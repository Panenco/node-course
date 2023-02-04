import { RequestContext } from "@mikro-orm/core";
import { PostBody } from "../../../contracts/bodies/post.pody";
import { Post } from "../../../entities/post.entity";

export const createPost = async (postBody: PostBody, id: string): Promise<Post> => {
  const em = await RequestContext.getEntityManager();
  console.log(id)
  const post = em.create(Post, { ...postBody, authorId: id });
  await em.persistAndFlush(post);

  return post;
}