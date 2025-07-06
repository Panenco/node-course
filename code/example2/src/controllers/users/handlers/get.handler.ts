import { NextFunction, Request, Response } from "express";

import { UserStore } from "./user.store";

export const get = async (req: Request, res: Response, next: NextFunction) => {
	const id = parseInt(req.params.id);
	const user = UserStore.get(id);

	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}

	res.json(user);
};
