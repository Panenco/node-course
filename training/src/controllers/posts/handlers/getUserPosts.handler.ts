import { RequestContext } from "@mikro-orm/core";
import { Post } from "../../../entities/post.entity";

export const getUserPosts = async (id: string):  Promise<[Post[], number]> => {
  const em = RequestContext.getEntityManager();
  const userPosts = await em.findAndCount(Post, { authorId: id })
  
  return userPosts;
}