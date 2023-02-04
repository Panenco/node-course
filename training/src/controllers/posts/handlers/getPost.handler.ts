import { RequestContext } from "@mikro-orm/core";
import { Post } from "../../../entities/post.entity";

export const getPost = async (id: string) => {
  const em = RequestContext.getEntityManager();
  const post = await em.findOneOrFail(Post, { id });

  return post;
}