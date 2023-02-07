import { Tender } from './../../../entities/tender.entity';
import { RequestContext } from '@mikro-orm/core';
import { Request } from '../../../entities/request.entity';

export const getRequests = async (tenderId: string) => {
  const em = RequestContext.getEntityManager();
  
  await em.findOneOrFail(Tender, { id: tenderId });
  const requests = await em.findAndCount(Request, { tender: tenderId });
  return requests;
}