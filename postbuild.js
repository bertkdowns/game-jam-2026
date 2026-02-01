import fs from "fs";

const file = "./build/module.js";
let content = fs.readFileSync(file, "utf8");

// 1. Prepend your import line
content = `import { imports } from "../src/extern";\n` + content;

// 2. Change function signature
content = content.replace(
  `async function instantiate(module, imports = {})`,
  `async function instantiate(module)`
);

fs.writeFileSync(file, content);
