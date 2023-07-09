import { Router } from 'express';

import { create } from './handlers/create.handler.js';
import { deleteUser } from './handlers/delete.handler.js';
import { get } from './handlers/get.handler.js';
import { getList } from './handlers/getList.handler.js';
import { update } from './handlers/update.handler.js';

const adminMiddleware = (req, res, next) => {
  if (req.header("auth") !== "api-key") {
    return res.status(401).send("Unauthorized");
  }
  next();
};
export class UserRoute {
  constructor() {
    this.router = Router();
    this.path = "users";

    this.router.post("/", adminMiddleware, create);
    this.router.get("/", getList);
    this.router.get("/:id", get);
    this.router.patch("/:id", update);
    this.router.delete("/:id", deleteUser);
  }
}
