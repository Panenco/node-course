export function TODO(msg?: string): never {
	throw new Error("TODO" + " " + msg);
}
