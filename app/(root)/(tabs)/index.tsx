import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	RefreshControl,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import icons from "@/_shard/constants/icons";
import images from "@/_shard/constants/images";
import { Card, FeaturedCard, HeroCard } from "@/_shard/components/Cards";
import Filters, { ALL_CATEGORIES } from "@/_shard/components/Filters";
import EmptyState from "@/_shard/components/EmptyState";
import {
	CategoryChipsSkeleton,
	EventGridSkeleton,
	FeaturedCardSkeleton,
	HeroSkeleton,
	SectionHeaderSkeleton,
	Skeleton,
} from "@/_shard/components/Skeleton";
import { GRADIENTS, colors } from "@/_shard/constants/colors";
import { LIST_BOTTOM_GUTTER, TAB_BAR_HEIGHT } from "@/_shard/constants/layout";
import { EventContext } from "@/_core/context/EventContext";
import { CategoryContext } from "@/_core/context/CategoryContext";
import { IEventListItem } from "@/_core/model/IEvent";
import { ApiError } from "@/_config/api/client";
import {
	buildCategoryColorMap,
	compareByStartAsc,
	isBookable,
	isLive,
	isPublished,
	startsWithinDays,
} from "@/_core/selectors/events";

/**
 * Accueil.
 *
 * L'écran ne consomme pas `GET /api/events` tel quel : cet endpoint trie par
 * `createdAt` décroissant et ne filtre ni les brouillons ni les événements
 * terminés. La programmation affichée est donc reconstruite ici — publiés
 * seulement, terminés écartés, triés par date de début — via les sélecteurs de
 * `_core/selectors/events`.
 */

/** En dessous de ce seuil, on va chercher la page suivante : la liste brute
 *  mélange passé et brouillons, une page de 20 peut ne donner que 6 dates. */
const MIN_PROGRAMME = 12;

const WEEK_DAYS = 7;

/** Longueur du rail quand aucune date proche ne justifie « Cette semaine ». */
const RAIL_SIZE = 10;

function greeting(): string {
	const hour = new Date().getHours();

	if (hour < 6) return "Bonne nuit";
	if (hour < 18) return "Bonjour";

	return "Bonsoir";
}

/** Titre de section : intitulé, sous-titre et lien facultatif. */
const SectionHeader = ({
	title,
	subtitle,
	actionLabel,
	onAction,
}: {
	title: string;
	subtitle?: string;
	actionLabel?: string;
	onAction?: () => void;
}) => (
	<View className="flex-row items-end justify-between mb-4">
		<View className="flex-1 pr-3">
			<Text className="font-poppins-bold text-ink-900 text-lg">{title}</Text>
			{subtitle && <Text className="font-poppins text-ink-500 text-xs mt-0.5">{subtitle}</Text>}
		</View>

		{actionLabel && onAction && (
			<TouchableOpacity onPress={onAction} activeOpacity={0.7} className="flex-row items-center">
				<Text className="font-poppins-semibold text-primary-700 text-xs mr-1">{actionLabel}</Text>
				<Image source={icons.rightArrow} tintColor={colors.primary[700]} className="size-3.5" />
			</TouchableOpacity>
		)}
	</View>
);

/** Chiffre clé du ruban posé sous l'en-tête. */
const Stat = ({ value, label }: { value: number | string; label: string }) => (
	<View className="flex-1 items-center">
		<Text className="font-poppins-bold text-ink-900 text-lg">{value}</Text>
		<Text className="font-poppins text-ink-500 text-[10px] mt-0.5">{label}</Text>
	</View>
);

const Home = () => {
	const router = useRouter();

	/**
	 * Garde basse de la liste.
	 *
	 * La barre d'onglets est en `position: "absolute"` : le contenu défile
	 * dessous et la dernière rangée se retrouve masquée si la liste ne réserve
	 * pas la place. Une valeur en dur ne tient pas — la hauteur réelle dépend
	 * de la safe area, qui varie d'un appareil à l'autre. On prend donc la
	 * hauteur publiée par le navigateur, avec un repli sur le même calcul si le
	 * contexte venait à manquer (écran monté hors des onglets).
	 */
	const insets = useSafeAreaInsets();
	const tabBarHeight = useContext(BottomTabBarHeightContext);
	const listBottomPadding =
		(tabBarHeight ?? TAB_BAR_HEIGHT + insets.bottom) + LIST_BOTTOM_GUTTER;

	const eventContext = useContext(EventContext);
	const categoryContext = useContext(CategoryContext);

	if (!eventContext) throw new Error("Must be used inside EventProvider");
	if (!categoryContext) throw new Error("Must be used inside CategoryProvider");

	const { events, isLoading, isLoadingMore, errors, itemsTotal, hasMore, loadMore, refresh } = eventContext;
	const {
		categories,
		isLoading: isLoadingCategories,
		refresh: refreshCategories,
	} = categoryContext;

	const [search, setSearch] = useState("");
	const [category, setCategory] = useState(ALL_CATEGORIES);
	const [refreshing, setRefreshing] = useState(false);

	/* ------------------------------------------------------------ données */

	// `color` n'est pas dans `events:lists` : la couleur d'un événement se
	// retrouve par l'identifiant de sa catégorie, depuis `GET /api/categories`.
	const colorByCategory = useMemo(() => buildCategoryColorMap(categories), [categories]);
	const accentOfEvent = useCallback(
		(event: IEventListItem) => colorByCategory[event.category?.id] ?? undefined,
		[colorByCategory]
	);

	const programme = useMemo(
		() => events.filter(isPublished).filter((event) => isBookable(event)).sort(compareByStartAsc),
		[events]
	);

	const isFiltering = search.trim().length > 0 || category !== ALL_CATEGORIES;

	const filtered = useMemo(() => {
		const needle = search.trim().toLowerCase();

		return programme.filter((event) => {
			if (category !== ALL_CATEGORIES && event.category?.name !== category) return false;
			if (!needle) return true;

			return (
				event.title?.toLowerCase().includes(needle) ||
				event.location?.name?.toLowerCase().includes(needle) ||
				event.category?.name?.toLowerCase().includes(needle)
			);
		});
	}, [programme, search, category]);

	const live = useMemo(() => programme.filter((event) => isLive(event)), [programme]);
	const hero = programme[0];

	/**
	 * Rail horizontal, au titre adaptatif.
	 *
	 * Une section « Cette semaine » figée disparaît dès que la programmation
	 * est lointaine — c'est le cas du jeu de données actuel, dont la première
	 * date est à plusieurs mois. On bascule alors sur les prochaines dates
	 * plutôt que de laisser un trou dans la page.
	 */
	const rail = useMemo(() => {
		const rest = programme.filter((event) => event.id !== hero?.id);
		const week = rest.filter((event) => startsWithinDays(event, WEEK_DAYS));

		if (week.length > 0) {
			return { title: "Cette semaine", subtitle: "Les sept prochains jours", items: week };
		}

		return {
			title: "Prochaines dates",
			subtitle: "Les rendez-vous les plus proches",
			items: rest.slice(0, RAIL_SIZE),
		};
	}, [programme, hero]);

	// En navigation libre, l'affiche n'est pas répétée dans la grille ; dès
	// qu'un filtre est posé, la grille redevient l'intégralité du résultat.
	const gridData = useMemo(
		() => (isFiltering ? filtered : filtered.filter((event) => event.id !== hero?.id)),
		[filtered, isFiltering, hero]
	);

	/* ----------------------------------------------------------- chargement */

	// La pagination du back porte sur la liste brute, pas sur la programmation :
	// on continue de paginer tant qu'il reste des pages et trop peu de dates.
	useEffect(() => {
		if (isLoading || isLoadingMore || !hasMore) return;
		if (programme.length >= MIN_PROGRAMME) return;

		loadMore();
	}, [isLoading, isLoadingMore, hasMore, programme.length, loadMore]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		refresh();
		refreshCategories();
	}, [refresh, refreshCategories]);

	useEffect(() => {
		if (!isLoading) setRefreshing(false);
	}, [isLoading]);

	const openEvent = useCallback(
		(eventId: number) => router.push(`/(root)/event/${eventId}`),
		[router]
	);

	/* --------------------------------------------------------------- états */

	const failure = errors[0];
	const unreachable = failure instanceof ApiError && failure.status === 0;
	const hasFailed = errors.length > 0 && events.length === 0;

	const renderEmpty = () => {
		if (isLoading) return <EventGridSkeleton rows={2} />;

		if (hasFailed) {
			return (
				<EmptyState
					variant={unreachable ? "offline" : "error"}
					message={
						failure instanceof ApiError && !unreachable
							? failure.message
							: undefined
					}
					onAction={refresh}
				/>
			);
		}

		if (isFiltering) {
			return (
				<EmptyState
					variant="search"
					onAction={() => {
						setSearch("");
						setCategory(ALL_CATEGORIES);
					}}
				/>
			);
		}

		return <EmptyState variant="empty" onAction={refresh} />;
	};

	const renderFooter = () => {
		if (isLoadingMore) {
			return (
				<View className="py-8 items-center">
					<ActivityIndicator size="small" color={colors.primary[600]} />
					<Text className="font-poppins text-ink-400 text-xs mt-2">Chargement de la suite…</Text>
				</View>
			);
		}

		// Fin de liste : un point final explicite vaut mieux qu'un vide ambigu.
		if (!hasMore && gridData.length > 0) {
			return (
				<View className="py-8 items-center">
					<View className="h-px w-10 bg-ink-200" />
					<Text className="font-poppins text-ink-400 text-[11px] mt-3">
						Vous avez vu toute la programmation
					</Text>
				</View>
			);
		}

		// Plus de cale-pied ici : la garde basse est portée par le
		// `contentContainerStyle` de la liste, qui s'applique dans tous les états.
		return null;
	};

	/* -------------------------------------------------------------- rendu */

	return (
		<View className="flex-1 bg-surface">
			<StatusBar style="light" />

			<FlatList
				data={gridData}
				keyExtractor={(item) => String(item.id)}
				numColumns={2}
				renderItem={({ item }) => (
					<Card event={item} accent={accentOfEvent(item)} onPress={() => openEvent(item.id)} />
				)}
				columnWrapperClassName="gap-4 px-5"
				contentContainerStyle={{ paddingBottom: listBottomPadding }}
				showsVerticalScrollIndicator={false}
				onEndReached={() => hasMore && loadMore()}
				onEndReachedThreshold={0.6}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={colors.primary[600]}
						colors={[colors.primary[600]]}
					/>
				}
				ListEmptyComponent={renderEmpty()}
				ListFooterComponent={renderFooter()}
				ListHeaderComponent={
					<View>
						{/* ---------------------------------------------- en-tête */}
						<LinearGradient
							colors={GRADIENTS.night}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							className="rounded-b-[36px] pb-28"
						>
							<SafeAreaView edges={["top"]}>
								<View className="px-5 pt-2">
									<View className="flex-row items-center justify-between">
										<View className="flex-1">
											<Text className="font-poppins text-white/60 text-xs">{greeting()}</Text>
											<Text className="font-poppins-bold text-white text-[22px] leading-7 mt-0.5">
												Trouvez votre prochaine sortie
											</Text>
										</View>

										<TouchableOpacity
											activeOpacity={0.8}
											className="size-11 items-center justify-center rounded-full bg-white/10 border border-white/15 ml-3"
										>
											<Image source={icons.bell} tintColor="#FFFFFF" className="size-5" />
											{/* Pastille de notification, en or pour rester lisible sur le bleu nuit. */}
											<View
												className="absolute top-2.5 right-2.5 size-2 rounded-full border border-primary-950"
												style={{ backgroundColor: colors.gold[400] }}
											/>
										</TouchableOpacity>

										<TouchableOpacity activeOpacity={0.8} className="ml-2">
											<Image
												source={images.avatar}
												className="size-11 rounded-full border border-white/20"
											/>
										</TouchableOpacity>
									</View>

									{/* Recherche */}
									<View className="flex-row items-center rounded-2xl bg-white/10 border border-white/15 px-4 mt-5">
										<Image
											source={icons.search}
											tintColor="rgba(255,255,255,0.65)"
											className="size-4"
										/>
										<TextInput
											value={search}
											onChangeText={setSearch}
											placeholder="Un titre, un lieu, une catégorie…"
											placeholderTextColor="rgba(255,255,255,0.45)"
											returnKeyType="search"
											className="flex-1 ml-2.5 py-3.5 font-poppins text-white text-sm"
										/>
										{search.length > 0 && (
											<TouchableOpacity
												onPress={() => setSearch("")}
												hitSlop={10}
												className="size-5 items-center justify-center rounded-full bg-white/20"
											>
												<Text className="font-poppins-bold text-white text-[10px]">✕</Text>
											</TouchableOpacity>
										)}
									</View>
								</View>
							</SafeAreaView>
						</LinearGradient>

						{/* -------------------------------- ruban de chiffres clés */}
						<View
							className="-mt-20 mx-5 flex-row items-center rounded-2xl bg-surface-raised py-3.5"
							style={{
								elevation: 4,
								shadowColor: colors.primary[950],
								shadowOpacity: 0.12,
								shadowRadius: 14,
								shadowOffset: { width: 0, height: 6 },
							}}
						>
							{isLoading ? (
								<View className="flex-1 flex-row items-center justify-around px-4">
									<Skeleton className="h-8 w-16 rounded-lg" />
									<Skeleton className="h-8 w-16 rounded-lg" />
									<Skeleton className="h-8 w-16 rounded-lg" />
								</View>
							) : (
								<>
									<Stat value={programme.length} label="à l'affiche" />
									<View className="w-px h-8 bg-ink-200" />
									<Stat value={live.length} label="en cours" />
									<View className="w-px h-8 bg-ink-200" />
									<Stat value={itemsTotal} label="au total" />
								</>
							)}
						</View>

						{/* ------------------------------------------- à la une */}
						{!isFiltering && (
							<View className="px-5 mt-6">
								{isLoading ? (
									<HeroSkeleton />
								) : hero ? (
									<HeroCard
										event={hero}
										accent={accentOfEvent(hero)}
										onPress={() => openEvent(hero.id)}
									/>
								) : null}
							</View>
						)}

						{/* --------------------------------------- en ce moment */}
						{!isFiltering && !isLoading && live.length > 0 && (
							<View className="mt-8">
								<View className="px-5">
									<SectionHeader
										title="En ce moment"
										subtitle={`${live.length} ${live.length > 1 ? "événements ont" : "événement a"} déjà commencé`}
									/>
								</View>
								<FlatList
									data={live}
									horizontal
									keyExtractor={(item) => `live-${item.id}`}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
									snapToInterval={288 + 16}
									decelerationRate="fast"
									renderItem={({ item }) => (
										<FeaturedCard
											event={item}
											accent={accentOfEvent(item)}
											onPress={() => openEvent(item.id)}
										/>
									)}
								/>
							</View>
						)}

						{/* ------------------------------ cette semaine / prochaines */}
						{!isFiltering && (isLoading || rail.items.length > 0) && (
							<View className="mt-8">
								<View className="px-5">
									{isLoading ? (
										<SectionHeaderSkeleton />
									) : (
										<SectionHeader
											title={rail.title}
											subtitle={rail.subtitle}
											actionLabel="Tout voir"
											onAction={() => router.push("/(root)/(tabs)/explore")}
										/>
									)}
								</View>

								{isLoading ? (
									<View className="flex-row px-5 gap-4">
										<FeaturedCardSkeleton />
										<FeaturedCardSkeleton />
									</View>
								) : (
									<FlatList
										data={rail.items}
										horizontal
										keyExtractor={(item) => `rail-${item.id}`}
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
										snapToInterval={288 + 16}
										decelerationRate="fast"
										renderItem={({ item }) => (
											<FeaturedCard
												event={item}
												accent={accentOfEvent(item)}
												onPress={() => openEvent(item.id)}
											/>
										)}
									/>
								)}
							</View>
						)}

						{/* -------------------------------------------- catégories */}
						<View className="mt-8">
							<View className="px-5">
								<SectionHeader title="Parcourir" subtitle="Choisissez une catégorie" />
							</View>
							<View className="pl-5">
								{isLoadingCategories ? (
									<CategoryChipsSkeleton />
								) : (
									<Filters categories={categories} selected={category} onSelect={setCategory} />
								)}
							</View>
						</View>

						{/* --------------------------------- titre de la grille */}
						<View className="px-5 mt-8 mb-4">
							<SectionHeader
								title={isFiltering ? "Résultats" : "Toute la programmation"}
								subtitle={
									isLoading
										? "Chargement…"
										: `${gridData.length} ${gridData.length > 1 ? "événements" : "événement"}${
												category !== ALL_CATEGORIES ? ` · ${category}` : ""
											}`
								}
							/>
						</View>
					</View>
				}
			/>
		</View>
	);
};

export default Home;
