const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..", "..");
const mappingPath = path.join(rootDir, "image_mapping.json");

const dockerTimeoutMs = Number(process.env.DOCKER_TIMEOUT_MS || "3600000");
const tagSuffix = (process.env.DOCKER_TAG_SUFFIX || "").trim();
const namespaceOverride = (process.env.DOCKERHUB_NAMESPACE || "").trim();

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

function resolveImageName(image) {
  if (!namespaceOverride) {
    return image;
  }
  const imageName = image.split("/").pop();
  return `${namespaceOverride}/${imageName}`;
}

function resolveTags(tags) {
  if (!tagSuffix) {
    return tags;
  }
  return tags.map((tag) => `${tag}${tagSuffix}`);
}

function runCommand(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      shell: true,
      stdio: "inherit",
      ...options,
    });

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Command timed out: ${command} ${commandArgs.join(" ")}`));
    }, dockerTimeoutMs);

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed (${code}): ${command} ${commandArgs.join(" ")}`));
      }
    });
  });
}

function formatCommand(command, commandArgs) {
  return `${command} ${commandArgs.join(" ")}`;
}

function loadMapping() {
  if (!fs.existsSync(mappingPath)) {
    exitWithError(`Missing mapping file: ${mappingPath}`);
  }
  const raw = fs.readFileSync(mappingPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed.images || !Array.isArray(parsed.images)) {
    exitWithError("image_mapping.json must contain an images array.");
  }
  return parsed.images;
}

function validateImageEntry(entry) {
  const required = ["name", "dockerfile", "context", "image", "tags"];
  required.forEach((field) => {
    if (!entry[field]) {
      exitWithError(`Missing "${field}" in mapping for ${JSON.stringify(entry)}`);
    }
  });
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
    exitWithError(`"tags" must be a non-empty array for ${entry.name}`);
  }
}

function shouldProcess(entry, onlyList) {
  if (!onlyList) {
    return true;
  }
  return onlyList.includes(entry.name);
}

function resolveEntryPaths(entry) {
  const dockerfilePath = path.resolve(rootDir, entry.dockerfile);
  const contextPath = path.resolve(rootDir, entry.context);

  if (!fs.existsSync(dockerfilePath)) {
    exitWithError(`Dockerfile not found: ${dockerfilePath}`);
  }
  if (!fs.existsSync(contextPath)) {
    exitWithError(`Context path not found: ${contextPath}`);
  }

  return { dockerfilePath, contextPath };
}

function resolveEntryTags(entry) {
  const imageName = resolveImageName(entry.image);
  const tags = resolveTags(entry.tags);
  return tags.map((tag) => `${imageName}:${tag}`);
}

async function buildAllImages({ isDryRun, onlyList }) {
  const images = loadMapping();

  for (const entry of images) {
    if (!shouldProcess(entry, onlyList)) {
      continue;
    }

    validateImageEntry(entry);
    console.log(`\n=== ${entry.name} (build) ===`);

    const { dockerfilePath, contextPath } = resolveEntryPaths(entry);
    const fullTags = resolveEntryTags(entry);
    const buildArgs = ["build", "-f", dockerfilePath];
    fullTags.forEach((tag) => buildArgs.push("-t", tag));
    buildArgs.push(contextPath);

    if (isDryRun) {
      console.log(`[dry-run] ${formatCommand("docker", buildArgs)}`);
    } else {
      await runCommand("docker", buildArgs, { cwd: rootDir });
    }
  }

  console.log("\nAll builds completed.");
}

async function pushAllImages({ isDryRun, onlyList }) {
  const images = loadMapping();

  for (const entry of images) {
    if (!shouldProcess(entry, onlyList)) {
      continue;
    }

    validateImageEntry(entry);
    console.log(`\n=== ${entry.name} (push) ===`);

    const fullTags = resolveEntryTags(entry);
    for (const tag of fullTags) {
      const pushArgs = ["push", tag];
      if (isDryRun) {
        console.log(`[dry-run] ${formatCommand("docker", pushArgs)}`);
      } else {
        await runCommand("docker", pushArgs, { cwd: rootDir });
      }
    }
  }

  console.log("\nAll pushes completed.");
}

module.exports = {
  buildAllImages,
  pushAllImages,
};
