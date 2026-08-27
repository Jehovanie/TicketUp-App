import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, Link, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import AuthLogo from "@/_shard/components/AuthLogo";
import icons from "@/_shard/constants/icons";
import { GRADIENTS, colors } from "@/_shard/constants/colors";
import { useSession } from "@/_core/context/SessionContext";

/**
 * Connexion.
 *
 * Atteignable uniquement par une action qui engage un compte (réserver,
 * ouvrir son profil) : l'écran reçoit alors le chemin d'origine dans
 * `redirect` et y ramène l'utilisateur une fois connecté. Sans ce paramètre —
 * arrivée directe — on retombe sur l'accueil.
 */
const SignIn = () => {
	const router = useRouter();
	const { redirect } = useLocalSearchParams<{ redirect?: string }>();
	const { signIn, isSubmitting, error, clearError } = useSession();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	/** La validation ne s'affiche qu'après une tentative, pas à la saisie. */
	const [submitted, setSubmitted] = useState(false);

	const emailMissing = submitted && email.trim().length === 0;
	const passwordMissing = submitted && password.length === 0;

	const handleSignIn = async () => {
		setSubmitted(true);
		if (email.trim().length === 0 || password.length === 0) return;

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

	return (
		<View className="flex-1 bg-primary-950">
			<StatusBar style="light" />

			<LinearGradient
				colors={GRADIENTS.night}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1"
			>
				<SafeAreaView edges={["top"]} className="flex-1">
					<ScrollView
						contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View className="items-center pt-6">
							<AuthLogo />
						</View>

						<View className="bg-surface-raised rounded-t-[36px] px-7 pt-8 pb-10">
							<Text className="font-poppins-bold text-2xl text-ink-900">Bon retour</Text>
							<Text className="font-poppins text-sm text-ink-500 mt-1">
								Connectez-vous pour réserver vos billets.
							</Text>

							{/* Échec de connexion renvoyé par l'API (401 Lexik compris). */}
							{error && (
								<View className="flex-row items-start rounded-2xl bg-danger-100 px-4 py-3 mt-5">
									<Image
										source={icons.info}
										tintColor={colors.danger.DEFAULT}
										className="size-4 mr-2.5 mt-0.5"
									/>
									<Text className="flex-1 font-poppins text-xs text-danger leading-4">{error}</Text>
								</View>
							)}

							<View className="mt-5">
								<Text className="font-poppins-medium text-xs text-ink-600 mb-1.5">E-mail</Text>
								<TextInput
									value={email}
									onChangeText={onChange(setEmail)}
									placeholder="vous@exemple.com"
									placeholderTextColor={colors.ink[400]}
									keyboardType="email-address"
									autoCapitalize="none"
									autoComplete="email"
									editable={!isSubmitting}
									className={`rounded-2xl border bg-surface px-4 py-3.5 font-poppins text-sm text-ink-900 ${
										emailMissing ? "border-danger" : "border-ink-200"
									}`}
								/>
								{emailMissing && (
									<Text className="font-poppins text-[11px] text-danger mt-1.5 ml-1">
										E-mail requis
									</Text>
								)}
							</View>

							<View className="mt-4">
								<Text className="font-poppins-medium text-xs text-ink-600 mb-1.5">Mot de passe</Text>
								<TextInput
									value={password}
									onChangeText={onChange(setPassword)}
									placeholder="••••••••"
									placeholderTextColor={colors.ink[400]}
									secureTextEntry
									autoCapitalize="none"
									editable={!isSubmitting}
									className={`rounded-2xl border bg-surface px-4 py-3.5 font-poppins text-sm text-ink-900 ${
										passwordMissing ? "border-danger" : "border-ink-200"
									}`}
								/>
								{passwordMissing && (
									<Text className="font-poppins text-[11px] text-danger mt-1.5 ml-1">
										Mot de passe requis
									</Text>
								)}
							</View>

							<TouchableOpacity
								onPress={handleSignIn}
								disabled={isSubmitting}
								activeOpacity={0.85}
								className={`rounded-2xl bg-primary py-4 mt-7 items-center justify-center ${
									isSubmitting ? "opacity-60" : ""
								}`}
							>
								{isSubmitting ? (
									<ActivityIndicator size="small" color="#FFFFFF" />
								) : (
									<Text className="font-poppins-bold text-white text-base">Se connecter</Text>
								)}
							</TouchableOpacity>

							{/* Sortie de secours : la consultation reste publique. */}
							<TouchableOpacity
								onPress={() => router.replace("/(root)/(tabs)")}
								activeOpacity={0.7}
								className="items-center mt-4"
							>
								<Text className="font-poppins-medium text-xs text-ink-500">
									Continuer sans compte
								</Text>
							</TouchableOpacity>

							<View className="flex-row items-center justify-center mt-6">
								<Text className="font-poppins text-sm text-ink-500">Pas encore de compte ? </Text>
								<Link href="/(root)/(auth)/signup" className="font-poppins-bold text-sm text-primary">
									S’inscrire
								</Link>
							</View>
						</View>
					</ScrollView>
				</SafeAreaView>
			</KeyboardAvoidingView>
		</View>
	);
};

export default SignIn;
