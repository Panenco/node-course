import { Body, ListRepresenter, Query, Representer, StatusCode } from '@panenco/papi';
import { Authorized, Delete, Get, JsonController, Param, Patch, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { SearchQuery } from '../../contracts/search.query';
import { UserBody } from '../../contracts/user.body';
import { UserView } from '../../contracts/user.view';
import { create } from './handlers/create.handler';
import { deleteUser } from './handlers/delete.handler';
import { get } from './handlers/get.handler';
import { getList } from './handlers/getList.handler';
import { update } from './handlers/update.handler';

@JsonController('/users')
export class UserController {
  @Post()
  @Representer(UserView, StatusCode.created)
  @OpenAPI({ summary: 'Create a new user' })
  async create(@Body() body: UserBody) {
    return create(body);
  }

  @Get()
  @Authorized()
  @ListRepresenter(UserView)
  @OpenAPI({ summary: 'Search users' })
  async getList(@Query() query: SearchQuery) {
    return getList(query.search);
  }

  @Get('/:id')
  @Authorized()
  @Representer(UserView)
  @OpenAPI({ summary: 'Get a user by id' })
  async get(@Param('id') id: string) {
    return get(id);
  }

  @Patch('/:id')
  @Authorized()
  @Representer(UserView)
  @OpenAPI({ summary: 'Update a user' })
  async update(@Body({}, { skipMissingProperties: true }) body: UserBody, @Param('id') id: string) {
    return update(id, body);
  }

  @Delete('/:id')
  @Authorized()
  @Representer(null)
  @OpenAPI({ summary: 'Delete a user' })
  async delete(@Param('id') id: string) {
    await deleteUser(id);
  }
}
