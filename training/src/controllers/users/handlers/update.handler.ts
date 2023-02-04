import { UserBody } from "../../../contracts/bodies/user.body";
import { NotFound } from "@panenco/papi";
import { RequestContext } from "@mikro-orm/core";
import { User } from "../../../entities/user.entity";

export const update = async (body: UserBody, id: string) => {
  const em = RequestContext.getEntityManager();
  const user = await em.findOneOrFail(User, { id })
  user.assign(body);
  await em.flush();
  return user;
}