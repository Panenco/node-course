import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	HttpCode,
	HttpStatus,
} from "@nestjs/common";
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiSecurity,
} from "@nestjs/swagger";

import { SearchQuery } from "../../contracts/search.query";
import { UserBody } from "../../contracts/user.body";
import { UserView } from "../../contracts/user.view";
import { create } from "./handlers/create.handler";
import { deleteUser } from "./handlers/delete.handler";
import { get } from "./handlers/get.handler";
import { getList } from "./handlers/getList.handler";
import { update } from "./handlers/update.handler";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";

@ApiTags("users")
@Controller("users")
export class UserController {
	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create a new user" })
	@ApiResponse({
		status: 201,
		description: "User created successfully",
		type: UserView,
	})
	@ApiResponse({ status: 400, description: "Bad request" })
	async create(@Body() body: UserBody): Promise<UserView> {
		return create(body);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiSecurity("x-auth")
	@ApiOperation({ summary: "Search users" })
	@ApiResponse({
		status: 200,
		description: "Users retrieved successfully",
		type: [UserView],
	})
	async getList(@Query() query: SearchQuery): Promise<UserView[]> {
		return getList(query.search);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard)
	@ApiSecurity("x-auth")
	@ApiOperation({ summary: "Get a user by id" })
	@ApiResponse({
		status: 200,
		description: "User retrieved successfully",
		type: UserView,
	})
	@ApiResponse({ status: 404, description: "User not found" })
	async get(@Param("id") id: string): Promise<UserView> {
		return get(id);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard)
	@ApiSecurity("x-auth")
	@ApiOperation({ summary: "Update a user" })
	@ApiResponse({
		status: 200,
		description: "User updated successfully",
		type: UserView,
	})
	@ApiResponse({ status: 404, description: "User not found" })
	async update(
		@Param("id") id: string,
		@Body() body: UserBody
	): Promise<UserView> {
		return update(id, body);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard)
	@ApiSecurity("x-auth")
	@ApiOperation({ summary: "Delete a user" })
	@ApiResponse({ status: 204, description: "User deleted successfully" })
	@ApiResponse({ status: 404, description: "User not found" })
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param("id") id: string): Promise<void> {
		await deleteUser(id);
	}
}
