/**
 * Enveloppe maison renvoyée par les contrôleurs personnalisés de l'API.
 *
 * Concerne : GET /api/events, /api/events/me, /api/events/search,
 * /api/events/{id}, /api/categories, /api/organizers/me, POST /api/organizers.
 *
 * Exceptions côté back (ne PAS déballer) :
 *  - GET /api/events/category/{categoryId} → tableau JSON brut ;
 *  - GET /api/user/me → objet utilisateur à plat ;
 *  - endpoints API Platform natifs → JSON-LD / Hydra (`member`, `@id`, ...).
 */
export interface IApiEnvelope<T> {
	message: string;
	status: number;
	data: T;
}

/** Bloc de pagination maison (attention : `nombreParPage`, pas `itemsPerPage`). */
export interface IPaginatedData<T> {
	itemsTotal: number;
	currentPage: number;
	nombreParPage: number;
	items: T[];
}

export type IPaginatedEnvelope<T> = IApiEnvelope<IPaginatedData<T>>;

/** Paramètres de pagination acceptés en query string. */
export interface IPaginationParams {
	page?: number;
	itemsPerPage?: number;
}
