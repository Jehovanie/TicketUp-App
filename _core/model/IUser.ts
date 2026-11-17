/**
 * Utilisateur connecté, tel que renvoyé par `GET /api/user/me`.
 *
 * ⚠️ Cet endpoint est l'une des exceptions de l'API : il répond avec un objet
 * **à plat**, sans l'enveloppe maison `{ message, status, data }` et sans
 * champs JSON-LD. Ne pas le déballer.
 */
export interface IUser {
	id: number;
	email: string;
	/** Colonnes nullables en base. */
	firstname: string | null;
	lastname: string | null;
	phone: string | null;
	language: string | null;
	roles: string[];
	/** Format `Y-m-d H:i:s` (et non ISO 8601, contrairement aux autres dates). */
	createdAt?: string;
	updatedAt?: string;
}

/** Nom d'affichage : prénom seul, sinon nom, sinon la partie locale de l'e-mail. */
export function displayName(user: IUser | null): string {
	if (!user) return "";
	if (user.firstname) return user.firstname;
	if (user.lastname) return user.lastname;

	return user.email.split("@")[0];
}
