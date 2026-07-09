import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR, Reflector } from "@nestjs/core";
import { AuthController } from "./controllers/auth/auth.controller";
import { UserController } from "./controllers/users/user.controller";
import { TransformInterceptor } from "./interceptors/transform.interceptor";

@Module({
	controllers: [AuthController, UserController],
	providers: [
		// useFactory (rather than useClass) so the Reflector is passed to the
		// constructor inherited from ClassSerializerInterceptor.
		{
			provide: APP_INTERCEPTOR,
			useFactory: (reflector: Reflector) =>
				new TransformInterceptor(reflector),
			inject: [Reflector],
		},
	],
})
export class AppModule {}
