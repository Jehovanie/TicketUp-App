import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import icons from "@/_shard/constants/icons";
import images from "@/_shard/constants/images";
import { LOCALE, CURRENCY_SYMBOL, formatPrice, isFree } from "@/_shard/constants/format";
import FreeBadge from "@/_shard/components/FreeBadge";
import { IEvent } from "@/_core/model/IEvent";
import { getEventById } from "@/_config/api/events";

const EventDetails = () => {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const [event, setEvent] = useState<IEvent | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

	useEffect(() => {
		const fetchEventDetails = async () => {
			try {
				setLoading(true);
				setError(null);
				setEvent(await getEventById(String(id)));
			} catch (err: any) {
				setError(err?.message ?? "Impossible de charger cet événement");
				console.error("[EventDetails] GET /api/events/:id", err);
			} finally {
				setLoading(false);
			}
		};


		if (id) {
			fetchEventDetails();
		}
	}, [id]);

	// Select the first available ticket by default
	useEffect(() => {
		if (event && event.ticket_type && event.ticket_type.length > 0 && selectedTicket === null) {
			setSelectedTicket(event.ticket_type[0].id);
		}
	}, [event]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const options: Intl.DateTimeFormatOptions = {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		};
		return date.toLocaleDateString(LOCALE, options);
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
	};

	const handleBookTicket = () => {
		if (selectedTicket !== null) {
			// Navigate to booking page
			console.log("Booking ticket:", selectedTicket);
		}
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-white items-center justify-center">
				<ActivityIndicator size="large" color="#0061ff" />
			</SafeAreaView>
		);
	}

	if (!event) {
		return (
			<SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
				<Text className="font-poppins-semibold text-lg text-gray-600 text-center">
					{error ?? "Événement introuvable"}
				</Text>
			</SafeAreaView>
		);
	}

	// `ticket_type` peut être un tableau vide : Math.min(...[]) vaudrait Infinity.
	// Aucun billet défini n'est pas la même chose qu'un billet à 0 (gratuit).
	const prices = event.ticket_type.map((t) => t.prix);
	const hasTickets = prices.length > 0;
	const selectedTicketPrice = event.ticket_type.find((t) => t.id === selectedTicket)?.prix ?? 0;
	const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
	const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header Image */}
				<View className="relative h-80 w-full">
					<Image source={event.imageUrl && event.imageUrl.length > 0 ? { uri: event.imageUrl[0] } : images.maitreGims} className="w-full h-full" resizeMode="cover" />

					{/* Gradient Overlay */}
					<View className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

					{/* Back Button */}
					<TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4 bg-white/90 rounded-full p-3 shadow-lg">
						<Image source={icons.backArrow} className="w-6 h-6" tintColor="#000" />
					</TouchableOpacity>

					{/* Share Button */}
					<TouchableOpacity className="absolute top-4 right-4 bg-white/90 rounded-full p-3 shadow-lg">
						<Image source={icons.heart} className="w-6 h-6" tintColor="#ff6b6b" />
					</TouchableOpacity>

					{/* Category Badge */}
					<View className="absolute bottom-4 left-4 flex-row items-center">
						<View style={{ backgroundColor: event.category.color || "#0061ff" }} className="px-4 py-2 rounded-full">
							<Text className="font-poppins-semibold text-white text-sm">{event.category.name}</Text>
						</View>
					</View>
				</View>

				{/* Content */}
				<View className="px-5 py-6">
					{/* Title & Status */}
					<View className="flex-row justify-between items-start mb-4">
						<View className="flex-1 pr-4">
							<Text className="font-poppins-bold text-2xl text-black-300 mb-2">{event.title}</Text>
							<View className="flex-row items-center">
								<View className={`w-2 h-2 rounded-full mr-2 ${event.status ? "bg-green-500" : "bg-red-500"}`} />
								<Text className={`font-poppins-medium text-sm ${event.status ? "text-green-600" : "text-red-600"}`}>{event.status ? "Disponible" : "Complet"}</Text>
							</View>
						</View>
					</View>

					{/* Date & Time Card */}
					<View className="bg-primary-100/10 rounded-2xl p-4 mb-5">
						<View className="flex-row items-center mb-3">
							<View className="bg-primary-100 rounded-full p-2 mr-3">
								<Image source={icons.calendar} className="w-5 h-5" tintColor="#0061ff" />
							</View>
							<View className="flex-1">
								<Text className="font-poppins-medium text-xs text-gray-500 mb-1">Date de l’événement</Text>
								<Text className="font-poppins-semibold text-base text-black-300">{formatDate(event.startedAt)}</Text>
							</View>
						</View>
						<View className="flex-row items-center">
							<View className="bg-primary-100 rounded-full p-2 mr-3">
							<Image source={icons.calendar} className="w-5 h-5" tintColor="#0061ff" />
							</View>
							<View className="flex-1">
								<Text className="font-poppins-medium text-xs text-gray-500 mb-1">Horaires</Text>
								<Text className="font-poppins-semibold text-base text-black-300">
									{formatTime(event.startedAt)} - {formatTime(event.endAt)}
								</Text>
							</View>
						</View>
					</View>

					{/* Location Card */}
					<View className="bg-purple-50 rounded-2xl p-4 mb-5">
						<View className="flex-row items-center">
							<View className="bg-purple-100 rounded-full p-2 mr-3">
								<Image source={icons.location} className="w-5 h-5" tintColor="#8b5cf6" />
							</View>
							<View className="flex-1">
								<Text className="font-poppins-medium text-xs text-gray-500 mb-1">Lieu</Text>
								<Text className="font-poppins-semibold text-base text-black-300">{event.location.name || "À définir"}</Text>
								{event.location.size && <Text className="font-poppins-regular text-sm text-gray-600 mt-1">Capacité : {event.location.size} personnes</Text>}
							</View>
						</View>
					</View>

					{/* Organizer Card — relation nullable côté API */}
					{event.organizer && (
						<View className="bg-orange-50 rounded-2xl p-4 mb-5">
							<Text className="font-poppins-semibold text-base text-black-300 mb-3">Organisateur</Text>
							<View className="flex-row items-center mb-2">
								<View className="bg-orange-100 rounded-full p-2 mr-3">
									<Image source={icons.person} className="w-5 h-5" tintColor="#f97316" />
								</View>
								<Text className="font-poppins-medium text-base text-black-300 flex-1">{event.organizer.name}</Text>
							</View>
							{event.organizer.email && (
								<View className="flex-row items-center mb-2 ml-11">
									<Text className="font-poppins-regular text-sm text-gray-600">{event.organizer.email}</Text>
								</View>
							)}
							{event.organizer.phone && (
								<View className="flex-row items-center mb-2 ml-11">
									<Text className="font-poppins-regular text-sm text-gray-600">{event.organizer.phone}</Text>
								</View>
							)}
							{event.organizer.website && (
								<View className="flex-row items-center ml-11">
									<Text className="font-poppins-regular text-sm text-primary-100">{event.organizer.website}</Text>
								</View>
							)}
						</View>
					)}

					{/* Description */}
					<View className="mb-5">
						<Text className="font-poppins-semibold text-lg text-black-300 mb-3">À propos de l’événement</Text>
						<Text className="font-poppins-regular text-sm text-gray-600 leading-6">{event.description}</Text>
					</View>

					{/* Tickets Section - Ultra Modern Design */}
					<View className="mb-24">
						{/* Header Section */}
						<View className="mb-6">
							<View className="flex-row items-center justify-between mb-3">
								<View className="flex-row items-center">
									<View className="bg-purple-100 p-2.5 rounded-xl mr-3">
										<Image source={icons.wallet} className="size-6" tintColor="#5C27C0" />
									</View>
									<View>
										<Text className="font-poppins-bold text-xl text-gray-800">Billets disponibles</Text>
										<Text className="font-poppins text-xs text-gray-500">Choisissez votre billet</Text>
									</View>
								</View>
							</View>
							<View className="flex-row items-center justify-between bg-purple-50 px-4 py-3 rounded-2xl">
								<Text className="font-poppins-semibold text-sm text-gray-600">Fourchette de prix</Text>
								{!hasTickets ? (
									<Text className="font-poppins-semibold text-sm text-gray-400">Non défini</Text>
								) : isFree(maxPrice) ? (
									<FreeBadge variant="solid" size="md" />
								) : (
									<Text className="font-poppins-bold text-lg text-primary-300">
										{minPrice === maxPrice ? formatPrice(minPrice) : `${minPrice.toLocaleString(LOCALE)} - ${formatPrice(maxPrice)}`}
									</Text>
								)}
							</View>
						</View>

						{/* Tickets List */}
						{event.ticket_type.map((ticket, index) => {
							const isSelected = selectedTicket === ticket.id;
							const gradientColors = [
								{ from: "#5C27C0", to: "#7C3AED", bg: "#EDE9FE", badge: "#A78BFA" },
								{ from: "#0061FF", to: "#3B82F6", bg: "#DBEAFE", badge: "#60A5FA" },
								{ from: "#F59E0B", to: "#FBBF24", bg: "#FEF3C7", badge: "#FCD34D" },
								{ from: "#10B981", to: "#34D399", bg: "#DCFCE7", badge: "#6EE7B7" },
							];
							const colors = gradientColors[index % gradientColors.length];

							return (
								<TouchableOpacity
									key={ticket.id}
									onPress={() => setSelectedTicket(ticket.id)}
									activeOpacity={0.7}
									className="mb-4"
								>
									{isSelected ? (
										<LinearGradient
											colors={[colors.from, colors.to]}
											start={{ x: 0, y: 0 }}
											end={{ x: 1, y: 1 }}
											className="rounded-3xl p-5"
											style={{ elevation: 8 }}
										>
											{/* Selected Ticket */}
											<View className="flex-row items-start justify-between mb-4">
												<View className="flex-1 pr-3">
													<View className="flex-row items-center mb-3">
														<View className="bg-white/30 backdrop-blur px-3 py-1.5 rounded-full mr-2">
															<Text className="font-poppins-bold text-sm text-white">
																Billet n°{index + 1}
															</Text>
														</View>
													</View>
													<Text className="font-poppins-bold text-xl text-white mb-2">
														{ticket.name}
													</Text>
													<View className="flex-row items-center">
														<View className="bg-white/30 p-1.5 rounded-lg mr-2">
															<Image source={icons.calendar} className="size-4" tintColor="#FFF" />
														</View>
														<Text className="font-poppins-semibold text-sm text-white/90">
															{ticket.quantite_max} places disponibles
														</Text>
													</View>
												</View>
												
												{/* Selected Badge */}
												<View className="items-center">
													<View className="bg-white rounded-full w-14 h-14 items-center justify-center mb-2">
														<Text className="text-3xl">✓</Text>
													</View>
													<View className="bg-white/30 px-3 py-1 rounded-full">
														<Text className="font-poppins-bold text-xs text-white">Sélectionné</Text>
													</View>
												</View>
											</View>

											{/* Price Section */}
											<View className="bg-white/20 backdrop-blur rounded-2xl p-4 flex-row items-center justify-between">
												<View>
													<Text className="font-poppins text-xs text-white/70 mb-1">Prix par personne</Text>
													{!isFree(ticket.prix) && (
														<Text className="font-poppins-semibold text-sm text-white/90">Taxes incluses</Text>
													)}
												</View>
												{isFree(ticket.prix) ? (
													<FreeBadge variant="light" size="lg" />
												) : (
													<View className="flex-row items-baseline">
														<Text className="font-poppins-bold text-3xl text-white">{ticket.prix.toLocaleString(LOCALE)}</Text>
														<Text className="font-poppins-bold text-xl text-white/90 ml-1">{CURRENCY_SYMBOL}</Text>
													</View>
												)}
											</View>
										</LinearGradient>
									) : (
										<View 
											className="bg-white rounded-3xl p-5 border-2 border-gray-200"
											style={{ elevation: 3 }}
										>
											{/* Unselected Ticket */}
											<View className="flex-row items-start justify-between mb-4">
												<View className="flex-1 pr-3">
													<View className="flex-row items-center mb-2">
														<View 
															className="px-3 py-1.5 rounded-full mr-2"
															style={{ backgroundColor: colors.bg }}
														>
															<Text 
																className="font-poppins-bold text-xs"
																style={{ color: colors.from }}
															>
																Billet n°{index + 1}
															</Text>
														</View>
														<View 
															className="px-3 py-1 rounded-full"
															style={{ backgroundColor: colors.bg }}
														>
															<Text 
																className="font-poppins-semibold text-xs"
																style={{ color: colors.from }}
															>
																Disponible
															</Text>
														</View>
													</View>
													<Text className="font-poppins-bold text-lg text-gray-800 mb-2">
														{ticket.name}
													</Text>
													<View className="flex-row items-center">
														<View 
															className="p-1.5 rounded-lg mr-2"
															style={{ backgroundColor: colors.bg }}
														>
															<Image 
																source={icons.calendar} 
																className="size-4" 
																tintColor={colors.from}
															/>
														</View>
														<Text className="font-poppins text-sm text-gray-600">
															{ticket.quantite_max} places restantes
														</Text>
													</View>
												</View>
												
												{/* Price Display */}
												<View className="items-end">
													{isFree(ticket.prix) ? (
														<View className="mb-2 items-end">
															<FreeBadge variant="solid" size="md" />
														</View>
													) : (
														<View className="flex-row items-baseline mb-2">
															<Text className="font-poppins-bold text-3xl text-gray-800">{ticket.prix.toLocaleString(LOCALE)}</Text>
															<Text className="font-poppins-bold text-lg text-gray-600 ml-1">{CURRENCY_SYMBOL}</Text>
														</View>
													)}
													<Text className="font-poppins text-xs text-gray-500">par personne</Text>
												</View>
											</View>

											{/* Action Hint */}
											<View 
												className="pt-4 border-t flex-row items-center justify-center"
												style={{ borderTopColor: colors.bg, borderTopWidth: 1 }}
											>
												<Text className="font-poppins-semibold text-sm text-gray-500 mr-2">
													Appuyez pour sélectionner
												</Text>
												<Image source={icons.rightArrow} className="size-4" tintColor="#9CA3AF" />
											</View>
										</View>
									)}
								</TouchableOpacity>
							);
						})}

						{/* Info Card */}
						<View className="bg-blue-50 rounded-2xl p-4 flex-row items-start mt-2">
							<View className="bg-blue-100 p-2.5 rounded-xl mr-3">
								<Image source={icons.info} className="size-5" tintColor="#0061FF" />
							</View>
							<View className="flex-1">
								<Text className="font-poppins-bold text-sm text-gray-800 mb-1">
									💡 Bon à savoir
								</Text>
								<Text className="font-poppins text-xs text-gray-600 leading-5">
									Les prix affichés incluent toutes les taxes. Votre billet vous sera envoyé par e-mail après confirmation du paiement.
								</Text>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>

			{/* Bottom Button - Modern Design */}
			<View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100">
				{selectedTicket !== null && event.status ? (
					<>
						{/* Price Summary */}
						<View className="flex-row items-center justify-between mb-3 bg-purple-50 px-4 py-3 rounded-2xl">
							<View>
								<Text className="font-poppins text-xs text-gray-500 mb-1">Prix total</Text>
								{isFree(selectedTicketPrice) ? (
									<FreeBadge variant="solid" size="md" />
								) : (
									<Text className="font-poppins-bold text-lg text-gray-800">
										{formatPrice(selectedTicketPrice)}
									</Text>
								)}
							</View>
							{!isFree(selectedTicketPrice) && (
								<View className="bg-purple-100 px-3 py-1.5 rounded-full">
									<Text className="font-poppins-semibold text-xs text-primary-300">Taxes incluses</Text>
								</View>
							)}
						</View>

						{/* Book Button with Gradient */}
						<TouchableOpacity
							onPress={handleBookTicket}
							activeOpacity={0.8}
							className="rounded-3xl overflow-hidden"
						>
							<LinearGradient
								colors={["#5C27C0", "#7C3AED"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								className="py-5 flex-row items-center justify-center"
								style={{ elevation: 8 }}
							>
								<Image source={icons.wallet} className="size-6 mr-3" tintColor="#FFF" />
								<Text className="font-poppins-bold text-white text-lg">Réserver</Text>
								<Image source={icons.rightArrow} className="size-5 ml-3" tintColor="#FFF" />
							</LinearGradient>
						</TouchableOpacity>
					</>
				) : (
					<TouchableOpacity
						disabled={true}
						className="rounded-2xl py-5 bg-gray-200 flex-row items-center justify-center"
					>
						<Image source={icons.info} className="size-5 mr-2" tintColor="#9CA3AF" />
						<Text className="font-poppins-semibold text-gray-500 text-base">
							{selectedTicket === null ? "Choisissez un billet" : "Événement complet"}
						</Text>
					</TouchableOpacity>
				)}
			</View>
		</SafeAreaView>
	);
};

export default EventDetails;
