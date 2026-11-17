import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import icons from "@/_shard/constants/icons";
import { IEventListItem } from "@/_core/model/IEvent";
import { LOCALE, formatPrice, isFree } from "@/_shard/constants/format";
import { accentOf, colors, coverGradient, withAlpha } from "@/_shard/constants/colors";
import { eventPhase, minPriceTicket } from "@/_core/selectors/events";
import FreeBadge from "@/_shard/components/FreeBadge";

/**
 * Cartes événement.
 *
 * `Event::$imageUrl` ne porte aucun groupe de sérialisation côté API : aucune
 * pochette n'arrive jamais du serveur. Plutôt que d'afficher trois photos
 * codées en dur pour soixante événements, l'identité visuelle est dérivée de la
 * **couleur de la catégorie** (`Category::$color`, une vraie donnée) — dégradé,
 * anneaux, initiale. Le jour où le back exposera les images, seul `EventCover`
 * sera à reprendre.
 */

interface Props {
	/** Forme `events:lists` : ni `description`, ni `organizer`, ni image. */
	event: IEventListItem;
	onPress?: () => void;
	/**
	 * Couleur de la catégorie. À fournir par l'écran : `color` n'appartient pas
	 * au groupe `events:lists`, elle vient de `GET /api/categories`.
	 */
	accent?: string;
}

/* ------------------------------------------------------------------ dates */

function dateParts(value: string) {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return { day: "--", month: "", time: "", full: "Date à confirmer" };
	}

	return {
		day: String(date.getDate()).padStart(2, "0"),
		month: date.toLocaleDateString(LOCALE, { month: "short" }).replace(".", "").toUpperCase(),
		time: date.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" }),
		full: date.toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "long" }),
	};
}

/* ---------------------------------------------------------------- éléments */

/** Point pulsant des événements en cours. */
const LiveDot = () => {
	const pulse = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, {
					toValue: 1,
					duration: 700,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(pulse, {
					toValue: 0,
					duration: 700,
					easing: Easing.in(Easing.ease),
					useNativeDriver: true,
				}),
			])
		);

		animation.start();
		return () => animation.stop();
	}, [pulse]);

	return (
		<Animated.View
			className="size-1.5 rounded-full bg-white mr-1.5"
			style={{ opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }}
		/>
	);
};

/**
 * Pochette générée : dégradé de la catégorie, anneaux décoratifs hors-champ et
 * initiale du titre en filigrane. Aucune ressource externe.
 */
const EventCover = ({
	event,
	accent,
	className = "",
	initialSize = "text-[110px]",
}: {
	event: IEventListItem;
	accent: string;
	className?: string;
	initialSize?: string;
}) => {
	const initial = (event.title ?? "?").trim().charAt(0).toUpperCase();

	return (
		<View className={`overflow-hidden ${className}`}>
			<LinearGradient
				colors={coverGradient(accent)}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			{/* Anneaux débordants : de la profondeur, sans image. */}
			<View
				className="absolute -right-14 -top-16 size-44 rounded-full border"
				style={{ borderColor: "rgba(255,255,255,0.16)" }}
			/>
			<View
				className="absolute -right-6 -top-24 size-44 rounded-full border"
				style={{ borderColor: "rgba(255,255,255,0.10)" }}
			/>

			<Text
				className={`absolute -bottom-6 -left-1 font-poppins-extrabold ${initialSize}`}
				style={{ color: "rgba(255,255,255,0.13)" }}
			>
				{initial}
			</Text>
		</View>
	);
};

/** Pastille de catégorie, teintée de sa propre couleur. */
const CategoryPill = ({ name, accent, onDark }: { name?: string; accent: string; onDark: boolean }) => {
	if (!name) return null;

	return (
		<View
			className="self-start rounded-full px-2.5 py-1"
			style={{ backgroundColor: onDark ? "rgba(255,255,255,0.22)" : withAlpha(accent, 0.12) }}
		>
			<Text
				className="font-poppins-semibold text-[10px] uppercase"
				style={{ color: onDark ? "#FFFFFF" : accent }}
				numberOfLines={1}
			>
				{name}
			</Text>
		</View>
	);
};

/**
 * Prix affiché. Trois états distincts, et non deux : aucune billetterie,
 * billetterie gratuite, billetterie payante.
 */
const Price = ({
	event,
	onDark,
	size = "md",
}: {
	event: IEventListItem;
	onDark: boolean;
	size?: "sm" | "md" | "lg";
}) => {
	const ticket = minPriceTicket(event);

	if (!ticket) {
		return (
			<Text
				className={`font-poppins-medium ${size === "sm" ? "text-[10px]" : "text-xs"} ${
					onDark ? "text-white/60" : "text-ink-400"
				}`}
			>
				Tarifs à venir
			</Text>
		);
	}

	if (isFree(ticket.prix)) {
		return <FreeBadge variant={onDark ? "light" : "outline"} size={size === "lg" ? "md" : "sm"} />;
	}

	const amount = { sm: "text-xs", md: "text-sm", lg: "text-xl" }[size];

	return (
		<View className="flex-row items-baseline">
			<Text
				className={`font-poppins ${size === "lg" ? "text-xs" : "text-[10px]"} mr-1 ${
					onDark ? "text-white/60" : "text-ink-400"
				}`}
			>
				dès
			</Text>
			<Text
				className={`font-poppins-bold ${amount}`}
				style={{ color: onDark ? colors.gold[300] : colors.primary[700] }}
			>
				{formatPrice(ticket.prix)}
			</Text>
		</View>
	);
};

/* ------------------------------------------------------------------ cartes */

/**
 * Affiche « à la une » — pleine largeur, dégradé plein cadre.
 * Réservée à l'événement mis en avant sur l'accueil.
 */
export const HeroCard = ({ event, onPress, accent: accentProp }: Props) => {
	const accent = accentOf(accentProp);
	const { day, month, full } = dateParts(event.startedAt);
	const live = eventPhase(event) === "live";

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.92}
			className="h-60 w-full rounded-[28px] overflow-hidden"
		>
			<EventCover
				event={event}
				accent={accent}
				className="absolute top-0 left-0 right-0 bottom-0"
				initialSize="text-[190px]"
			/>
			<LinearGradient
				colors={["rgba(13,17,27,0)", "rgba(13,17,27,0.55)", "rgba(13,17,27,0.93)"]}
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			{/* Bandeau : mise en avant à gauche, date à droite. */}
			<View className="flex-row items-start justify-between p-5">
				<View
					className="flex-row items-center rounded-full px-3 py-1.5"
					style={{ backgroundColor: colors.gold[500] }}
				>
					{live && <LiveDot />}
					<Text className="font-poppins-bold text-[10px] uppercase text-ink-950">
						{live ? "En ce moment" : "À la une"}
					</Text>
				</View>

				<View className="items-center rounded-2xl bg-white/95 px-3 py-2">
					<Text className="font-poppins-bold text-xl text-primary-900 leading-6">{day}</Text>
					<Text className="font-poppins-semibold text-[10px] text-ink-500">{month}</Text>
				</View>
			</View>

			<View className="absolute bottom-0 left-0 right-0 p-5">
				<CategoryPill name={event.category?.name} accent={accent} onDark />

				<Text className="font-poppins-bold text-white text-2xl leading-8 mt-2" numberOfLines={2}>
					{event.title}
				</Text>

				<View className="flex-row items-center mt-2">
					<Image source={icons.location} tintColor="rgba(255,255,255,0.7)" className="size-3.5 mr-1.5" />
					<Text className="font-poppins text-white/70 text-xs flex-1" numberOfLines={1}>
						{event.location?.name} · {full}
					</Text>
				</View>

				<View className="flex-row items-center justify-between mt-4">
					<Price event={event} onDark size="lg" />
					<View className="rounded-full bg-white px-5 py-2.5">
						<Text className="font-poppins-bold text-primary-900 text-xs">Réserver</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

/** Carte des listes horizontales — pochette teintée, puis contenu sur blanc. */
export const FeaturedCard = ({ event, onPress, accent: accentProp }: Props) => {
	const accent = accentOf(accentProp);
	const { day, month, time } = dateParts(event.startedAt);
	const live = eventPhase(event) === "live";

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.9}
			className="w-72 h-72 mb-2 rounded-3xl bg-surface-raised overflow-hidden"
			style={{
				elevation: 3,
				shadowColor: colors.primary[950],
				shadowOpacity: 0.1,
				shadowRadius: 12,
				shadowOffset: { width: 0, height: 6 },
			}}
		>
			<EventCover event={event} accent={accent} className="h-40 w-full" />

			<View className="absolute top-3 left-3 items-center rounded-xl bg-white/95 px-2.5 py-1.5">
				<Text className="font-poppins-bold text-base text-primary-900 leading-5">{day}</Text>
				<Text className="font-poppins-semibold text-[9px] text-ink-500">{month}</Text>
			</View>

			{live && (
				<View
					className="absolute top-3 right-3 flex-row items-center rounded-full px-2.5 py-1"
					style={{ backgroundColor: colors.danger.DEFAULT }}
				>
					<LiveDot />
					<Text className="font-poppins-bold text-[9px] uppercase text-white">En cours</Text>
				</View>
			)}

			<View className="flex-1 p-4">
				<CategoryPill name={event.category?.name} accent={accent} onDark={false} />

				<Text className="font-poppins-bold text-ink-900 text-base leading-5 mt-2" numberOfLines={2}>
					{event.title}
				</Text>

				<View className="flex-row items-center mt-1.5">
					<Image source={icons.location} tintColor={colors.ink[400]} className="size-3 mr-1" />
					<Text className="font-poppins text-ink-500 text-[11px] flex-1" numberOfLines={1}>
						{event.location?.name}
					</Text>
				</View>

				<View className="flex-row items-center justify-between mt-auto">
					<Price event={event} onDark={false} />
					<View className="flex-row items-center">
						<Image source={icons.calendar} tintColor={colors.ink[400]} className="size-3 mr-1" />
						<Text className="font-poppins-medium text-ink-500 text-[11px]">{time}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

/** Carte de la grille à deux colonnes. */
export const Card = ({ event, onPress, accent: accentProp }: Props) => {
	const accent = accentOf(accentProp);
	const { day, month, time } = dateParts(event.startedAt);
	const live = eventPhase(event) === "live";

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.9}
			className="flex-1 rounded-3xl bg-surface-raised overflow-hidden mb-4"
			style={{
				elevation: 2,
				shadowColor: colors.primary[950],
				shadowOpacity: 0.08,
				shadowRadius: 10,
				shadowOffset: { width: 0, height: 4 },
			}}
		>
			<EventCover event={event} accent={accent} className="h-32 w-full" initialSize="text-[86px]" />

			<View className="absolute top-2.5 left-2.5 items-center rounded-lg bg-white/95 px-2 py-1">
				<Text className="font-poppins-bold text-sm text-primary-900 leading-4">{day}</Text>
				<Text className="font-poppins-semibold text-[8px] text-ink-500">{month}</Text>
			</View>

			{live && (
				<View
					className="absolute top-2.5 right-2.5 size-2.5 rounded-full border-2 border-white"
					style={{ backgroundColor: colors.danger.DEFAULT }}
				/>
			)}

			<View className="p-3">
				<CategoryPill name={event.category?.name} accent={accent} onDark={false} />

				<Text className="font-poppins-semibold text-ink-900 text-[13px] leading-4 mt-2" numberOfLines={2}>
					{event.title}
				</Text>

				<View className="flex-row items-center mt-1.5">
					<Image source={icons.location} tintColor={colors.ink[400]} className="size-2.5 mr-1" />
					<Text className="font-poppins text-ink-500 text-[10px] flex-1" numberOfLines={1}>
						{event.location?.name}
					</Text>
				</View>

				<View className="flex-row items-center justify-between mt-2.5">
					<Price event={event} onDark={false} size="sm" />
					<Text className="font-poppins-medium text-ink-400 text-[10px]">{time}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

/** Ligne compacte, pour la vue liste d'`explore`. */
export const CompactCard = ({ event, onPress, accent: accentProp }: Props) => {
	const accent = accentOf(accentProp);
	const { day, month, time } = dateParts(event.startedAt);

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.9}
			className="flex-row rounded-2xl bg-surface-raised overflow-hidden p-3 mb-3"
			style={{
				elevation: 2,
				shadowColor: colors.primary[950],
				shadowOpacity: 0.07,
				shadowRadius: 8,
				shadowOffset: { width: 0, height: 3 },
			}}
		>
			<View
				className="w-16 items-center justify-center rounded-xl py-2"
				style={{ backgroundColor: withAlpha(accent, 0.1) }}
			>
				<Text className="font-poppins-bold text-xl" style={{ color: accent }}>
					{day}
				</Text>
				<Text className="font-poppins-semibold text-[9px] text-ink-500">{month}</Text>
				<Text className="font-poppins text-[9px] text-ink-400 mt-0.5">{time}</Text>
			</View>

			<View className="flex-1 ml-3 justify-center">
				<CategoryPill name={event.category?.name} accent={accent} onDark={false} />

				<Text className="font-poppins-semibold text-ink-900 text-sm mt-1.5" numberOfLines={1}>
					{event.title}
				</Text>

				<View className="flex-row items-center justify-between mt-1.5">
					<View className="flex-row items-center flex-1 mr-2">
						<Image source={icons.location} tintColor={colors.ink[400]} className="size-3 mr-1" />
						<Text className="font-poppins text-ink-500 text-[11px] flex-1" numberOfLines={1}>
							{event.location?.name}
						</Text>
					</View>
					<Price event={event} onDark={false} size="sm" />
				</View>
			</View>
		</TouchableOpacity>
	);
};
