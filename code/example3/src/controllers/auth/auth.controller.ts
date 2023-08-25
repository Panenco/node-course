import { Body, Representer } from '@panenco/papi';
import { JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { AccessTokenView } from '../../contracts/accessToken.view.js';
import { LoginBody } from '../../contracts/login.body.js';
import { createToken } from './handlers/login.handler.js';

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
