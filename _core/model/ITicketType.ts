/**
 * Entité `TicketType`. Ce n'est pas une ressource API Platform : elle n'existe
 * qu'imbriquée dans un événement (pas de champs JSON-LD, pas d'URL propre).
 *
 *  - `events:lists`   → id, name, prix, quantite_max
 *  - `events:details` → + createdAt, updatedAt
 */
export interface ITicketType {
	id: number;
	name: string;
	prix: number;
	quantite_max: number;
	/** `events:details` uniquement → `GET /api/events/{id}`. */
	createdAt?: string;
	updatedAt?: string;
}
