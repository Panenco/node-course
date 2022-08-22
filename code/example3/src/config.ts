import loader from '@ljobse/appsettings-loader';

import configJson from './config.json';

const config = loader.applyEnvConfig(configJson);

// We need a default export here. Otherwise the imported object might be undefined.
export default config;
