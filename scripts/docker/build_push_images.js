const { buildAllImages, pushAllImages } = require("./docker_utils");

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const noPush = args.includes("--no-push");
const onlyArg = args.find((arg) => arg.startsWith("--only="));
const onlyList = onlyArg ? onlyArg.replace("--only=", "").split(",") : null;

async function main() {
  await buildAllImages({ isDryRun, onlyList });
  if (noPush) {
    return;
  }
  await pushAllImages({ isDryRun, onlyList });
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
