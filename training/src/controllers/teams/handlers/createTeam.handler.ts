import { RequestContext } from '@mikro-orm/core';
import { Membership } from '../../../entities/membership.entity';
import { Team } from '../../../entities/team.entity';
import { TeamBody } from './../../../contracts/bodies/team.body';

export const createTeam = async (body: TeamBody, userId: string): Promise<Team> => {
  const em = RequestContext.getEntityManager();

  // create team
  const team = em.create(Team, body);
  await em.persistAndFlush(team);

  // create team member
  const membership = em.create(Membership, { userId, teamId: team.id })
  await em.persistAndFlush(membership);

  return team;
}