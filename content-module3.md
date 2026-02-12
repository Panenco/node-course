# Module 3

The previous modules showed you the main features of express. Now it's time to
go to a whole other level and create a real world setup.

The next part will consist of a few large topics:

-   **NestJS Framework** for scalable Node.js applications with dependency injection
-   **Swagger** for automatically generated API documentation
-   **Authentication and authorization** with JWT tokens and guards for access management
-   **Databases** for storing data with Prisma ORM

# NestJS Framework

[NestJS](https://nestjs.com/) is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. It uses TypeScript by default and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

NestJS is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP, FP, and FRP. Under the hood, NestJS makes use of robust HTTP Server frameworks like Express (the default) and optionally can be configured to use Fastify as well.

## Development Philosophy

NestJS provides a level of abstraction above these common Node.js frameworks (Express/Fastify), but also exposes their APIs directly to the developer. This provides developers with the freedom to use the myriad of third-party modules which are available for the underlying platform.

The default flow of a feature/endpoint always has 4 steps:

1. Authorize the user
    - Validate the token with Guards
    - Validate the access rights to the resource
2. Validate the input
    - Transform and strip the input
      with [class transformer](https://www.npmjs.com/package/class-transformer).
      Make sure no unknown properties can be provided, parse all items to the
      correct type (ex. string to date)
    - Validate the input
      with [class validator](https://www.npmjs.com/package/class-validator)
      through NestJS validation pipes
3. Execute the business logic
    - The endpoint lands in the controller, the controller should contain
      absolutely no logic and should instantly call the handler
    - The handler contains all logic but can call several helpers, clients or
      services
4. Representation
    - Transform the output of the handler to a predefined view contract

By following these few steps it will be easy to build clean, secure and
maintainable API's.

## Add packages

There are several packages we need to add for NestJS framework support:

```bash
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/swagger cors
pnpm add -D @nestjs/cli @nestjs/testing
```

We also need to create the NestJS configuration file:

```bash
echo '{"collection": "@nestjs/schematics", "sourceRoot": "src"}' > nest-cli.json
```

## Bootstrap with NestJS

The initialization of the application works different with NestJS than plain Express. NestJS uses a module-based architecture where we bootstrap the application using `NestFactory`.

First, create an `app.module.ts` file that will serve as the root module:

```ts
import { Module } from "@nestjs/common";
import { UserController } from "./controllers/users/user.controller";

@Module({
	controllers: [UserController],
})
export class AppModule {}
```

Next, replace your `server.ts` with `main.ts` to bootstrap the NestJS application:

```ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		})
	);

	// Enable CORS
	app.enableCors({
		origin: "*",
		credentials: true,
		exposedHeaders: ["x-auth"],
	});

	// Set global prefix
	app.setGlobalPrefix("api");

	await app.listen(3000);
	console.log("🚀 http://localhost:3000");
}

bootstrap();
```

You can also delete the old `app.ts` file as it's no longer needed with NestJS.

## Convert users route to controller

### Controller definition

In NestJS what makes a controller a controller is simply
the `@Controller` decorator. Because the class is decorated with this
decorator NestJS will understand how to process the class.

You need to specify the route path in the decorator, in our case this should
be `users`.

Your result should look like this:

```ts
@Controller("users")
export class UserRoute {}
```

However, the name is actually not valid anymore.
The Route is no longer a router but a controller.  
Rename the class to `UserController`.
Make use of the VSCode built in refactoring to rename the class by
pressing [`f2`] (or [`fn`]+[`f2`] depending
on your settings). By changing the name like this all references will
automatically be renamed as well.  
Now also rename the file `user.controller.ts`

### Add all endpoints to the controller

Endpoints are defined completely different from what we had before. Instead of
constructing the endpoint with express router, we now can simply add a method
for
each endpoint with some decorators.

Very detailed examples and documentation can be found
on [the NestJS documentation](https://docs.nestjs.com/controllers).

Converting the code:

1. Remove the router and the path properties from the controller
2. Comment the entire constructor for now
3. Add a method for each endpoint

    The controller should look like this now:

    ```ts
    @Controller("users")
    export class UserController {
    	//   constructor() {
    	//     this.router = Router();
    	//     this.path = "users";

    	//     this.router.post("/", adminMiddleware, create);
    	//     this.router.get("/", getList);
    	//     this.router.get("/:id", get);
    	//     this.router.patch(
    	//       "/:id",
    	//       patchValidationMiddleware,
    	//       update,
    	//       representationMiddleware
    	//     );
    	//     this.router.delete("/:id", deleteUser);
    	//   }
    	async create() {}

    	async getList() {}

    	async get() {}

    	async update() {}

    	async delete() {}
    }
    ```

4. Next up you should tell NestJS that these methods are the
   routes, specify the path and the http-method.

    NestJS has some decorators to accomplish this. For each
    http-method there is a decorator, the argument you pass defines the path.
    ex `@Post()`

    When that's done NestJS will actually know the endpoints we
    have defined.

5. In the method body you can call the handlers now. Currently, that will still
   give errors as we don't pass the arguments defined in the handlers yet. We'll
   be fixing that later.

    Most of the commented code is now converted so lets clean it up. Remove all
    lines except the `post` and `patch`; we'll come back to the middleware used
    there later.

The current code:

```ts
@Controller("users")
export class UserController {
	//     this.router.post("/", adminMiddleware, create);
	//     this.router.patch(
	//       "/:id",
	//       patchValidationMiddleware,
	//       update,
	//       representationMiddleware
	//     );
	@Post()
	async create() {
		return create();
	}

	@Get()
	async getList() {
		return getList();
	}

	@Get(":id")
	async get() {
		return get();
	}

	@Patch(":id")
	async update() {
		return update();
	}

	@Delete(":id")
	async delete() {
		await deleteUser();
	}
}
```

#### NestJS body decorator to inject body

Previously we implemented body validation manually in the handler, after that we
converted it into middleware.  
Now we will be using NestJS's `@Body()` decorator to inject the body into the
controller method and have the body automatically transformed and validated.

The decorator should be used just before an argument, for example:

```
async create(@Body() body: UserBody) {}
```

The type of `UserBody` will automatically be inferred and used for the
transformation and validation through NestJS's ValidationPipe that we configured in `main.ts`.

For updating an entity we don't want to require all properties to be provided.
NestJS will automatically handle partial validation when using class-validator
decorators with `@IsOptional()` on optional fields.

```
async update(@Body() body: UserBody) {}
```

That covers all body validations that previously were done manually. You can
remove `patchValidationMiddleware` and the manual validation/transformation from
the `create` handler now.

#### NestJS query decorator to inject search param

The query decorator actually works exactly the same as the body decorator, only
instead of processing `request.body` it processes `request.query`.

For the get list endpoint we expect a search parameter. In order to validate the
parameter you can add a query contract: `src/contracts/search.query.ts` where
you validate it as a string and specify it as optional.

Defining the contract:

```ts
// search.query.ts
import { IsString, IsOptional } from "class-validator";

export class SearchQuery {
	@IsString()
	@IsOptional()
	public search?: string;
}
```

And use it like this:

```
async getList(@Query() query: SearchQuery) {}
```

#### NestJS Param decorator to inject id's (or other params)

`request.params` needs to be injected one by one with the `@Param()` decorator
from `@nestjs/common`. Type conversion is not supported here so it will
always inject a string.

It's used like this:

```
async get(@Param("id") id: string){}
```

Apply this decorator to all endpoints containing an id.

#### Guards for authentication

The last thing we need from the currently commented route definitions is
the authentication logic (the `adminMiddleware`).

NestJS uses Guards instead of middleware for authentication and authorization.
We'll create a proper JWT guard later in the authentication section, but for now
you can remove the `adminMiddleware` as we'll replace it with a proper guard.

So you can go ahead and remove the remaining commented
code, `patchValidationMiddleware` and `representationMiddleware`.

### Converting handlers

With plain express we had to manually take what we needed from the request.
Quite a hassle to do. Definitely when trying to test a handler and you need to
mock the request/response.

Since we are injecting only the items we need now, this becomes a lot easier.

1. Replace the arguments in each handler with the ones we
   need: `body`, `id`, `query`
    - Also pass the these arguments to the handler from the controller
2. Return the result instead of calling `res.json(...)` or assigning it
   to `locals`
3. Remove the validation/transformation as this has now been abstracted away
   with the decorators
4. Remove the `next` function calls
5. Throw a NestJS `NotFoundException` when no user is found instead of manually
   returning an error (we'll come back to this in the next section)

Now all references to `request`, `response` and `next` are gone. The build
errors in the handlers and controller should also be resolved.

<details>
<summary>user.controller.ts</summary>

```ts
import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	HttpCode,
	HttpStatus,
} from "@nestjs/common";

import { SearchQuery } from "../../contracts/search.query";
import { UserBody } from "../../contracts/user.body";
import { create } from "./handlers/create.handler";
import { deleteUser } from "./handlers/delete.handler";
import { get } from "./handlers/get.handler";
import { getList } from "./handlers/getList.handler";
import { update } from "./handlers/update.handler";

@Controller("users")
export class UserController {
	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() body: UserBody) {
		return create(body);
	}

	@Get()
	async getList(@Query() query: SearchQuery) {
		return getList(query.search);
	}

	@Get(":id")
	async get(@Param("id") id: string) {
		return get(id);
	}

	@Patch(":id")
	async update(@Param("id") id: string, @Body() body: UserBody) {
		return update(id, body);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param("id") id: string) {
		await deleteUser(id);
	}
}
```

</details>

<details>
<summary>create.handler.ts</summary>

```ts
import { UserBody } from "../../../contracts/user.body";
import { UserStore } from "./user.store";

export const create = async (body: UserBody) => {
	const user = UserStore.add(body);

	return user;
};
```

</details>

<details>
<summary>getList.handler.ts</summary>

```ts
import { UserStore } from "./user.store";

export const getList = (search: string) => {
	const users = UserStore.find(search);
	return users;
};
```

</details>

<details>
<summary>get.handler.ts</summary>

```ts
import { NotFoundException } from "@nestjs/common";

import { UserStore } from "./user.store";

export const get = (idString: string) => {
	const id = Number(idString);
	const user = UserStore.get(id);
	if (!user) {
		throw new NotFoundException("User not found");
	}
	return user;
};
```

</details>

<details>
<summary>update.handler.ts</summary>

```ts
import { NotFoundException } from "@nestjs/common";

import { UserBody } from "../../../contracts/user.body";
import { UserStore } from "./user.store";

export const update = (idString: string, body: UserBody) => {
	const id = Number(idString);
	const user = UserStore.get(id);
	if (!user) {
		throw new NotFoundException("User not found");
	}
	const updated = UserStore.update(id, { ...user, ...body });
	return updated;
};
```

</details>

<details>
<summary>delete.handler.ts</summary>

```ts
import { NotFoundException } from "@nestjs/common";

import { UserStore } from "./user.store";

export const deleteUser = (idString: string) => {
	const id = Number(idString);
	const user = UserStore.get(id);
	if (!user) {
		throw new NotFoundException("User not found");
	}
	UserStore.delete(id);
};
```

</details>
<br>

### NestJS Error handling

Handling expected errors manually is a bit of a pain as you might have noticed
when doing so in a previous section. It's much easier to just be able to throw
a NestJS exception and have it handled in the background.

You already implemented the `NotFoundException` error but there are
other [built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
as well.

NestJS automatically handles exceptions for you:

-   All unhandled exceptions are automatically caught by the built-in exception filter
-   HTTP exceptions are automatically converted to proper HTTP responses
-   Async errors are handled automatically (no need for express-async-errors)

The built-in exception filter returns JSON responses in the following format:

```json
{
	"statusCode": 404,
	"message": "User not found",
	"error": "Not Found"
}
```

NestJS comes with many built-in exceptions like:

-   `BadRequestException`
-   `UnauthorizedException`
-   `NotFoundException`
-   `ForbiddenException`
-   `InternalServerErrorException`
-   And many more...

## Response Serialization

NestJS automatically serializes responses and uses class-transformer to transform your response objects. When you return an object from your controller method, NestJS will automatically serialize it to JSON.

To control what properties are exposed in the response, you can use class-transformer decorators in your view contracts:

-   `@Exclude()` - Exclude the property from serialization
-   `@Expose()` - Expose the property in serialization
-   `@Transform()` - Transform the property value during serialization

### Update UserView Contract

Make sure your `UserView` contract properly excludes sensitive data:

```ts
// src/contracts/user.view.ts
import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsString, IsUUID } from "class-validator";

@Exclude()
export class UserView {
	@Expose()
	@IsUUID()
	id: string;

	@Expose()
	@IsString()
	name: string;

	@Expose()
	@IsEmail()
	email: string;

	// password is automatically excluded because it's not @Expose()d
}
```

### Setting HTTP Status Codes

You can explicitly set HTTP status codes using the `@HttpCode()` decorator:

```ts
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() body: UserBody) {
	return create(body);
}

@Delete(":id")
@HttpCode(HttpStatus.NO_CONTENT)
async delete(@Param("id") id: string) {
	await deleteUser(id);
}
```

### List Responses

For the get list endpoint, you can simply return the array of users. NestJS will automatically serialize each user according to the UserView contract:

```ts
export const getList = (search: string): User[] => {
	const users = UserStore.find(search);
	return users;
};
```

Your controller method can specify the return type:

```ts
@Get()
async getList(@Query() query: SearchQuery): Promise<UserView[]> {
	return getList(query.search);
}
```

## Update server start commands in package.json
Nest.js uses the following commands to start the app, so add/modify them in `package.json`:
```
"build": "nest build",
"start": "nest start",
"start:dev": "nest start --watch",
"start:debug": "nest start --debug --watch",
```

## Fix tests

While converting the code, we introduced some breaking changes. That means the
previously created tests will no longer work.  
The handlers now have different arguments and responses, so we need to adjust the
tests accordingly.  
Most endpoints themselves are exactly the same, so the integration tests should
remain mainly the same.  
However, there are some small changes like the exception types that need to be updated.

### Handler tests without the request/response

The handlers have a simple, readable signature now, without the bloated express
objects.
So now you can simplify the tests and remove the mocked request and response.
Just pass in the arguments you need and get the return value to validate.

<details>
<summary>The code</summary>

```ts
import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";

import { create } from "../../controllers/users/handlers/create.handler";
import { deleteUser } from "../../controllers/users/handlers/delete.handler";
import { get } from "../../controllers/users/handlers/get.handler";
import { getList } from "../../controllers/users/handlers/getList.handler";
import { update } from "../../controllers/users/handlers/update.handler";
import { User, UserStore } from "../../controllers/users/handlers/user.store";

const userFixtures: User[] = [
	{
		name: "test1",
		email: "test-user+1@panenco.com",
		id: 0,
		password: "password1",
	},
	{
		name: "test2",
		email: "test-user+2@panenco.com",
		id: 1,
		password: "password2",
	},
];

describe("Handler tests", () => {
	describe("User Tests", () => {
		beforeEach(() => {
			UserStore.users = [...userFixtures]; // Clone the array
		});

		it("should get users", () => {
			const res = getList(null);

			expect(res.some((x) => x.name === "test2")).true;
		});

		it("should get user by id", () => {
			const res = get("1");

			expect(res.name).equal("test2");
			expect(res.email).equal("test-user+2@panenco.com");
		});

		it("should fail when getting user by unknown id", () => {
			try {
				get("999");
			} catch (error) {
				expect(error.message).equal("User not found");
				return;
			}
			expect(true, "should have thrown an error").false;
		});

		it("should create user", async () => {
			const body = {
				email: "test-user+new@panenco.com",
				name: "newUser",
				password: "reallysecretstuff",
			} as User;
			const res = await create(body);

			expect(res.name).equal("newUser");
			expect(res.email).equal("test-user+new@panenco.com");
		});

		it("should update user", async () => {
			const body = {
				email: "test-user+updated@panenco.com",
			} as User;
			const id = 0;
			const res = update(id.toString(), body);

			expect(res.email).equal(body.email);
			expect(res.name).equal("test1");
			expect(UserStore.users.find((x) => x.id === id).email).equal(
				body.email
			);
		});

		it("should delete user by id", () => {
			const initialCount = UserStore.users.length;
			deleteUser("1");

			expect(UserStore.users.some((x) => x.id === 1)).false;
			expect(initialCount - 1).equal(UserStore.users.length);
		});
	});
});
```

</details>

### Fix integration tests

The integration test shouldn't have any build error at this point. So to know if
anything needs to change here we can simply run them.

There are a few changes needed:

-   Update imports to use NestJS testing utilities
-   Remove references to Express-specific response structures
-   Update the authentication mechanism (we'll cover this in the next section)

> Bonus: You can use HTTP status constants like `200`, `201`, `404` instead of magic numbers.

<details>
<summary>The code</summary>

```ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { expect } from "chai";
import { beforeAll, beforeEach, afterAll, describe, it } from "mocha";
import * as request from "supertest";

import { AppModule } from "../../app.module";
import { UserBody } from "../../contracts/user.body";
import { User, UserStore } from "../../controllers/users/handlers/user.store";

describe("Integration tests", () => {
	describe("User Tests", () => {
		let app: INestApplication;

		beforeAll(async () => {
			const moduleFixture: TestingModule = await Test.createTestingModule(
				{
					imports: [AppModule],
				}
			).compile();

			app = moduleFixture.createNestApplication();

			// Apply the same configuration as in main.ts
			app.useGlobalPipes(
				new ValidationPipe({
					whitelist: true,
					forbidNonWhitelisted: true,
					transform: true,
				})
			);

			app.enableCors({
				origin: "*",
				credentials: true,
				exposedHeaders: ["x-auth"],
			});

			app.setGlobalPrefix("api");

			await app.init();
		});

		beforeEach(() => {
			UserStore.users = []; // Clean up users before each test
		});

		afterAll(async () => {
			await app.close();
		});

		it("should CRUD users", async () => {
			// Successfully create new user
			const { body: createResponse } = await request(app.getHttpServer())
				.post(`/api/users`)
				.send({
					name: "test",
					email: "test-user+1@panenco.com",
					password: "real secret stuff",
				} as User)
				.expect(201);

			expect(
				UserStore.users.some((x) => x.email === createResponse.email)
			).true;

			// Get the newly created user
			const { body: getResponse } = await request(app.getHttpServer())
				.get(`/api/users/${createResponse.id}`)
				.expect(200);
			expect(getResponse.name).equal("test");

			// Get all users
			const { body: getListRes } = await request(app.getHttpServer())
				.get(`/api/users`)
				.expect(200);
			expect(getListRes.length).equal(1);
			expect(getListRes[0].name).equal("test");

			// Successfully update user
			const { body: updateResponse } = await request(app.getHttpServer())
				.patch(`/api/users/${createResponse.id}`)
				.send({
					email: "test-user+1@panenco.com",
				} as User)
				.expect(200);

			expect(updateResponse.name).equal("test");
			expect(updateResponse.email).equal("test-user+1@panenco.com");
			expect(updateResponse.password).undefined; // password excluded from response

			// Delete the newly created user
			await request(app.getHttpServer())
				.delete(`/api/users/${createResponse.id}`)
				.expect(204);

			// Get all users again after deleted the only user
			const { body: getNoneResponse } = await request(app.getHttpServer())
				.get(`/api/users`)
				.expect(200);
			expect(getNoneResponse.length).equal(0);
		});
	});
});
```

</details>

🥳 🚀 That's all for the NestJS conversion of the API. Next up... **Authentication**

# Authentication & Authorization

Currently most of our endpoints are publicly available.
NestJS provides a robust authentication system using Guards to protect your routes.

We'll not go into a lot of detail on the basic principles here, but the Udemy
course has a quite extensive explanation on this
topic: [Section 12: API Authentication and Security (Task App)](https://www.udemy.com/course/the-complete-nodejs-developer-course-2/learn/lecture/13729276#overview)

## The basics

A brief intro:

-   Authentication: Verify a user's identity by checking their credentials. In our
    case we will always return a [`JWT token`](https://jwt.io)
    -   When a user provides invalid credentials, we should return
        a `401 Unauthorized` error.
-   Authorization: Use the JWT token to verify whether the user has access to the
    requested resource.
    -   When the token itself is invalid, we should return a `401 Unauthorized`
        error.
    -   When the token is valid but the user has no access to the resource we
        should return a `403 Forbidden` error.

The `@UseGuards()` decorator should be used to mark the endpoint as requiring a
token.  
You can create custom guards to add validations like `isAdmin`, `belongsToOrganization`, etc. But we
won't be covering custom requirements.

Have a look at
the [NestJS Guards documentation](https://docs.nestjs.com/guards)
for more info.

## Login

You can make authenticating users quite complex but to get you started we'll be
implementing the most basic and unsecure login ever.

The login endpoint should exist in a new controller, the `AuthController`.

First, add the JWT dependency:

```bash
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken
```

1. Create the controller (in a new `auth` folder)
2. Add the new exported class `AuthController` with the `@Controller`
   decorator and register it in the `AppModule`.
3. Create a new `LoginBody` contract that contains password and email
4. Create a new `AccessTokenView` contract that contains token and expiresIn
5. Add a handler in `src/controllers/auth/handlers/login.handler.ts` that will
   handle the login request.
    1. As input you have the `LoginBody` contract
    2. As output you have the `AccessTokenView` contract
    3. Use `getByEmail` from the `UserStore` to find the user
    4. Validate the user's password
        1. Simply compare both passwords in plain text. (this is a bad idea,
           it's just an example)
        2. Either if the user is not found or the password is wrong, throw
           an `UnauthorizedException`
    5. Use the `jsonwebtoken` library to create a JWT token
        1. secret: used to verify the fact that our application created the
           token (add this in a `config.ts` file in the `src` folder (see below))
        2. expiresIn: amount of time the token should be valid (put it to 1 hour)
        3. payload: you can put basically anything in there. In our case we'll just
           put the user id
        4. return the result
6. Create the endpoint in the controller with the `LoginBody`, `AccessTokenView`
   and call the handler

When testing this you can check the contents of the JWT token
on [jwt.io](jwt.io)  
![](assets/jwt-io.png)

<details>
<summary>config.ts</summary>

```ts
const config = {
  jwtSecret: "very_secure_jwt_secret",
};

export default config;
```

</details>

<details>
<summary>login.body.ts</summary>

```ts
import { IsEmail, IsString } from "class-validator";

export class LoginBody {
	@IsEmail()
	public email: string;

	@IsString()
	public password: string;
}
```

</details>

<details>
<summary>accessToken.view.ts</summary>

```ts
import { IsNumber, IsString } from "class-validator";

export class AccessTokenView {
	@IsString()
	public token: string;

	@IsNumber()
	public expiresIn: number;
}
```

</details>

<details>
<summary>auth.controller.ts</summary>

```ts
import { Controller, Post, Body } from "@nestjs/common";

import { AccessTokenView } from "../../contracts/accessToken.view";
import { LoginBody } from "../../contracts/login.body";
import { createToken } from "./handlers/login.handler";

@Controller("auth")
export class AuthController {
	@Post("login")
	async login(@Body() body: LoginBody): Promise<AccessTokenView> {
		return createToken(body);
	}
}
```

</details>

<details>
<summary>login.handler.ts</summary>

```ts
import { UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

import { LoginBody } from "../../../contracts/login.body";
import { UserStore } from "../../users/handlers/user.store";
import config from "../../../config";

export const createToken = async (body: LoginBody) => {
	const user = UserStore.getByEmail(body.email);
	if (!user || user.password !== body.password) {
		throw new UnauthorizedException("Invalid credentials");
	}

	const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
		expiresIn: "1h",
	});

	return {
		token,
		expiresIn: 3600, // 1 hour in seconds
	};
};
```

</details>

## JWT Guard

The guard is the thing that will verify the JWT token and protect your routes.

Create a JWT guard `src/guards/jwt-auth.guard.ts`:

```ts
import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import config from "../config";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const token = request.headers["x-auth"];

		if (!token) {
			throw new UnauthorizedException("Token not provided");
		}

		try {
			const payload = jwt.verify(token, config.jwtSecret) as any;
			request.user = payload;
			return true;
		} catch (error) {
			throw new UnauthorizedException("Invalid token");
		}
	}
}
```

Now when we use the `@UseGuards(JwtAuthGuard)` decorator, this guard will be
used to validate the tokens created by the login handler.

## @UseGuards()

All preparations have been done, and it's finally time to secure our endpoints!

First, update your `AppModule` to include the `AuthController`:

```ts
import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth/auth.controller";
import { UserController } from "./controllers/users/user.controller";

@Module({
	controllers: [AuthController, UserController],
})
export class AppModule {}
```

Simply add the `@UseGuards(JwtAuthGuard)` decorator to your users endpoints and the endpoints
will no longer be freely available. Secure get, getList, patch and delete. Leave
the `POST` endpoint publicly available so you can still create new users.

```ts
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
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";

@Controller("users")
export class UserController {
	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() body: UserBody) {
		return create(body);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getList(@Query() query: SearchQuery) {
		return getList(query.search);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard)
	async get(@Param("id") id: string) {
		return get(id);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard)
	async update(@Param("id") id: string, @Body() body: UserBody) {
		return update(id, body);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param("id") id: string) {
		await deleteUser(id);
	}
}
```

When running your integration test now you'll notice it's failing with
`Unauthorized` errors. Change it up a bit to first create a new user, then
login and use the response token in the `x-auth` header to access the other
endpoints.

Here's an updated integration test that demonstrates the authentication flow:

```ts
it("should CRUD users with authentication", async () => {
	// Successfully create new user (public endpoint)
	const { body: createResponse } = await request(app.getHttpServer())
		.post(`/api/users`)
		.send({
			name: "test",
			email: "test-user+1@panenco.com",
			password: "real secret stuff",
		})
		.expect(201);

	expect(UserStore.users.some((x) => x.email === createResponse.email)).true;

	// Login to get JWT token
	const { body: loginResponse } = await request(app.getHttpServer())
		.post(`/api/auth/login`)
		.send({
			email: "test-user+1@panenco.com",
			password: "real secret stuff",
		})
		.expect(200);

	const token = loginResponse.token;
	expect(token).to.be.a("string");

	// Try to access protected endpoint without token (should fail)
	await request(app.getHttpServer()).get(`/api/users`).expect(401);

	// Get all users with valid token
	const { body: getListRes } = await request(app.getHttpServer())
		.get(`/api/users`)
		.set("x-auth", token)
		.expect(200);
	expect(getListRes.length).equal(1);
	expect(getListRes[0].name).equal("test");

	// Get the newly created user with token
	const { body: getResponse } = await request(app.getHttpServer())
		.get(`/api/users/${createResponse.id}`)
		.set("x-auth", token)
		.expect(200);
	expect(getResponse.name).equal("test");

	// Successfully update user with token
	const { body: updateResponse } = await request(app.getHttpServer())
		.patch(`/api/users/${createResponse.id}`)
		.send({
			email: "test-user+updated@panenco.com",
		})
		.set("x-auth", token)
		.expect(200);

	expect(updateResponse.name).equal("test");
	expect(updateResponse.email).equal("test-user+updated@panenco.com");
	expect(updateResponse.password).undefined; // password excluded from response

	// Delete the user with token
	await request(app.getHttpServer())
		.delete(`/api/users/${createResponse.id}`)
		.set("x-auth", token)
		.expect(204);

	// Verify user is deleted
	const { body: getNoneResponse } = await request(app.getHttpServer())
		.get(`/api/users`)
		.set("x-auth", token)
		.expect(200);
	expect(getNoneResponse.length).equal(0);
});
```

<details>
<summary>user.controller.ts</summary>

```ts
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

import { SearchQuery } from "../../contracts/search.query";
import { UserBody } from "../../contracts/user.body";
import { UserView } from "../../contracts/user.view";
import { create } from "./handlers/create.handler";
import { deleteUser } from "./handlers/delete.handler";
import { get } from "./handlers/get.handler";
import { getList } from "./handlers/getList.handler";
import { update } from "./handlers/update.handler";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";

@Controller("users")
export class UserController {
	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() body: UserBody): Promise<UserView> {
		return create(body);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getList(@Query() query: SearchQuery): Promise<UserView[]> {
		return getList(query.search);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard)
	async get(@Param("id") id: string): Promise<UserView> {
		return get(id);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard)
	async update(
		@Param("id") id: string,
		@Body() body: UserBody
	): Promise<UserView> {
		return update(id, body);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param("id") id: string): Promise<void> {
		await deleteUser(id);
	}
}
```

</details>

<details>
<summary>user.integration.test.ts with NestJS</summary>

```ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { expect } from "chai";
import { beforeAll, beforeEach, afterAll, describe, it } from "mocha";
import * as request from "supertest";

import { AppModule } from "../../app.module";
import { UserBody } from "../../contracts/user.body";
import { UserStore } from "../../controllers/users/handlers/user.store";

describe("Integration tests", () => {
	describe("User Tests", () => {
		let app: INestApplication;

		beforeAll(async () => {
			const moduleFixture: TestingModule = await Test.createTestingModule(
				{
					imports: [AppModule],
				}
			).compile();

			app = moduleFixture.createNestApplication();

			// Apply the same configuration as in main.ts
			app.useGlobalPipes(
				new ValidationPipe({
					whitelist: true,
					forbidNonWhitelisted: true,
					transform: true,
				})
			);

			app.enableCors({
				origin: "*",
				credentials: true,
				exposedHeaders: ["x-auth"],
			});

			app.setGlobalPrefix("api");

			await app.init();
		});

		beforeEach(() => {
			// Clean up in-memory store before each test
			UserStore.users = [];
		});

		afterAll(async () => {
			await app.close();
		});

		it("should CRUD users with authentication", async () => {
			// Test unauthorized access
			await request(app.getHttpServer()).get(`/api/users`).expect(401);

			// Successfully create new user (public endpoint)
			const { body: createResponse } = await request(app.getHttpServer())
				.post(`/api/users`)
				.send({
					name: "test",
					email: "test-user+1@panenco.com",
					password: "real secret stuff",
				} as UserBody)
				.expect(201);

			// Verify user was created in memory store
			expect(
				UserStore.users.some((x) => x.email === createResponse.email)
			).true;

			// Login to get JWT token
			const { body: loginResponse } = await request(app.getHttpServer())
				.post(`/api/auth/login`)
				.send({
					email: "test-user+1@panenco.com",
					password: "real secret stuff",
				})
				.expect(200);

			const token = loginResponse.token;
			expect(token).to.be.a("string");

			// Get all users with valid token
			const { body: getListRes } = await request(app.getHttpServer())
				.get(`/api/users`)
				.set("x-auth", token)
				.expect(200);
			expect(getListRes.length).equal(1);
			expect(getListRes[0].name).equal("test");

			// Get the newly created user with token
			const { body: getResponse } = await request(app.getHttpServer())
				.get(`/api/users/${createResponse.id}`)
				.set("x-auth", token)
				.expect(200);
			expect(getResponse.name).equal("test");

			// Successfully update user with token
			const { body: updateResponse } = await request(app.getHttpServer())
				.patch(`/api/users/${createResponse.id}`)
				.send({
					email: "test-user+updated@panenco.com",
				})
				.set("x-auth", token)
				.expect(200);

			expect(updateResponse.name).equal("test");
			expect(updateResponse.email).equal("test-user+updated@panenco.com");
			expect(updateResponse.password).undefined; // password excluded from response

			// Delete the user with token
			await request(app.getHttpServer())
				.delete(`/api/users/${createResponse.id}`)
				.set("x-auth", token)
				.expect(204);

			// Verify user is deleted
			const { body: getNoneResponse } = await request(app.getHttpServer())
				.get(`/api/users`)
				.set("x-auth", token)
				.expect(200);
			expect(getNoneResponse.length).equal(0);
		});
	});
});
```

</details>

# API Documentation

Manually writing and maintaining API documentation is a horrible task to do.
Some things will always be incorrect or not up to date. Frontend developers will
have a terrible experience as they don't have a correct guide on what endpoints
there are and what they do.

Luckily it's amazingly easy to generate these docs automatically because of the
decorator based approach we're using.

2 things to understand:

-   [OpenAPI](https://swagger.io/specification/): A specification for how to
    describe an API. It's the standardized format we need to serve into a
    graphical interface of our endpoints. It will contain all information about
    the contracts and endpoints.
-   [Swagger](https://swagger.io/solutions/api-documentation/): The actual
    interface we use to display the documentation.

## Configure swagger

### Add packages

NestJS has built-in Swagger support that's much easier to set up:

```bash
pnpm add @nestjs/swagger swagger-ui-express
```

-   `@nestjs/swagger` provides the built-in Swagger integration
-   `swagger-ui-express` to display the documentation

### Configure swagger-ui in main.ts

NestJS provides built-in Swagger support that's much easier to configure. Update your `main.ts` file to include Swagger configuration:

```ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		})
	);

	// Enable CORS
	app.enableCors({
		origin: "*",
		credentials: true,
		exposedHeaders: ["x-auth"],
	});

	// Set global prefix
	app.setGlobalPrefix("api");

	// Swagger configuration
	const config = new DocumentBuilder()
		.setTitle("Node Course API")
		.setDescription("The Node Course API description")
		.setVersion("1.0")
		.addApiKey(
			{
				type: "apiKey",
				name: "x-auth",
				in: "header",
			},
			"x-auth"
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, document);

	await app.listen(3000);
	console.log("🚀 http://localhost:3000/docs");
}

bootstrap();
```

### Endpoint descriptions

This will already give you very handy docs. However if you have 100+ endpoints,
not every endpoint might be very self explanatory.  
To fix that we can add some descriptions using NestJS Swagger decorators.

Add Swagger decorators to your controllers:

```ts
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiSecurity,
} from "@nestjs/swagger";

@ApiTags("users")
@Controller("users")
export class UserController {
	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create a new user" })
	@ApiResponse({ status: 201, description: "User created successfully" })
	async create(@Body() body: UserBody) {
		return create(body);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiSecurity("x-auth")
	@ApiOperation({ summary: "Get all users" })
	@ApiResponse({ status: 200, description: "Users retrieved successfully" })
	async getList(@Query() query: SearchQuery) {
		return getList(query.search);
	}
}
```

## Test out swagger

You can go ahead and start up your API and checkout the docs
on [localhost:3000/docs](http://localhost:3000/docs).  
![](assets/swagger.png)

For instance, execute a flow in there:

-   Create a user
-   Get login
-   Configure it in the top right with the "Authorize" button
-   Get your user

Your NestJS application is now properly configured with Swagger documentation!

# Database

## Intro

Up until now we've only used a minimalistic in-memory store. Obviously that's
not something you can use for a real product. So next up, it's time to use a
real database. For this example we'll be using Postgres running in a docker
container.

## Docker

Docker is a way to virtually run operating systems preinstalled with certain
software to run on your pc. No deep understanding of docker is needed for this
course but there is a ton of information online if you're interested.

### Installing docker

If it's not yet installed, you can
install [docker](https://formulae.brew.sh/formula/docker) with brew:

```bash
brew install docker
```

In order to get some extra functionality, you also need to
install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Docker container

To configure the docker container, we'll create a compose file. This holds
information about the image to use and the variables used to configure it.

1. Add a `docker-compose.yml` file in the root of the project:

    ```yaml
    version: "3"
    services:
        postgres:
            container_name: example-postgres
            image: postgres:latest
            ports:
                - "5432:5432"
            volumes:
                - ./data/postgres:/data/example-postgres
            env_file:
                - docker.env
    ```

2. Add a `docker.env` file in the root of the project to configure postgres:

    ```env
    POSTGRES_USER=root
    POSTGRES_PASSWORD=root
    POSTGRES_DB=example
    POSTGRES_CONTAINER=example-postgres
    ```

### Running a compose file

The compose file has a default naming format so with the filename as it was
previously specified it will automatically be found.

Running a container is as simple as running `docker-compose up` in your terminal
but we want to start it in the background so we'll add `-d` flag, which gives
us:

```bash
  docker compose up -d
```

![](assets/docker-started.png)

That's it, now you have a postgres database running on your pc, exposed on the
default port `5432`.

## Accessing the database

A great tool to checkout, query and update the data in a database
is [TablePlus](https://tableplus.com/).
Install it by following the instructions on their website.

When opening the app, you should see something like this:  
![](assets/tableplus-empty.png)

Adding the database:

1. Add a postgres connection  
   ![](assets/table-plus-add-postgres.png)
2. Enter the connection details
    - Name: Course db
    - Host: 127.0.0.1
    - Port: 5432
    - User: root
    - Password: root
    - Database: example  
      ![](assets/table-plus-connection-details.png)
3. Test and connect
    - Hit the test button at the bottom, if no error shows up you're good to go
    - Connect  
      ![](assets/table-plus-connect.png)

Naturally, there is not a lot to see here yet because we haven't created any
tables or data yet. We'll do that next.

# Prisma

With our CRUD routes and database in place it is now time to migrate our
handlers from using the in-memory store to functions modifying and reading our
PostgreSQL database.

To query tables in our PostgreSQL database, SQL statements are used. Instead of
writing plain SQL statements (SELECT, UPDATE, INSERT,...) in our JS handlers, we
use Object-Relational Mappers (ORMs) that do the heavy lifting for us.

An ORM provides a mapping between your database and your object oriented
programming language of choice, allowing you to query and manipulate data using
the OOP paradigms we all know and love.
For better understanding of ORMs, read
this [stack overflow explanation](https://stackoverflow.com/a/1279678).

## Intro

Each ORM comes with its own superset of functionalities and
advantages/disadvantages. While carefully following up on the newest industry
trends, we choose to use [Prisma](https://www.prisma.io/).

Prisma is a modern TypeScript ORM with an intuitive data model, automated migrations, type-safety, and auto-completion.

## Bootstrap Prisma

### Add packages

Prisma consists of two main packages: the Prisma CLI for development tasks and the Prisma Client for runtime database access. We also need bcryptjs for password hashing:

```bash
pnpm add prisma@6 @prisma/client@6 bcryptjs
pnpm add -D @types/bcryptjs
```

### Initialize Prisma

First, we need to initialize Prisma in our project:

```bash
npx prisma init
```

This creates:

-   A `prisma` directory with a `schema.prisma` file
-   A `.env` file for environment variables

### Prisma Schema

Prisma uses a single schema file to define your database structure. Replace the content of `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Environment Configuration

Update your `docker.env` file to include the DATABASE_URL:

```env
POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_DB=example
POSTGRES_CONTAINER=example-postgres
DATABASE_URL="postgresql://root:root@localhost:5432/example?schema=public"
```

Keep the existing `config.json` file as it's still used for other application settings:

-   `config.json`

```json
{
	"port": 3000,
	"jwtSecret": "jwtSecretFromConfigHere",
	"postgres": {
		"db": "example",
		"host": "localhost",
		"password": "root",
		"port": 5432,
		"user": "root"
	}
}
```

### Prisma Client Setup

Create a Prisma client instance that will be used throughout your application. Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Database Connection in NestJS

With NestJS, you can connect to Prisma during the application bootstrap process. Update your `main.ts` to initialize the database connection:

```ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { prisma } from "./lib/prisma";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		})
	);

	// Enable CORS
	app.enableCors({
		origin: "*",
		credentials: true,
		exposedHeaders: ["x-auth"],
	});

	// Set global prefix
	app.setGlobalPrefix("api");

	// Connect to database
	await prisma.$connect();
	console.log("Database connected successfully");

	await app.listen(3000);
	console.log("🚀 http://localhost:3000");
}

bootstrap().catch(console.error);
```

Alternatively, you can create a custom Prisma service and inject it as a provider in your NestJS modules for better dependency injection patterns.

### Database Schema Management

So now our application can connect to the database, however it remains empty and
is not being used.

#### Prisma Schema

With Prisma, your database schema is defined in a single `schema.prisma` file using Prisma's schema language. This is much simpler than maintaining separate entity files.

Our User model is already defined in the schema file we created earlier:

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

Key features of this schema:

-   We are using UUIDs (String type with `@default(uuid())`) instead of numerical incremental ids
-   The `@unique` directive ensures email uniqueness
-   `createdAt` and `updatedAt` are automatically managed by Prisma
-   `@@map("users")` maps the model to a "users" table in the database

#### Generate Prisma Client

After defining your schema, generate the Prisma Client:

```bash
npx prisma generate
```

This creates type-safe client code based on your schema that you can use in your application.

#### Migrations

Having defined the schema, this now needs to be translated to SQL statements to
create the accompanying database schema.

Prisma has excellent built-in support for database migrations with automatic generation and version control.

Add the following scripts to your `package.json`:

```json
{
	"scripts": {
		"db:generate": "prisma generate",
		"db:push": "prisma db push",
		"db:migrate": "prisma migrate dev",
		"db:studio": "prisma studio"
	}
}
```

To create and execute a migration:

1. Make sure your database is up and running: `docker compose up -d`
2. Set the DATABASE_URL environment variable: `export DATABASE_URL="postgresql://root:root@localhost:5432/example?schema=public"`
3. For development, you can use: `pnpm db:push` (pushes schema without creating migration files)
4. For production migrations: `pnpm db:migrate` (creates migration files and applies them)
5. Generate the Prisma client: `pnpm db:generate`

For development, you typically use `prisma db push` which is faster:

```bash
DATABASE_URL="postgresql://root:root@localhost:5432/example?schema=public" pnpm db:push
```

Now that the schema is pushed, a refresh of your database (`⌘+R` or `ctrl+R`) in
TablePlus should show you the `users` table with all the properties we defined.

To find out more details about your database schema, click the 'Structure'
button in the bottom of the TablePlus app (located next to Data).

Since database migrations can run on large amounts of critical production data,
Prisma provides safety features:

-   Migrations are executed in transactions
-   Migration history is tracked in the `_prisma_migrations` table
-   You can reset your database: `prisma migrate reset`

## Updating the handlers

With the database connected and our schema in place, we are now ready to
update the handlers to insert, update, fetch and delete the users from the
database.

### Using Prisma Client

The Prisma client we created in `src/lib/prisma.ts` can be imported and used anywhere in your application. Each method on the client is automatically type-safe based on your schema.

### Replacing the UserStore queries

Now we replace all occurrences of the UserStore with Prisma client queries:

1. Import the Prisma client in each handler: `import { prisma } from "../../../lib/prisma";`
2. Add password hashing with bcrypt for security: `import bcrypt from "bcryptjs";`
3. Use Prisma's intuitive query methods: `create`, `findMany`, `findUnique`, `update`, `delete`
4. For search functionality, use Prisma's `contains` filter with case-insensitive mode
5. Remove the UserStore

Key features:

-   Type-safe queries with auto-completion
-   Automatic password hashing in create and update handlers
-   Intuitive query syntax

<details>
<summary>create.handler.ts</summary>

```ts
import { prisma } from "../../../lib/prisma";
import { UserBody } from "../../../contracts/user.body";
import bcrypt from "bcryptjs";

export const create = async (body: UserBody) => {
	const hashedPassword = await bcrypt.hash(body.password, 10);

	const user = await prisma.user.create({
		data: {
			name: body.name,
			email: body.email,
			password: hashedPassword,
		},
	});

	return user;
};
```

</details>

<details>
<summary>getList.handler.ts</summary>

```ts
import { prisma } from "../../../lib/prisma";

export const getList = async (search?: string) => {
	const where = search
		? {
				OR: [
					{
						name: {
							contains: search,
							mode: "insensitive" as const,
						},
					},
					{
						email: {
							contains: search,
							mode: "insensitive" as const,
						},
					},
				],
		  }
		: {};

	const users = await prisma.user.findMany({
		where,
		orderBy: { createdAt: "desc" },
	});

	return [users, users.length];
};
```

</details>

<details>
<summary>get.handler.ts</summary>

```ts
import { NotFoundException } from "@nestjs/common";
import { prisma } from "../../../lib/prisma";

export const get = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: { id },
	});

	if (!user) {
		throw new NotFoundException("User not found");
	}

	return user;
};
```

</details>

<details>
<summary>update.handler.ts</summary>

```ts
import { NotFoundException } from "@nestjs/common";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { UserBody } from "../../../contracts/user.body";

export const update = async (id: string, body: Partial<UserBody>) => {
	const existingUser = await prisma.user.findUnique({
		where: { id },
	});

	if (!existingUser) {
		throw new NotFoundException("User not found");
	}

	const updateData: any = {};
	if (body.name !== undefined) updateData.name = body.name;
	if (body.email !== undefined) updateData.email = body.email;
	if (body.password !== undefined) {
		updateData.password = await bcrypt.hash(body.password, 10);
	}

	return prisma.user.update({
		where: { id },
		data: updateData,
	});
};
```

</details>

<details>
<summary>delete.handler.ts</summary>

```ts
import { NotFoundException } from "@nestjs/common";
import { prisma } from "../../../lib/prisma";

export const deleteUser = async (id: string) => {
	const existingUser = await prisma.user.findUnique({
		where: { id },
	});

	if (!existingUser) {
		throw new NotFoundException("User not found");
	}

	await prisma.user.delete({
		where: { id },
	});
};
```

</details><details>
<summary>login.handler.ts</summary>

```ts
import { UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { LoginBody } from "../../../contracts/login.body";

export const createToken = async (body: LoginBody) => {
	const user = await prisma.user.findUnique({
		where: { email: body.email },
	});

	if (!user) {
		throw new UnauthorizedException("Invalid credentials");
	}

	const isPasswordValid = await bcrypt.compare(body.password, user.password);
	if (!isPasswordValid) {
		throw new UnauthorizedException("Invalid credentials");
	}

	const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
		expiresIn: "1h",
	});

	return {
		token,
		expiresIn: 3600, // 1 hour in seconds
	};
};
```

</details>

### Error Handling with Prisma

As you might have noticed, looking for an entity and throwing a `NotFoundException` error
when not found, is a commonly returning pattern. With Prisma, this pattern is
straightforward - you simply check if the result is null and throw the
appropriate error.

Prisma's `findUnique` method returns `null` when no record is found, making it
easy to handle the not-found case consistently across your handlers:

```ts
const user = await prisma.user.findUnique({
	where: { id },
});

if (!user) {
	throw new NotFoundException("User not found");
}
```

This approach is explicit and easy to understand.

## Fix tests

At this point, our handlers exchanged the UserStore for working with a database,
but our tests have not been updated.

### Integration tests

For integration tests:

-   Create a NestJS test application using the Test module
-   Connect to the database during test setup
-   Clear the database using Prisma before each test

<details>
<summary>user.integration.test.ts</summary>

```ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../app.module";
import { prisma } from "../../lib/prisma";

describe("Integration tests", () => {
	describe("User Tests", () => {
		let app: INestApplication;

		beforeAll(async () => {
			const moduleFixture: TestingModule = await Test.createTestingModule(
				{
					imports: [AppModule],
				}
			).compile();

			app = moduleFixture.createNestApplication();

			// Configure app like in main.ts
			app.useGlobalPipes(
				new ValidationPipe({
					whitelist: true,
					forbidNonWhitelisted: true,
					transform: true,
				})
			);

			app.enableCors({
				origin: "*",
				credentials: true,
				exposedHeaders: ["x-auth"],
			});

			app.setGlobalPrefix("api");

			await app.init();

			// Connect to database
			await prisma.$connect();
		});

		beforeEach(async () => {
			// Clean up database before each test
			await prisma.user.deleteMany();
		});

		afterAll(async () => {
			await app.close();
		});

		// ... your tests here
	});
});
```

</details>

### Handler tests

For our handler tests:

1. Before running the suite, create test fixtures using Prisma
2. Clean up the database before each test using `prisma.user.deleteMany()`

<details>
<summary>user.handler.test.ts</summary>

```ts
import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

import { create } from "../../controllers/users/handlers/create.handler";
import { deleteUser } from "../../controllers/users/handlers/delete.handler";
import { get } from "../../controllers/users/handlers/get.handler";
import { getList } from "../../controllers/users/handlers/getList.handler";
import { update } from "../../controllers/users/handlers/update.handler";
import { prisma } from "../../lib/prisma";

const userFixtures = [
	{
		name: "test1",
		email: "test-user+1@panenco.com",
		password: "password1",
	},
	{
		name: "test2",
		email: "test-user+2@panenco.com",
		password: "password2",
	},
];

describe("Handler tests", () => {
	describe("User Tests", () => {
		let users: any[];

		beforeEach(async () => {
			// Clean up database
			await prisma.user.deleteMany();

			// Create test users
			users = await Promise.all(
				userFixtures.map(async (fixture) => {
					const hashedPassword = await bcrypt.hash(
						fixture.password,
						10
					);
					return prisma.user.create({
						data: {
							name: fixture.name,
							email: fixture.email,
							password: hashedPassword,
						},
					});
				})
			);
		});

		it("should get users", async () => {
			const [res] = await getList(undefined);
			expect(res.some((x) => x.name === "test2")).true;
		});

		it("should get user by id", async () => {
			const res = await get(users[1].id);

			expect(res.name).equal("test2");
			expect(res.email).equal("test-user+2@panenco.com");
		});

		it("should fail when getting user by unknown id", async () => {
			try {
				await get(randomUUID());
			} catch (error) {
				expect(error.message).equal("User not found");
				return;
			}
			expect(true, "should have thrown an error").false;
		});

		it("should create user", async () => {
			const body = {
				email: "test-user+new@panenco.com",
				name: "newUser",
				password: "reallysecretstuff",
			};
			const res = await create(body);

			expect(res.name).equal("newUser");
			expect(res.email).equal("test-user+new@panenco.com");
		});

		it("should update user", async () => {
			const body = {
				email: "test-user+updated@panenco.com",
			};
			const id = users[0].id;
			const res = await update(id, body);

			expect(res.email).equal(body.email);
			expect(res.name).equal("test1");
		});

		it("should delete user by id", async () => {
			const initialCount = await prisma.user.count();
			await deleteUser(users[0].id);

			const newCount = await prisma.user.count();
			expect(initialCount - 1).equal(newCount);
		});
	});
});
```

</details>
