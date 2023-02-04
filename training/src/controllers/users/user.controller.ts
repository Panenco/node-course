import { getList } from "./handlers/getList.handler";
import { create } from "./handlers/create.handler";
import { get } from "./handlers/get.handler";
import { update } from "./handlers/update.handler";
import { deleteUser } from "./handlers/delete.handler";
import { UserBody } from "../../contracts/bodies/user.body";
import { Body, ListRepresenter, Query, Representer } from '@panenco/papi';
import { Authorized, Delete, Get, JsonController, Param, Patch, Post } from "routing-controllers";
import { SearchQuery } from "../../contracts/queries/search.query";
import { UserView } from "../../contracts/views/user.view";
import { OpenAPI } from "routing-controllers-openapi";

@JsonController('/users')
export class UserController {
  @Post()
  @Representer(UserView)
  @OpenAPI({ summary: 'Create a new user' })
  async create(@Body() body: UserBody) {
    return create(body);
  }

  @Get()
  @Authorized()
  @ListRepresenter(UserView)
  async getList(@Query() query: SearchQuery) {
    return getList(query?.search);
  }

  @Get('/:id')
  @Authorized()
  @Representer(UserView)
  async get(@Param("id") id: string) {
    return get(id);
  }

  @Patch('/:id')
  @Authorized()
  @Representer(UserView)
  async update(@Body({}, { skipMissingProperties: true }) body: UserBody, @Param("id") id: string) {
    return update(body, id);
  }

  @Delete('/:id')
  @Authorized()
  @Representer(null)
  async delete(@Param("id") id: string) {
    return deleteUser(id);
  }
}