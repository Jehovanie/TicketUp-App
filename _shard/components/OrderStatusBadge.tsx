import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, withAlpha } from "@/_shard/constants/colors";
import { OrderStatus } from "@/_core/model/IOrder";

/** Teinte et icône par statut : le statut est la première chose qu'on cherche. */
const STATUS: Record<OrderStatus, { tone: string; icon: keyof typeof Ionicons.glyphMap }> = {
	paid: { tone: colors.success.DEFAULT, icon: "checkmark-circle" },
	pending: { tone: colors.gold[600], icon: "time" },
	cancelled: { tone: colors.danger.DEFAULT, icon: "close-circle" },
	expired: { tone: colors.ink[500], icon: "hourglass-outline" },
	refunded: { tone: colors.primary[600], icon: "return-up-back" },
};

export const statusTone = (status: OrderStatus) => (STATUS[status] ?? STATUS.expired).tone;

const OrderStatusBadge = ({ status, label }: { status: OrderStatus; label: string }) => {
	const { tone, icon } = STATUS[status] ?? STATUS.expired;
	return (
		<View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: withAlpha(tone, 0.12) }}>
			<Ionicons name={icon} size={12} color={tone} />
			<Text className="ml-1 font-poppins-semibold text-[11px]" style={{ color: tone }}>
				{label}
			</Text>
		</View>
	);
};

export default OrderStatusBadge;
