import express from 'express';

import { UserRoute } from './controllers/users/user.route';

export class App {
  constructor() {
    // Init server
    this.host = express();

    // Allow json body
    this.host.use(express.json());

    // Example root endpoint
    this.host.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // Custom before middleware
    this.host.use((req, res, next) => {
      console.log(req.method, req.url);
      next();
    });

    const usersRoute = new UserRoute();
    this.host.use(`/api/${usersRoute.path}`, usersRoute.router);

    // Custom after middleware (only used when res.send or json is not called in a previous middleware (no endpoint found))
    this.host.use((req, res, next) => {
      res.status(404).send("No Endpoint found");
    });

    this.host.use((error, req, res, next) => {
      res.status(400).json(error);
    });
  }

  listen() {
    this.host.listen(3000, () => {
      console.info(`🚀 http://localhost:3000`);
      console.info(`=================================`);
    });
  }
}
