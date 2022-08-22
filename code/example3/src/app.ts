import 'express-async-errors';

import { MikroORM, RequestContext } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { errorMiddleware, getAuthenticator } from '@panenco/papi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import express, { Application, NextFunction, Request, Response } from 'express';
import { getMetadataArgsStorage, RoutingControllersOptions, useExpressServer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUi from 'swagger-ui-express';

import config from './config';
import { AuthController } from './controllers/auth/auth.controller';
import { UserController } from './controllers/users/user.controller';
import ormConfig from './orm.config';

export class App {
  public host: Application;
  public orm: MikroORM<PostgreSqlDriver>;

  constructor() {
    // Init server
    this.host = express();

    // Allow json body
    this.host.use(express.json());

    // Example root endpoint
    this.host.get('/', (req: Request, res: Response) => {
      res.send('Hello World!');
    });

    // Custom before middleware
    this.host.use((req: Request, res: Response, next: NextFunction) => {
      console.log(req.method, req.url);
      next();
    });

    this.host.use((req, __, next: NextFunction) => {
      RequestContext.create(this.orm.em, next);
    });
    const controllers = [AuthController, UserController];
    this.initializeControllers(controllers);
    this.initializeSwagger();

    this.host.use(errorMiddleware);
  }

  public async createConnection() {
    try {
      this.orm = await MikroORM.init(ormConfig);
    } catch (error) {
      console.log('Error while connecting to the database', error);
    }
  }

  public listen() {
    const port = config.port;
    this.host.listen(port, () => {
      console.info(`🚀 http://localhost:${port}/docs`);
      console.info(`================================`);
    });
  }

  private initializeControllers(controllers: Function[]) {
    useExpressServer(this.host, {
      cors: {
        origin: '*',
        credentials: true,
        exposedHeaders: ['x-auth'],
      },
      controllers,
      defaultErrorHandler: false,
      routePrefix: '/api',
      authorizationChecker: getAuthenticator('jwtSecretFromConfigHere'),
    });
  }

  private initializeSwagger() {
    const { defaultMetadataStorage } = require('class-transformer/cjs/storage');

    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
    });

    const routingControllersOptions: RoutingControllersOptions = {
      routePrefix: '/api',
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas,
        securitySchemes: {
          JWT: {
            in: 'header',
            name: 'x-auth',
            type: 'apiKey',
            bearerFormat: 'JWT',
            description: 'JWT Authorization header using the JWT scheme. Example: "x-auth: {token}"',
          },
        },
      },
      security: [{ JWT: [] }],
    });

    this.host.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
  }
}
