import { Team } from './../../../entities/team.entity';
import { RequestContext } from '@mikro-orm/core';

export const getTeam = async (teamId: string) => {
  const em = RequestContext.getEntityManager();

  const team = await em.findOneOrFail(Team, { id: teamId })
  return team;
}