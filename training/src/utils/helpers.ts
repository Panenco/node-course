import { RequestContext } from "@mikro-orm/core";
import { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql";
import { Section } from "../entities/section.entity";

export const getSectionsTotalWeight = async (requestId: string) => {
  const em = RequestContext.getEntityManager() as SqlEntityManager<PostgreSqlDriver>;

  const [{ total }] = await em
	.createQueryBuilder(Section, 'section')
	.select([`coalesce(SUM(section.weight), 0) as total`])
	.where({ request: requestId })
	.execute<any>();

  return parseInt(total);
}

export const getSectionRelativeWeight = (sectionWeight: number, totalWeight: number) => { 
  return totalWeight > 0 ? (sectionWeight / totalWeight) * 100 : 0;
}