/**
 * Accès typé à la palette depuis le code (là où `className` ne passe pas :
 * `LinearGradient`, `tintColor`, `RefreshControl`, `ActivityIndicator`...).
 *
 * La palette elle-même vit dans `palette.js`, partagée avec `tailwind.config.js`.
 */
import palette from "@/_shard/constants/palette";

export const colors = palette as {
	primary: Record<string, string>;
	gold: Record<string, string>;
	ink: Record<string, string>;
	surface: { DEFAULT: string; raised: string; sunken: string };
	success: Record<string, string>;
	warning: Record<string, string>;
	danger: Record<string, string>;
};

/** `LinearGradient` attend un tuple d'au moins deux couleurs, pas un `string[]`. */
export type Gradient = readonly [string, string, ...string[]];

export const GRADIENTS = {
	/** En-tête et fonds profonds — le bleu nuit de la marque. */
	night: [colors.primary[950], colors.primary[900], colors.primary[800]] as Gradient,
	/** Voile posé sur une pochette pour garder le texte lisible. */
	scrim: ["transparent", "rgba(13,17,27,0.35)", "rgba(13,17,27,0.92)"] as Gradient,
	/** Liseré précieux, réservé aux mises en avant. */
	gold: [colors.gold[300], colors.gold[500]] as Gradient,
} as const;

/** `#RRGGBB` → `rgba(r,g,b,alpha)`. Les couleurs de catégorie viennent de l'API. */
export function withAlpha(hex: string, alpha: number): string {
	const clean = hex.replace("#", "").trim();
	const full =
		clean.length === 3
			? clean
					.split("")
					.map((c) => c + c)
					.join("")
			: clean;

	if (full.length !== 6) return hex;

	const value = parseInt(full, 16);
	if (Number.isNaN(value)) return hex;

	const r = (value >> 16) & 255;
	const g = (value >> 8) & 255;
	const b = value & 255;

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Noir ou blanc selon la luminance perçue du fond — les couleurs de catégorie
 * vont du `#f59e0b` (Humour) au `#0f766e` (Salon pro), un texte figé serait
 * illisible sur l'une des deux.
 */
export function readableOn(hex: string): string {
	const clean = hex.replace("#", "").trim();
	if (clean.length !== 6) return "#FFFFFF";

	const value = parseInt(clean, 16);
	if (Number.isNaN(value)) return "#FFFFFF";

	const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	});

	const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];

	return luminance > 0.45 ? colors.ink[950] : "#FFFFFF";
}

/** Couleur d'accent d'un événement : celle de sa catégorie, sinon le bleu marque. */
export function accentOf(categoryColor?: string | null): string {
	return categoryColor && categoryColor.length > 0 ? categoryColor : colors.primary[600];
}

/** Dégradé de pochette dérivé d'une couleur d'accent (aucune image côté API). */
export function coverGradient(accent: string): Gradient {
	return [withAlpha(accent, 0.95), withAlpha(accent, 0.55), colors.primary[950]] as Gradient;
}
