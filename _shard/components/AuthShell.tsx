import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";
import {
	ActivityIndicator,
	Animated,
	Image,
	LayoutChangeEvent,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import images from "@/_shard/constants/images";
import icons from "@/_shard/constants/icons";
import { GRADIENTS, colors } from "@/_shard/constants/colors";
import { useKeyboardInset } from "@/_core/hooks/useKeyboardInset";

/**
 * Gabarit commun des écrans de compte (connexion, inscription).
 *
 * Trois problèmes de saisie au téléphone y sont réglés une fois pour toutes :
 *
 *  1. **Le clavier masquait le formulaire.** Le décalage est appliqué par la
 *     feuille blanche elle-même (`useKeyboardInset`), qui vient donc se poser
 *     exactement sur le clavier au lieu de passer dessous.
 *  2. **Le champ actif pouvait rester hors écran** sur un formulaire long :
 *     `AuthField` signale sa position au montage du focus, la feuille défile
 *     juste ce qu'il faut (voir `RevealContext`).
 *  3. **Le logo mangeait la moitié de l'écran.** Il se réduit dès que le
 *     clavier apparaît, et reprend sa taille à la fermeture.
 *
 * L'identité reste celle de la marque : fond bleu nuit dégradé, feuille claire
 * remontée en grand rayon, filet doré — l'or ponctue, il ne remplit jamais.
 */

/** Repère de défilement demandé par un champ qui prend le focus. */
type RevealField = (node: View | null) => void;

const RevealContext = createContext<RevealField>(() => {});

/** Utilisé par `AuthField` ; inutile de l'appeler à la main. */
export function useRevealField(): RevealField {
	return useContext(RevealContext);
}

/** Marge conservée entre le champ visé et le bord de la zone visible. */
const REVEAL_GUTTER = 24;

const LOGO_HEIGHT_RESTING = 150;
const LOGO_HEIGHT_TYPING = 56;

type AuthShellProps = {
	/** Titre de la feuille — « Bon retour », « Créer un compte ». */
	title: string;
	subtitle: string;
	children: ReactNode;
	/**
	 * Liens secondaires, poussés en bas de la feuille tant qu'il reste de la
	 * place. Dès que le clavier réduit la zone visible, l'espaceur se referme
	 * et le pied reprend sa place dans le flux.
	 */
	footer?: ReactNode;
};

const AuthShell = ({ title, subtitle, children, footer }: AuthShellProps) => {
	const router = useRouter();
	const safeArea = useSafeAreaInsets();
	const keyboardInset = useKeyboardInset();

	const scrollRef = useRef<ScrollView>(null);
	const contentRef = useRef<View>(null);
	/** Champ ayant le focus : on le repositionne à chaque variation du clavier. */
	const focusedRef = useRef<View | null>(null);
	const offsetRef = useRef(0);
	const viewportRef = useRef(0);
	const insetRef = useRef(0);

	const collapse = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		insetRef.current = keyboardInset;

		Animated.timing(collapse, {
			toValue: keyboardInset > 0 ? 1 : 0,
			duration: 220,
			// La hauteur n'est pas animable par le driver natif.
			useNativeDriver: false,
		}).start();
	}, [keyboardInset, collapse]);

	const scrollFieldIntoView = useCallback((node: View | null) => {
		const content = contentRef.current;
		if (!node || !content) return;

		node.measureLayout(
			content,
			(_x, y, _width, height) => {
				const visible = viewportRef.current - insetRef.current;
				if (visible <= 0) return;

				const current = offsetRef.current;
				let target = current;

				// Champ sous le clavier : on remonte juste assez pour le dégager.
				if (y + height + REVEAL_GUTTER > current + visible) {
					target = y + height + REVEAL_GUTTER - visible;
				}
				// Champ au-dessus de la zone visible : on redescend sur son étiquette.
				if (y - REVEAL_GUTTER < target) {
					target = y - REVEAL_GUTTER;
				}

				target = Math.max(0, target);
				if (Math.abs(target - current) < 1) return;

				scrollRef.current?.scrollTo({ y: target, animated: true });
			},
			() => {}
		);
	}, []);

	const reveal = useCallback<RevealField>(
		(node) => {
			focusedRef.current = node;
			// Le focus précède l'ouverture du clavier : la mesure faite tout de
			// suite serait juste, mais la zone visible pas encore réduite.
			requestAnimationFrame(() => scrollFieldIntoView(node));
		},
		[scrollFieldIntoView]
	);

	// Le clavier vient de s'ouvrir (ou de changer de taille) : le champ actif
	// n'est peut-être plus visible, on le ramène.
	useEffect(() => {
		if (keyboardInset === 0 || !focusedRef.current) return;

		const timer = setTimeout(() => scrollFieldIntoView(focusedRef.current), 60);

		return () => clearTimeout(timer);
	}, [keyboardInset, scrollFieldIntoView]);

	const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		offsetRef.current = event.nativeEvent.contentOffset.y;
	};

	const onScrollViewLayout = (event: LayoutChangeEvent) => {
		viewportRef.current = event.nativeEvent.layout.height;
	};

	const logoHeight = collapse.interpolate({
		inputRange: [0, 1],
		outputRange: [LOGO_HEIGHT_RESTING, LOGO_HEIGHT_TYPING],
	});

	return (
		<View className="flex-1 bg-primary-950">
			<StatusBar style="light" />

			<LinearGradient
				colors={GRADIENTS.night}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			<SafeAreaView edges={["top"]} className="flex-1">
				{/* Retour : l'écran est atteint depuis une action (réserver, profil). */}
				<TouchableOpacity
					onPress={() => (router.canGoBack() ? router.back() : router.replace("/(root)/(tabs)"))}
					activeOpacity={0.7}
					hitSlop={12}
					className="ml-5 mt-1 size-10 items-center justify-center rounded-full bg-white/10"
				>
					<Image source={icons.backArrow} tintColor="#FFFFFF" className="size-4" />
				</TouchableOpacity>

				<ScrollView
					ref={scrollRef}
					onScroll={onScroll}
					onLayout={onScrollViewLayout}
					scrollEventThrottle={16}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
					showsVerticalScrollIndicator={false}
				>
					{/* Repère de mesure : les positions de champs sont relatives à ce nœud. */}
					<View ref={contentRef} collapsable={false} style={{ flexGrow: 1 }}>
						<Animated.View
							style={{ height: logoHeight, alignItems: "center", justifyContent: "center" }}
						>
							{/* Le logo est bleu nuit sur fond transparent : posé tel quel
							    sur le dégradé de la marque, il disparaît. On l'inverse en
							    blanc — la coche, qui est une découpe, laisse alors passer
							    le bleu du fond. */}
							<Animated.Image
								source={images.logoTransparent}
								resizeMode="contain"
								style={{ height: logoHeight, width: "100%", tintColor: "#FFFFFF" }}
							/>
						</Animated.View>

						<View
							className="rounded-t-[36px] bg-surface-raised px-7 pt-6"
							style={{
								// La feuille descend jusqu'au bas de l'écran : sans ça elle
								// se réduit à la hauteur de ses champs et flotte en bas,
								// laissant un grand vide sous le logo.
								flexGrow: 1,
								paddingBottom: 28 + (keyboardInset > 0 ? keyboardInset : safeArea.bottom),
								shadowColor: colors.primary[950],
								shadowOpacity: 0.25,
								shadowRadius: 24,
								shadowOffset: { width: 0, height: -8 },
								elevation: 12,
							}}
						>
							{/* Filet doré : la seule touche d'or de l'écran. */}
							<View className="mb-6 h-1 w-10 self-center rounded-full bg-gold-300" />

							<Text className="font-poppins-bold text-2xl text-ink-900">{title}</Text>
							<Text className="mt-1 font-poppins text-sm text-ink-500">{subtitle}</Text>

							<RevealContext.Provider value={reveal}>
								{children}

								{footer && (
									<>
										<View className="flex-1" />
										{footer}
									</>
								)}
							</RevealContext.Provider>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
};

/** Message d'échec renvoyé par l'API, posé au-dessus des champs. */
export const AuthAlert = ({ message }: { message: string }) => (
	<View className="mt-5 flex-row items-start rounded-2xl bg-danger-100 px-4 py-3">
		<Image
			source={icons.info}
			tintColor={colors.danger.DEFAULT}
			className="mr-2.5 mt-0.5 size-4"
		/>
		<Text className="flex-1 font-poppins text-xs leading-4 text-danger">{message}</Text>
	</View>
);

/** Action principale de l'écran : pleine largeur, pouce en bas de feuille. */
export const AuthSubmit = ({
	label,
	onPress,
	busy = false,
}: {
	label: string;
	onPress: () => void;
	busy?: boolean;
}) => (
	<TouchableOpacity
		onPress={onPress}
		disabled={busy}
		activeOpacity={0.85}
		className={`mt-7 items-center justify-center rounded-2xl bg-primary py-4 ${busy ? "opacity-60" : ""}`}
	>
		{busy ? (
			<ActivityIndicator size="small" color="#FFFFFF" />
		) : (
			<Text className="font-poppins-bold text-base text-white">{label}</Text>
		)}
	</TouchableOpacity>
);

export default AuthShell;
