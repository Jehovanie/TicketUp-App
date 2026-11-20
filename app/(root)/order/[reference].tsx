import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import FreeBadge from "@/_shard/components/FreeBadge";
import OrderActions from "@/_shard/components/OrderActions";
import OrderStatusBadge from "@/_shard/components/OrderStatusBadge";
import { GRADIENTS, colors } from "@/_shard/constants/colors";
import { LOCALE, formatPrice, isFree } from "@/_shard/constants/format";
import { IOrder } from "@/_core/model/IOrder";
import { ApiError } from "@/_config/api/client";
import { getOrder } from "@/_config/api/orders";

const dateTime = (iso: string | null) =>
	iso
		? new Date(iso).toLocaleString(LOCALE, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
		: null;

const Row = ({ label, value }: { label: string; value: string | null }) =>
	value ? (
		<View className="mb-2 flex-row items-center justify-between">
			<Text className="font-poppins text-sm text-ink-500">{label}</Text>
			<Text className="ml-4 flex-1 text-right font-poppins-medium text-sm text-ink-900">{value}</Text>
		</View>
	) : null;

/** Détail d'une commande : statut, lignes, billets, dates, actions. */
const OrderDetails = () => {
	const { reference } = useLocalSearchParams<{ reference: string }>();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [order, setOrder] = useState<IOrder | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = async () => {
		try {
			setLoading(true);
			setError(null);
			setOrder(await getOrder(String(reference)));
		} catch (err) {
			setError(
				err instanceof ApiError && err.status === 404
					? "Commande introuvable."
					: err instanceof Error
						? err.message
						: "Chargement impossible."
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (reference) load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reference]);

	const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

	return (
		<View className="flex-1 bg-surface">
			<LinearGradient colors={GRADIENTS.night} style={{ paddingTop: insets.top + 12 }} className="px-5 pb-6">
				<View className="flex-row items-center">
					<TouchableOpacity onPress={back} accessibilityLabel="Retour" className="h-10 w-10 items-center justify-center rounded-full bg-white/15">
						<Ionicons name="arrow-back" size={20} color="#FFF" />
					</TouchableOpacity>
					<View className="ml-3 flex-1">
						<Text className="font-poppins-bold text-xl text-white">Détail de la commande</Text>
						<Text className="font-poppins text-xs tracking-wider text-white/70" selectable>
							{reference}
						</Text>
					</View>
				</View>
			</LinearGradient>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={colors.primary.DEFAULT} />
				</View>
			) : !order ? (
				<View className="flex-1 items-center justify-center px-8">
					<Text className="text-center font-poppins-semibold text-base text-ink-600">{error}</Text>
					<TouchableOpacity onPress={load} className="mt-5 rounded-full bg-primary px-6 py-3">
						<Text className="font-poppins-semibold text-white">Réessayer</Text>
					</TouchableOpacity>
				</View>
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
				>
					<View className="rounded-3xl border border-ink-100 bg-surface-raised p-5">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-poppins text-xs text-ink-500">Statut</Text>
							<OrderStatusBadge status={order.status} label={order.statusLabel} />
						</View>
						<Text className="font-poppins-bold text-lg text-ink-900">{order.event.title}</Text>
						<Text className="mt-1 font-poppins text-sm capitalize text-ink-500">{dateTime(order.event.startedAt)}</Text>
						{order.status === "pending" && order.expiresAt && (
							<View className="mt-3 rounded-xl bg-gold-100 px-3 py-2">
								<Text className="font-poppins text-xs text-gold-800">
									Places gardées jusqu&apos;à {dateTime(order.expiresAt)}. Passé ce délai, la commande expire.
								</Text>
							</View>
						)}
					</View>

					<View className="mt-4 rounded-3xl border border-ink-100 bg-surface-raised p-5">
						<Text className="mb-3 font-poppins-semibold text-base text-ink-900">Billets commandés</Text>
						{order.items.map((item, i) => (
							<View key={i} className="mb-2 flex-row items-center justify-between">
								<View className="flex-1 pr-3">
									<Text className="font-poppins-medium text-sm text-ink-900">
										{item.quantity} × {item.name}
									</Text>
									{!isFree(item.unitPrice) && (
										<Text className="font-poppins text-xs text-ink-500">{formatPrice(item.unitPrice)} l&apos;unité</Text>
									)}
								</View>
								<Text className="font-poppins-medium text-sm text-ink-900">
									{isFree(item.lineTotal) ? "Gratuit" : formatPrice(item.lineTotal)}
								</Text>
							</View>
						))}
						<View className="my-3 h-px bg-ink-100" />
						<View className="flex-row items-center justify-between">
							<Text className="font-poppins-semibold text-base text-ink-900">Total</Text>
							{isFree(order.totalAmount) ? (
								<FreeBadge variant="solid" size="lg" />
							) : (
								<Text className="font-poppins-bold text-xl text-gold-700">{formatPrice(order.totalAmount)}</Text>
							)}
						</View>
					</View>

					{order.tickets.length > 0 && (
						<View className="mt-4 rounded-3xl border border-ink-100 bg-surface-raised p-5">
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

					<View className="mt-4 rounded-3xl border border-ink-100 bg-surface-raised p-5">
						<Text className="mb-3 font-poppins-semibold text-base text-ink-900">Historique</Text>
						<Row label="Passée le" value={dateTime(order.createdAt)} />
						<Row label="Payée le" value={dateTime(order.paidAt)} />
						<Row label="Annulée le" value={dateTime(order.cancelledAt)} />
					</View>

					<View className="mt-5">
						<OrderActions order={order} showDetails={false} onChange={setOrder} />
					</View>
				</ScrollView>
			)}
		</View>
	);
};

export default OrderDetails;
