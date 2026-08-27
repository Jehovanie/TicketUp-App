import { IJsonLd } from "./IJsonLd";

/**
 * Entité `Category`.
 *
 * Champs disponibles selon l'endpoint (groupes de sérialisation) :
 *  - items de `GET /api/events`      (`events:lists`)   → id, name
 *  - `event.category` de `/api/events/{id}` (`events:details`) → id, name, color
 *  - items de `GET /api/categories`  (`category:lists`) → id, name, color
 *  - `GET /api/categories/{id}`      (+ `category:details`) → + createdAt, updatedAt (JSON-LD)
 */
export interface ICategory extends IJsonLd {
	id: number;
	name: string;
	/** Absent des items de `GET /api/events` (hors groupe `events:lists`). */
	color?: string;
	/** `category:details` uniquement → `GET /api/categories/{id}`. */
	createdAt?: string;
	updatedAt?: string;
}
