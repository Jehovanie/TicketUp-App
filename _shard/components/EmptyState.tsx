import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from "react-native";

import icons from "@/_shard/constants/icons";
import { colors, withAlpha } from "@/_shard/constants/colors";

/**
 * État vide unifié.
 *
 * Une liste vide n'a pas une seule cause, et les confondre laisse l'utilisateur
 * sans issue : « aucun événement à venir » appelle un rafraîchissement,
 * « aucun résultat » appelle un effacement du filtre, « serveur injoignable »
 * appelle une nouvelle tentative. Chaque variante porte donc son propre ton,
 * son propre texte et sa propre action.
 */

export type EmptyVariant = "empty" | "search" | "error" | "offline";

interface VariantSpec {
	icon: ImageSourcePropType;
	tint: string;
	title: string;
	message: string;
	action: string;
}

const VARIANTS: Record<EmptyVariant, VariantSpec> = {
	empty: {
		icon: icons.calendar,
		tint: colors.primary[600],
		title: "Aucun événement à venir",
		message: "La programmation se remplit. Revenez d'ici peu pour découvrir les prochaines dates.",
		action: "Actualiser",
	},
	search: {
		icon: icons.search,
		tint: colors.gold[600],
		title: "Aucun résultat",
		message: "Aucun événement ne correspond à cette recherche. Essayez un autre titre ou un autre lieu.",
		action: "Effacer la recherche",
	},
	error: {
		icon: icons.info,
		tint: colors.danger.DEFAULT,
		title: "Chargement impossible",
		message: "Une erreur est survenue en récupérant la programmation.",
		action: "Réessayer",
	},
	offline: {
		icon: icons.info,
		tint: colors.warning.DEFAULT,
		title: "Serveur injoignable",
		message: "Vérifiez votre connexion, puis relancez le chargement.",
		action: "Réessayer",
	},
};

interface Props {
	variant?: EmptyVariant;
	/** Remplacent le texte par défaut de la variante. */
	title?: string;
	message?: string;
	actionLabel?: string;
	onAction?: () => void;
	/** Version resserrée, pour un état vide à l'intérieur d'une section. */
	compact?: boolean;
}

const EmptyState = ({ variant = "empty", title, message, actionLabel, onAction, compact = false }: Props) => {
	const spec = VARIANTS[variant];

	return (
		<View className={`items-center px-8 ${compact ? "py-8" : "py-16"}`}>
			{/* Halo concentrique : un cercle net posé sur un cercle diffus. */}
			<View
				className={`items-center justify-center rounded-full ${compact ? "size-16" : "size-24"}`}
				style={{ backgroundColor: withAlpha(spec.tint, 0.08) }}
			>
				<View
					className={`items-center justify-center rounded-full ${compact ? "size-11" : "size-16"}`}
					style={{ backgroundColor: withAlpha(spec.tint, 0.14) }}
				>
					<Image
						source={spec.icon}
						tintColor={spec.tint}
						resizeMode="contain"
						className={compact ? "size-5" : "size-7"}
					/>
				</View>
			</View>

			<Text
				className={`font-poppins-bold text-ink-900 text-center mt-5 ${compact ? "text-base" : "text-xl"}`}
			>
				{title ?? spec.title}
			</Text>

			<Text
				className={`font-poppins text-ink-500 text-center mt-2 leading-5 ${
					compact ? "text-xs" : "text-sm"
				}`}
			>
				{message ?? spec.message}
			</Text>

			{onAction && (
				<TouchableOpacity
					onPress={onAction}
					activeOpacity={0.85}
					className="mt-6 bg-primary rounded-full px-7 py-3.5"
				>
					<Text className="font-poppins-semibold text-white text-sm">{actionLabel ?? spec.action}</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

export default EmptyState;
