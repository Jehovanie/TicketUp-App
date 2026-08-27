import { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link, useRouter } from "expo-router";

import AuthShell, { AuthAlert, AuthSubmit } from "@/_shard/components/AuthShell";
import AuthField from "@/_shard/components/AuthField";

/**
 * Création de compte.
 *
 * Six champs, c'est long au téléphone : ils sont regroupés en deux blocs
 * (identité, accès) et enchaînés au clavier — chaque « Suivant » amène le
 * champ suivant, que `AuthShell` fait remonter au-dessus du clavier. Le
 * formulaire ne se valide qu'à l'envoi, puis à chaque frappe une fois la
 * première tentative faite : corriger une erreur la fait disparaître tout de
 * suite, sans réappuyer sur le bouton.
 *
 * ⚠️ **L'envoi n'est pas encore branché.** `_config/api/auth.ts` ne connaît
 * que `login` / `getMe` : l'API n'expose pas (encore) de création de compte.
 * La saisie est validée localement, puis l'écran le dit franchement plutôt que
 * de simuler un succès. Point d'accroche : `handleSignUp`.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

type Fields = {
	firstname: string;
	lastname: string;
	email: string;
	phone: string;
	password: string;
	confirmation: string;
};

const EMPTY: Fields = {
	firstname: "",
	lastname: "",
	email: "",
	phone: "",
	password: "",
	confirmation: "",
};

/** Erreurs affichables, champ par champ. `null` = champ valide. */
function validate(fields: Fields): Partial<Record<keyof Fields, string>> {
	const errors: Partial<Record<keyof Fields, string>> = {};

	if (fields.firstname.trim().length === 0) errors.firstname = "Prénom requis";
	if (fields.lastname.trim().length === 0) errors.lastname = "Nom requis";

	if (fields.email.trim().length === 0) errors.email = "E-mail requis";
	else if (!EMAIL_PATTERN.test(fields.email.trim())) errors.email = "Adresse e-mail invalide";

	// Les numéros malgaches s'écrivent aussi bien « 034 12 345 67 » que
	// « +261 34 12 345 67 » : on ne compte que les chiffres.
	const digits = fields.phone.replace(/\D/g, "");
	if (digits.length === 0) errors.phone = "Téléphone requis";
	else if (digits.length < 9) errors.phone = "Numéro incomplet";

	if (fields.password.length === 0) errors.password = "Mot de passe requis";
	else if (fields.password.length < PASSWORD_MIN_LENGTH)
		errors.password = `${PASSWORD_MIN_LENGTH} caractères minimum`;

	if (fields.confirmation.length === 0) errors.confirmation = "Confirmation requise";
	else if (fields.confirmation !== fields.password)
		errors.confirmation = "Les mots de passe ne correspondent pas";

	return errors;
}

const SignUp = () => {
	const router = useRouter();

	const lastnameRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const phoneRef = useRef<TextInput>(null);
	const passwordRef = useRef<TextInput>(null);
	const confirmationRef = useRef<TextInput>(null);

	const [fields, setFields] = useState<Fields>(EMPTY);
	/** Les messages n'apparaissent qu'après une première tentative d'envoi. */
	const [submitted, setSubmitted] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);

	const errors = validate(fields);
	const errorOf = (field: keyof Fields) => (submitted ? errors[field] ?? null : null);

	const set = (field: keyof Fields) => (value: string) => {
		if (notice) setNotice(null);
		setFields((current) => ({ ...current, [field]: value }));
	};

	const handleSignUp = () => {
		setSubmitted(true);

		const pending = validate(fields);
		const firstInvalid = (
			["firstname", "lastname", "email", "phone", "password", "confirmation"] as const
		).find((field) => pending[field]);

		if (firstInvalid) {
			// Amener l'utilisateur au premier champ fautif : sur un formulaire
			// long, un message hors écran passe inaperçu.
			const refs = {
				firstname: null,
				lastname: lastnameRef,
				email: emailRef,
				phone: phoneRef,
				password: passwordRef,
				confirmation: confirmationRef,
			} as const;

			refs[firstInvalid]?.current?.focus();
			return;
		}

		// TODO: brancher la création de compte dès que l'API l'expose, puis
		// enchaîner sur `signIn` pour connecter l'utilisateur sans ressaisie.
		setNotice("La création de compte n’est pas encore disponible. Réessayez bientôt.");
	};

	const footer = (
		<View className="pt-8">
			<TouchableOpacity
				onPress={() => router.replace("/(root)/(tabs)")}
				activeOpacity={0.7}
				className="items-center"
			>
				<Text className="font-poppins-medium text-xs text-ink-500">Continuer sans compte</Text>
			</TouchableOpacity>

			<View className="mt-5 flex-row items-center justify-center">
				<Text className="font-poppins text-sm text-ink-500">Vous avez déjà un compte ? </Text>
				<Link href="/(root)/(auth)/signin" className="font-poppins-bold text-sm text-primary">
					Se connecter
				</Link>
			</View>
		</View>
	);

	return (
		<AuthShell
			title="Créer un compte"
			subtitle="Quelques instants, et vos billets vous suivent."
			footer={footer}
		>
			{notice && <AuthAlert message={notice} />}

			<Text className="mb-3 mt-6 font-poppins-semibold text-[11px] uppercase tracking-widest text-ink-400">
				Votre identité
			</Text>

			<View className="flex-row gap-3">
				<AuthField
					label="Prénom"
					containerClassName="flex-1"
					value={fields.firstname}
					onChangeText={set("firstname")}
					error={errorOf("firstname")}
					placeholder="Hery"
					autoCapitalize="words"
					autoComplete="given-name"
					textContentType="givenName"
					returnKeyType="next"
					submitBehavior="submit"
					onSubmitEditing={() => lastnameRef.current?.focus()}
				/>

				<AuthField
					ref={lastnameRef}
					label="Nom"
					containerClassName="flex-1"
					value={fields.lastname}
					onChangeText={set("lastname")}
					error={errorOf("lastname")}
					placeholder="Rakoto"
					autoCapitalize="words"
					autoComplete="family-name"
					textContentType="familyName"
					returnKeyType="next"
					submitBehavior="submit"
					onSubmitEditing={() => emailRef.current?.focus()}
				/>
			</View>

			<AuthField
				ref={emailRef}
				label="E-mail"
				containerClassName="mt-4"
				value={fields.email}
				onChangeText={set("email")}
				error={errorOf("email")}
				placeholder="vous@exemple.com"
				keyboardType="email-address"
				autoCapitalize="none"
				autoCorrect={false}
				autoComplete="email"
				textContentType="emailAddress"
				returnKeyType="next"
				submitBehavior="submit"
				onSubmitEditing={() => phoneRef.current?.focus()}
			/>

			<AuthField
				ref={phoneRef}
				label="Téléphone"
				containerClassName="mt-4"
				value={fields.phone}
				onChangeText={set("phone")}
				error={errorOf("phone")}
				hint="Sert à retrouver vos billets."
				placeholder="034 00 000 00"
				keyboardType="phone-pad"
				autoComplete="tel"
				textContentType="telephoneNumber"
				returnKeyType="next"
				submitBehavior="submit"
				onSubmitEditing={() => passwordRef.current?.focus()}
			/>

			<Text className="mb-3 mt-7 font-poppins-semibold text-[11px] uppercase tracking-widest text-ink-400">
				Vos accès
			</Text>

			<AuthField
				ref={passwordRef}
				label="Mot de passe"
				value={fields.password}
				onChangeText={set("password")}
				error={errorOf("password")}
				hint={`${PASSWORD_MIN_LENGTH} caractères minimum`}
				placeholder="••••••••"
				secure
				autoCapitalize="none"
				autoComplete="new-password"
				textContentType="newPassword"
				returnKeyType="next"
				submitBehavior="submit"
				onSubmitEditing={() => confirmationRef.current?.focus()}
			/>

			<AuthField
				ref={confirmationRef}
				label="Confirmer le mot de passe"
				containerClassName="mt-4"
				value={fields.confirmation}
				onChangeText={set("confirmation")}
				error={errorOf("confirmation")}
				placeholder="••••••••"
				secure
				autoCapitalize="none"
				autoComplete="new-password"
				textContentType="newPassword"
				returnKeyType="go"
				onSubmitEditing={handleSignUp}
			/>

			<AuthSubmit label="Créer mon compte" onPress={handleSignUp} />
		</AuthShell>
	);
};

export default SignUp;
