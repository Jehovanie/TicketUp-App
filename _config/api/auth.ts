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

export interface IRegisterInput {
	email: string;
	password: string;
	firstname: string;
	lastname: string;
	/** Facultatifs côté API (`RegisterDTO`) : `phone` ≤ 30, `language` ≤ 10. */
	phone?: string | null;
	language?: string | null;
}

export interface IRegisterResponse {
	token: string;
	refresh_token: string;
	/** Profil **partiel** : ni `roles`, ni `createdAt` — repasser par `getMe()`. */
	user: Pick<IUser, "id" | "email" | "firstname" | "lastname" | "phone" | "language">;
}

/**
 * `POST /api/auth/register` — crée le compte **et** délivre les jetons : pas
 * besoin d'enchaîner sur `login`.
 *
 * Contraintes du `RegisterDTO` : `email` valide, `password` de 4 à 72
 * caractères (borne haute imposée par bcrypt), `firstname` / `lastname` non
 * vides et ≤ 50.
 */
export async function register(input: IRegisterInput): Promise<IRegisterResponse> {
	const response = await client.post<IRegisterResponse>("/api/auth/register", input, {
		// La route est publique ; un jeton périmé encore en mémoire n'a rien à
		// y faire.
		skipAuth: true,
	});

	return response.data;
}

/** `GET /api/user/me` — objet à plat, hors enveloppe. Requiert le jeton. */
export async function getMe(): Promise<IUser> {
	const response = await client.get<IUser>("/api/user/me");

	return response.data;
}
