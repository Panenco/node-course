import { Body, Representer } from '@panenco/papi';
import { JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { AccessTokenView } from '../../contracts/accessToken.view';
import { LoginBody } from '../../contracts/login.body';
import { createToken } from './handlers/login.handler';

@JsonController('/auth')
export class AuthController {
  @Post('/tokens')
  @Representer(AccessTokenView)
  @OpenAPI({
    summary: 'Request a new accesstoken',
  })
  async create(@Body() body: LoginBody) {
    return createToken(body);
  }
}
