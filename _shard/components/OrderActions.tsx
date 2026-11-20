import { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/_shard/constants/colors";
import { isFree } from "@/_shard/constants/format";
import { IOrder } from "@/_core/model/IOrder";
import { ApiError } from "@/_config/api/client";
import { cancelOrder } from "@/_config/api/orders";

interface Props {
	order: IOrder;
	/** Masqué sur la page de détail, où l'on est déjà. */
	showDetails?: boolean;
	/** Reçoit la commande rafraîchie après une annulation réussie. */
	onChange: (order: IOrder) => void;
}

/**
 * Actions d'une commande, selon son statut :
 *  - détails      → toujours ;
 *  - payer        → `pending` payante seulement ;
 *  - annuler      → `pending` seulement (l'API refuse les autres, 409).
 */
const OrderActions = ({ order, showDetails = true, onChange }: Props) => {
	const router = useRouter();
	const [cancelling, setCancelling] = useState(false);

	const pending = order.status === "pending";
	const payable = pending && !isFree(order.totalAmount);

	const doCancel = async () => {
		setCancelling(true);
		try {
			onChange(await cancelOrder(order.reference));
		} catch (err) {
			Alert.alert("Annulation impossible", err instanceof ApiError ? err.message : "Réessayez dans un instant.");
		} finally {
			setCancelling(false);
		}
	};

	const confirmCancel = () =>
		Alert.alert("Annuler la commande ?", `${order.reference}\nLes places réservées seront rendues.`, [
			{ text: "Garder", style: "cancel" },
			{ text: "Annuler la commande", style: "destructive", onPress: doCancel },
		]);

	return (
		<View>
			{payable && (
				<TouchableOpacity
					// TODO : l'API n'a pas d'endpoint de paiement ; on ouvre pour l'instant
					// l'écran des moyens de paiement (maquette).
					onPress={() => router.push("/(root)/payment")}
					activeOpacity={0.85}
					className="mb-2 flex-row items-center justify-center rounded-2xl bg-primary py-3.5"
				>
					<Ionicons name="card-outline" size={18} color="#FFF" />
					<Text className="ml-2 font-poppins-bold text-sm text-white">Passer au paiement</Text>
				</TouchableOpacity>
			)}

			<View className="flex-row gap-2">
				{showDetails && (
					<TouchableOpacity
						onPress={() => router.push({ pathname: "/(root)/order/[reference]", params: { reference: order.reference } })}
						className="flex-1 flex-row items-center justify-center rounded-2xl border border-primary py-3"
					>
						<Ionicons name="eye-outline" size={16} color={colors.primary.DEFAULT} />
						<Text className="ml-1.5 font-poppins-semibold text-sm text-primary">Détails</Text>
					</TouchableOpacity>
				)}
				{pending && (
					<TouchableOpacity
						onPress={confirmCancel}
						disabled={cancelling}
						className="flex-1 flex-row items-center justify-center rounded-2xl border border-danger/30 bg-danger-100 py-3"
					>
						{cancelling ? (
							<ActivityIndicator size="small" color={colors.danger.DEFAULT} />
						) : (
							<>
								<Ionicons name="close-circle-outline" size={16} color={colors.danger.DEFAULT} />
								<Text className="ml-1.5 font-poppins-semibold text-sm text-danger">Annuler</Text>
							</>
						)}
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

export default OrderActions;
