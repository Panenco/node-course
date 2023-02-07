import { getSectionRelativeWeight, getSectionsTotalWeight } from './../../../utils/helpers';
import { Section } from './../../../entities/section.entity';
import { RequestContext } from '@mikro-orm/core';
import { SectionBody } from '../../../contracts/bodies/section.body';
import { Request } from '../../../entities/request.entity';
import { PostgreSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql';

export const createSection = async (requestId: string, sectionBody: SectionBody) => {
	const em = RequestContext.getEntityManager() as SqlEntityManager<PostgreSqlDriver>;

	await em.findOneOrFail(Request, { id: requestId });

	const section = await em.create(Section, { 
		...sectionBody, 
		request: requestId,
	})
	await em.persistAndFlush(section);

	// important to get weights after new section appear in DB
	const totalWeight = await getSectionsTotalWeight(requestId);
	const relativeWeight = getSectionRelativeWeight(section.weight, totalWeight);
	return { ...section, totalWeight, relativeWeight };
}