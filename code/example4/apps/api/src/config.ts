import * as fs from "node:fs";

// Simple synchronous config loading for learning purposes
const json = fs.readFileSync("./config.json", "utf8");
const config = JSON.parse(json);

// We need a default export here. Otherwise the imported object might be undefined.
export default config;
