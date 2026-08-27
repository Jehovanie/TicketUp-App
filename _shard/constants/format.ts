/**
 * Locale et formats d'affichage de l'application.
 *
 * L'interface est en français ; seules les données renvoyées par l'API
 * (titres d'événements, noms de lieux, de catégories, d'organisateurs)
 * s'affichent telles quelles.
 */
export const LOCALE = "fr-FR";

/**
 * Devise affichée à côté des prix (`TicketType::$prix`).
 *
 * L'API ne renvoie qu'un entier, sans devise : les montants sont exprimés
 * en ariary malgache (code ISO `MGA`), affiché suffixé — « 50 000 Ar ».
 */
export const CURRENCY_SYMBOL = "Ar";

/** Libellé du badge affiché à la place d'un prix nul. */
export const FREE_LABEL = "Gratuit";

/** Un billet à 0 (ou sans prix) est gratuit : on affiche un badge, pas « 0 Ar ». */
export function isFree(prix: number | null | undefined): boolean {
	return !prix || prix <= 0;
}

/** Formate un montant en ariary, convention française : `50 000 Ar`. */
export function formatPrice(prix: number): string {
	return `${prix.toLocaleString(LOCALE)} ${CURRENCY_SYMBOL}`;
}
