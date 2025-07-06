import { RequestContext } from "@mikro-orm/core";
import { createAccessToken, Unauthorized } from "@panenco/papi";

import config from "../../../config";
import { LoginBody } from "../../../contracts/login.body";
import { User } from "../../../entities/user.entity";

export const createToken = async (body: LoginBody) => {
	const em = RequestContext.getEntityManager();
	const user = await em.findOne(User, { email: body.email });
	if (!user || user.password !== body.password) {
		throw new Unauthorized("invalidCredentials", "Invalid credentials");
	}
	return createAccessToken(config.jwtSecret, 3600, { userId: user.id });
};
