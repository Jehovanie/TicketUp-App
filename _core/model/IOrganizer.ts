import { IJsonLd } from "./IJsonLd";

/**
 * Entité `Organizer`.
 *
 *  - `event.organizer` (`events:details`)        → id, name, email, phone, website
 *  - `GET /api/organizers` (`organizer:lists`)   → id, name, email (JSON-LD)
 *  - `GET /api/organizer/{id}` (+ `organizer:details`) → + phone, website, timestamps
 *
 * Absent des items de `GET /api/events` : `organizer` n'est pas dans `events:lists`.
 */
export interface IOrganizer extends IJsonLd {
	id: number;
	name: string;
	email: string;
	/** Colonnes nullables en base. */
	phone: string | null;
	website: string | null;
	/** `organizer:details` uniquement. */
	createdAt?: string;
	updatedAt?: string;
}
