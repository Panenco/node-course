import { RequestContext } from "@mikro-orm/core";
import { PostBody } from "../../../contracts/bodies/post.pody";
import { Post } from "../../../entities/post.entity";

export const updatePost = async (id: string, postBody: PostBody) => {
  const em = RequestContext.getEntityManager();
  const postToUpdate = await em.findOneOrFail(Post, { id });
  postToUpdate.assign(postBody);
  await em.flush();
  return postToUpdate;
}