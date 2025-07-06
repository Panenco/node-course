import { App } from "./app";

const app = new App();

const startServer = async () => {
	await app.createConnection();
	app.listen();
};

startServer().catch(console.error);

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("Received SIGTERM, shutting down gracefully...");
	await app.shutdown();
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("Received SIGINT, shutting down gracefully...");
	await app.shutdown();
	process.exit(0);
});
