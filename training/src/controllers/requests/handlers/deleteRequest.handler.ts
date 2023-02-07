import { RequestContext } from '@mikro-orm/core';
import { Request } from '../../../entities/request.entity';

export const deleteRequest = async (requestId: string) => {
  const em = RequestContext.getEntityManager();
  const request = await em.findOneOrFail(Request, { id: requestId });
  await em.removeAndFlush(request);
}
