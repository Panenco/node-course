import { App } from './app';

(async () => {
  const app = new App();
  await app.createConnection();
  app.listen();
})();