import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import FreeBadge from "@/_shard/components/FreeBadge";
import { GRADIENTS, colors, readableOn, withAlpha } from "@/_shard/constants/colors";
import { LOCALE, formatPrice, isFree } from "@/_shard/constants/format";
import { IEvent } from "@/_core/model/IEvent";
import { IOrder } from "@/_core/model/IOrder";
import { getEventById } from "@/_config/api/events";
import { ApiError } from "@/_config/api/client";
import { cancelOrder, placeOrder } from "@/_config/api/orders";

/** Plafond par commande, quel que soit le stock : limite les achats en rafale. */
const MAX_PER_ORDER = 10;

/** Écran affiché une fois la commande enregistrée par l'API. */
const OrderConfirmation = ({
	order,
	onHome,
	onPay,
	onCancel,
	cancelling,
	error,
	topInset,
	bottomInset,
}: {
	order: IOrder;
	onHome: () => void;
	onPay: () => void;
	onCancel: () => void;
	cancelling: boolean;
	error: string | null;
	topInset: number;
	bottomInset: number;
}) => {
	const paid = order.status === "paid";
	const pending = order.status === "pending";
	const ok = paid || pending;
	const payable = pending && !isFree(order.totalAmount);
	const expires = order.expiresAt
		? new Date(order.expiresAt).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })
		: null;

	const tone = paid ? colors.success.DEFAULT : pending ? colors.gold[600] : colors.danger.DEFAULT;
	const icon = paid ? "checkmark" : pending ? "time-outline" : "close";
	const headline = paid ? "Commande confirmée" : pending ? "Places réservées" : order.statusLabel;

	return (
		<View className="flex-1 bg-surface">
			<ScrollView
				contentContainerStyle={{ paddingTop: topInset + 40, paddingBottom: 24, paddingHorizontal: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<View className="items-center">
					<View
						className="h-20 w-20 items-center justify-center rounded-full"
						style={{ backgroundColor: withAlpha(tone, 0.12) }}
					>
						<Ionicons name={icon} size={38} color={tone} />
					</View>
					<Text className="mt-5 font-poppins-bold text-2xl text-ink-900">{headline}</Text>
					<Text className="mt-2 text-center font-poppins text-sm leading-5 text-ink-600">
						{paid
							? "Vos billets sont prêts. Un e-mail de confirmation vous est envoyé."
							: pending
								? `Vos places sont gardées jusqu'à ${expires ?? "quelques minutes"}. Le paiement en ligne n'est pas encore disponible : la commande expirera si elle n'est pas réglée à temps.`
								: "Cette commande n'est plus active."}
					</Text>
				</View>

				<View className="mt-8 rounded-3xl border border-ink-100 bg-surface-raised p-5">
					<View className="flex-row items-center justify-between">
						<Text className="font-poppins text-xs text-ink-500">Référence</Text>
						<Text className="font-poppins-bold text-sm tracking-wider text-ink-900" selectable>
							{order.reference}
						</Text>
					</View>
					<Text className="mt-3 font-poppins-semibold text-base text-ink-900" numberOfLines={2}>
						{order.event.title}
					</Text>

					<View className="my-4 h-px bg-ink-100" />

					{order.items.map((item, i) => (
						<View key={i} className="mb-1.5 flex-row items-center justify-between">
							<Text className="flex-1 pr-3 font-poppins text-sm text-ink-600">
								{item.quantity} × {item.name}
							</Text>
							<Text className="font-poppins-medium text-sm text-ink-900">
								{isFree(item.lineTotal) ? "Gratuit" : formatPrice(item.lineTotal)}
							</Text>
						</View>
					))}

					<View className="mt-3 flex-row items-center justify-between">
						<Text className="font-poppins-semibold text-base text-ink-900">Total</Text>
						{isFree(order.totalAmount) ? (
							<FreeBadge variant="solid" size="lg" />
						) : (
							<Text className="font-poppins-bold text-xl text-gold-700">{formatPrice(order.totalAmount)}</Text>
						)}
					</View>
				</View>

				{order.tickets.length > 0 && (
					<View className="mt-5 rounded-3xl border border-ink-100 bg-surface-raised p-5">
						<Text className="mb-3 font-poppins-semibold text-base text-ink-900">Vos billets</Text>
						{order.tickets.map((t) => (
							<View key={t.code} className="mb-2 flex-row items-center justify-between rounded-xl bg-primary-50 px-3 py-2.5">
								<Text className="font-poppins-medium text-sm text-primary-800">{t.ticketTypeName}</Text>
								<Text className="font-poppins-bold text-xs tracking-wider text-primary-900" selectable>
									{t.code}
								</Text>
							</View>
						))}
					</View>
				)}

				{error && <Text className="mt-4 text-center font-poppins text-xs text-danger">{error}</Text>}
			</ScrollView>

			<View className="px-5 pt-3" style={{ paddingBottom: Math.max(bottomInset, 12) }}>
				{payable && (
					<TouchableOpacity
						onPress={onPay}
						activeOpacity={0.85}
						className="mb-2 flex-row items-center justify-center rounded-2xl bg-primary py-4"
					>
						<Ionicons name="card-outline" size={18} color="#FFF" />
						<Text className="ml-2 font-poppins-bold text-base text-white">Passer au paiement</Text>
					</TouchableOpacity>
				)}
				{pending && (
					<TouchableOpacity
						onPress={onCancel}
						disabled={cancelling}
						className="mb-2 items-center rounded-2xl border border-ink-200 bg-surface-raised py-3.5"
					>
						{cancelling ? (
							<ActivityIndicator color={colors.ink[600]} />
						) : (
							<Text className="font-poppins-semibold text-sm text-ink-700">Annuler la commande</Text>
						)}
					</TouchableOpacity>
				)}
				<TouchableOpacity
					onPress={onHome}
					activeOpacity={0.85}
					className={`items-center rounded-2xl py-4 ${payable ? "border border-primary" : "bg-primary"}`}
				>
					<Text className={`font-poppins-bold text-base ${payable ? "text-primary" : "text-white"}`}>{ok ? "Retour à l'accueil" : "Retour"}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

/**
 * Commande : choix du nombre de billets, récapitulatif, validation.
 *
 * Reçoit `eventId` et `ticketId` depuis la fiche événement. La fiche détaillée
 * est relue ici plutôt que passée en paramètres : le stock (`quantite_max`) doit
 * être celui du moment, pas celui de l'écran précédent.
 *
 * « Passer la commande » appelle `POST /api/orders` : les places sont réservées
 * 15 minutes (commande `pending`), ou la commande est `paid` d'emblée si elle
 * est gratuite. L'API n'expose pas encore de paiement : une commande payante
 * reste en attente. Après succès, l'écran bascule sur la confirmation.
 */
const Checkout = () => {
	const { eventId, ticketId } = useLocalSearchParams<{ eventId: string; ticketId: string }>();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [event, setEvent] = useState<IEvent | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedId, setSelectedId] = useState<number | null>(ticketId ? Number(ticketId) : null);
	const [quantity, setQuantity] = useState(1);
	const [barHeight, setBarHeight] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [order, setOrder] = useState<IOrder | null>(null);
	const [cancelling, setCancelling] = useState(false);
	/** Clé d'idempotence : stable tant que la commande demandée ne change pas. */
	const idempotency = useRef<{ signature: string; key: string } | null>(null);

	const loadEvent = async (silent = false) => {
		try {
			if (!silent) setLoading(true);
			setError(null);
			setEvent(await getEventById(String(eventId)));
		} catch (err: any) {
			if (!silent) setError(err?.message ?? "Impossible de charger la commande");
		} finally {
			if (!silent) setLoading(false);
		}
	};

	useEffect(() => {
		if (eventId) loadEvent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId]);

	const ticket = useMemo(
		() => event?.ticket_type.find((t) => t.id === selectedId) ?? event?.ticket_type[0] ?? null,
		[event, selectedId]
	);

	const maxQty = ticket ? Math.min(ticket.quantite_max, MAX_PER_ORDER) : 0;

	// Changer de billet peut réduire le plafond : on ramène la quantité dedans.
	useEffect(() => {
		setQuantity((q) => Math.max(1, Math.min(q, maxQty || 1)));
	}, [maxQty]);

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-surface">
				<ActivityIndicator size="large" color={colors.primary.DEFAULT} />
			</View>
		);
	}

	if (!event || !ticket) {
		return (
			<View className="flex-1 items-center justify-center bg-surface px-8">
				<Text className="text-center font-poppins-semibold text-base text-ink-600">
					{error ?? "Aucun billet à commander pour cet événement"}
				</Text>
				<TouchableOpacity onPress={() => router.back()} className="mt-5 rounded-full bg-primary px-6 py-3">
					<Text className="font-poppins-semibold text-white">Retour</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const accent = event.category.color || colors.primary.DEFAULT;
	const free = isFree(ticket.prix);
	const total = ticket.prix * quantity;
	const soldOut = maxQty <= 0;

	const date = new Date(event.startedAt);
	const dateLabel = date.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });
	const timeLabel = date.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });

	const handlePlaceOrder = async () => {
		if (submitting) return;

		// Même commande renvoyée après une coupure réseau → même clé, l'API
		// renvoie la commande déjà créée au lieu d'en ouvrir une seconde.
		const signature = `${event.id}:${ticket.id}:${quantity}`;
		if (idempotency.current?.signature !== signature) {
			idempotency.current = {
				signature,
				key: `${signature}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
			};
		}

		setSubmitting(true);
		setSubmitError(null);
		try {
			setOrder(await placeOrder(event.id, [{ ticketTypeId: ticket.id, quantity }], idempotency.current.key));
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.status === 0) setSubmitError("Serveur injoignable. Vérifiez votre connexion et réessayez.");
				else if (err.status === 401) setSubmitError("Votre session a expiré. Reconnectez-vous pour commander.");
				else setSubmitError(err.message);
				// Stock ou vente changés entre-temps : on rafraîchit l'affichage.
				if (err.status === 409) loadEvent(true);
			} else {
				setSubmitError("Une erreur est survenue. Réessayez.");
			}
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancel = async () => {
		if (!order || cancelling) return;
		setCancelling(true);
		try {
			setOrder(await cancelOrder(order.reference));
		} catch (err) {
			setSubmitError(err instanceof ApiError ? err.message : "Annulation impossible.");
		} finally {
			setCancelling(false);
		}
	};

	if (order) {
		return (
			<OrderConfirmation
				order={order}
				onHome={() => router.replace("/")}
				// TODO : l'API n'a pas d'endpoint de paiement ; écran des moyens de paiement (maquette).
				onPay={() => router.push("/(root)/payment")}
				onCancel={handleCancel}
				cancelling={cancelling}
				error={submitError}
				topInset={insets.top}
				bottomInset={insets.bottom}
			/>
		);
	}

	return (
		<View className="flex-1 bg-surface">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: barHeight + 24 }}
			>
				{/* En-tête : bleu nuit, rappel de l'événement */}
				<LinearGradient colors={GRADIENTS.night} style={{ paddingTop: insets.top + 12 }} className="px-5 pb-8">
					<View className="flex-row items-center">
						<TouchableOpacity
							onPress={() => router.back()}
							accessibilityLabel="Retour"
							className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
						>
							<Ionicons name="arrow-back" size={20} color="#FFF" />
						</TouchableOpacity>
						<Text className="ml-3 font-poppins-semibold text-base text-white/80">Votre commande</Text>
					</View>

					<View
						className="mt-5 self-start rounded-full px-3 py-1"
						style={{ backgroundColor: accent }}
					>
						<Text className="font-poppins-semibold text-xs" style={{ color: readableOn(accent) }}>
							{event.category.name}
						</Text>
					</View>
					<Text className="mt-3 font-poppins-bold text-2xl leading-8 text-white" numberOfLines={2}>
						{event.title}
					</Text>
					<View className="mt-3 flex-row items-center">
						<Ionicons name="calendar-outline" size={14} color={withAlpha("#FFFFFF", 0.7)} />
						<Text className="ml-2 flex-1 font-poppins text-sm capitalize text-white/70" numberOfLines={1}>
							{dateLabel} · {timeLabel}
						</Text>
					</View>
					<View className="mt-1.5 flex-row items-center">
						<Ionicons name="location-outline" size={14} color={withAlpha("#FFFFFF", 0.7)} />
						<Text className="ml-2 flex-1 font-poppins text-sm text-white/70" numberOfLines={1}>
							{event.location.name || "Lieu à définir"}
						</Text>
					</View>
				</LinearGradient>

				<View className="-mt-4 rounded-t-3xl bg-surface px-5 pt-6">
					{/* Choix du billet, seulement s'il y a vraiment un choix */}
					{event.ticket_type.length > 1 && (
						<View className="mb-6">
							<Text className="mb-3 font-poppins-semibold text-base text-ink-900">Type de billet</Text>
							<View className="flex-row flex-wrap">
								{event.ticket_type.map((t) => {
									const active = t.id === ticket.id;
									return (
										<TouchableOpacity
											key={t.id}
											onPress={() => setSelectedId(t.id)}
											accessibilityState={{ selected: active }}
											className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
												active ? "border-primary bg-primary" : "border-ink-200 bg-surface-raised"
											}`}
										>
											<Text
												className={`font-poppins-medium text-sm ${active ? "text-white" : "text-ink-700"}`}
											>
												{t.name}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>
					)}

					{/* Quantité */}
					<View className="rounded-3xl border border-ink-100 bg-surface-raised p-5">
						<View className="flex-row items-start justify-between">
							<View className="flex-1 pr-3">
								<Text className="font-poppins-bold text-lg text-ink-900">{ticket.name}</Text>
								<Text className="mt-0.5 font-poppins text-xs text-ink-500">
									{soldOut
										? "Plus aucune place"
										: `${ticket.quantite_max} place${ticket.quantite_max > 1 ? "s" : ""} restante${ticket.quantite_max > 1 ? "s" : ""}`}
								</Text>
							</View>
							{free ? (
								<FreeBadge variant="solid" size="md" />
							) : (
								<View className="items-end">
									<Text className="font-poppins-bold text-lg text-gold-700">{formatPrice(ticket.prix)}</Text>
									<Text className="font-poppins text-[11px] text-ink-500">par billet</Text>
								</View>
							)}
						</View>

						<View className="my-4 h-px bg-ink-100" />

						<View className="flex-row items-center justify-between">
							<View>
								<Text className="font-poppins-semibold text-sm text-ink-900">Nombre de billets</Text>
								<Text className="font-poppins text-xs text-ink-500">Maximum {maxQty || 0} par commande</Text>
							</View>

							<View className="flex-row items-center">
								<TouchableOpacity
									onPress={() => setQuantity((q) => Math.max(1, q - 1))}
									disabled={quantity <= 1}
									accessibilityLabel="Retirer un billet"
									className={`h-11 w-11 items-center justify-center rounded-full border ${
										quantity <= 1 ? "border-ink-100 bg-surface-sunken" : "border-primary bg-surface-raised"
									}`}
								>
									<Ionicons
										name="remove"
										size={20}
										color={quantity <= 1 ? colors.ink[300] : colors.primary.DEFAULT}
									/>
								</TouchableOpacity>

								<Text
									className="w-12 text-center font-poppins-bold text-2xl text-ink-900"
									accessibilityLiveRegion="polite"
								>
									{quantity}
								</Text>

								<TouchableOpacity
									onPress={() => setQuantity((q) => Math.min(maxQty, q + 1))}
									disabled={quantity >= maxQty}
									accessibilityLabel="Ajouter un billet"
									className={`h-11 w-11 items-center justify-center rounded-full ${
										quantity >= maxQty ? "bg-surface-sunken" : "bg-primary"
									}`}
								>
									<Ionicons name="add" size={20} color={quantity >= maxQty ? colors.ink[300] : "#FFF"} />
								</TouchableOpacity>
							</View>
						</View>

						{quantity >= maxQty && !soldOut && (
							<Text className="mt-3 font-poppins text-xs text-warning">
								{maxQty === MAX_PER_ORDER
									? `Limite de ${MAX_PER_ORDER} billets par commande atteinte.`
									: "Vous avez pris toutes les places restantes."}
							</Text>
						)}
					</View>

					{/* Récapitulatif */}
					<View className="mt-5 rounded-3xl border border-ink-100 bg-surface-raised p-5">
						<Text className="mb-4 font-poppins-semibold text-base text-ink-900">Récapitulatif</Text>

						<View className="flex-row items-center justify-between">
							<Text className="flex-1 pr-3 font-poppins text-sm text-ink-600">
								{quantity} × {ticket.name}
							</Text>
							{free ? (
								<Text className="font-poppins-medium text-sm text-success-600">Gratuit</Text>
							) : (
								<Text className="font-poppins-medium text-sm text-ink-900">{formatPrice(total)}</Text>
							)}
						</View>

						{!free && (
							<View className="mt-2 flex-row items-center justify-between">
								<Text className="font-poppins text-sm text-ink-600">Taxes</Text>
								<Text className="font-poppins text-sm text-ink-500">Incluses</Text>
							</View>
						)}

						<View className="my-4 h-px bg-ink-100" />

						<View className="flex-row items-center justify-between">
							<Text className="font-poppins-semibold text-base text-ink-900">Total</Text>
							{free ? (
								<FreeBadge variant="solid" size="lg" />
							) : (
								<Text className="font-poppins-bold text-2xl text-gold-700">{formatPrice(total)}</Text>
							)}
						</View>
					</View>

					<View className="mt-5 flex-row items-start rounded-2xl bg-primary-50 p-4">
						<Ionicons name="mail-outline" size={18} color={colors.primary[700]} style={{ marginTop: 2 }} />
						<Text className="ml-3 flex-1 font-poppins text-xs leading-5 text-primary-800">
							Vos billets vous seront envoyés par e-mail après confirmation de la commande.
						</Text>
					</View>
				</View>
			</ScrollView>

			{/* Barre d'action fixe : le total reste visible pendant qu'on ajuste */}
			<View
				onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}
				className="absolute bottom-0 left-0 right-0 border-t border-ink-100 bg-surface-raised px-5 pt-3"
				style={{ paddingBottom: Math.max(insets.bottom, 12) }}
			>
				<View className="mb-3 flex-row items-end justify-between">
					<Text className="font-poppins text-sm text-ink-500">
						{quantity} billet{quantity > 1 ? "s" : ""}
					</Text>
					{free ? (
						<FreeBadge variant="solid" size="md" />
					) : (
						<Text className="font-poppins-bold text-xl text-ink-900">{formatPrice(total)}</Text>
					)}
				</View>

				{submitError && (
					<View className="mb-3 flex-row items-start rounded-xl bg-danger-100 px-3 py-2.5">
						<Ionicons name="alert-circle" size={16} color={colors.danger.DEFAULT} style={{ marginTop: 1 }} />
						<Text className="ml-2 flex-1 font-poppins text-xs leading-4 text-danger" accessibilityLiveRegion="polite">
							{submitError}
						</Text>
					</View>
				)}

				<TouchableOpacity
					onPress={handlePlaceOrder}
					disabled={soldOut || submitting}
					activeOpacity={0.85}
					accessibilityRole="button"
					className="overflow-hidden rounded-2xl"
				>
					<LinearGradient
						colors={soldOut ? [colors.ink[200], colors.ink[200]] : [colors.primary[900], colors.primary[700]]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						className="flex-row items-center justify-center py-4"
					>
						{submitting ? (
							<ActivityIndicator color="#FFF" />
						) : (
							<Text className={`font-poppins-bold text-base ${soldOut ? "text-ink-500" : "text-white"}`}>
								{soldOut ? "Complet" : "Passer la commande"}
							</Text>
						)}
						{!soldOut && !submitting && <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 10 }} />}
					</LinearGradient>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default Checkout;
