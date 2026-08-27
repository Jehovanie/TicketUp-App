import { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Href, Link, useLocalSearchParams, useRouter } from "expo-router";

import AuthShell, { AuthAlert, AuthSubmit } from "@/_shard/components/AuthShell";
import AuthField from "@/_shard/components/AuthField";
import { useSession } from "@/_core/context/SessionContext";

/**
 * Connexion.
 *
 * Atteignable uniquement par une action qui engage un compte (réserver,
 * ouvrir son profil) : l'écran reçoit alors le chemin d'origine dans
 * `redirect` et y ramène l'utilisateur une fois connecté. Sans ce paramètre —
 * arrivée directe — on retombe sur l'accueil.
 *
 * La mise en page (clavier, défilement, feuille) est entièrement portée par
 * `AuthShell` : voir ce fichier avant de toucher à l'agencement.
 */
const SignIn = () => {
	const router = useRouter();
	const { redirect } = useLocalSearchParams<{ redirect?: string }>();
	const { signIn, isSubmitting, error, clearError } = useSession();

	const passwordRef = useRef<TextInput>(null);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	/** La validation ne s'affiche qu'après une tentative, pas à la saisie. */
	const [submitted, setSubmitted] = useState(false);

	const emailError = submitted && email.trim().length === 0 ? "E-mail requis" : null;
	const passwordError = submitted && password.length === 0 ? "Mot de passe requis" : null;

	const handleSignIn = async () => {
		setSubmitted(true);

		if (email.trim().length === 0) return;
		if (password.length === 0) {
			passwordRef.current?.focus();
			return;
		}

		const ok = await signIn(email.trim(), password);
		if (!ok) return;

		// `replace` et non `push` : la connexion ne doit pas rester dans la pile,
		// un retour arrière ramènerait sur le formulaire déjà validé.
		//
		// Le cast est inévitable : `redirect` est une chaîne construite à
		// l'exécution, que `typedRoutes` ne peut pas vérifier statiquement.
		router.replace((redirect as Href | undefined) ?? "/(root)/(tabs)");
	};

	const onChange = (setter: (value: string) => void) => (value: string) => {
		if (error) clearError();
		setter(value);
	};

	const footer = (
		<View className="pt-8">
			{/* Sortie de secours : la consultation reste publique. */}
			<TouchableOpacity
				onPress={() => router.replace("/(root)/(tabs)")}
				activeOpacity={0.7}
				className="items-center"
			>
				<Text className="font-poppins-medium text-xs text-ink-500">Continuer sans compte</Text>
			</TouchableOpacity>

			<View className="mt-5 flex-row items-center justify-center">
				<Text className="font-poppins text-sm text-ink-500">Pas encore de compte ? </Text>
				<Link href="/(root)/(auth)/signup" className="font-poppins-bold text-sm text-primary">
					S’inscrire
				</Link>
			</View>
		</View>
	);

	return (
		<AuthShell
			title="Bon retour"
			subtitle="Connectez-vous pour réserver vos billets."
			footer={footer}
		>
			{/* Échec de connexion renvoyé par l'API (401 Lexik compris). */}
			{error && <AuthAlert message={error} />}

			<AuthField
				label="E-mail"
				containerClassName="mt-5"
				value={email}
				onChangeText={onChange(setEmail)}
				error={emailError}
				placeholder="vous@exemple.com"
				keyboardType="email-address"
				autoCapitalize="none"
				autoCorrect={false}
				autoComplete="email"
				textContentType="emailAddress"
				editable={!isSubmitting}
				returnKeyType="next"
				submitBehavior="submit"
				onSubmitEditing={() => passwordRef.current?.focus()}
			/>

			<AuthField
				ref={passwordRef}
				label="Mot de passe"
				containerClassName="mt-4"
				value={password}
				onChangeText={onChange(setPassword)}
				error={passwordError}
				placeholder="••••••••"
				secure
				autoCapitalize="none"
				autoComplete="current-password"
				textContentType="password"
				editable={!isSubmitting}
				returnKeyType="go"
				onSubmitEditing={handleSignIn}
			/>

			<AuthSubmit label="Se connecter" onPress={handleSignIn} busy={isSubmitting} />
		</AuthShell>
	);
};

export default SignIn;
