import { NextFunction, Request, Response } from "express";

import { UserStore } from "./user.store";

export const getList = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { search } = req.query;
	const users = UserStore.find(search as string);
	res.json(users);
};
