import { Section } from './../../../entities/section.entity';
import { RequestContext } from '@mikro-orm/core';

export const deleteSection = async (sectionId: string) => {
  const em = RequestContext.getEntityManager();
  const section = await em.findOneOrFail(Section, { id: sectionId });
  await em.removeAndFlush(section);
}
