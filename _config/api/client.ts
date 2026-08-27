import { environment } from "@/environment/environement";

export interface ClientResponse<T> {
	status: number;
	data: T;
	header: Headers;
	url: string;
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions extends Omit<Partial<RequestInit>, "body"> {
	body?: any;
	query?: QueryParams;
	/** Ne pas joindre le `Authorization: Bearer` même si un token est enregistré. */
	skipAuth?: boolean;
}

/**
 * Erreur applicative : porte le code HTTP et le corps renvoyé par l'API.
 *
 * L'API expose trois formats d'erreur :
 *  - enveloppe maison   → `{ message, status, data: null }`   (contrôleurs custom)
 *  - Lexik / firewall   → `{ code, message }`                 (401 sur /api/auth/login)
 *  - API Platform       → `{ "hydra:description" | "detail" }` (endpoints natifs)
 */
export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		public readonly payload: unknown = null,
		public readonly url: string = ""
	) {
		super(message);
		this.name = "ApiError";
	}
}

let authToken: string | null = null;

/** Enregistre le JWT joint à chaque appel (`/api/user/me`, `/api/events/me`, ...). */
export function setAuthToken(token: string | null) {
	authToken = token;
}

export function getAuthToken(): string | null {
	return authToken;
}

function buildUrl(endPoint: string, query?: QueryParams): string {
	const base = `${environment.apiUrl}${endPoint}`;
	if (!query) return base;

	const search = Object.entries(query)
		.filter(([, value]) => value !== undefined && value !== null && value !== "")
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
		.join("&");

	return search ? `${base}?${search}` : base;
}

function extractErrorMessage(status: number, payload: any): string {
	if (payload && typeof payload === "object") {
		const message =
			payload.message ?? payload["hydra:description"] ?? payload.detail ?? payload.error_description;
		if (typeof message === "string" && message.length > 0) return message;
	}
	if (typeof payload === "string" && payload.length > 0) return payload;
	return `Requête échouée (HTTP ${status})`;
}

export async function client<T>(
	endPoint: string,
	{ body, query, skipAuth, ...customConfig }: RequestOptions = {}
): Promise<ClientResponse<T>> {
	const headers: Record<string, string> = {
		// Indispensable : sans cet en-tête les endpoints API Platform natifs
		// répondent en JSON-LD (`application/ld+json`).
		Accept: "application/json",
	};

	if (body !== undefined) headers["Content-Type"] = "application/json";
	if (authToken && !skipAuth) headers.Authorization = `Bearer ${authToken}`;

	const config: RequestInit = {
		method: body !== undefined ? "POST" : "GET",
		...customConfig,
		headers: {
			...headers,
			...customConfig.headers,
		},
	};

	if (body !== undefined) config.body = JSON.stringify(body);

	const url = buildUrl(endPoint, query);

	let response: Response;
	try {
		response = await fetch(url, config);
	} catch (err: any) {
		// Panne réseau : l'appareil n'atteint pas `environment.apiUrl`.
		throw new ApiError(err?.message ?? "Serveur injoignable", 0, null, url);
	}

	// 204 / corps vide : ne pas tenter de parser.
	const raw = await response.text();
	let data: any = null;
	if (raw.length > 0) {
		try {
			data = JSON.parse(raw);
		} catch {
			if (!response.ok) throw new ApiError(raw.slice(0, 200), response.status, raw, url);
			throw new ApiError("Réponse non JSON reçue de l'API", response.status, raw, url);
		}
	}

	if (!response.ok) {
		throw new ApiError(extractErrorMessage(response.status, data), response.status, data, url);
	}

	return {
		status: response.status,
		data: data as T,
		header: response.headers,
		url: response.url || url,
	};
}

client.get = function <T>(endpoint: string, options: Omit<RequestOptions, "body"> = {}) {
	return client<T>(endpoint, { ...options, method: options.method ?? "GET" });
};

client.post = function <T>(endpoint: string, body: any, options: Omit<RequestOptions, "body"> = {}) {
	return client<T>(endpoint, { ...options, body, method: options.method ?? "POST" });
};
