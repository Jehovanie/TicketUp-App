import { IJsonLd } from "./IJsonLd";

/**
 * Entité `Location`.
 *
 *  - `event.location` (`events:lists`)          → id, name, size
 *  - `GET /api/locations` (`location:lists`)    → id, name, size (JSON-LD)
 *  - `GET /api/location/{id}` (+ `location:details`) → + createdAt, updatedAt
 *
 * ⚠️ Incohérence d'URL côté back : collection au pluriel, détail au singulier.
 */
export interface IEventLocation extends IJsonLd {
	id: number;
	name: string;
	size: number;
	/** `location:details` uniquement → `GET /api/location/{id}`. */
	createdAt?: string;
	updatedAt?: string;
}
