import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import FreeBadge from "@/_shard/components/FreeBadge";
import { GRADIENTS, colors } from "@/_shard/constants/colors";
import { LOCALE, formatPrice, isFree } from "@/_shard/constants/format";
import OrderActions from "@/_shard/components/OrderActions";
import OrderStatusBadge from "@/_shard/components/OrderStatusBadge";
import { IOrder } from "@/_core/model/IOrder";
import { ApiError } from "@/_config/api/client";
import { getMyOrders } from "@/_config/api/orders";

const PAGE_SIZE = 10;

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

/** Commandes de l'utilisateur connecté, avec leur statut. */
const Orders = () => {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [orders, setOrders] = useState<IOrder[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async (target: number, mode: "initial" | "refresh" | "more") => {
		try {
			setError(null);
			const data = await getMyOrders({ page: target, itemsPerPage: PAGE_SIZE });
			setTotal(data.itemsTotal);
			setPage(target);
			setOrders((prev) => (mode === "more" ? [...prev, ...data.items] : data.items));
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) setError("Votre session a expiré. Reconnectez-vous.");
			else if (err instanceof ApiError && err.status === 0) setError("Serveur injoignable. Vérifiez votre connexion.");
			else setError(err instanceof Error ? err.message : "Impossible de charger vos commandes.");
		} finally {
			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
		}
	}, []);

	useEffect(() => {
		load(1, "initial");
	}, [load]);

	const hasMore = orders.length < total;

	return (
		<View className="flex-1 bg-surface">
			<LinearGradient colors={GRADIENTS.night} style={{ paddingTop: insets.top + 12 }} className="px-5 pb-6">
				<View className="flex-row items-center">
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
								{total} commande{total > 1 ? "s" : ""}
							</Text>
						)}
					</View>
				</View>
			</LinearGradient>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={colors.primary.DEFAULT} />
				</View>
			) : (
				<FlatList
					data={orders}
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
								load(1, "refresh");
							}}
							tintColor={colors.primary.DEFAULT}
						/>
					}
					onEndReachedThreshold={0.4}
					onEndReached={() => {
						if (!hasMore || loadingMore || refreshing || error) return;
						setLoadingMore(true);
						load(page + 1, "more");
					}}
					ListFooterComponent={loadingMore ? <ActivityIndicator className="my-4" color={colors.primary.DEFAULT} /> : undefined}
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
							<Text className="mt-1 text-center font-poppins text-sm text-ink-500">
								{error ?? "Vos commandes de billets apparaîtront ici."}
							</Text>
							<TouchableOpacity
								onPress={() => (error ? (setLoading(true), load(1, "initial")) : router.replace("/"))}
								className="mt-5 rounded-full bg-primary px-6 py-3"
							>
								<Text className="font-poppins-semibold text-white">{error ? "Réessayer" : "Découvrir les événements"}</Text>
							</TouchableOpacity>
						</View>
					}
				/>
			)}
		</View>
	);
};

export default Orders;
