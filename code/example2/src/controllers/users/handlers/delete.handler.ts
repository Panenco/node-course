import { NextFunction, Request, Response } from "express";

import { UserStore } from "./user.store";

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = UserStore.get(parseInt(req.params.id));
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	UserStore.delete(parseInt(req.params.id));
	res.status(204).send();
};
