import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response, Router } from 'express';

import { UserBody } from '../../contracts/user.body';
import { UserView } from '../../contracts/user.view';
import { create } from './handlers/create.handler';
import { deleteUser } from './handlers/delete.handler';
import { get } from './handlers/get.handler';
import { getList } from './handlers/getList.handler';
import { update } from './handlers/update.handler';

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.header("auth") !== "api-key") {
    return res.status(401).send("Unauthorized");
  }
  next();
};
const patchValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transformed = plainToInstance(UserBody, req.body, {
    exposeUnsetFields: false,
  });
  const validationErrors = await validate(transformed, {
    skipMissingProperties: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (validationErrors.length) {
    return next(validationErrors);
  }
  req.body = transformed;
  next();
};
const representationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transformed = plainToInstance(UserView, res.locals.body);
  res.json(transformed);
};

export class UserRoute {
  router: Router;
  path: string;

  constructor() {
    this.router = Router();
    this.path = "users";

    this.router.post("/", adminMiddleware, create);
    this.router.get("/", getList);
    this.router.get("/:id", get);
    this.router.patch(
      "/:id",
      patchValidationMiddleware,
      update,
      representationMiddleware
    );
    this.router.delete("/:id", deleteUser);
  }
}
