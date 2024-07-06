
export function inlinePromise<T>(p: Promise<T>): Promise<[T, null] | [null, Error]> {
	return p.then(v => [v, null], err => [null, err]);
}
