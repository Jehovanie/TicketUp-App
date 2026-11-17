import { useState } from "react";
import { Text, ScrollView, TouchableOpacity, View } from "react-native";

import { ICategory } from "@/_core/model/ICategory";
import { colors, readableOn, withAlpha } from "@/_shard/constants/colors";

/** Libellé de la puce « toutes catégories » (ce n'est pas une catégorie de l'API). */
export const ALL_CATEGORIES = "Toutes";

interface Props {
	categories: Partial<ICategory>[];
	/**
	 * Rend le composant contrôlé. Sans ces deux props il gère sa sélection en
	 * interne, ce qui préserve les écrans qui l'utilisaient déjà ainsi.
	 */
	selected?: string;
	onSelect?: (name: string) => void;
}

/**
 * Puces de catégorie.
 *
 * Chaque catégorie porte sa propre couleur en base (`Category::$color`,
 * exposée par `GET /api/categories`) : la puce sélectionnée s'habille de cette
 * couleur plutôt que d'un bleu uniforme, et le texte bascule en clair ou en
 * sombre selon la luminance du fond — sans quoi « Humour » (`#f59e0b`) serait
 * illisible en blanc.
 */
const Filters = ({ categories, selected, onSelect }: Props) => {
	const [internal, setInternal] = useState(ALL_CATEGORIES);
	const active = selected ?? internal;

	const handlePress = (name: string) => {
		// Re-cliquer la puce active revient à « Toutes » : jamais d'état sans
		// sélection, l'utilisateur ne peut pas se retrouver avec une liste vide
		// sans comprendre pourquoi.
		const next = active === name ? ALL_CATEGORIES : name;

		if (onSelect) onSelect(next);
		else setInternal(next);
	};

	const items = [{ id: 0, name: ALL_CATEGORIES, color: colors.primary[900] }, ...categories];

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ paddingRight: 20, gap: 10 }}
		>
			{items.map((item) => {
				const name = item.name ?? "";
				const tint = item.color || colors.primary[600];
				const isActive = active === name;

				return (
					<TouchableOpacity
						key={`${item.id}-${name}`}
						onPress={() => handlePress(name)}
						activeOpacity={0.85}
						className="flex-row items-center rounded-full px-4 py-2.5 border"
						style={{
							backgroundColor: isActive ? tint : colors.surface.raised,
							borderColor: isActive ? tint : colors.ink[200],
						}}
					>
						{/* Pastille de couleur : l'identité de la catégorie reste lisible
						    même quand la puce n'est pas sélectionnée. */}
						<View
							className="size-2 rounded-full mr-2"
							style={{ backgroundColor: isActive ? withAlpha(readableOn(tint), 0.85) : tint }}
						/>
						<Text
							className={`text-[13px] ${isActive ? "font-poppins-semibold" : "font-poppins-medium"}`}
							style={{ color: isActive ? readableOn(tint) : colors.ink[700] }}
						>
							{name}
						</Text>
					</TouchableOpacity>
				);
			})}
		</ScrollView>
	);
};

export default Filters;
