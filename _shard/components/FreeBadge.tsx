import { View, Text } from "react-native";
import { FREE_LABEL } from "@/_shard/constants/format";

type Variant = "solid" | "light" | "outline";
type Size = "sm" | "md" | "lg";

interface Props {
	/**
	 * `solid`   — pastille verte pleine, sur fond clair ;
	 * `light`   — pastille blanche translucide, sur dégradé ou photo ;
	 * `outline` — version discrète, sur fond clair.
	 */
	variant?: Variant;
	size?: Size;
}

const VARIANTS: Record<Variant, { container: string; label: string }> = {
	solid: { container: "bg-green-500", label: "text-white" },
	light: { container: "bg-white/30", label: "text-white" },
	outline: { container: "bg-green-50 border border-green-200", label: "text-green-600" },
};

const SIZES: Record<Size, { container: string; label: string }> = {
	sm: { container: "px-2 py-0.5", label: "text-[10px]" },
	md: { container: "px-3 py-1", label: "text-xs" },
	lg: { container: "px-4 py-1.5", label: "text-sm" },
};

/** Badge « Gratuit », affiché à la place du prix quand celui-ci vaut 0. */
const FreeBadge = ({ variant = "solid", size = "md" }: Props) => {
	const { container, label } = VARIANTS[variant];
	const size_ = SIZES[size];

	return (
		<View className={`${container} ${size_.container} rounded-full self-start`}>
			<Text className={`${label} ${size_.label} font-poppins-bold uppercase`}>{FREE_LABEL}</Text>
		</View>
	);
};

export default FreeBadge;
