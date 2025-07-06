import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

import { UserBody } from "../../../contracts/user.body";
import { UserView } from "../../../contracts/user.view";
import { UserStore } from "./user.store";

export const update = async (
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

	const id = parseInt(req.params.id);
	const user = UserStore.get(id);
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	const updated = UserStore.update(id, { ...user, ...transformed });

	res.json(plainToInstance(UserView, updated));
};
