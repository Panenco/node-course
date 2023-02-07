import { Tender } from './../../../entities/tender.entity';
import { TenderBody } from './../../../contracts/bodies/tender.body';
import { RequestContext } from '@mikro-orm/core';

export const updateTender = async (tenderBody: TenderBody, tenderId: string) => {
  const em = RequestContext.getEntityManager();

  const tender = await em.findOneOrFail(Tender, { id: tenderId });
  tender.assign(tenderBody);

  await em.flush();
  return tender;
}