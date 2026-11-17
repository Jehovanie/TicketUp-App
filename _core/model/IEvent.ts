import { ICategory } from "./ICategory";
import { IEventLocation } from "./IEventLocation";
import { ITicketType } from "./ITicketType";
import { IOrganizer } from "./IOrganizer";

/**
 * Événement tel que sérialisé par le groupe `events:lists`.
 *
 * Forme renvoyée par : `GET /api/events`, `GET /api/events/me`,
 * `GET /api/events/search`, `GET /api/events/category/{categoryId}`.
 *
 * ⚠️ Ni `description`, ni `organizer`, ni les timestamps ne sont présents ici.
 */
export interface IEventListItem {
	id: number;
	title: string;
	startedAt: string;
	endAt: string;
	status: boolean;
	category: ICategory;
	location: IEventLocation;
	ticket_type: ITicketType[];
}

/**
 * Événement détaillé : groupes `events:lists` + `events:details`.
 * Forme renvoyée par `GET /api/events/{id}` uniquement.
 */
export interface IEvent extends IEventListItem {
	description: string;
	/** Relation nullable en base (`Event::$organizer` peut être null). */
	organizer: IOrganizer | null;
	/**
	 * ⚠️ Jamais renvoyé aujourd'hui : `Event::$imageUrl` ne porte AUCUN groupe de
	 * sérialisation côté API, et `POST /api/events` ne l'alimente pas non plus.
	 * Conservé optionnel pour le jour où le back ajoutera le groupe.
	 */
	imageUrl?: string[];
}
