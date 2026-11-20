import { client } from "./client";
import { IApiEnvelope, IPaginatedData, IPaginationParams } from "@/_core/model/IApiResponse";
import { IOrder, IOrderLine } from "@/_core/model/IOrder";

/**
 * `POST /api/orders` — authentifié. Réserve les places (15 min) ; une commande
 * gratuite est directement `paid`, billets émis.
 *
 * `idempotencyKey` : un renvoi avec la même clé (réseau mobile instable)
 * renvoie la commande déjà créée (200) au lieu d'en créer une seconde (201).
 * Les prix ne sont pas envoyés : le total est calculé côté API.
 *
 * Erreurs métier : 400 saisie, 404 événement, 409 stock / vente terminée.
 */
export async function placeOrder(
	eventId: number,
	items: IOrderLine[],
	idempotencyKey?: string
): Promise<IOrder> {
	const response = await client.post<IApiEnvelope<IOrder>>(
		"/api/orders",
		{ eventId, items },
		{ headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined }
	);

	return response.data.data;
}

/** `POST /api/orders/{reference}/cancel` — seulement tant que la commande est `pending`. */
export async function cancelOrder(reference: string): Promise<IOrder> {
	const response = await client.post<IApiEnvelope<IOrder>>(`/api/orders/${reference}/cancel`, {});

	return response.data.data;
}

/**
 * `GET /api/orders/me` — commandes de l'utilisateur connecté, plus récentes
 * d'abord. Pagination maison, `itemsPerPage` plafonné à 20 côté API.
 */
export async function getMyOrders({ page = 1, itemsPerPage = 10 }: IPaginationParams = {}): Promise<IPaginatedData<IOrder>> {
	const response = await client.get<IApiEnvelope<IPaginatedData<IOrder>>>("/api/orders/me", {
		query: { page, itemsPerPage: Math.min(itemsPerPage, 20) },
	});

	return response.data.data;
}

/** `GET /api/orders/{reference}` — détail d'une commande, billets compris. 404 si elle n'est pas la vôtre. */
export async function getOrder(reference: string): Promise<IOrder> {
	const response = await client.get<IApiEnvelope<IOrder>>(`/api/orders/${reference}`);

	return response.data.data;
}
