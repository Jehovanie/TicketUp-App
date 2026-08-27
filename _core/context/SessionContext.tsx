import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

import {
	getMe,
	login as loginRequest,
	register as registerRequest,
	IRegisterInput,
} from "@/_config/api/auth";
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
 * à chaque redémarrage de l'application.
 *
 * ⚠️ **L'access token expire en 15 minutes** (`exp = iat + 900` dans le JWT
 * délivré par Lexik). Le `refresh_token` renvoyé par la connexion comme par
 * l'inscription est gardé ici, mais `POST /api/auth/refresh` n'est pas encore
 * appelé : au-delà de ce quart d'heure, une requête authentifiée repartira en
 * 401. Sans conséquence aujourd'hui — `getMe()`, juste après la connexion, est
 * le seul appel authentifié de l'application.
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
	/** Inscription : crée le compte et connecte dans la foulée. */
	signUp: (input: IRegisterInput) => Promise<boolean>;
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
	signUp: async () => false,
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

/**
 * Message affichable à partir d'un échec d'inscription.
 *
 * ⚠️ L'API ne distingue pas les erreurs métier des pannes : `RegisterController`
 * ne rattrape rien, donc un e-mail déjà pris (violation d'unicité Doctrine)
 * comme un `RegisterDTO` invalide (`\InvalidArgumentException`) ressortent
 * tous les deux en **500**, avec le détail dans `detail`. On lit donc ce texte
 * pour retrouver le cas réel — et on retombe sur un message générique en
 * production, où Symfony masque ce détail.
 *
 * Le jour où le back renverra 409 / 422, ces heuristiques deviendront inutiles
 * et pourront disparaître.
 */
function registerErrorMessage(err: unknown): string {
	if (!(err instanceof ApiError)) return "Création de compte impossible";

	if (err.status === 0) return "Serveur injoignable. Vérifiez votre connexion.";

	const detail = err.message.toLowerCase();

	if (detail.includes("uniq_identifier_email") || detail.includes("duplicate key")) {
		return "Un compte existe déjà avec cet e-mail.";
	}
	if (detail.includes("not a valid email")) return "Adresse e-mail invalide.";
	if (detail.includes("too short")) return "Mot de passe trop court.";
	if (detail.includes("too long")) return "Une des informations saisies est trop longue.";

	if (err.status >= 500) return "Création de compte impossible pour le moment.";

	return err.message;
}

export const SessionProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<IUser | null>(null);
	/** Gardé pour `POST /api/auth/refresh`, pas encore consommé. */
	const [, setRefreshToken] = useState<string | null>(null);
	const [isLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const signIn = useCallback(async (email: string, password: string) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const { token, refresh_token } = await loginRequest(email, password);

			// L'ordre compte : `getMe()` a besoin du jeton déjà enregistré.
			setAuthToken(token);
			setRefreshToken(refresh_token);
			setUser(await getMe());

			return true;
		} catch (err) {
			// Le jeton peut avoir été posé avant l'échec de `getMe()` : on ne
			// laisse pas l'application dans un état à moitié connecté.
			setAuthToken(null);
			setRefreshToken(null);
			setUser(null);
			setError(loginErrorMessage(err));
			console.error("[SessionContext] POST /api/auth/login", err);

			return false;
		} finally {
			setIsSubmitting(false);
		}
	}, []);

	/**
	 * L'inscription délivre déjà les jetons : on ne repasse pas par `signIn`.
	 * En revanche le profil renvoyé est partiel (ni `roles`, ni dates), d'où le
	 * `getMe()` — l'application ne manipule ainsi qu'une seule forme d'`IUser`.
	 */
	const signUp = useCallback(async (input: IRegisterInput) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const { token, refresh_token } = await registerRequest(input);

			setAuthToken(token);
			setRefreshToken(refresh_token);
			setUser(await getMe());

			return true;
		} catch (err) {
			setAuthToken(null);
			setRefreshToken(null);
			setUser(null);
			setError(registerErrorMessage(err));
			console.error("[SessionContext] POST /api/auth/register", err);

			return false;
		} finally {
			setIsSubmitting(false);
		}
	}, []);

	const signOut = useCallback(() => {
		setAuthToken(null);
		setRefreshToken(null);
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
			signUp,
			signOut,
			clearError,
		}),
		[user, isLoading, isSubmitting, error, signIn, signUp, signOut, clearError]
	);

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/** Accès à la session. À préférer à `useContext(SessionContext)` direct. */
export function useSession(): SessionContextType {
	return useContext(SessionContext);
}
