import { RequestContext } from "@mikro-orm/core";
import { User } from "../../../entities/user.entity";

export const deleteUser = async (id: string) => {
  const em = RequestContext.getEntityManager();
  const user = await em.findOneOrFail(User, { id });
  await em.removeAndFlush(user);
}