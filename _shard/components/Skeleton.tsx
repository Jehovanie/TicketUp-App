import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Squelettes de chargement.
 *
 * Ils reprennent la géométrie exacte des composants qu'ils remplacent — même
 * hauteur, même rayon, même gouttière. C'est ce qui évite le saut de mise en
 * page au moment où les données arrivent, et ce qui distingue un squelette
 * d'un simple rectangle gris.
 *
 * L'animation passe par l'`Animated` de React Native (et non Reanimated) :
 * une translation sur le pilote natif, sans dépendance de configuration.
 */

const SWEEP: readonly [string, string, string] = [
	"rgba(255,255,255,0)",
	"rgba(255,255,255,0.65)",
	"rgba(255,255,255,0)",
];

interface SkeletonProps {
	className?: string;
	style?: ViewStyle;
}

/** Bloc élémentaire : un aplat creux parcouru par un reflet. */
export const Skeleton = ({ className = "", style }: SkeletonProps) => {
	const [width, setWidth] = useState(0);
	const progress = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (width === 0) return;

		progress.setValue(0);
		const animation = Animated.loop(
			Animated.timing(progress, {
				toValue: 1,
				duration: 1300,
				easing: Easing.inOut(Easing.ease),
				useNativeDriver: true,
			})
		);

		animation.start();
		return () => animation.stop();
	}, [progress, width]);

	const translateX = progress.interpolate({
		inputRange: [0, 1],
		outputRange: [-width, width],
	});

	return (
		<View
			onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
			className={`bg-surface-sunken overflow-hidden ${className}`}
			style={style}
		>
			{width > 0 && (
				<Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }] }]}>
					<LinearGradient colors={SWEEP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
				</Animated.View>
			)}
		</View>
	);
};

/** Squelette de l'affiche « à la une ». */
export const HeroSkeleton = () => <Skeleton className="h-60 w-full rounded-[28px]" />;

/** Squelette d'une `FeaturedCard` (liste horizontale). */
export const FeaturedCardSkeleton = () => (
	<View className="w-72 h-72 rounded-3xl bg-surface-raised overflow-hidden">
		<Skeleton className="h-40 w-full" />
		<View className="p-4">
			<Skeleton className="h-3 w-20 rounded-full" />
			<Skeleton className="h-4 w-48 rounded-full mt-3" />
			<Skeleton className="h-3 w-32 rounded-full mt-2" />
			<Skeleton className="h-5 w-24 rounded-full mt-4" />
		</View>
	</View>
);

/** Squelette d'une `Card` de la grille à deux colonnes. */
export const EventCardSkeleton = () => (
	<View className="flex-1 rounded-3xl bg-surface-raised overflow-hidden">
		<Skeleton className="h-32 w-full" />
		<View className="p-3">
			<Skeleton className="h-3 w-16 rounded-full" />
			<Skeleton className="h-3.5 w-full rounded-full mt-2.5" />
			<Skeleton className="h-3 w-2/3 rounded-full mt-2" />
			<Skeleton className="h-4 w-20 rounded-full mt-3" />
		</View>
	</View>
);

/** Squelette des puces de catégorie. */
export const CategoryChipsSkeleton = () => (
	<View className="flex-row gap-2.5">
		{[72, 96, 84, 110, 68].map((width, index) => (
			<Skeleton key={index} className="h-10 rounded-full" style={{ width }} />
		))}
	</View>
);

/** Deux rangées de la grille, affichées pendant le premier chargement. */
export const EventGridSkeleton = ({ rows = 2 }: { rows?: number }) => (
	<View className="px-5">
		{Array.from({ length: rows }).map((_, row) => (
			<View key={row} className="flex-row gap-4 mb-4">
				<EventCardSkeleton />
				<EventCardSkeleton />
			</View>
		))}
	</View>
);

/** Titre de section en attente. */
export const SectionHeaderSkeleton = () => (
	<View className="mb-4">
		<Skeleton className="h-5 w-40 rounded-full" />
		<Skeleton className="h-3 w-28 rounded-full mt-2" />
	</View>
);
