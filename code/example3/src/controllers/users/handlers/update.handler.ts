import { RequestContext } from "@mikro-orm/core";
import { NotFound } from "@panenco/papi";

import { UserBody } from "../../../contracts/user.body";
import { User } from "../../../entities/user.entity";

export const update = async (id: string, body: Partial<UserBody>) => {
	const em = RequestContext.getEntityManager();
	const user = await em.findOne(User, { id });
	if (!user) {
		throw new NotFound("userNotFound", "User not found");
	}
	em.assign(user, body);
	await em.persistAndFlush(user);
	return user;
};
