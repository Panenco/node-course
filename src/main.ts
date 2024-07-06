import http from "node:http";
import { Dir, FileServer, } from "./fileserver/fileserver.js";
import * as net from "node:net";
import createRouter, {
	type Handler as RouterHandler, type HTTPMethod,
	type HTTPVersion
} from "find-my-way";
import {
	type Handler,
	type HandleFunc,
	sendError, stripPrefix
} from "./internal/net/http.js";

const PORT = 8080;

async function main() {
	const mux = createRouter({
		defaultRoute(req, res) {
			res.setHeader("Content-Type", "text/html; charset=utf-8")
			res.writeHead(404, "Not Found");
			res.end(`<!doctype html><html lang="en"><head><title>Not Found</title></head><body><p>Not found</p></body>`);
		}
	});
	const fileServer = FileServer(Dir("./buckets"))

	mux.on("GET", "/buckets/*", stripPrefix("/buckets", fileServer).handle)
	mux.on("GET", "/files/:id", (req, res, params) => {
		const q = req.url!.search('?');
		let query = new URLSearchParams();
		if (q !== -1) {
			query = new URLSearchParams(req.url!.slice(q + 1));
		}

		query.get("ext")
	})

	const server = http.createServer(async function serve(request, response) {
		if (!request.method) {
			sendError(response, "Method not allowed", 405);
			return;
		} else if (!request.url) {
			sendError(response, "Invalid URL", 400);
			return;
		}


		await mux.lookup(request, response);

		if (!response.writableEnded) {
			response.end();
		}
	})

	server.listen(PORT, () => {
		const address = server.address();
		if (address == null) {
			throw new Error("Failed to start a server");
		}
		console.info(`listening on ${parseAddress(address)}`);
	});
}

void main()



function parseAddress(address: net.AddressInfo | string): string {
	if (typeof address === "string") {
		return address;
	} else if (address.family === "IPv4") {
		return `http://${address.address}:${address.port}`;
	} else if (address.family === "IPv6") {
		return `http://[${address.address}]:${address.port}`;
	} else {
		return address.address;
	}
}
