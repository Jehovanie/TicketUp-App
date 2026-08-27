import { Fragment, useEffect, useRef, useState } from "react";
import {
	Image,
	Keyboard,
	LayoutChangeEvent,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AuthField from "@/_shard/components/AuthField";
import icons from "@/_shard/constants/icons";
import { GRADIENTS, colors } from "@/_shard/constants/colors";
import {
	PAYMENT_FAMILIES,
	PAYMENT_PROVIDERS,
	PaymentProvider,
	maskAccount,
	providerOf,
	validateAccount,
} from "@/_shard/constants/payments";
import { IPaymentMethod, PaymentProviderId } from "@/_core/model/IPaymentMethod";
import { useKeyboardInset } from "@/_core/hooks/useKeyboardInset";

/**
 * Moyens de paiement de l'utilisateur.
 *
 * ⚠️ **Écran de présentation : rien n'est enregistré.** L'API n'expose ni
 * entité ni endpoint de moyen de paiement ; l'état vit dans le `useState`
 * ci-dessous et disparaît en quittant l'écran. C'est volontaire — la maquette
 * est manipulable (on ajoute, on retire, on change le moyen par défaut) sans
 * faire croire à une persistance qui n'existe pas. Le jour venu, seul
 * `methods` change de source.
 *
 * Parti pris d'interface : un opérateur = une carte, dépliée sur place plutôt
 * qu'un écran séparé. L'utilisateur n'en configure qu'un ou deux, et rester
 * sur la même page lui montre en permanence ce qui est déjà en place.
 */

/**
 * Pastille de marque, portant le logo officiel de l'opérateur.
 *
 * Fond blanc et liseré discret : les fichiers vont du PNG transparent (PayPal)
 * à l'aplat de couleur bord à bord (MVola, Airtel). Il faut donc une base
 * neutre commune, et un contour pour que les logos clairs gardent une forme
 * sur la carte, elle-même blanche. Le cadrage propre à chaque fichier vient de
 * `logoFit` / `logoPadding` (voir `_shard/constants/payments.ts`).
 */
const ProviderLogo = ({ provider, size = 48 }: { provider: PaymentProvider; size?: number }) => (
	<View
		className="overflow-hidden border border-ink-100 bg-white"
		style={{
			width: size,
			height: size,
			borderRadius: size / 3,
			padding: provider.logoPadding,
		}}
	>
		<Image
			source={provider.logo}
			resizeMode={provider.logoFit}
			style={{ width: "100%", height: "100%" }}
			accessibilityLabel={provider.name}
		/>
	</View>
);

const DefaultBadge = () => (
	<View className="flex-row items-center rounded-full bg-gold-100 px-2.5 py-1">
		<Ionicons name="star" size={10} color={colors.gold[600]} />
		<Text className="ml-1 font-poppins-semibold text-[10px] text-gold-700">Par défaut</Text>
	</View>
);

type ProviderCardProps = {
	provider: PaymentProvider;
	method?: IPaymentMethod;
	expanded: boolean;
	onToggle: () => void;
	onSave: (account: string, makeDefault: boolean) => void;
	onRemove: () => void;
	onLayout: (event: LayoutChangeEvent) => void;
};

const ProviderCard = ({
	provider,
	method,
	expanded,
	onToggle,
	onSave,
	onRemove,
	onLayout,
}: ProviderCardProps) => {
	const [account, setAccount] = useState(method?.account ?? "");
	const [makeDefault, setMakeDefault] = useState(method?.isDefault ?? false);
	const [error, setError] = useState<string | null>(null);

	// Rouvrir une carte repart de ce qui est enregistré : une saisie
	// abandonnée ne doit pas ressurgir plus tard.
	useEffect(() => {
		if (!expanded) return;

		setAccount(method?.account ?? "");
		setMakeDefault(method?.isDefault ?? false);
		setError(null);
	}, [expanded, method]);

	const handleSave = () => {
		const message = validateAccount(provider, account);
		if (message) {
			setError(message);
			return;
		}

		onSave(account.trim(), makeDefault);
	};

	return (
		<View
			onLayout={onLayout}
			className={`mx-5 mb-3 overflow-hidden rounded-2xl border bg-surface-raised ${
				expanded ? "border-primary-200" : "border-ink-100"
			}`}
			style={{
				shadowColor: colors.primary[950],
				shadowOpacity: 0.06,
				shadowRadius: 10,
				shadowOffset: { width: 0, height: 4 },
				elevation: 2,
			}}
		>
			<Pressable onPress={onToggle} className="flex-row items-center px-4 py-4">
				<ProviderLogo provider={provider} />

				<View className="ml-4 flex-1">
					<View className="flex-row items-center">
						<Text className="font-poppins-semibold text-base text-ink-900">{provider.name}</Text>
						{method?.isDefault && <View className="ml-2"><DefaultBadge /></View>}
					</View>

					<Text
						className={`mt-0.5 font-poppins text-xs ${method ? "text-ink-500" : "text-ink-400"}`}
					>
						{method ? maskAccount(provider, method.account) : "Non configuré"}
					</Text>
				</View>

				{method ? (
					<Ionicons
						name={expanded ? "chevron-up" : "chevron-forward"}
						size={18}
						color={colors.ink[400]}
					/>
				) : (
					<View className="rounded-full bg-primary-50 px-3 py-1.5">
						<Text className="font-poppins-semibold text-[11px] text-primary">
							{expanded ? "Fermer" : "Configurer"}
						</Text>
					</View>
				)}
			</Pressable>

			{expanded && (
				<View className="border-t border-ink-100 px-4 pb-4 pt-4">
					<AuthField
						label={provider.accountLabel}
						value={account}
						onChangeText={(value) => {
							if (error) setError(null);
							setAccount(value);
						}}
						error={error}
						hint={provider.hint}
						placeholder={provider.placeholder}
						keyboardType={provider.accountKind === "email" ? "email-address" : "phone-pad"}
						autoCapitalize="none"
						autoCorrect={false}
						maxLength={provider.accountKind === "email" ? 180 : 20}
						returnKeyType="done"
						onSubmitEditing={handleSave}
					/>

					<Pressable
						onPress={() => setMakeDefault((value) => !value)}
						className="mt-4 flex-row items-center"
						hitSlop={6}
					>
						<Ionicons
							name={makeDefault ? "checkmark-circle" : "ellipse-outline"}
							size={20}
							color={makeDefault ? colors.primary[600] : colors.ink[300]}
						/>
						<Text className="ml-2 font-poppins text-xs text-ink-600">
							Proposer ce moyen en premier à la réservation
						</Text>
					</Pressable>

					<View className="mt-5 flex-row items-center gap-3">
						<TouchableOpacity
							onPress={handleSave}
							activeOpacity={0.85}
							className="flex-1 items-center justify-center rounded-xl bg-primary py-3.5"
						>
							<Text className="font-poppins-semibold text-sm text-white">
								{method ? "Mettre à jour" : "Enregistrer"}
							</Text>
						</TouchableOpacity>

						{method && (
							<TouchableOpacity
								onPress={onRemove}
								activeOpacity={0.7}
								className="items-center justify-center rounded-xl border border-danger/30 bg-danger-100 px-4 py-3.5"
							>
								<Text className="font-poppins-semibold text-sm text-danger">Retirer</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			)}
		</View>
	);
};

const PaymentMethods = () => {
	const router = useRouter();
	const safeArea = useSafeAreaInsets();
	const keyboardInset = useKeyboardInset();

	const scrollRef = useRef<ScrollView>(null);
	/**
	 * Position de chaque carte dans le contenu. Toutes les sections sont des
	 * frères directs du conteneur de défilement — d'où les marges portées par
	 * chaque bloc plutôt qu'un `View` englobant : `onLayout` donne alors
	 * directement une ordonnée exploitable par `scrollTo`.
	 */
	const cardOffsets = useRef<Partial<Record<PaymentProviderId, number>>>({});

	const [methods, setMethods] = useState<IPaymentMethod[]>([]);
	const [expanded, setExpanded] = useState<PaymentProviderId | null>(null);

	const methodOf = (id: PaymentProviderId) => methods.find((method) => method.provider === id);
	const defaultMethod = methods.find((method) => method.isDefault);

	const toggle = (id: PaymentProviderId) => {
		const next = expanded === id ? null : id;
		setExpanded(next);

		if (!next) {
			Keyboard.dismiss();
			return;
		}

		// Amener la carte dépliée en haut de l'écran : son champ reste ainsi
		// au-dessus du clavier, quelle que soit sa place dans la liste.
		const offset = cardOffsets.current[next];
		if (offset !== undefined) {
			requestAnimationFrame(() =>
				scrollRef.current?.scrollTo({ y: Math.max(0, offset - 16), animated: true })
			);
		}
	};

	const save = (provider: PaymentProviderId, account: string, makeDefault: boolean) => {
		setMethods((current) => {
			const others = current.filter((method) => method.provider !== provider);
			// Le premier moyen enregistré devient le moyen par défaut : sans ça,
			// l'utilisateur aurait un moyen configuré et rien de proposé à l'achat.
			const isDefault = makeDefault || others.length === 0;

			return [
				...(isDefault ? others.map((method) => ({ ...method, isDefault: false })) : others),
				{ provider, account, isDefault },
			];
		});

		setExpanded(null);
		Keyboard.dismiss();
	};

	const remove = (provider: PaymentProviderId) => {
		setMethods((current) => {
			const rest = current.filter((method) => method.provider !== provider);
			const removedWasDefault = current.find((method) => method.provider === provider)?.isDefault;

			// Ne jamais laisser la liste sans moyen par défaut.
			if (removedWasDefault && rest.length > 0) {
				return rest.map((method, index) => ({ ...method, isDefault: index === 0 }));
			}

			return rest;
		});

		setExpanded(null);
	};

	return (
		<View className="flex-1 bg-surface">
			<StatusBar style="light" />

			<ScrollView
				ref={scrollRef}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					paddingBottom: 32 + (keyboardInset > 0 ? keyboardInset : safeArea.bottom),
				}}
			>
				<LinearGradient
					colors={GRADIENTS.night}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{ paddingTop: safeArea.top + 8 }}
					className="rounded-b-[32px] px-5 pb-20"
				>
					<TouchableOpacity
						onPress={() => (router.canGoBack() ? router.back() : router.replace("/(root)/(tabs)"))}
						activeOpacity={0.7}
						hitSlop={12}
						className="size-10 items-center justify-center rounded-full bg-white/10"
					>
						<Image source={icons.backArrow} tintColor="#FFFFFF" className="size-4" />
					</TouchableOpacity>

					<Text className="mt-4 font-poppins-bold text-2xl text-white">Moyens de paiement</Text>
					<Text className="mt-1 font-poppins text-sm text-white/70">
						Enregistrez un compte pour régler vos billets en un geste.
					</Text>
				</LinearGradient>

				{/* Carte de synthèse, à cheval sur le dégradé. */}
				<View
					className="mx-5 -mt-12 rounded-2xl bg-surface-raised p-5"
					style={{
						shadowColor: colors.primary[950],
						shadowOpacity: 0.12,
						shadowRadius: 16,
						shadowOffset: { width: 0, height: 6 },
						elevation: 6,
					}}
				>
					{defaultMethod ? (
						<View className="flex-row items-center">
							<ProviderLogo provider={providerOf(defaultMethod.provider)} size={52} />
							<View className="ml-4 flex-1">
								<Text className="font-poppins-medium text-[11px] uppercase tracking-widest text-ink-400">
									Moyen par défaut
								</Text>
								<Text className="mt-1 font-poppins-semibold text-base text-ink-900">
									{providerOf(defaultMethod.provider).name}
								</Text>
								<Text className="font-poppins text-xs text-ink-500">
									{maskAccount(providerOf(defaultMethod.provider), defaultMethod.account)}
								</Text>
							</View>
						</View>
					) : (
						<View className="flex-row items-start">
							<View className="rounded-2xl bg-primary-50 p-3">
								<Image source={icons.wallet} tintColor={colors.primary[700]} className="size-5" />
							</View>
							<View className="ml-4 flex-1">
								<Text className="font-poppins-semibold text-base text-ink-900">
									Aucun moyen enregistré
								</Text>
								<Text className="mt-1 font-poppins text-xs leading-4 text-ink-500">
									Choisissez un opérateur ci-dessous : il vous sera proposé d’office au moment de
									payer.
								</Text>
							</View>
						</View>
					)}
				</View>

				{PAYMENT_FAMILIES.map((family) => (
					// `Fragment` et non `View` : les cartes restent des enfants directs
					// du conteneur de défilement, condition pour que leur `onLayout`
					// donne une ordonnée directement utilisable par `scrollTo`.
					<Fragment key={family.id}>
						<View className="mx-5 mb-3 mt-7">
							<Text className="font-poppins-bold text-base text-ink-900">{family.title}</Text>
							<Text className="mt-0.5 font-poppins text-xs text-ink-500">{family.caption}</Text>
						</View>

						{PAYMENT_PROVIDERS.filter((provider) => provider.family === family.id).map(
							(provider) => (
								<ProviderCard
									key={provider.id}
									provider={provider}
									method={methodOf(provider.id)}
									expanded={expanded === provider.id}
									onToggle={() => toggle(provider.id)}
									onSave={(account, makeDefault) => save(provider.id, account, makeDefault)}
									onRemove={() => remove(provider.id)}
									onLayout={(event) => {
										cardOffsets.current[provider.id] = event.nativeEvent.layout.y;
									}}
								/>
							)
						)}
					</Fragment>
				))}

				<View className="mx-5 mt-4 flex-row items-start rounded-2xl bg-primary-50 px-4 py-3.5">
					<Image source={icons.shield} tintColor={colors.primary[700]} className="mr-3 mt-0.5 size-4" />
					<Text className="flex-1 font-poppins text-[11px] leading-4 text-primary-800">
						Nous n’enregistrons qu’un identifiant de compte — jamais de code secret ni de numéro de
						carte. Chaque paiement reste à confirmer chez votre opérateur.
					</Text>
				</View>
			</ScrollView>
		</View>
	);
};

export default PaymentMethods;
