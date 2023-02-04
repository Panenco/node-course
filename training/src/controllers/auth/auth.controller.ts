import { Body, Representer } from "@panenco/papi";
import { JsonController, Post } from "routing-controllers";
import { LoginBody } from "../../contracts/bodies/login.body";
import { AccessTokenView } from "../../contracts/views/access-token.view";
import { login } from "./handlers/login.handler";

@JsonController('/auth')
export class AuthController {
  @Post('/login')
  @Representer(AccessTokenView)
  async login (@Body() body: LoginBody) {
    return login(body);
  }
}