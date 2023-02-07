import { Tender } from './../../../entities/tender.entity';
import { RequestContext } from '@mikro-orm/core';
import { RequestBody } from "../../../contracts/bodies/request.body";
import { Request } from '../../../entities/request.entity';


export const createRequest = async (requestBody: RequestBody, tenderId: string) => {
  const em = RequestContext.getEntityManager();

  await em.findOneOrFail(Tender, { id: tenderId });
  const request = em.create(Request, { ...requestBody, tender: tenderId });
  em.persistAndFlush(request);
  await em.populate(request, ['tender']);

  return request;
}