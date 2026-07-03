const TOKEN_KEY = "token";

export function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
	window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
	window.localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
	return getToken() !== null;
}
