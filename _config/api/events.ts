import { client } from "./client";
import { IEvent, IEventListItem } from "@/_core/model/IEvent";
import { IApiEnvelope, IPaginatedData, IPaginationParams } from "@/_core/model/IApiResponse";

/** Plafond imposé par `GetEventsController` : `min(20, max(1, itemsPerPage))`. */
export const EVENTS_MAX_ITEMS_PER_PAGE = 20;

/**
 * `GET /api/events` — liste paginée, triée par `createdAt` DESC.
 *
 * ⚠️ Cet endpoint NE filtre PAS sur `status` : les brouillons (`status = false`,
 * valeur par défaut à la création) sont inclus dans la liste.
 */
export async function getEvents({
	page = 1,
	itemsPerPage = EVENTS_MAX_ITEMS_PER_PAGE,
}: IPaginationParams = {}): Promise<IPaginatedData<IEventListItem>> {
	const response = await client.get<IApiEnvelope<IPaginatedData<IEventListItem>>>("/api/events", {
		query: { page, itemsPerPage: Math.min(itemsPerPage, EVENTS_MAX_ITEMS_PER_PAGE) },
	});

	return response.data.data;
}

/**
 * `GET /api/events/{id}` — détail (`events:lists` + `events:details`).
 *
 * L'identifiant doit être numérique : la route porte `requirements: ['id' => '\d+']`,
 * un id non numérique tombe sur un 404 de routage Symfony (HTML), hors enveloppe.
 */
export async function getEventById(id: number | string): Promise<IEvent> {
	const response = await client.get<IApiEnvelope<IEvent>>(`/api/events/${id}`);

	return response.data.data;
}
