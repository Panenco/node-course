import { RequestContext } from '@mikro-orm/core';
import { Request } from '../../../entities/request.entity';

export const getRequest = async (id: string) => {
  const em = RequestContext.getEntityManager();

  const request = await em.findOneOrFail(Request, { id });
  await em.populate(request, ['tender']);
  return request;
}