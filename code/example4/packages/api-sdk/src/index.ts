import { client } from "./generated/client.gen";

export * from "./generated";
export { client };

// Point the generated client at the API and tell it how to find the JWT.
// The protected endpoints declare an `x-auth` apiKey security scheme in the
// OpenAPI spec, so returning the token here makes the client attach it as the
// `x-auth` header on exactly those calls (and leave public calls untouched).
export function configureApiClient(options: {
	baseUrl: string;
	getToken?: () => string | null | undefined;
}) {
	client.setConfig({
		baseUrl: options.baseUrl,
		auth: () => options.getToken?.() ?? undefined,
	});
}
