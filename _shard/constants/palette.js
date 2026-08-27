/**
 * Palette « Bleu nuit & Or » — source de vérité unique des couleurs.
 *
 * En CommonJS à dessein : le fichier est lu par `tailwind.config.js` (chargé par
 * Node, hors pipeline TypeScript) autant que par l'application via
 * `_shard/constants/colors.ts`. Une seule définition, deux consommateurs.
 *
 * Intention : le bleu nuit porte l'identité (noblesse, confiance, billetterie
 * de gala), l'or ne sert que de ponctuation — prix, mise en avant, accents
 * précieux. Jamais d'aplat doré : l'or perd sa valeur dès qu'il couvre.
 */

/** Bleu nuit royal — identité de marque, boutons, surfaces profondes. */
const primary = {
	50: "#F1F4FC",
	100: "#E1E8F8",
	200: "#C4D0F0",
	300: "#9AAFE4",
	400: "#6B87D3",
	500: "#4863BE",
	600: "#34499E",
	700: "#293A80",
	800: "#22306A",
	900: "#1B2A5B",
	950: "#0E1734",
};

/** Or champagne — prix, badges « à la une », liserés. Usage parcimonieux. */
const gold = {
	50: "#FBF7EC",
	100: "#F6EDD3",
	200: "#EDDCA6",
	300: "#E1C56F",
	400: "#D6AE45",
	500: "#C69A2E",
	600: "#A87B26",
	700: "#855C23",
	800: "#6F4C24",
	900: "#5F4022",
	950: "#372110",
};

/** Neutres froids, accordés au bleu nuit — texte, bordures, fonds. */
const ink = {
	50: "#F7F8FA",
	100: "#EFF1F5",
	200: "#DFE3EB",
	300: "#C3CAD8",
	400: "#98A2B5",
	500: "#6F7B92",
	600: "#556076",
	700: "#434C5E",
	800: "#2E3646",
	900: "#1A2030",
	950: "#0D111B",
};

module.exports = {
	primary: { DEFAULT: primary[900], ...primary },
	gold: { DEFAULT: gold[500], ...gold },
	ink: { DEFAULT: ink[900], ...ink },

	/** Fonds d'écran et de cartes. `sunken` sert de base aux squelettes. */
	surface: {
		DEFAULT: "#F6F7FB",
		raised: "#FFFFFF",
		sunken: "#EAEDF4",
	},

	success: { DEFAULT: "#0F9D6E", 100: "#E3F6EF", 600: "#0B7C57" },
	warning: { DEFAULT: "#D97706", 100: "#FEF1E1" },
	danger: { DEFAULT: "#DC2626", 100: "#FDE8E8" },

	/**
	 * Conservés pour les écrans pas encore repris (`Search`, `profile`,
	 * `event/[id]`) : ces alias existaient dans l'ancienne palette et sont
	 * remappés sur les nouveaux neutres pour éviter toute rupture visuelle.
	 */
	black: { DEFAULT: ink[950], 100: ink[400], 200: ink[500], 300: ink[900] },
	accent: { 100: "#F6F7FB" },
};
