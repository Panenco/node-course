import { RequestContext } from '@mikro-orm/core';

import { UserBody } from '../../../contracts/user.body';
import { User } from '../../../entities/user.entity';

export const create = async (body: UserBody) => {
  const em = RequestContext.getEntityManager();
  const user = em.create(User, body);
  await em.persistAndFlush(user);

  return user;
};
