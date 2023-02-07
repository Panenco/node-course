import { RequestContext } from '@mikro-orm/core';
import { Team } from '../../../entities/team.entity';
import { Tender } from '../../../entities/tender.entity';
import { TenderBody } from '../../../contracts/bodies/tender.body';

export const createTender = async (tenderBody: TenderBody, teamId: string) => {
  const em = RequestContext.getEntityManager();

  const team = await em.findOneOrFail(Team, { id: teamId });
  const tender = em.create(Tender, { ...tenderBody, team: team.id })
  
  await em.persistAndFlush(tender);
  await em.populate(tender, ['team']);

  return tender;
}