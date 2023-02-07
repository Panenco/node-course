import { Body, ListRepresenter, Representer } from "@panenco/papi";
import { Authorized, Delete, Get, JsonController, Param, Patch, Post, Req } from "routing-controllers";
import { PostBody } from "../../contracts/bodies/post.pody";
import { PostView } from "../../contracts/views/post.view";
import { createPost } from "./handlers/create.handler";
import { deletePost } from "./handlers/delete.handler";
import { getUserPosts } from "./handlers/getUserPosts.handler";
import { getPost } from "./handlers/getPost.handler";
import { updatePost } from "./handlers/update.handler";

@JsonController('/posts')
@Authorized()
export class PostController {
  @Post()
  @Representer(PostView, 201)
  async createPost(@Body() body: PostBody, @Req() { token: { userId } }: any) { // for some reason I get TS error: "Property 'token' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'"
    return createPost(body, userId);
  }

  @Get()
  @ListRepresenter(PostView)
  async getUserPosts(@Req() { token: { userId } }: any) { // same here
    return getUserPosts(userId);
  }

  @Get('/:id')
  @Representer(PostView)
  async getPost(@Param("id") id: string) {
    return getPost(id);
  }

  @Patch('/:id')
  @Representer(PostView)
  async updatePost(@Body({}, { skipMissingProperties: true }) body: PostBody, @Param("id") id: string) {
    return updatePost(id, body)
  }

  @Delete('/:id')
  @Representer(null, 204)
  async deletePost(@Param("id") id: string) {
    return deletePost(id);
  }
}