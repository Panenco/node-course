import { UserStore } from './user.store.js';

export const getList = async (req, res, next) => {
  const users = UserStore.find(req.query.search);
  res.json(users);
};
