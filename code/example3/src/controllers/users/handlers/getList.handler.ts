import { RequestContext } from "@mikro-orm/core";

import { User } from "../../../entities/user.entity";

export const getList = async (search?: string) => {
	const em = RequestContext.getEntityManager();
	const users = await em.find(
		User,
		search ? { name: { $like: `%${search}%` } } : {}
	);
	return users;
};
