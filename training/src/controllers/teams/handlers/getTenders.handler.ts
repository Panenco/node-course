import { Tender } from './../../../entities/tender.entity';
import { Team } from './../../../entities/team.entity';
import { RequestContext } from '@mikro-orm/core';

export const getTenders = async (teamId: string) => {
  const em = RequestContext.getEntityManager();
  await em.findOneOrFail(Team, { id: teamId });
  const tenders = await em.findAndCount(Tender, { team: teamId });

  return tenders;
}