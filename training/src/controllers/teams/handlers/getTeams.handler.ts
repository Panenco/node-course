import { Team } from './../../../entities/team.entity';
import { RequestContext } from '@mikro-orm/core';

export const getTeams = async (userId: string) => {
  const em = RequestContext.getEntityManager();
  const res = await em.findAndCount(Team, { memberships: { user: userId } });
  return res;
}