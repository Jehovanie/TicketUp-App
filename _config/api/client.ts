import { environment } from "@/environment/environement";

interface ClientResponse<T> {
	message?: string;
	status: number;
	data: T;
	header?: Headers;
	url?: string;
}

export async function client<T>(
	endPoint: string,
	{ body, ...customConfig }: Partial<RequestInit> = {}
): Promise<ClientResponse<T>> {
	try {
		const headers = {
			Accept: "application/json",
			"Content-Type": "application/json",
		};

		const config: RequestInit = {
			method: body ? "POST" : "GET",
			...customConfig,
			headers: {
				...headers,
				...customConfig.headers,
			},
		};

		if (body) config.body = JSON.stringify(body);

		console.log(`Link : ${environment.apiUrl}${endPoint}`);
		console.log("config " + JSON.stringify(config));

		const response = await window.fetch(`${environment.apiUrl}${endPoint}`, config);

		const { data, message, status } = await response.json();
		if (response.ok) {
			return Promise.resolve({
				status: status,
				message: message,
				data,
				header: response.headers,
				url: response.url,
			});
		}

		throw new Error(JSON.stringify(response));
	} catch (err: any) {
		return Promise.reject(err.message ? err.message : []);
	}
}

client.get = function <T>(endpoint: string, customConfig: Partial<RequestInit> = {}) {
	return client<T>(endpoint, { ...customConfig, method: "GET" });
};

client.post = function <T>(endpoint: string, body: any, customConfig: Partial<RequestInit> = {}) {
	return client<T>(endpoint, { ...customConfig, body });
};
