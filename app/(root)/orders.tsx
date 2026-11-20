import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import FreeBadge from "@/_shard/components/FreeBadge";
import { GRADIENTS, colors } from "@/_shard/constants/colors";
import { LOCALE, formatPrice, isFree } from "@/_shard/constants/format";
import OrderActions from "@/_shard/components/OrderActions";
import OrderStatusBadge from "@/_shard/components/OrderStatusBadge";
import { IOrder, OrderStatus } from "@/_core/model/IOrder";
import { ApiError } from "@/_config/api/client";
import { getMyOrders } from "@/_config/api/orders";

/** Plafond de l'API (`itemsPerPage` ≤ 20) et garde-fou sur le nombre de pages lues. */
const PAGE_SIZE = 20;
const MAX_PAGES = 10;

/**
 * Onglets par statut, dans l'ordre d'affichage. L'API ne filtre pas par statut
 * (`GET /api/orders/me`) : on charge les commandes de l'utilisateur et on les
 * répartit ici, ce qui donne aussi le compteur de chaque onglet.
 */
const TABS: { status: OrderStatus; label: string; empty: string }[] = [
	{ status: "pending", label: "En attente", empty: "Aucune commande en attente de paiement." },
	{ status: "paid", label: "Payées", empty: "Aucune commande payée pour le moment." },
	{ status: "cancelled", label: "Annulées", empty: "Aucune commande annulée." },
	{ status: "expired", label: "Expirées", empty: "Aucune commande expirée." },
	{ status: "refunded", label: "Remboursées", empty: "Aucune commande remboursée." },
];

const OrderCard = ({ order, onChange }: { order: IOrder; onChange: (o: IOrder) => void }) => {
	const router = useRouter();
	const date = new Date(order.event.startedAt).toLocaleDateString(LOCALE, {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
	const expires =
		order.status === "pending" && order.expiresAt
			? new Date(order.expiresAt).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })
			: null;

	return (
		<View className="mb-3 rounded-3xl border border-ink-100 bg-surface-raised p-4">
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={() => router.push({ pathname: "/(root)/order/[reference]", params: { reference: order.reference } })}
			>
				<View className="flex-row items-center justify-between">
					<Text className="font-poppins-bold text-xs tracking-wider text-ink-500">{order.reference}</Text>
					<OrderStatusBadge status={order.status} label={order.statusLabel} />
				</View>

				<Text className="mt-3 font-poppins-semibold text-base text-ink-900" numberOfLines={2}>
					{order.event.title}
				</Text>
				<Text className="mt-0.5 font-poppins text-xs capitalize text-ink-500">{date}</Text>

				{expires && <Text className="mt-2 font-poppins text-xs text-gold-700">Places gardées jusqu&apos;à {expires}</Text>}

				<View className="my-3 h-px bg-ink-100" />

				<View className="flex-row items-center justify-between">
					<Text className="font-poppins text-sm text-ink-600">
						{order.ticketCount} billet{order.ticketCount > 1 ? "s" : ""}
					</Text>
					{isFree(order.totalAmount) ? (
						<FreeBadge variant="solid" size="md" />
					) : (
						<Text className="font-poppins-bold text-lg text-gold-700">{formatPrice(order.totalAmount)}</Text>
					)}
				</View>
			</TouchableOpacity>

			<View className="mt-4">
				<OrderActions order={order} onChange={onChange} />
			</View>
		</View>
	);
};

/** Commandes de l'utilisateur connecté, réparties par statut. */
const Orders = () => {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [orders, setOrders] = useState<IOrder[]>([]);
	const [tab, setTab] = useState<OrderStatus>("pending");
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setError(null);
			const all: IOrder[] = [];
			for (let page = 1; page <= MAX_PAGES; page++) {
				const data = await getMyOrders({ page, itemsPerPage: PAGE_SIZE });
				all.push(...data.items);
				if (all.length >= data.itemsTotal || data.items.length === 0) break;
			}
			setOrders(all);
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) setError("Votre session a expiré. Reconnectez-vous.");
			else if (err instanceof ApiError && err.status === 0) setError("Serveur injoignable. Vérifiez votre connexion.");
			else setError(err instanceof Error ? err.message : "Impossible de charger vos commandes.");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const counts = useMemo(() => {
		const map: Record<string, number> = {};
		for (const o of orders) map[o.status] = (map[o.status] ?? 0) + 1;
		return map;
	}, [orders]);

	const visible = useMemo(() => orders.filter((o) => o.status === tab), [orders, tab]);
	const current = TABS.find((t) => t.status === tab)!;

	return (
		<View className="flex-1 bg-surface">
			<LinearGradient colors={GRADIENTS.night} style={{ paddingTop: insets.top + 12 }} className="pb-4">
				<View className="flex-row items-center px-5">
					<TouchableOpacity
						onPress={() => router.back()}
						accessibilityLabel="Retour"
						className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
					>
						<Ionicons name="arrow-back" size={20} color="#FFF" />
					</TouchableOpacity>
					<View className="ml-3">
						<Text className="font-poppins-bold text-xl text-white">Mes commandes</Text>
						{!loading && !error && (
							<Text className="font-poppins text-xs text-white/70">
								{orders.length} commande{orders.length > 1 ? "s" : ""}
							</Text>
						)}
					</View>
				</View>

				{/* Onglets par statut */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="mt-4"
					contentContainerStyle={{ paddingHorizontal: 20 }}
				>
					{TABS.map((t) => {
						const active = t.status === tab;
						const count = counts[t.status] ?? 0;
						return (
							<TouchableOpacity
								key={t.status}
								onPress={() => setTab(t.status)}
								accessibilityRole="tab"
								accessibilityState={{ selected: active }}
								className={`mr-2 flex-row items-center rounded-full px-4 py-2 ${active ? "bg-white" : "bg-white/15"}`}
							>
								<Text className={`font-poppins-semibold text-sm ${active ? "text-primary" : "text-white"}`}>{t.label}</Text>
								{!loading && (
									<View
										className={`ml-2 min-w-[20px] items-center rounded-full px-1.5 py-0.5 ${active ? "bg-primary" : "bg-white/25"}`}
									>
										<Text className="font-poppins-bold text-[11px] text-white">{count}</Text>
									</View>
								)}
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</LinearGradient>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={colors.primary.DEFAULT} />
				</View>
			) : (
				<FlatList
					data={error ? [] : visible}
					keyExtractor={(o) => o.reference}
					renderItem={({ item }) => (
						<OrderCard order={item} onChange={(o) => setOrders((prev) => prev.map((x) => (x.reference === o.reference ? o : x)))} />
					)}
					contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => {
								setRefreshing(true);
								load();
							}}
							tintColor={colors.primary.DEFAULT}
						/>
					}
					ListEmptyComponent={
						<View className="flex-1 items-center justify-center px-6">
							<View className="h-16 w-16 items-center justify-center rounded-full bg-primary-50">
								<Ionicons
									name={error ? "alert-circle-outline" : "ticket-outline"}
									size={30}
									color={error ? colors.danger.DEFAULT : colors.primary[600]}
								/>
							</View>
							<Text className="mt-4 text-center font-poppins-semibold text-base text-ink-900">
								{error ? "Chargement impossible" : "Aucune commande"}
							</Text>
							<Text className="mt-1 text-center font-poppins text-sm text-ink-500">{error ?? current.empty}</Text>
							{(error || orders.length === 0) && (
								<TouchableOpacity
									onPress={() => (error ? (setLoading(true), load()) : router.replace("/"))}
									className="mt-5 rounded-full bg-primary px-6 py-3"
								>
									<Text className="font-poppins-semibold text-white">{error ? "Réessayer" : "Découvrir les événements"}</Text>
								</TouchableOpacity>
							)}
						</View>
					}
				/>
			)}
		</View>
	);
};

export default Orders;
