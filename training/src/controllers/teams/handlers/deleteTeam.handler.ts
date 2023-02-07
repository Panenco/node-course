import { Team } from './../../../entities/team.entity';
import { RequestContext } from '@mikro-orm/core';

export const deleteTeam = async (teamId: string) => {
  const em = RequestContext.getEntityManager();

  const teamToDelete = await em.findOneOrFail(Team, { id: teamId });
  await em.removeAndFlush(teamToDelete);
}