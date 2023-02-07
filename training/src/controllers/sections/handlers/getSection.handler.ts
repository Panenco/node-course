import { Section } from './../../../entities/section.entity';
import { RequestContext } from '@mikro-orm/core';
import { getSectionRelativeWeight, getSectionsTotalWeight } from '../../../utils/helpers';

export const getSection = async (sectionId: string) => {
  const em = RequestContext.getEntityManager();

  const section = await em.findOneOrFail(Section, { id: sectionId });

  const totalWeight = await getSectionsTotalWeight(section.request.id);
	const relativeWeight = getSectionRelativeWeight(section.weight, totalWeight);
  return { ...section, totalWeight, relativeWeight };
}