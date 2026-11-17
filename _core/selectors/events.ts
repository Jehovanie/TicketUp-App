/**
 * Lecture métier d'un événement, calée sur ce que `GET /api/events` renvoie
 * vraiment (groupe `events:lists`).
 *
 * Deux réalités du back que l'interface doit absorber ici, et pas ailleurs :
 *
 *  1. l'endpoint **ne filtre pas `status`** et trie par `createdAt` DESC — la
 *     liste mélange donc brouillons, événements terminés, en cours et à venir,
 *     dans un ordre sans rapport avec les dates ;
 *  2. `ticket_type` peut être **vide** (un événement sur douze dans les
 *     fixtures) : il n'y a pas toujours un prix à afficher.
 */
import { IEventListItem } from "@/_core/model/IEvent";
import { ITicketType } from "@/_core/model/ITicketType";
import { ICategory } from "@/_core/model/ICategory";

/** Où en est un événement par rapport à maintenant. */
export type EventPhase = "past" | "live" | "upcoming";

const DAY_MS = 24 * 60 * 60 * 1000;

function time(value: string | null | undefined): number {
	if (!value) return Number.NaN;
	return new Date(value).getTime();
}

export function eventPhase(event: IEventListItem, now: number = Date.now()): EventPhase {
	const start = time(event.startedAt);
	const end = time(event.endAt);

	// Date illisible : on ne le fait pas disparaître, on le traite comme à venir.
	if (Number.isNaN(start)) return "upcoming";
	if (!Number.isNaN(end) && end < now) return "past";
	if (start <= now) return "live";

	return "upcoming";
}

/** Seuls les événements publiés ont leur place sur un écran public. */
export function isPublished(event: IEventListItem): boolean {
	return event.status === true;
}

export function isLive(event: IEventListItem, now?: number): boolean {
	return eventPhase(event, now) === "live";
}

export function isUpcoming(event: IEventListItem, now?: number): boolean {
	return eventPhase(event, now) === "upcoming";
}

/** À venir **ou** en cours : ce qu'un visiteur peut encore rejoindre. */
export function isBookable(event: IEventListItem, now?: number): boolean {
	return eventPhase(event, now) !== "past";
}

/** Commence dans les `days` prochains jours (les événements en cours comptent). */
export function startsWithinDays(event: IEventListItem, days: number, now: number = Date.now()): boolean {
	const start = time(event.startedAt);
	if (Number.isNaN(start)) return false;

	return start <= now + days * DAY_MS && !isPast(event, now);
}

function isPast(event: IEventListItem, now?: number): boolean {
	return eventPhase(event, now) === "past";
}

/** Tri chronologique : le plus proche d'abord. */
export function compareByStartAsc(a: IEventListItem, b: IEventListItem): number {
	const left = time(a.startedAt);
	const right = time(b.startedAt);

	if (Number.isNaN(left)) return 1;
	if (Number.isNaN(right)) return -1;

	return left - right;
}

/**
 * Billet le moins cher, ou `null` si l'événement n'a pas de billetterie.
 *
 * `null` (pas de tarif défini) et un billet à 0 (gratuit) sont deux états
 * distincts : l'appelant affiche « Tarifs à venir » dans un cas, le badge
 * « Gratuit » dans l'autre.
 */
export function minPriceTicket(event: IEventListItem): ITicketType | null {
	const tickets = event.ticket_type;
	if (!tickets || tickets.length === 0) return null;

	return tickets.reduce((a, b) => (a.prix <= b.prix ? a : b));
}

/**
 * `id de catégorie → couleur`.
 *
 * Nécessaire parce que `color` n'appartient pas au groupe `events:lists` :
 * `event.category` n'expose que `id` et `name`. La couleur, elle, arrive par
 * `GET /api/categories` (groupe `category:lists`).
 */
export function buildCategoryColorMap(categories: ICategory[]): Record<number, string> {
	const map: Record<number, string> = {};

	for (const category of categories) {
		if (category?.id != null && category.color) map[category.id] = category.color;
	}

	return map;
}
