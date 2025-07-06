const { Router } = require('express');

const { create } = require('./handlers/create.handler.js');
const { deleteUser } = require('./handlers/delete.handler.js');
const { get } = require('./handlers/get.handler.js');
const { getList } = require('./handlers/getList.handler.js');
const { update } = require('./handlers/update.handler.js');

const adminMiddleware = (req, res, next) => {
  if (req.header("auth") !== "api-key") {
    return res.status(401).send("Unauthorized");
  }
  next();
};

class UserRoute {
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

module.exports = { UserRoute };
