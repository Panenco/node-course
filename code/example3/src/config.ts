import loader from '@ljobse/appsettings-loader';
import * as fs from "node:fs";

const json = await fs.promises.readFile('./config.json', 'utf8');

const config = loader.applyEnvConfig(JSON.parse(json));

// We need a default export here. Otherwise the imported object might be undefined.
export default config;
