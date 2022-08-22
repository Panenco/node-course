import { RequestContext } from '@mikro-orm/core';
import { NotFound } from '@panenco/papi';

import { User } from '../../../entities/user.entity';

export const get = async (id: string) => {
  const em = RequestContext.getEntityManager();
  const user = await em.findOne(User, { id });
  if (!user) {
    throw new NotFound("userNotFound", "User not found");
  }
  return user;
};
