const { execFileSync } = require("child_process");

function parseDockerHostToOptions(dockerHost) {
  if (!dockerHost) {
    throw new Error("Docker context returned an empty endpoint.");
  }

  if (dockerHost.startsWith("unix://")) {
    return { socketPath: dockerHost.replace("unix://", "") };
  }

  if (dockerHost.startsWith("npipe://")) {
    return { socketPath: dockerHost };
  }

  if (dockerHost.startsWith("tcp://")) {
    const endpoint = new URL(dockerHost);
    return {
      host: endpoint.hostname,
      port: Number(endpoint.port || 2375),
      protocol: "http",
    };
  }

  throw new Error(`Unsupported Docker endpoint from context: ${dockerHost}`);
}

function readContextValue(args) {
  return execFileSync("docker", args, {
    encoding: "utf8",
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function getDockerodeOptionsFromContextSync() {
  try {
    const contextName = readContextValue(["context", "show"]);
    if (!contextName) {
      throw new Error("No active Docker context found.");
    }

    const dockerHost = readContextValue([
      "context",
      "inspect",
      contextName,
      "--format",
      '{{ (index .Endpoints "docker").Host }}',
    ]);

    return parseDockerHostToOptions(dockerHost);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error("Docker CLI is not installed or not available in PATH.");
    }

    const stderr = error?.stderr ? String(error.stderr).trim() : "";
    const extra = stderr ? ` (${stderr})` : "";
    throw new Error(`Failed to resolve Docker endpoint from Docker context${extra}`);
  }
}

module.exports = { getDockerodeOptionsFromContextSync };
