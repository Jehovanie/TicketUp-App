/** Statuts renvoyés par `OrderStatus` côté API. */
export type OrderStatus = "pending" | "paid" | "cancelled" | "expired" | "refunded";

export interface IOrderItem {
	ticketTypeId: number | null;
	name: string;
	unitPrice: number;
	quantity: number;
	lineTotal: number;
}

export interface IOrderTicket {
	code: string;
	status: string;
	ticketTypeName: string;
	holderName: string | null;
}

/**
 * Commande telle que sérialisée par `OrderPresenter`.
 *
 * Désignée par sa `reference` (« TU-… »), jamais par un id. `tickets` n'est
 * rempli qu'une fois la commande payée — d'emblée pour une commande gratuite.
 */
export interface IOrder {
	reference: string;
	status: OrderStatus;
	statusLabel: string;
	totalAmount: number;
	currency: string;
	ticketCount: number;
	/** Fin de la réservation des places pour une commande `pending`. */
	expiresAt: string | null;
	paidAt: string | null;
	cancelledAt: string | null;
	createdAt: string;
	event: { id: number; title: string; startedAt: string; endAt: string };
	items: IOrderItem[];
	tickets: IOrderTicket[];
}

export interface IOrderLine {
	ticketTypeId: number;
	quantity: number;
}
