import type { FileHandle } from "node:fs/promises";
import path from "node:path";
import * as  fs from "node:fs";
import http from "node:http";
import * as assert from "node:assert";
import * as stream from "node:stream"
import { sniffContentType } from "./sniff.js";
import { pipeline } from "node:stream/promises";
import sanitize from "sanitize-html";
import { inlinePromise } from "../internal/async/async.js";
import { type Handler, sendError } from "../internal/net/http.js";

export interface FileSystem {
	open(name: string): Promise<[FileHandle, null] | [null, Error]>;

	path(name: string): string;
}

export function Dir(dir: string) {
	if (dir === "") {
		dir = ".";
	}
	dir = path.resolve(dir);

	// cleanup
	async function open(name: string): Promise<[FileHandle, null] | [null, Error]> {
		return await inlinePromise(fs.promises.open(filePath(name)));
	}

	function filePath(name: string) {
		return path.join(dir, name);
	}

	return {
		open,
		path: filePath
	}  satisfies FileSystem;
}

export function FileServer(root: FileSystem) {
	const indexPage = "index.html";
	const sniffLength = 512;
	// clean the path
	// check if exists otherwise return 404
	// check permissions otherwise return 403
	// handle the index.html case (redirect to "/")✅
	// content mime type sniffing (based on the extension + some well defined cases)
	// content length✅
	// zip?
	// continuous download


	async function serveHTTP(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
		assert.ok(request.url, "the request url is required");
		let upath = request.url;

		if (!upath.startsWith("/")) {
			upath = "/" + upath;
			request.url = upath;
		}

		await serveFile(request, response, root, upath, true);
	}

	async function serveFile(request: http.IncomingMessage, response: http.ServerResponse, fs: FileSystem, name: string, canonicalURL: boolean) {
		let file: FileHandle | null = null;
		let err: Error | null = null;
		try {
			if (name.endsWith(indexPage)) {
				// IS IT POSSIBLE TO DO RELATIVE PATH REDIRECT?
				localRedirect(request, response, "./");
				return;
			}

			[file, err] = await fs.open(name);

			if (err) {
				const [msg, code] = toHTTPError(err);
				sendError(response, msg, code);
				return;
			}

			let stat: fs.Stats | null;
			[stat, err] = await inlinePromise(file!.stat());
			if (err) {
				const [msg, code] = toHTTPError(err);
				sendError(response, msg, code);
				return;
			}


			if (canonicalURL) {
				if (stat!.isDirectory()) {
					if (!name.endsWith("/")) {
						localRedirect(request, response, path.basename(name) + "/");
						return;
					}
				}
			}

			if (stat!.isDirectory()) {
				if (!name.endsWith("/")) {
					localRedirect(request, response, path.basename(name) + "/");
					return;
				}

				// check whether index.html is present
				const indexFile = path.join(name, indexPage);
				const [fileHandle] = await fs.open(indexFile);
				if (fileHandle) {
					const [indexStat, err] = await inlinePromise(fileHandle.stat());
					if (indexStat) {
						await file?.close();
						file = fileHandle;
						stat = indexStat;
					}
				}
			}

			// no index.html file found
			if (stat!.isDirectory()) {
				await listDirs(response, fs.path(name));
				return;
			}

			const sizeFunc = (): [number, null] => {
				return [stat!.size, null];
			};

			await serveContent(request, response, name, sizeFunc, file!.createReadStream());
		} finally {
			if (file) {
				await file.close();
			}
		}
	}

	const MIME_TYPES = {
		".avif": "image/avif",
		".css": "text/css; charset=utf-8",
		".gif": "image/gif",
		".htm": "text/html; charset=utf-8",
		".html": "text/html; charset=utf-8",
		".jpeg": "image/jpeg",
		".jpg": "image/jpeg",
		".js": "text/javascript; charset=utf-8",
		".json": "application/json",
		".mjs": "text/javascript; charset=utf-8",
		".pdf": "application/pdf",
		".png": "image/png",
		".svg": "image/svg+xml",
		".wasm": "application/wasm",
		".webp": "image/webp",
		".xml": "text/xml; charset=utf-8",
	};

	async function serveContent(request: http.IncomingMessage, response: http.ServerResponse, name: string, sizeFunc: () => [number, null] | [null, Error], stream: fs.ReadStream) {

		// If Content-Type is undefined, use the file's extension to set it
		// If Content-Type is an empty array, do not sniff the type
		let contentTypes = response.getHeader("Content-Type");
		let contentType = "";
		assert.ok(typeof contentTypes !== "number"); // definitely wrong

		if (!contentTypes) {
			contentType = MIME_TYPES[path.extname(name)] ?? "";

			if (contentType === "") {
				const buff = new Uint8Array(sniffLength);
				const [read] = await readAtLeast(stream, buff);
				contentType = sniffContentType(buff.slice(0, read));
				const err = await rewindStream(stream, buff.slice(0, read));
				if (err) {
					sendError(response, "cannot rewind the stream", 500);
					return;
				}
			}

			response.setHeader("Content-Type", contentType);
		} else if (contentTypes.length > 0) {
			contentType = contentTypes[0];
		}

		const [size, err] = sizeFunc();
		if (err) {
			sendError(response, err.message, 500);
			return;
		}

		// should never happen
		if (size < 0) {
			sendError(response, "Negative content size computed. Impossible state", 500);
			return;
		}

		response.setHeader("Content-Length", size);
		response.writeHead(200);

		if (request.method !== "HEAD") {
			await pipeline(
				stream,
				response
			);
		}

		response.end();
	}

	async function readAtLeast(stream: fs.ReadStream, buffer: Uint8Array): Promise<[number, Error | null]> {
		return await new Promise<[number, Error | null]>((resolve) => {
			stream.on("error", err => {
				console.error(err);
				resolve([0, err]);
			});
			stream.once("readable", () => {
				const size = Math.min(buffer.byteLength, stream.readableLength);
				const bytes: Buffer | null = stream.read(size);
				if (bytes == null) {
					resolve([0, new Error("no data in stream")]);
				} else if (size < buffer.byteLength) {
					bytes.copy(buffer);
					resolve([size, new Error("short buffer")]);
				} else {
					bytes.copy(buffer);
					resolve([bytes.byteLength, null]);
				}
			});
		});
	}

	async function rewindStream(stream: stream.Readable, buffer: Uint8Array): Promise<Error | undefined> {
		return await new Promise<Error | undefined>((resolve) => {
			stream.on("error", resolve);
			stream.unshift(buffer);
			resolve(undefined);
		}).catch(e => e);
	}


	return {
		handle: serveHTTP
	} satisfies Handler;
}

async function listDirs(response: http.ServerResponse, directoryPath: string) {
	const [dirents, err] = await inlinePromise(fs.promises.readdir(directoryPath, {withFileTypes: true}));

	if (err) {
		sendError(response, "Error reading directory", 500);
		return;
	}

	dirents!.sort((a, b) => a.name.localeCompare(b.name));

	response.setHeader("Content-Type", "text/html; charset=utf-8");
	response.write(`<!doctype html>`);
	response.write(`<html>`);
	response.write(`<head><title>Index of ${path.basename(directoryPath)}</title></head>`);
	response.write(`<body><pre>`);
	for (const dirent of dirents) {
		let name = dirent.name;
		if (dirent.isDirectory()) {
			name += "/";
		}
		// name can contain special characters that can modify the URL
		// TODO: FIXME
		const path = encodeURI(name);
		response.write(`<a href="${path}">${sanitize(name)}</a>` + "\n");
	}
	response.write(`</pre></body></html>`);
	response.end();
}

function localRedirect(request: http.IncomingMessage, response: http.ServerResponse, path: string) {
	const [, query] = request.url!.split("?");
	if (query && query !== "") {
		path += "?" + query;
	}

	response.setHeader("Location", path);
	response.writeHead(301);
	response.end();
}

function toHTTPError(error: Error): [string, number] {
	return ["Internal error", 500];
}
