import "reflect-metadata";
import express, { Application, NextFunction, Request, Response } from 'express';

import { UserRoute } from './controllers/users/user.route.js';

export class App {
  host: Application;
  constructor() {
    // Init server
    this.host = express();

    // Allow json body
    this.host.use(express.json());

    // Example root endpoint
    this.host.get("/", (req: Request, res: Response) => {
      res.send("Hello World!");
    });

    // Custom before middleware
    this.host.use((req: Request, res: Response, next: NextFunction) => {
      console.log(req.method, req.url);
      next();
    });

    const usersRoute = new UserRoute();
    this.host.use(`/api/${usersRoute.path}`, usersRoute.router);

    // Custom after middleware (only used when res.send or json is not called in a previous middleware (no endpoint found))
    this.host.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).send("No Endpoint found");
    });

    this.host.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
        res.status(400).json(error);
      }
    );
  }

  listen() {
    this.host.listen(3000, () => {
      console.info(`🚀 http://localhost:3000`);
      console.info(`=================================`);
    });
  }
}
