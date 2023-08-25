import { App } from './app.js';

(async () => {
  const app = new App();
  await app.createConnection();
  app.listen();
})();
