import { Section } from './../../../entities/section.entity';
import { RequestContext } from '@mikro-orm/core';
import { Request } from '../../../entities/request.entity';
import { getSectionRelativeWeight, getSectionsTotalWeight } from '../../../utils/helpers';

export const getSections = async (requestId: string) => {
  const em = RequestContext.getEntityManager();

  await em.findOneOrFail(Request, { id: requestId });
  const [sections, count] = await em.findAndCount(Section, { request: requestId });

  const totalWeight = await getSectionsTotalWeight(requestId);
  
  const sectionsWithWeights = sections.map((section) => {
	  const relativeWeight = getSectionRelativeWeight(section.weight, totalWeight);
    return ({ ...section, totalWeight, relativeWeight });
  })
  return [sectionsWithWeights, count];
}