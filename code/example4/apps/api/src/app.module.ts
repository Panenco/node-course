import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth/auth.controller";
import { UserController } from "./controllers/users/user.controller";

@Module({
	controllers: [AuthController, UserController],
})
export class AppModule {}
