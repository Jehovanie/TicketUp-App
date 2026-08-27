/**
 * Moyens de paiement enregistrés par un utilisateur.
 *
 * ⚠️ **Rien de tout ceci n'existe côté API pour l'instant** : aucune entité, ni
 * endpoint. Ces types décrivent la forme visée pour l'écran de configuration,
 * et servent de contrat le jour où le back l'exposera.
 *
 * À noter pour cette suite : on n'enregistre qu'un **identifiant de compte**
 * (un numéro d'opérateur, une adresse PayPal), jamais un moyen de débit — pas
 * de code PIN, pas de numéro de carte. Le débit se fera par redirection vers
 * l'opérateur au moment de l'achat.
 */

export type PaymentProviderId = "mvola" | "airtel-money" | "orange-money" | "paypal" | "stripe";

/** Ce que l'utilisateur saisit pour identifier son compte chez l'opérateur. */
export type PaymentAccountKind = "phone" | "email";

export interface IPaymentMethod {
	provider: PaymentProviderId;
	/** Saisie brute, telle qu'entrée par l'utilisateur. */
	account: string;
	/** Un seul moyen par défaut à la fois — proposé d'office à la réservation. */
	isDefault: boolean;
}
