import { ImageSourcePropType } from "react-native";

import { PaymentAccountKind, PaymentProviderId } from "@/_core/model/IPaymentMethod";
import logos from "@/_shard/constants/logos";

/**
 * Catalogue des opérateurs de paiement proposés.
 *
 * Chaque opérateur porte son logo officiel (`@/assets/logos`). Comme les
 * fichiers fournis n'ont pas le même cadrage, `logoFit` dit comment poser
 * chacun dans sa pastille carrée :
 *
 *  - `"cover"` pour les visuels qui **sont** déjà un carré de marque (MVola,
 *    Airtel, Orange Money) ou dont la marge est à rogner (Stripe, en 16:9) :
 *    la pastille prend alors la couleur de la marque ;
 *  - `"contain"` pour les logos sur fond transparent (PayPal), posés sur blanc
 *    avec une respiration.
 *
 * Les logos sont des marques déposées : on ne les recolore pas.
 */

export type PaymentProviderFamily = "mobile-money" | "international";

export type PaymentProvider = {
	id: PaymentProviderId;
	name: string;
	family: PaymentProviderFamily;
	logo: ImageSourcePropType;
	/** Cadrage du fichier dans la pastille — voir l'en-tête du module. */
	logoFit: "cover" | "contain";
	/** Marge intérieure de la pastille, en points. */
	logoPadding: number;
	accountKind: PaymentAccountKind;
	accountLabel: string;
	placeholder: string;
	/** Aide affichée sous le champ. */
	hint: string;
	/** Préfixes malgaches de l'opérateur, utilisés par `validateAccount`. */
	prefixes?: string[];
};

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
	{
		id: "mvola",
		name: "MVola",
		family: "mobile-money",
		logo: logos.mvola,
		logoFit: "cover",
		logoPadding: 0,
		accountKind: "phone",
		accountLabel: "Numéro MVola",
		placeholder: "034 00 000 00",
		hint: "Numéro Telma, commençant par 034 ou 038.",
		prefixes: ["034", "038"],
	},
	{
		id: "airtel-money",
		name: "Airtel Money",
		family: "mobile-money",
		logo: logos.airtelMoney,
		logoFit: "cover",
		logoPadding: 0,
		accountKind: "phone",
		accountLabel: "Numéro Airtel",
		placeholder: "033 00 000 00",
		hint: "Numéro Airtel, commençant par 033.",
		prefixes: ["033"],
	},
	{
		id: "orange-money",
		name: "Orange Money",
		family: "mobile-money",
		logo: logos.orangeMoney,
		logoFit: "cover",
		logoPadding: 0,
		accountKind: "phone",
		accountLabel: "Numéro Orange",
		placeholder: "032 00 000 00",
		hint: "Numéro Orange, commençant par 032 ou 037.",
		prefixes: ["032", "037"],
	},
	{
		id: "paypal",
		name: "PayPal",
		family: "international",
		logo: logos.paypal,
		logoFit: "contain",
		logoPadding: 7,
		accountKind: "email",
		accountLabel: "Adresse PayPal",
		placeholder: "vous@exemple.com",
		hint: "L'adresse e-mail rattachée à votre compte PayPal.",
	},
	{
		// Paiement par carte. Le numéro de carte n'est **jamais** saisi ici : il
		// sera collecté par la feuille de paiement de Stripe le jour où elle
		// sera intégrée. On ne garde que l'e-mail du client Stripe, celui qui
		// reçoit les reçus.
		id: "stripe",
		name: "Stripe",
		family: "international",
		logo: logos.stripe,
		logoFit: "cover",
		logoPadding: 0,
		accountKind: "email",
		accountLabel: "E-mail de facturation",
		placeholder: "vous@exemple.com",
		hint: "Paiement par carte. Votre carte sera saisie au moment de payer, jamais ici.",
	},
];

export const PAYMENT_FAMILIES: { id: PaymentProviderFamily; title: string; caption: string }[] = [
	{
		id: "mobile-money",
		title: "Mobile Money",
		caption: "Réglez depuis votre portefeuille mobile, sans carte bancaire.",
	},
	{
		id: "international",
		title: "À l'international",
		caption: "Compte PayPal ou carte bancaire, pratique depuis l'étranger.",
	},
];

export function providerOf(id: PaymentProviderId): PaymentProvider {
	// Le catalogue est exhaustif par construction : `PaymentProviderId` et
	// `PAYMENT_PROVIDERS` évoluent ensemble.
	return PAYMENT_PROVIDERS.find((provider) => provider.id === id)!;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** `null` quand la saisie est acceptable, sinon le message à afficher. */
export function validateAccount(provider: PaymentProvider, value: string): string | null {
	const trimmed = value.trim();
	if (trimmed.length === 0) {
		return provider.accountKind === "email" ? "Adresse requise" : "Numéro requis";
	}

	if (provider.accountKind === "email") {
		return EMAIL_PATTERN.test(trimmed) ? null : "Adresse e-mail invalide";
	}

	// Les numéros s'écrivent « 034 12 345 67 » ou « +261 34 12 345 67 » : on ne
	// raisonne que sur les chiffres, et on ramène la forme internationale à la
	// forme locale avant de comparer le préfixe.
	const digits = trimmed.replace(/\D/g, "");
	const local = digits.startsWith("261") ? `0${digits.slice(3)}` : digits;

	if (local.length !== 10) return "Le numéro doit comporter 10 chiffres";

	if (provider.prefixes && !provider.prefixes.some((prefix) => local.startsWith(prefix))) {
		return `Ce numéro n'est pas un numéro ${provider.name} (${provider.prefixes.join(" ou ")})`;
	}

	return null;
}

/**
 * Forme affichée une fois le moyen enregistré : assez pour se reconnaître,
 * pas assez pour être lu par-dessus l'épaule.
 */
export function maskAccount(provider: PaymentProvider, value: string): string {
	const trimmed = value.trim();

	if (provider.accountKind === "email") {
		const [local, domain] = trimmed.split("@");
		if (!domain) return trimmed;

		const head = local.slice(0, 2);

		return `${head}${"•".repeat(Math.max(local.length - 2, 1))}@${domain}`;
	}

	const digits = trimmed.replace(/\D/g, "");
	const local = digits.startsWith("261") ? `0${digits.slice(3)}` : digits;

	return `${local.slice(0, 3)} •• ••• ${local.slice(-2)}`;
}
