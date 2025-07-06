import { Representer } from "@panenco/papi";
import { Body, JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import { AccessTokenView } from "../../contracts/accessToken.view";
import { LoginBody } from "../../contracts/login.body";
import { createToken } from "./handlers/login.handler";

@JsonController("/auth")
export class AuthController {
	@Post("/login")
	@Representer(AccessTokenView)
	@OpenAPI({
		summary: "Request a new accesstoken",
	})
	async login(@Body() body: LoginBody) {
		return createToken(body);
	}
}
