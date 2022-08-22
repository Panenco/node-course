import { RequestContext } from '@mikro-orm/core';
import { createAccessToken, Unauthorized } from '@panenco/papi';

import { LoginBody } from '../../../contracts/login.body';
import { User } from '../../../entities/user.entity';

export const createToken = async (body: LoginBody) => {
  const user = await RequestContext.getEntityManager().findOne(User, { email: body.email });
  if (!user || user.password !== body.password) {
    throw new Unauthorized('unauthorized', 'Invalid credentials');
  }
  const result = await createAccessToken('jwtSecretFromConfigHere', 60 * 10, { userId: user.id });
  return result;
};
