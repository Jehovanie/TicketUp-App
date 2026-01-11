import { View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	interpolate,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Skeleton animé de base
const SkeletonBase = ({ width, height, className = "" }: { width: number | string; height: number; className?: string }) => {
	const shimmer = useSharedValue(0);

	useEffect(() => {
		shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
	}, []);

	const animatedStyle = useAnimatedStyle(() => {
		const translateX = interpolate(shimmer.value, [0, 1], [-300, 300]);
		return {
			transform: [{ translateX }],
		};
	});

	return (
		<View style={{ width, height }} className={`bg-gray-200 rounded-2xl overflow-hidden ${className}`}>
			<Animated.View style={[{ flex: 1 }, animatedStyle]}>
				<LinearGradient
					colors={["transparent", "rgba(255,255,255,0.5)", "transparent"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={{ flex: 1, width: 300 }}
				/>
			</Animated.View>
		</View>
	);
};

// Skeleton pour FeaturedCard
export const FeaturedCardSkeleton = () => {
	return (
		<View style={{ width: width * 0.75 }} className="mr-4">
			<SkeletonBase width="100%" height={280} className="rounded-3xl" />
			<View className="absolute bottom-4 left-4 right-4">
				<SkeletonBase width="70%" height={24} className="mb-2 rounded-lg" />
				<View className="flex-row items-center justify-between">
					<SkeletonBase width="40%" height={16} className="rounded-lg" />
					<SkeletonBase width={80} height={32} className="rounded-full" />
				</View>
			</View>
		</View>
	);
};

// Skeleton pour Card normale
export const CardSkeleton = () => {
	return (
		<View className="bg-white rounded-2xl overflow-hidden shadow-sm">
			<SkeletonBase width="100%" height={140} className="rounded-t-2xl" />
			<View className="p-3">
				<SkeletonBase width="80%" height={18} className="mb-2 rounded-lg" />
				<SkeletonBase width="60%" height={14} className="mb-2 rounded-lg" />
				<View className="flex-row items-center justify-between mt-2">
					<SkeletonBase width="45%" height={14} className="rounded-lg" />
					<SkeletonBase width={60} height={24} className="rounded-full" />
				</View>
			</View>
		</View>
	);
};

// Groupe de skeletons pour FeaturedCards
export const FeaturedCardsSkeletonGroup = ({ count = 3 }: { count?: number }) => {
	return (
		<View className="flex-row">
			{Array.from({ length: count }).map((_, index) => (
				<FeaturedCardSkeleton key={index} />
			))}
		</View>
	);
};

// Groupe de skeletons pour Cards normales
export const CardsSkeletonGroup = ({ count = 6 }: { count?: number }) => {
	return (
		<View className="flex-row flex-wrap gap-4">
			{Array.from({ length: count }).map((_, index) => (
				<View key={index} style={{ width: (width - 48) / 2 }}>
					<CardSkeleton />
				</View>
			))}
		</View>
	);
};

// Skeleton pour Event Detail Page
export const EventDetailSkeleton = () => {
	return (
		<View className="flex-1 bg-white">
			{/* Header Image Skeleton */}
			<SkeletonBase width="100%" height={320} className="rounded-none" />

			{/* Content Skeleton */}
			<View className="px-5 py-6">
				{/* Title Section */}
				<View className="mb-6">
					<SkeletonBase width="80%" height={32} className="mb-3 rounded-xl" />
					<SkeletonBase width="30%" height={20} className="rounded-lg" />
				</View>

				{/* Date & Time Card */}
				<View className="bg-gray-100 rounded-2xl p-4 mb-5">
					<View className="flex-row items-center mb-3">
						<SkeletonBase width={40} height={40} className="rounded-full mr-3" />
						<View className="flex-1">
							<SkeletonBase width="30%" height={12} className="mb-2 rounded-lg" />
							<SkeletonBase width="60%" height={16} className="rounded-lg" />
						</View>
					</View>
					<View className="flex-row items-center">
						<SkeletonBase width={40} height={40} className="rounded-full mr-3" />
						<View className="flex-1">
							<SkeletonBase width="30%" height={12} className="mb-2 rounded-lg" />
							<SkeletonBase width="70%" height={16} className="rounded-lg" />
						</View>
					</View>
				</View>

				{/* Location Card */}
				<View className="bg-gray-100 rounded-2xl p-4 mb-5">
					<View className="flex-row items-center">
						<SkeletonBase width={40} height={40} className="rounded-full mr-3" />
						<View className="flex-1">
							<SkeletonBase width="30%" height={12} className="mb-2 rounded-lg" />
							<SkeletonBase width="80%" height={16} className="rounded-lg" />
						</View>
					</View>
				</View>

				{/* Organizer Card */}
				<View className="bg-gray-100 rounded-2xl p-4 mb-5">
					<SkeletonBase width="40%" height={20} className="mb-3 rounded-lg" />
					<View className="flex-row items-center mb-2">
						<SkeletonBase width={40} height={40} className="rounded-full mr-3" />
						<SkeletonBase width="60%" height={16} className="rounded-lg" />
					</View>
					<View className="ml-11">
						<SkeletonBase width="70%" height={14} className="mb-2 rounded-lg" />
						<SkeletonBase width="50%" height={14} className="rounded-lg" />
					</View>
				</View>

				{/* Description */}
				<View className="mb-5">
					<SkeletonBase width="50%" height={24} className="mb-3 rounded-xl" />
					<SkeletonBase width="100%" height={16} className="mb-2 rounded-lg" />
					<SkeletonBase width="95%" height={16} className="mb-2 rounded-lg" />
					<SkeletonBase width="90%" height={16} className="mb-2 rounded-lg" />
					<SkeletonBase width="70%" height={16} className="rounded-lg" />
				</View>

				{/* Tickets Section */}
				<View className="mb-6">
					<SkeletonBase width="60%" height={24} className="mb-4 rounded-xl" />
					
					{/* Ticket Cards */}
					{[1, 2, 3].map((_, index) => (
						<View key={index} className="bg-gray-100 rounded-3xl p-5 mb-4">
							<View className="flex-row items-start justify-between mb-4">
								<View className="flex-1">
									<SkeletonBase width="40%" height={20} className="mb-3 rounded-full" />
									<SkeletonBase width="70%" height={24} className="mb-2 rounded-lg" />
									<SkeletonBase width="50%" height={16} className="rounded-lg" />
								</View>
								<SkeletonBase width={56} height={56} className="rounded-full" />
							</View>
							<View className="bg-gray-200 rounded-2xl p-4">
								<SkeletonBase width="60%" height={32} className="rounded-lg" />
							</View>
						</View>
					))}
				</View>
			</View>
		</View>
	);
};
