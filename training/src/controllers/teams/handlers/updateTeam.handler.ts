import { RequestContext } from '@mikro-orm/core';
import { Team } from '../../../entities/team.entity';
import { TeamBody } from './../../../contracts/bodies/team.body';

export const updateTeam = async (teamId: string, teamBody: TeamBody) => {
  const em = RequestContext.getEntityManager();
  
  const team = await em.findOneOrFail(Team, { id: teamId });
  team.assign(teamBody);
  await em.flush();

  return team;
}