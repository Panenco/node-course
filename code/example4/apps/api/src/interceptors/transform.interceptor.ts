import {
	ClassSerializerContextOptions,
	ClassSerializerInterceptor,
	ExecutionContext,
	Injectable,
} from "@nestjs/common";

import { Serialize } from "../decorators/serialize.decorator";

/**
 * Serializes every response into the view declared with `@Serialize(View)`.
 *
 * It extends the built-in ClassSerializerInterceptor. We only override
 * `getContextOptions` to resolve the requested view from the route metadata and
 * put it on `options.type`. The base `intercept()` then runs its normal
 * serialize pipeline, which does `plainToInstance(View, response)` for both
 * single objects and arrays. `excludeExtraneousValues` makes it a strict
 * whitelist: anything not @Expose()d on the view is dropped from the response.
 *
 * Handlers can therefore return raw domain objects and stay ignorant of the
 * representation layer.
 */
@Injectable()
export class TransformInterceptor extends ClassSerializerInterceptor {
	protected getContextOptions(
		context: ExecutionContext
	): ClassSerializerContextOptions | undefined {
		const view = this.reflector.getAllAndOverride(Serialize, [
			context.getHandler(),
			context.getClass(),
		]);

		// Preserve any options set via the built-in @SerializeOptions().
		const base = super.getContextOptions(context);
		if (!view) {
			return base;
		}

		return { ...base, type: view, excludeExtraneousValues: true };
	}
}
