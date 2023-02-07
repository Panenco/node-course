import { RequestContext } from '@mikro-orm/core';
import { RequestBody } from '../../../contracts/bodies/request.body';
import { Request } from '../../../entities/request.entity';

export const updateRequest = async (body: RequestBody, id: string) => {
  const em = RequestContext.getEntityManager();

  const request = await em.findOneOrFail(Request, { id });
  request.assign(body);
  await em.flush();
  return request;
}