import { NextFunction, Request, Response } from 'express';

import { UserStore } from './user.store.js';

export const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  const user = UserStore.get(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  UserStore.delete(id);
  res.status(204).end();
};
