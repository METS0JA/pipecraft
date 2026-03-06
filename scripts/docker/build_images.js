const { buildAllImages } = require("./docker_utils");

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const onlyArg = args.find((arg) => arg.startsWith("--only="));
const onlyList = onlyArg ? onlyArg.replace("--only=", "").split(",") : null;

buildAllImages({ isDryRun, onlyList }).catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
