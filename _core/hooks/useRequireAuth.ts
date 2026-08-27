import { useCallback } from "react";
import { usePathname, useRouter } from "expo-router";

import { useSession } from "@/_core/context/SessionContext";

/**
 * Garde d'authentification posée **sur l'action**, pas sur la navigation.
 *
 * La consultation reste entièrement publique — accueil, recherche, fiche
 * événement. Le mur n'arrive qu'au moment où l'action engage un compte
 * (réserver un billet, ouvrir son profil). L'écran de connexion reçoit le
 * chemin d'origine pour y ramener l'utilisateur une fois connecté : sans ça,
 * il perdrait l'événement qu'il était en train de regarder.
 */
export function useRequireAuth() {
	const { isLogged } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	return useCallback(
		(action: () => void) => {
			if (isLogged) {
				action();
				return;
			}

			router.push({ pathname: "/(root)/(auth)/signin", params: { redirect: pathname } });
		},
		[isLogged, router, pathname]
	);
}
