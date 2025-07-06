# Module 3

The previous modules showed you the main features of express. Now it's time to
go to a whole other level and create a real world setup.

The next part will consist of a few large topics:

-   Papi & routing-controllers for easy controller definition and contract
    validation/representation
-   Swagger for automatically generated API documentation
-   Authentication and authorization for access management
-   Databases for storing data

# papi & routing-controllers

[@panenco/papi](https://www.npmjs.com/package/@panenco/papi) is package we
developed in house to provide reusable utilities across products.

The package is documented in
it's [README](https://github.com/Panenco/papi/blob/main/README.md)

## Development Philosophy

Papi is a small superset on top
of [class validator](https://www.npmjs.com/package/class-validator), [class transformer](https://www.npmjs.com/package/class-transformer)
and [routing-controllers](https://www.npmjs.com/package/routing-controllers) that
forces our opinionated way of working. It highly depends on decorators to define
endpoints and contracts.

The default flow of a feature/endpoint always has 4 steps:

1. Authorize the user
    - Validate the token
    - Validate the access rights to the resource
2. Validate the input
    - Transform and strip the input
      with [class transformer](https://www.npmjs.com/package/class-transformer).
      Make sure no unknown properties can be provided, parse all items to the
      correct type (ex. string to date)
    - Validate the input
      with [class validator](https://www.npmjs.com/package/class-validator)
      trough our Body or Query decorators
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

There are 2 packages we still need to
add [@panenco/papi](https://www.npmjs.com/package/@panenco/papi)
and [routing-controllers](https://www.npmjs.com/package/routing-controllers)
because previously we already added `class-transformer` and `class-validator`.

```bash
pnpm add routing-controllers@0.10.4 @panenco/papi cors
```

Some warnings will be shown but they can be ignored as we are not impacted by
them.

## Bootstrap in app.ts

The initialization of routes works a little bit different
with `routing-controllers` than plain `express`.

Let's immediately clean up the code a bit and add a private
method `initializeControllers` in the `App` class that takes as an argument a
list of controllers (currently just [`UserRoute`]).

```
private initializeControllers(controllers: Function[]) {
   useExpressServer(this.host, { // Link the express host to routing-controllers
   cors: {
      origin: "*", // Allow all origins, any application on any url can call our api. This is why we also added the `cors` package.
      exposedHeaders: ["x-auth"], // Allow the header `x-auth` to be exposed to the client. This is needed for the authentication to work later.
   },
   controllers, // Provide the controllers. Currently this won't work yet, first we need to convert the Route to a routing-controllers controller.
   defaultErrorHandler: false, // Disable the default error handler. We will handle errors through papi later.
   routePrefix: "/api", // Map all routes to the `/api` path.
   });
}
```

Now you can replace the `UserRoute` initialization with a call
to `initializeControllers` and pass the constructor of the route.

```ts
this.initializeControllers([UserRoute]);
```

In addition, you can also automatically detect all controllers by making use of
papi's `importClasses` function. If you'd like to do so you can find some
info [here](https://github.com/Panenco/papi/blob/main/docs/modules.md#importclasses).

## Convert users route to controller

### Controller definition

In `routing-controllers` what makes a controller a controller is simply
the `JsonController` decorator. Because the class is decorated with this
decorator `routing-controllers` will understand how to process the class.

You need to specify the route path in the decorator, in our case this should
be `/users`.

Your result should look like this:

```ts
@JsonController("/users")
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
on [their github](https://github.com/typestack/routing-controllers).

Converting the code:

1. Remove the router and the path properties from the controller
2. Comment the entire constructor for now
3. Add a method for each endpoint

    The controller should look like this now:

    ```ts
    @JsonController("/users")
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

4. Next up you should tell `routing-controllers` that these methods are the
   routes, specify the path and the http-method.

    `routing-controllers` has some decorators to accomplish this. For each
    http-method there is a decorator, the argument you pass defines the path.
    ex `@Post("/users")`

    When that's done `routing-controllers` will actually know the endpoints we
    have defined.

5. In the method body you can call the handlers now. Currently, that will still
   give errors as we don't pass the arguments defined in the handlers yet. We'll
   be fixing that later.

    Most of the commented code is now converted so lets clean it up. Remove all
    lines except the `post` and `patch`; we'll come back to the middleware used
    there later.

The current code:

```ts
@JsonController("/users")
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

	@Get("/:id")
	async get() {
		return get();
	}

	@Patch("/:id")
	async update() {
		return update();
	}

	@Delete("/:id")
	async delete() {
		await deleteUser();
	}
}
```

#### papi body decorator to inject body

Previously we implemented body validation manually in the handler, after that we
converted it into middleware.  
Now we will be using papi's `body` decorator to inject the body into the
controller method and have the body automatically transformed and validated.

The decorator should be used just before an argument, for example:

```
async create(@Body() body: UserBody) {}
```

The type of `UserBody` will automatically be inferred and used for the
transformation and validation.

> Note: `routing-controllers` also has a `@Body` decorator. Make sure you import
> the one from `@panenco/papi` and **not** the one from `routing-controllers`.
> The handler arguments will be changed later in this section.

For updating an entity we don't want to require all properties to be provided,
to skip these we can set some options in the decorator:

```
async update(@Body({}, {skipMissingProperties: true}) body: UserBody) {}
```

That covers all body validations that previously were done manually. You can
remove `patchValidationMiddleware` and the manual validation/transformation from
the `create` handler now.

#### papi query decorator to inject search param

The query decorator actually works exactly the same as the body decorator, only
instead of processing `request.body` it processes `request.query`.

For the get list endpoint we expect a search parameter. In order to validate the
parameter you can add a query contract: `src/contracts/search.query.ts` where
you validate it as a string and specify it as optional.

Defining the contract:

```ts
// search.query.ts
@Exclude()
export class SearchQuery {
	@Expose()
	@IsString()
	@IsOptional()
	public search?: string;
}
```

And use it like this:

```
async getList(@Query() query: SearchQuery) {}
```

#### routing-controllers Param decorator to inject id's (or other params)

`request.params` needs to be injected one by one with the `@Param` decorator
from `routing-controllers`. Type conversion is not supported here so it will
always inject a string.

It's used like this:

```
async get(@Param("id") id: string){}
```

Apply this decorator to all endpoints containing an id.

#### Middleware decorators

The last thing we need from the currently commented route definitions is
the `adminMiddleware`.

To allow middleware to be registered on endpoints, `routing-controllers` has
the `@UseBefore` and `@UseAfter` decorators.

The `@UseBefore` decorator is used to register middleware before the endpoint is
called.
The `@UseAfter` decorator is used to register middleware after the endpoint is
called.

We want the `adminMiddleware` to be called before the handler is hit so we
use `@UseBefore`:

```
@Post()
@UseBefore(adminMiddleware)
async create(@Body() body: UserBody) {
	return create(body);
}
```

The view/representation middleware we'll cover in a bit.

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
5. Throw a papi `NotFound` error when no user is found instead of manually
   returning an error (we'll come back to this in the next section)

Now all references to `request`, `response` and `next` are gone. The build
errors in the handlers and controller should also be resolved.

<details>
<summary>user.controller.ts</summary>

```ts
import { Body, Query } from "@panenco/papi";
import { NextFunction, Request, Response } from "express";
import {
	Delete,
	Get,
	JsonController,
	Param,
	Patch,
	Post,
	UseBefore,
} from "routing-controllers";

import { SearchQuery } from "../../contracts/search.query.js";
import { UserBody } from "../../contracts/user.body.js";
import { create } from "./handlers/create.handler.js";
import { deleteUser } from "./handlers/delete.handler.js";
import { get } from "./handlers/get.handler.js";
import { getList } from "./handlers/getList.handler.js";
import { update } from "./handlers/update.handler.js";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (req.header("x-auth") !== "api-key") {
		return res.status(401).send("Unauthorized");
	}
	next();
};

@JsonController("/users")
export class UserController {
	@Post()
	@UseBefore(adminMiddleware)
	async create(@Body() body: UserBody) {
		return create(body);
	}

	@Get()
	async getList(@Query() query: SearchQuery) {
		return getList(query.search);
	}

	@Get("/:id")
	async get(@Param("id") id: string) {
		return get(id);
	}

	@Patch("/:id")
	async update(
		@Param("id") id: string,
		@Body({}, { skipMissingProperties: true }) body: UserBody
	) {
		return update(id, body);
	}

	@Delete("/:id")
	async delete(@Param("id") id: string) {
		deleteUser(id);
		return null;
	}
}
```

</details>

<details>
<summary>create.handler.ts</summary>

```ts
import { UserBody } from "../../../contracts/user.body.js";
import { UserStore } from "./user.store.js";

export const create = async (body: UserBody) => {
	const user = UserStore.add(body);

	return user;
};
```

</details>

<details>
<summary>getList.handler.ts</summary>

```ts
import { UserStore } from "./user.store.js";

export const getList = (search: string) => {
	const users = UserStore.find(search);
	return users;
};
```

</details>

<details>
<summary>get.handler.ts</summary>

```ts
import { NotFound } from "@panenco/papi";

import { UserStore } from "./user.store.js";

export const get = (idString: string) => {
	const id = Number(idString);
	const user = UserStore.get(id);
	if (!user) {
		throw new NotFound("userNotFound", "User not found");
	}
	return user;
};
```

</details>

<details>
<summary>update.handler.ts</summary>

```ts
import { NotFound } from "@panenco/papi";

import { UserBody } from "../../../contracts/user.body.js";
import { UserStore } from "./user.store.js";

export const update = (idString: string, body: UserBody) => {
	const id = Number(idString);
	const user = UserStore.get(id);
	if (!user) {
		throw new NotFound("userNotFound", "User not found");
	}
	const updated = UserStore.update(id, { ...user, ...body });
	return updated;
};
```

</details>

<details>
<summary>delete.handler.ts</summary>

```ts
import { NotFound } from "@panenco/papi";

import { UserStore } from "./user.store.js";

export const deleteUser = (idString: string) => {
	const id = Number(idString);
	const user = UserStore.get(id);
	if (!user) {
		throw new NotFound("userNotFound", "User not found");
	}
	UserStore.delete(id);
};
```

</details>
<br>

### Papi Error handling

Handling expected errors manually is a bit of a pain as you might have noticed
when doing so in a previous section. It's much easier to just be able to throw
a `papi` error and have it handled in the background.

You already implemented the `NotFound` error but there are
other [errors](https://github.com/Panenco/papi/blob/main/docs/modules.md#error-classes)
as well.

There are 2 things you need to do to set it up:

-   Use the papi `errorMiddleware`
-   Allow for async errors

#### Papi error middleware

Papi comes
with [errorMiddleware](https://github.com/Panenco/papi/blob/main/docs/modules.md#errormiddleware)
to handle papi errors, this way errors are consistently parsed and handled.

Simply replace the custom error middleware in `app.ts` with the one from
papi.

```ts
this.host.use(errorMiddleware);
```

#### Async errors

Throwing errors in an asynchronous context is a bit of a pain, luckily there is
a package that takes care of
this: [express-async-errors](https://www.npmjs.com/package/express-async-errors).
It's basically a hack that changes some small things in the inner workings of
express.

In express v5 this will no longer be needed, but for now let's add it.

Add the package:

```bash
pnpm add express-async-errors
```

Now it only needs to be imported once before anything else loads. So put it at
the top of `app.ts`:

```ts
import "express-async-errors";
```

## Representer decorators

By now I think you see the value of the decorators and how it can make life
easier by abstracting recurring code away.

Much like the Body/Query decorators there are also decorators to represent the
response:

-   [Representer](https://github.com/Panenco/papi/blob/main/docs/modules.md#representer)
-   [ListRepresenter](https://github.com/Panenco/papi/blob/main/docs/modules.md#listrepresenter)
-   [ArrayRepresenter](https://github.com/Panenco/papi/blob/main/docs/modules.md#arrayrepresenter)

These decorators ensure your output is correctly serialized and strip out all
data not represented in the view.

2 arguments can be passed to the decorators:

-   View: The view contract you want to be serialized, `null` if no response is
    needed (Mandatory)
-   Status code: The status code you want to return (Optional)
    -   Want to learn more
        about [status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)?

### Use the Representer

Apply the `@Representer` decorator with the `UserView` on all endpoints except
the get list endpoint.

<details>
<summary>The code</summary>

```
@Post()
@UseBefore(adminMiddleware)
@Representer(UserView, StatusCode.created)
async create(@Body() body: UserBody) {
	return create(body);
}

@Get("/:id")
@Representer(UserView)
async get(@Param("id") id: string) {
	return get(id);
}

@Patch("/:id")
@Representer(UserView)
async update(@Param("id")id: string, @Body({}, {skipMissingProperties: true}) body: UserBody) {
	return update(id, body);
}

@Delete("/:id")
@Representer(null)
async delete (@Param("id") id: string) {
	deleteUser(id);
}
```

</details>

### Use the ListRepresenter

In real world applications, arrays should always
be [paginated](https://stackoverflow.com/questions/12168624/pagination-response-payload-from-a-restful-api).
That means only a certain amount of items should be returned. To get the next
page some extra input is needed. `offset` and `limit` for instance.  
However in our small example it makes no sense to fully implement pagination but
let's cover the representation part of it already.

When returning a paginated list we should also output the **total amount** of
items. This way the client can show the amount of pages there are in total. For
our example we will be returning the entire list at all times, so we can just
return the length of the list.

The `ListRepresenter` will return something like this to the client:

```json
{
	"items": [],
	"count": 0
}
```

This would be the result of a return statement like this: `return [[], 0]`

Apply the `@ListRepresenter` decorator with the `UserView` on the get list
endpoint.

In order to keep things simple modify the handler to return a fake paginated
list of users:

-   `return [users, users.length];`
-   Explicitly set the return type to `[UserView[], number]`

Putting it all together:

```ts
export const getList = (search: string): [User[], number] => {
	const users = UserStore.find(search);
	return [users, users.length];
};
```

<details>
<summary>The code</summary>

```
@Get()
@Authorized()
@ListRepresenter(UserView)
@OpenAPI({summary: 'Search users'})
async getList(@Query() query: SearchQuery) {
	return getList(query.search);
}

```

</details>

## Fix tests

While converting the code, we introduced some breaking changes. That means the
previously created tests will no longer work.  
The handlers now have different arguments and responses, so we need to adjust the
tests accordingly.  
Most endpoints themselves are exactly the same, so the integration tests should
remain mainly the same.  
However, there are some small changes like the view that was not applied on all
endpoints or the list response that is introduced now.

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

import { create } from "../../controllers/users/handlers/create.handler.js";
import { deleteUser } from "../../controllers/users/handlers/delete.handler.js";
import { get } from "../../controllers/users/handlers/get.handler.js";
import { getList } from "../../controllers/users/handlers/getList.handler.js";
import { update } from "../../controllers/users/handlers/update.handler.js";
import {
	User,
	UserStore,
} from "../../controllers/users/handlers/user.store.js";

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
			const [res, total] = getList(null);

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

For me there were a few changes needed:

-   Provide a body when validating the access (unauthorized) on the create
    endpoint. (this happens because the Body is validated before the UseBefore
    middleware. Not really a problem, but it's not ideal.)
-   Process the list response a bit different as now we have the `items` + `count`

> Bonus: Papi has named status codes in the `StatusCode` enum. So you can use
> them instead of specifying numbers to validate the status code.

<details>
<summary>The code</summary>

```ts
import { StatusCode } from "@panenco/papi";
import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import supertest from "supertest";

import { App } from "../../app.js";
import { UserBody } from "../../contracts/user.body.js";
import {
	User,
	UserStore,
} from "../../controllers/users/handlers/user.store.js";

describe("Integration tests", () => {
	describe("User Tests", () => {
		let request: supertest.SuperTest<supertest.Test>;
		beforeEach(() => {
			UserStore.users = [];
			const app = new App();

			request = supertest(app.host);
		});

		it("should CRUD users", async () => {
			// Unauthorized without "api-key"
			await request
				.post(`/api/users`)
				.send({
					email: "test@test.test",
					name: "test",
					password: "testtestest",
				} as UserBody)
				.expect(StatusCode.unauthorized);

			// Successfully create new user
			const { body: createResponse } = await request
				.post(`/api/users`)
				.send({
					name: "test",
					email: "test-user+1@panenco.com",
					password: "real secret stuff",
				} as User)
				.set("x-auth", "api-key")
				.expect(StatusCode.created);

			expect(
				UserStore.users.some((x) => x.email === createResponse.email)
			).true;

			// Get the newly created user
			const { body: getResponse } = await request
				.get(`/api/users/${createResponse.id}`)
				.expect(StatusCode.ok);
			expect(getResponse.name).equal("test");

			// Get all users
			const { body: getListRes } = await request
				.get(`/api/users`)
				.expect(StatusCode.ok);
			const { items, count } = getListRes;
			expect(items.length).equal(1);
			expect(count).equal(1);

			// Successfully update user
			const { body: updateResponse } = await request
				.patch(`/api/users/${createResponse.id}`)
				.send({
					email: "test-user+1@panenco.com",
				} as User)
				.expect(StatusCode.ok);

			expect(updateResponse.name).equal("test");
			expect(updateResponse.email).equal("test-user+1@panenco.com");
			expect(updateResponse.password).undefined; // middleware transformed the object to not include the password

			// Delete the newly created user
			await request.delete(`/api/users/${createResponse.id}`).expect(204);

			// Get all users again after deleted the only user
			const { body: getNoneResponse } = await request
				.get(`/api/users`)
				.expect(StatusCode.ok);
			const { count: getNoneCount } = getNoneResponse;
			expect(getNoneCount).equal(0);
		});
	});
});
```

</details>

🥳 🚀 That's all for the papi conversion of the API. Next up... **Authentication**

# Authentication & Authorization

Currently most of our endpoints are publicly available or with a very bad
authorization technique (e.g. `api-key`).  
Luckily `papi` and `routing-controllers` provide a few utilities to easily
implement this.

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

The `@Authorized` decorator should be used to mark the endpoint as requiring a
token.  
You can pass
in [requirements](https://github.com/Panenco/papi/blob/main/docs/modules.md#irequirement)
to add custom validations like `isAdmin`, `belongsToOrganization`, etc. But we
won't be covering requirements.

Have a look at
the [papi authorization docs](https://github.com/Panenco/papi/blob/main/README.md#authorization)
for more info.

## Login

You can make authenticating users quite complex but to get you started we'll be
implementing the most basic and unsecure login ever.

The login endpoint should exist in a new controller, the `AuthController`.

1. Create the controller (in a new `auth` folder)
2. Add the new exported class `AuthController` with the `JsonController`
   decorator and register it in the `App` class.
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
           an `Unauthorized` error
    5. Use
       the [`createAccessToken`](https://github.com/Panenco/papi/blob/main/docs/modules.md#createaccesstoken)
       helper from papi to create a JWT token
        1. This is an `async` function so you need to `await` it
        2. secret: used to verify the fact that our application created the
           token by the `@Authorize` decorator
        3. expiresIn: amount of seconds the token should be valid (put it to 10
           minutes)
        4. data: you can put basically anything in there. In our case we'll just
           put the user id
        5. return the result
6. Create the endpoint in the controller with the `LoginBody`, `AccessTokenView`
   and call the handler

When testing this you can check the contents of the JWT token
on [jwt.io](jwt.io)  
![](assets/jwt-io.png)

<details>
<summary>login.body.ts</summary>

```ts
import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsString } from "class-validator";

@Exclude()
export class LoginBody {
	@Expose()
	@IsEmail()
	public email: string;

	@Expose()
	@IsString()
	public password: string;
}
```

</details>

<details>
<summary>accessToken.view.ts</summary>

```ts
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

@Exclude()
export class AccessTokenView {
	@Expose()
	@IsString()
	public token: string;

	@Expose()
	@IsNumber()
	public expiresIn: number;
}
```

</details>

<details>
<summary>auth.controller.ts</summary>

```ts
import { Representer } from "@panenco/papi";
import { Body, JsonController, Post } from "routing-controllers";

import { AccessTokenView } from "../../contracts/accessToken.view.js";
import { LoginBody } from "../../contracts/login.body.js";
import { login } from "./handlers/login.handler.js";

@JsonController("/auth")
export class AuthController {
	@Post("/tokens")
	@Representer(AccessTokenView)
	async create(@Body() body: LoginBody) {
		return login(body);
	}
}
```

</details>

<details>
<summary>login.handler.ts</summary>

```ts
import { createAccessToken, Unauthorized } from "@panenco/papi";

import { LoginBody } from "../../../contracts/login.body.js";
import { UserStore } from "../../users/handlers/user.store.js";

export const login = async (body: LoginBody) => {
	const user = UserStore.getByEmail(body.email);
	if (!user || user.password !== body.password) {
		throw new Unauthorized("unauthorized", "Invalid credentials");
	}
	const result = await createAccessToken("jwtSecretFromConfigHere", 60 * 10, {
		userId: user.id,
	}); // Important this secret is also used for the authenticator initialization in app.ts
	return result;
};
```

</details>

## Authenticator

The authenticator is the thing that will verify the JWT token and execute the
requirements.

In order for the papi authenticator to be used, you need to initialize it when
setting up `routing-controllers` in `App`.

The final code should look like the sample below:

```
private initializeControllers(controllers: Function[]) {
	useExpressServer(this.host, {
		cors: {
			origin: '*',
			exposedHeaders: ['x-auth'],
		},
		controllers,
		defaultErrorHandler: false,
		routePrefix: '/api',
		authorizationChecker: getAuthenticator('jwtSecretFromConfigHere'), // Tell routing-controllers to use the papi authentication checker
	});
}
```

Now when we use the `@Authorized` decorator, the `papi` authenticator will be
used, with your secret to validate the tokens created by the login handler.

## @Authorized()

All preparations have been done, and it's finally time to secure our endpoints!

Simply add the `@Authorized` decorator to your users endpoints and the endpoints
will no longer be freely available. Secure get, getList, patch and delete. Leave
the `POST` endpoint publicly available so you can still create new users.

When running your integration test now you'll notice it's failing with
a `Unauthorized` errors. Change it up a bit to first create a new user, then
login and use the response token in the `x-auth` header to access the other
endpoints.

Meanwhile we also have no use for the `adminMiddleware` anymore so you can
completely remove it.

<details>
<summary>user.controller.ts</summary>

```ts
import {
	Body,
	ListRepresenter,
	Query,
	Representer,
	StatusCode,
} from "@panenco/papi";
import {
	Authorized,
	Delete,
	Get,
	JsonController,
	Param,
	Patch,
	Post,
} from "routing-controllers";

import { SearchQuery } from "../../contracts/search.query.js";
import { UserBody } from "../../contracts/user.body.js";
import { UserView } from "../../contracts/user.view.js";
import { create } from "./handlers/create.handler.js";
import { deleteUser } from "./handlers/delete.handler.js";
import { get } from "./handlers/get.handler.js";
import { getList } from "./handlers/getList.handler.js";
import { update } from "./handlers/update.handler.js";

@JsonController("/users")
export class UserController {
	@Post()
	@Representer(UserView, StatusCode.created)
	async create(@Body() body: UserBody) {
		return create(body);
	}

	@Get()
	@Authorized()
	@ListRepresenter(UserView)
	async getList(@Query() query: SearchQuery) {
		return getList(query.search);
	}

	@Get("/:id")
	@Authorized()
	@Representer(UserView)
	async get(@Param("id") id: string) {
		return get(id);
	}

	@Patch("/:id")
	@Authorized()
	@Representer(UserView)
	async update(
		@Param("id") id: string,
		@Body({}, { skipMissingProperties: true }) body: UserBody
	) {
		return update(id, body);
	}

	@Delete("/:id")
	@Authorized()
	@Representer(null)
	async delete(@Param("id") id: string) {
		deleteUser(id);
	}
}
```

</details>

<details>
<summary>user.integration.test.ts</summary>

```ts
import { StatusCode } from "@panenco/papi";
import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import supertest from "supertest";

import { App } from "../../app.js";
import {
	User,
	UserStore,
} from "../../controllers/users/handlers/user.store.js";

describe("Integration tests", () => {
	describe("User Tests", () => {
		let request: supertest.SuperTest<supertest.Test>;
		beforeEach(async () => {
			UserStore.users = [];
			const app = new App();

			request = supertest(app.host);
		});

		it("should CRUD users", async () => {
			// Unauthorized without "token"
			await request.get(`/api/users`).expect(StatusCode.unauthorized);

			// Successfully create new user
			const { body: createResponse } = await request
				.post(`/api/users`)
				.send({
					name: "test",
					email: "test-user+1@panenco.com",
					password: "real secret stuff",
				} as User)
				.expect(StatusCode.created);

			// Login
			const { body: loginResponse } = await request
				.post(`/api/auth/tokens`)
				.send({
					email: "test-user+1@panenco.com",
					password: "real secret stuff",
				} as User)
				.expect(StatusCode.ok);
			const token = loginResponse.token;

			expect(
				UserStore.users.some((x) => x.email === createResponse.email)
			).true;

			// Get the newly created user
			const { body: getResponse } = await request
				.get(`/api/users/${createResponse.id}`)
				.set("x-auth", token)
				.expect(StatusCode.ok);
			expect(getResponse.name).equal("test");

			// Get all users
			const { body: getListRes } = await request
				.get(`/api/users`)
				.set("x-auth", token)
				.expect(StatusCode.ok);
			const { items, count } = getListRes;
			expect(items.length).equal(1);
			expect(count).equal(1);

			// Successfully update user
			const { body: updateResponse } = await request
				.patch(`/api/users/${createResponse.id}`)
				.send({
					email: "test-user+1@panenco.com",
				} as User)
				.set("x-auth", token)
				.expect(StatusCode.ok);

			expect(updateResponse.name).equal("test");
			expect(updateResponse.email).equal("test-user+1@panenco.com");
			expect(updateResponse.password).undefined; // middleware transformed the object to not include the password

			// Get the newly created user
			await request
				.delete(`/api/users/${createResponse.id}`)
				.set("x-auth", token)
				.expect(204);

			// Get all users again after deleted the only user
			const { body: getNoneResponse } = await request
				.get(`/api/users`)
				.set("x-auth", token)
				.expect(StatusCode.ok);
			const { count: getNoneCount } = getNoneResponse;
			expect(getNoneCount).equal(0);
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

```bash
pnpm add class-validator-jsonschema@5.0.0 routing-controllers-openapi@4.0.0 swagger-ui-express@4.4.0
```

-   `class-validator-jsonschema` to convert all the data from the decorators (
    metadata) to an OpenAPI json schema
-   `swagger-ui-express` to display the documentation
-   `routing-controllers-openapi` to hook up `routing-controllers` with swagger

add module overrides in package.json to fix a dependency issue with routing controllers

```json
{
	"pnpm": {
		"overrides": {
			"openapi3-ts": "3.2.0"
		}
	}
}
```

and run `pnpm install`.

### Configure swagger-ui in app.ts

Add a private method in app.ts to configure swagger and call it after the
controllers are initialized.

Some explanation is inline:

```ts
import { getMetadataStorage } from "class-validator";

class App {
	// ...
	private initializeSwagger() {
		const schemas = validationMetadatasToSchemas({
			classValidatorMetadataStorage: getMetadataStorage(),
			refPointerPrefix: "#/components/schemas/",
		});

		const routingControllersOptions: RoutingControllersOptions = {
			routePrefix: "/api",
		};

		const storage = getMetadataArgsStorage();
		const spec = routingControllersToSpec(
			storage,
			routingControllersOptions,
			{
				components: {
					schemas,
					securitySchemes: {
						JWT: {
							in: "header",
							name: "x-auth",
							type: "apiKey",
							bearerFormat: "JWT",
							description:
								'JWT Authorization header using the JWT scheme. Example: "x-auth: {token}"',
						},
					},
				},
				security: [{ JWT: [] }],
			}
		);

		this.host.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
	}
}
```

### Endpoint descriptions

This will already give you very handy docs. However if you have 100+ endpoints,
not every endpoint might be very self explanatory.  
To fix that we can add some descriptions. To do so you can add the `OpenAPI`
decorator to your endpoint and provide some summary.

Like this:

```
@Post()
@Representer(UserView, StatusCode.created)
@OpenAPI({summary: 'Create a new user'})
async create(@Body() body: UserBody) {
	return create(body);
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

In the end the `app.ts` should look like this:

<details>
<summary>app.ts</summary>

```ts
import "express-async-errors";
import { errorMiddleware, getAuthenticator } from "@panenco/papi";
import express, { Application } from "express";
import {
	getMetadataArgsStorage,
	RoutingControllersOptions,
	useExpressServer,
} from "routing-controllers";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import { getMetadataStorage } from "class-validator";
import { UserController } from "./controllers/users/user.controller.js";
import { AuthController } from "./controllers/auth/auth.controller.js";

export class App {
	host: Application;

	constructor() {
		// Init server
		this.host = express();
		this.host.use(express.json());
		this.host.use((req, res, next) => {
			// general middleware
			console.log(req.method, req.url);
			next();
		});
		this.host.get("/", (req, res, next) => {
			res.send("Hello World @ Panenco!");
		});
		const controllers = [AuthController, UserController];
		this.initializeControllers(controllers);
		this.initializeSwagger();
		this.host.use(errorMiddleware);
	}

	listen() {
		this.host.listen(3000, () => {
			console.info(`:rocket: http://localhost:3000`);
			console.info(`========================`);
		});
	}

	private initializeControllers(controllers: Function[]) {
		useExpressServer(this.host, {
			// Link the express host to routing-controllers
			cors: {
				origin: "*", // Allow all origins, any application on any url can call our api. This is why we also added the `cors` package.
				credentials: true,
				exposedHeaders: ["x-auth"], // Allow the header `x-auth` to be exposed to the client. This is needed for the authentication to work later.
			},
			controllers, // Provide the controllers. Currently this won't work yet, first we need to convert the Route to a routing-controllers controller.
			defaultErrorHandler: false, // Disable the default error handler. We will handle errors through papi later.
			routePrefix: "/api", // Map all routes to the `/api` path.
			authorizationChecker: getAuthenticator("jwtSecretFromConfigHere"), // Tell routing-controllers to use the papi authentication checker
		});
	}

	private initializeSwagger() {
		const schemas = validationMetadatasToSchemas({
			classValidatorMetadataStorage: getMetadataStorage(),
			refPointerPrefix: "#/components/schemas/",
		});

		const routingControllersOptions: RoutingControllersOptions = {
			routePrefix: "/api",
		};

		const storage = getMetadataArgsStorage();
		const spec = routingControllersToSpec(
			storage,
			routingControllersOptions,
			{
				components: {
					schemas,
					securitySchemes: {
						JWT: {
							in: "header",
							name: "x-auth",
							type: "apiKey",
							bearerFormat: "JWT",
							description:
								'JWT Authorization header using the JWT scheme. Example: "x-auth: {token}"',
						},
					},
				},
				security: [{ JWT: [] }],
			}
		);

		this.host.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
	}
}
```

</details>

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
pnpm add prisma @prisma/client bcryptjs
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

### Database Connection in App

Connecting to the database and initializing Prisma occurs when bootstrapping
your application, right before you start listening to incoming requests.

In `server.ts` we replace the existing code with this asynchronous step and call
the function:

```ts
import { App } from "./app.js";

const app = new App();

const startServer = async () => {
	await app.createConnection();
	app.listen();
};

startServer().catch(console.error);
```

The `createConnection` method lives in `app.ts` and initializes Prisma and
provides a database connection:

-   `app.ts`

```ts
import { prisma } from "./lib/prisma.js";

export class App {
	// ...

	public async createConnection() {
		try {
			// Test database connection
			await prisma.$connect();
			console.log("Database connected successfully");
		} catch (error) {
			console.log("Error while connecting to the database", error);
			process.exit(1);
		}
	}
}
```

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
import { prisma } from "../../../lib/prisma";
import { NotFound } from "@panenco/papi";

export const get = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: { id },
	});

	if (!user) {
		throw new NotFound("userNotFound", "User not found");
	}

	return user;
};
```

</details>

<details>
<summary>update.handler.ts</summary>

```ts
import { prisma } from "../../../lib/prisma";
import { NotFound } from "@panenco/papi";
import bcrypt from "bcryptjs";
import { UserBody } from "../../../contracts/user.body";

export const update = async (id: string, body: Partial<UserBody>) => {
	const existingUser = await prisma.user.findUnique({
		where: { id },
	});

	if (!existingUser) {
		throw new NotFound("userNotFound", "User not found");
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
import { prisma } from "../../../lib/prisma";
import { NotFound } from "@panenco/papi";

export const deleteUser = async (id: string) => {
	const existingUser = await prisma.user.findUnique({
		where: { id },
	});

	if (!existingUser) {
		throw new NotFound("userNotFound", "User not found");
	}

	await prisma.user.delete({
		where: { id },
	});
};
```

</details><details>
<summary>login.handler.ts</summary>

```ts
import { prisma } from "../../../lib/prisma";
import { createAccessToken, Unauthorized } from "@panenco/papi";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { LoginBody } from "../../../contracts/login.body";

export const login = async (body: LoginBody) => {
	const user = await prisma.user.findUnique({
		where: { email: body.email },
	});

	if (!user) {
		throw new Unauthorized("invalidCredentials", "Invalid credentials");
	}

	const isPasswordValid = await bcrypt.compare(body.password, user.password);
	if (!isPasswordValid) {
		throw new Unauthorized("invalidCredentials", "Invalid credentials");
	}

	return createAccessToken(config.jwtSecret, 60 * 10, {
		userId: user.id,
	});
};
```

</details>

### Error Handling with Prisma

As you might have noticed, looking for an entity and throwing a `NotFound` error
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
	throw new NotFound("userNotFound", "User not found");
}
```

This approach is explicit and easy to understand.

## Fix tests

At this point, our handlers exchanged the UserStore for working with a database,
but our tests have not been updated.

### Integration tests

For integration tests:

-   For each test suite we create a connection to the database through the App class
-   Instead of setting the users to an empty array in the beforeEach, we now clear the database using Prisma

<details>
<summary>user.integration.test.ts</summary>

```ts
import { prisma } from "../../lib/prisma";

describe("Integration tests", () => {
	describe("User Tests", () => {
		let request: any;

		before(async () => {
			const app = new App();
			await app.createConnection();
			request = supertest(app.host);
		});

		beforeEach(async () => {
			// Clean up database before each test
			await prisma.user.deleteMany();
		});
		// ...
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
