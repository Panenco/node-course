import { RequestContext } from "@mikro-orm/core";
import { Post } from "routing-controllers";

export const deletePost = async (id: string) => {
  const em = RequestContext.getEntityManager();
  const postToDelete = await em.findOneOrFail(Post, { id })
  await em.removeAndFlush(postToDelete);
}