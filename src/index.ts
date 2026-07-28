const VERSION = "0.1.0";
const argv = process.argv.slice(2);
if (argv[0] === "--version" || argv[0] === "-V") {
  console.log(VERSION);
  process.exit(0);
}
console.error(JSON.stringify({ error: { message: "not implemented yet" } }));
process.exit(1);
