import { NextFunction, Request, Response } from 'express';

import { UserStore } from './user.store';

export const getList = (req: Request, res: Response, next: NextFunction) => {
  const users = UserStore.find(req.query.search?.toString());
  res.json(users);
};
