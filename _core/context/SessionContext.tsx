import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

import { getMe, login as loginRequest } from "@/_config/api/auth";
import { ApiError, setAuthToken } from "@/_config/api/client";
import { IUser } from "@/_core/model/IUser";

/**
 * Session de l'utilisateur — source de vérité unique du « connecté / pas
 * connecté » pour toute l'application.
 *
 * Avant, `(tabs)/_layout.tsx` codait en dur `{ loading: false, isLogged: true }`.
 * Tout ce qui dépend de l'authentification (visibilité de la barre d'onglets,
 * garde à la réservation, accès au profil) passe désormais par ce contexte, et
 * par lui seul : pas de garde parallèle.
 *
 * ⚠️ **Le jeton ne vit qu'en mémoire.** Aucun module de persistance n'est
 * installé (`expo-secure-store` / `async-storage`), donc la session est perdue
 * à chaque redémarrage de l'application. Le `refresh_token` est conservé ici
 * mais pas encore exploité — `POST /api/auth/refresh` existe côté back. Le
 * point d'accroche pour brancher la persistance est `restore()`.
 */

type SessionContextType = {
	user: IUser | null;
	isLogged: boolean;
	/** Restauration d'une session au démarrage (toujours brève aujourd'hui). */
	isLoading: boolean;
	/** Connexion en cours : sert à désactiver le formulaire. */
	isSubmitting: boolean;
	error: string | null;
	signIn: (email: string, password: string) => Promise<boolean>;
	signOut: () => void;
	clearError: () => void;
};

export const SessionContext = createContext<SessionContextType>({
	user: null,
	isLogged: false,
	isLoading: false,
	isSubmitting: false,
	error: null,
	signIn: async () => false,
	signOut: () => {},
	clearError: () => {},
});

/**
 * Message affichable à partir d'un échec de connexion.
 *
 * Le firewall Lexik répond `{ code: 401, message: "Invalid credentials." }` :
 * en anglais, et formulé pour un développeur. On ne montre pas ça à
 * l'utilisateur. Les autres cas gardent le message de l'API, déjà exploitable.
 */
function loginErrorMessage(err: unknown): string {
	if (err instanceof ApiError) {
		if (err.status === 401) return "E-mail ou mot de passe incorrect";
		if (err.status === 0) return "Serveur injoignable. Vérifiez votre connexion.";

		return err.message;
	}

	return "Connexion impossible";
}

export const SessionProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<IUser | null>(null);
	const [isLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const signIn = useCallback(async (email: string, password: string) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const { token } = await loginRequest(email, password);

			// L'ordre compte : `getMe()` a besoin du jeton déjà enregistré.
			setAuthToken(token);
			setUser(await getMe());

			return true;
		} catch (err) {
			// Le jeton peut avoir été posé avant l'échec de `getMe()` : on ne
			// laisse pas l'application dans un état à moitié connecté.
			setAuthToken(null);
			setUser(null);
			setError(loginErrorMessage(err));
			console.error("[SessionContext] POST /api/auth/login", err);

			return false;
		} finally {
			setIsSubmitting(false);
		}
	}, []);

	const signOut = useCallback(() => {
		setAuthToken(null);
		setUser(null);
		setError(null);
	}, []);

	const clearError = useCallback(() => setError(null), []);

	const value = useMemo<SessionContextType>(
		() => ({
			user,
			isLogged: user !== null,
			isLoading,
			isSubmitting,
			error,
			signIn,
			signOut,
			clearError,
		}),
		[user, isLoading, isSubmitting, error, signIn, signOut, clearError]
	);

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/** Accès à la session. À préférer à `useContext(SessionContext)` direct. */
export function useSession(): SessionContextType {
	return useContext(SessionContext);
}
