import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "../app.module";

// Boot the app without listening, build the same Swagger document as main.ts,
// and write it to disk so the SDK package can generate a typed client from it.
async function generate() {
	const app = await NestFactory.create(AppModule, { logger: false });
	app.setGlobalPrefix("api");

	const config = new DocumentBuilder()
		.setTitle("Node Course API")
		.setDescription("The Node Course API description")
		.setVersion("1.0")
		.addApiKey({ type: "apiKey", name: "x-auth", in: "header" }, "x-auth")
		.build();

	const document = SwaggerModule.createDocument(app, config);

	const outPath = resolve(__dirname, "../../../../packages/api-sdk/openapi.json");
	mkdirSync(dirname(outPath), { recursive: true });
	writeFileSync(outPath, JSON.stringify(document, null, 2));
	console.log(`OpenAPI spec written to ${outPath}`);

	await app.close();
}

generate().catch((error) => {
	console.error(error);
	process.exit(1);
});
