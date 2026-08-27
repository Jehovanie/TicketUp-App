import { useEffect, useState } from "react";
import { Dimensions, Keyboard, KeyboardEvent, Platform } from "react-native";

/**
 * Hauteur dont le contenu doit se décaler **lui-même** pour rester au-dessus
 * du clavier.
 *
 * Pourquoi pas `KeyboardAvoidingView` : depuis le SDK 54, l'affichage
 * bord-à-bord (edge-to-edge) est imposé sur Android, et la fenêtre n'est donc
 * plus redimensionnée à l'ouverture du clavier — `adjustResize` ne déplace
 * plus rien. C'est exactement le symptôme observé : le formulaire reste sous
 * le clavier. Sur iOS, `KeyboardAvoidingView` fonctionne mais impose son
 * `padding` à tout le sous-arbre, ce qui empêche la feuille blanche de
 * « coller » au clavier.
 *
 * On lit donc la hauteur nous-mêmes :
 *  - **iOS** : `window.height - endCoordinates.screenY`, qui reste juste même
 *    quand le clavier flotte ou n'occupe pas toute la largeur (iPad).
 *  - **Android** : `endCoordinates.height`, la fenêtre couvrant tout l'écran
 *    en bord-à-bord, le recouvrement vaut la hauteur du clavier.
 *
 * ⚠️ Ne jamais combiner cette valeur avec un `KeyboardAvoidingView` sur le
 * même sous-arbre : la compensation serait appliquée deux fois.
 */
export function useKeyboardInset(): number {
	const [inset, setInset] = useState(0);

	useEffect(() => {
		const onShow = (event: KeyboardEvent) => {
			const { screenY, height } = event.endCoordinates;
			const overlap =
				Platform.OS === "ios" ? Dimensions.get("window").height - screenY : height;

			setInset(Math.max(0, Math.round(overlap)));
		};

		const onHide = () => setInset(0);

		// `will*` sur iOS : l'animation du contenu part en même temps que celle
		// du clavier. Android n'émet que les `did*`.
		const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

		const subscriptions = [
			Keyboard.addListener(showEvent, onShow),
			Keyboard.addListener(hideEvent, onHide),
		];

		// Le clavier peut changer de hauteur sans se refermer : passage au
		// clavier numérique, barre de suggestions, saisie vocale. Android
		// réémet `keyboardDidShow`, iOS a besoin de cet abonnement en plus.
		if (Platform.OS === "ios") {
			subscriptions.push(Keyboard.addListener("keyboardWillChangeFrame", onShow));
		}

		return () => subscriptions.forEach((subscription) => subscription.remove());
	}, []);

	return inset;
}
