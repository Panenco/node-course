import { Type } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/**
 * Marks an endpoint's response to be serialized into the given view contract.
 *
 * Usage: `@Serialize(UserView)` on a controller method. The TransformInterceptor
 * reads this and transforms the handler's return value into the view, stripping
 * any field that isn't declared on it.
 */
export const Serialize = Reflector.createDecorator<Type>();
