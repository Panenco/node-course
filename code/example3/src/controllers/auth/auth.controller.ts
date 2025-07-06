import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { AccessTokenView } from "../../contracts/accessToken.view";
import { LoginBody } from "../../contracts/login.body";
import { createToken } from "./handlers/login.handler";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	@Post("login")
	@ApiOperation({ summary: "Request a new accesstoken" })
	@ApiResponse({
		status: 200,
		description: "Login successful",
		type: AccessTokenView,
	})
	@ApiResponse({ status: 401, description: "Invalid credentials" })
	async login(@Body() body: LoginBody): Promise<AccessTokenView> {
		return createToken(body);
	}
}
