import http from "node:http";

export type HandleFunc = (request: http.IncomingMessage, response: http.ServerResponse, params: Record<string, string | undefined>) => Promise<void>;

export interface Handler {
	handle: HandleFunc;
}

export function sendError(response: http.ServerResponse, error: string, code: number): void {
	response.setHeader("Content-Type", "text/plain; charset=utf-8");
	response.writeHead(code);
	response.end(error);
	return;
}

export function stripPrefix(prefix: string, handler: Handler): Handler {
	return {
		handle(request, response, params) {
			if (prefix.length > 0 && request.url!.startsWith(prefix)) {
				request.url = request.url!.slice(prefix.length);
			}
			return handler.handle(request, response, params)
		}
	}
}

