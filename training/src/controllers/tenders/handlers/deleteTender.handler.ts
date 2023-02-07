import { RequestContext } from '@mikro-orm/core';
import { Tender } from '../../../entities/tender.entity';

export const deleteTender = async (tenderId: string) => {
  const em = RequestContext.getEntityManager();
  const tender = await em.findOneOrFail(Tender, { id: tenderId });
  await em.removeAndFlush(tender);
}
