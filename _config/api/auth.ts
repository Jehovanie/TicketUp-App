import { client } from "./client";
import { IUser } from "@/_core/model/IUser";

/**
 * Authentification.
 *
 * `POST /api/auth/login` n'est pas servi par un contrôleur applicatif mais par
 * le firewall `json_login` de Symfony : la réponse ne porte donc **pas**
 * l'enveloppe maison, et une erreur d'identifiants revient au format Lexik
 * (`{ code: 401, message: "Invalid credentials." }`) — que `ApiError` sait déjà
 * lire, puisqu'il cherche `message` en premier.
 */

export interface ILoginResponse {
	token: string;
	/** Ajouté par `JwtLoginSuccessSubscriber`, en plus du handler Lexik. */
	refresh_token: string;
}

/** Le champ d'identifiant est `email` (`username_path: email` côté firewall). */
export async function login(email: string, password: string): Promise<ILoginResponse> {
	const response = await client.post<ILoginResponse>(
		"/api/auth/login",
		{ email, password },
		// Un jeton périmé encore en mémoire ne doit pas parasiter la connexion.
		{ skipAuth: true }
	);

	return response.data;
}

/** `GET /api/user/me` — objet à plat, hors enveloppe. Requiert le jeton. */
export async function getMe(): Promise<IUser> {
	const response = await client.get<IUser>("/api/user/me");

	return response.data;
}
