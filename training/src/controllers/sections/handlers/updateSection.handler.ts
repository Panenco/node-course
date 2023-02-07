import { RequestContext } from "@mikro-orm/core";
import { SectionView } from "../../../contracts/views/section.view";
import { Section } from "../../../entities/section.entity";
import { getSectionRelativeWeight, getSectionsTotalWeight } from "../../../utils/helpers";


export const updateSection = async (body: SectionView, id: string) => {
  const em = RequestContext.getEntityManager();

  const section = await em.findOneOrFail(Section, { id });
  section.assign(body);
  await em.flush();

  const totalWeight = await getSectionsTotalWeight(section.request.id);
	const relativeWeight = getSectionRelativeWeight(section.weight, totalWeight);
  return { ...section, totalWeight, relativeWeight };
}