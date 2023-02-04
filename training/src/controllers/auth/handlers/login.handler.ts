import { RequestContext } from "@mikro-orm/core";
import { createAccessToken, Unauthorized } from "@panenco/papi";
import { LoginBody } from "../../../contracts/bodies/login.body";
import { User } from "../../../entities/user.entity";

export const login = async (body: LoginBody) => {
  const em = RequestContext.getEntityManager();
  const user = await em.findOne(User, { email: body.email })

  if (!user || user.password !== body.password) {
    throw new Unauthorized('WrongCredentials', 'Wrong password or email');
  }
  const token = await createAccessToken('jwtSecretFromConfigHere', 60 * 60 * 24, { userId: user.id });
  return token;
}