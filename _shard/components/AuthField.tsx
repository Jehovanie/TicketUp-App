import { forwardRef, useRef, useState } from "react";
import {
	Pressable,
	Text,
	TextInput,
	TextInputProps,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/_shard/constants/colors";
import { useRevealField } from "@/_shard/components/AuthShell";

/**
 * Champ de formulaire des écrans de compte.
 *
 * Il porte deux responsabilités que les écrans n'ont plus à répéter :
 *  - **se rendre visible** en prenant le focus — il transmet sa position à
 *    `AuthShell`, qui fait défiler la feuille juste ce qu'il faut ;
 *  - **montrer son état** : bordure bleue au focus, rouge en erreur, message
 *    sous le champ. La validation ne s'affiche qu'après une tentative d'envoi,
 *    jamais pendant la frappe.
 *
 * `ref` cible le `TextInput` : les écrans enchaînent les champs au clavier
 * (`returnKeyType="next"` + `onSubmitEditing`).
 */

type AuthFieldProps = Omit<TextInputProps, "className" | "style"> & {
	label: string;
	/** Message d'erreur ; `null` quand le champ est valide. */
	error?: string | null;
	/** Indication permanente sous le champ (« 8 caractères minimum »). */
	hint?: string;
	/** Ajoute le bouton afficher / masquer et active `secureTextEntry`. */
	secure?: boolean;
	containerClassName?: string;
};

const AuthField = forwardRef<TextInput, AuthFieldProps>(
	(
		{ label, error, hint, secure = false, containerClassName = "", onFocus, onBlur, ...inputProps },
		ref
	) => {
		const revealField = useRevealField();
		const holder = useRef<View>(null);

		const [focused, setFocused] = useState(false);
		const [revealed, setRevealed] = useState(false);

		const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
			setFocused(true);
			revealField(holder.current);
			onFocus?.(event);
		};

		const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
			setFocused(false);
			onBlur?.(event);
		};

		const border = error ? "border-danger" : focused ? "border-primary-500" : "border-ink-200";
		const background = focused ? "bg-white" : "bg-surface";

		return (
			<View ref={holder} collapsable={false} className={containerClassName}>
				<Text className="mb-1.5 font-poppins-medium text-xs text-ink-600">{label}</Text>

				<View className="relative justify-center">
					<TextInput
						ref={ref}
						onFocus={handleFocus}
						onBlur={handleBlur}
						placeholderTextColor={colors.ink[400]}
						secureTextEntry={secure && !revealed}
						// Sans cette hauteur minimale, le champ se réduit à la taille
						// du texte sur Android et devient dur à viser au pouce.
						style={{ minHeight: 52 }}
						className={`rounded-2xl border px-4 py-3.5 font-poppins text-sm text-ink-900 ${border} ${background} ${
							secure ? "pr-14" : ""
						}`}
						{...inputProps}
					/>

					{secure && (
						<Pressable
							onPress={() => setRevealed((visible) => !visible)}
							hitSlop={10}
							accessibilityRole="button"
							accessibilityLabel={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
							className="absolute bottom-0 right-0 top-0 justify-center px-4"
						>
							<Ionicons
								name={revealed ? "eye-off-outline" : "eye-outline"}
								size={20}
								color={focused ? colors.primary[600] : colors.ink[400]}
							/>
						</Pressable>
					)}
				</View>

				{error ? (
					<Text className="ml-1 mt-1.5 font-poppins text-[11px] text-danger">{error}</Text>
				) : hint ? (
					<Text className="ml-1 mt-1.5 font-poppins text-[11px] text-ink-400">{hint}</Text>
				) : null}
			</View>
		);
	}
);

AuthField.displayName = "AuthField";

export default AuthField;
