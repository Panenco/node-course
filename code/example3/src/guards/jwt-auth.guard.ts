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
