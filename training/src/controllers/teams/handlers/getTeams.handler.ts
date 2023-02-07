import { Membership } from './../../../entities/membership.entity';
import { RequestContext } from '@mikro-orm/core';
import { PostgreSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql';

export const getTeams = async (userId: string) => {
  const em = RequestContext.getEntityManager() as SqlEntityManager<PostgreSqlDriver>;

  const res = await em.createQueryBuilder(Membership, 'm')
  .select(['t.*'])
  .leftJoin('teamId', 't')
  .where({ 'm.user_id': userId })
  .execute();

  return [res, res.length];
}