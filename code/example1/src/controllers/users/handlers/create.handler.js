import { UserStore } from './user.store.js';

export const create = async (req, res, next) => {
  if (!req.body.name) {
    return next({
      error: "name is required",
    });
  }
  const user = UserStore.add(req.body);
  res.json(user);
};
