# TicketUp App Mobile

Bienvenue dans le projet **TicketUp App Mobile**.

## Description

TicketUp est une application mobile permettant la gestion et l'achat de tickets pour divers événements. Elle vise à offrir une expérience utilisateur simple et rapide pour réserver, acheter et présenter ses tickets.

## Fonctionnalités principales

- Parcourir la liste des événements disponibles
- Acheter des tickets en ligne
- Gérer ses tickets depuis l'application
- Présenter un ticket numérique à l'entrée

## Technologies utilisées

- React Native V0.76.9
- Expo SDK 52.0.46
- API REST ([voir le dépôt backend](https://github.com/jehovanie/ticketup-api))

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/jehovanie/ticketup-app-mobile.git
   ```
2. Installez les dépendances :
   ```bash
   cd ticketup-app-mobile
   npm install
   ```
3. Configurez l'URL de l'API back-end dans `environment/environement.ts` :
   ```ts
   apiUrl: "http://<VOTRE_IP_LAN>:<PORT>",
   ```
   `localhost` ne fonctionne ni depuis un téléphone ni depuis un émulateur.
   Procédure complète, cas par plateforme et dépannage :
   **[environment/README.md](environment/README.md)**.
4. Lancez l'application :
   ```bash
   npm run start
   ```

# Connexion à l'API back-end

Ce dossier est **le seul point de configuration réseau de l'application**. Tout
ce qui part vers le back-end passe par `_config/api/client.ts`, qui préfixe
chaque appel par `environment.apiUrl` :

```
environment/environement.ts
        ↓  import { environment }
_config/api/client.ts            ← unique wrapper fetch (Authorization, Accept, ApiError)
        ↓
_config/api/{auth,events,categories}.ts   ← un module par ressource
        ↓
_core/context/*  et  écrans app/**
```

Le back-end est un service séparé, **API Platform / Symfony** :
[jehovanie/ticketup-api](https://github.com/jehovanie/ticketup-api). Il doit
tourner de son côté ; l'app ne l'embarque pas.

---

## 1. Contenu du dossier

| Fichier | Rôle | État |
| --- | --- | --- |
| `environement.ts` | **Le seul fichier réellement importé** (par `_config/api/client.ts`). | actif |
| `environement.test.ts` | Palier de test — pointe encore sur `jsonplaceholder.typicode.com`. | non branché |
| `environement.staging.ts` | Palier de recette. | **vide** |
| `environement.prod.ts` | Palier de production. | **vide** |

> ⚠️ Il n'y a **aucun basculement d'environnement au build** pour l'instant :
> aucun alias Babel/Metro, aucun `EXPO_PUBLIC_*`, aucun `app.config.js` ne
> substitue un fichier à l'autre. Changer de palier = éditer
> `environement.ts` à la main. Les trois autres fichiers ne servent qu'à
> conserver les valeurs.

Noter l'orthographe du dossier et des fichiers : `environment/environement.ts`
(« environement », un seul `n`). L'import est donc :

```ts
import { environment } from "@/environment/environement";
```

## 2. Forme attendue

```ts
export const environment = {
	production: false,
	apiUrl: "http://192.168.1.194:8080",
};
```

- `apiUrl` — **origine seule, sans slash final** : `client.ts` concatène
  directement `${environment.apiUrl}${endPoint}` et tous les endpoints
  commencent déjà par `/api/...`. Un `/` final produirait `//api/events`.
- `production` — simple indicateur, aucun code ne le lit aujourd'hui. Il
  deviendra utile pour couper les heuristiques d'erreur décrites au §6.

## 3. Faire pointer l'app sur l'API locale

`localhost` ne fonctionne **pas** depuis un téléphone ni depuis un émulateur :
pour eux, `localhost` désigne l'appareil lui-même, pas votre machine.

1. **Démarrer l'API** dans le dépôt `ticketup-api` (`symfony server:start`,
   `docker compose up`, … selon votre installation) et relever son port —
   `8000` pour le serveur Symfony, `8080` avec la config Docker utilisée ici.

2. **Relever l'IP LAN de votre machine** :

   ```bash
   # macOS
   ipconfig getifaddr en0        # Wi-Fi ; en1 si Ethernet/Thunderbolt

   # Linux
   hostname -I | awk '{print $1}'

   # Windows
   ipconfig                      # « Adresse IPv4 » de l'interface active
   ```

3. **Reporter cette IP** dans `environment/environement.ts` :

   ```ts
   apiUrl: "http://<VOTRE_IP_LAN>:<PORT>",
   ```

4. **Vérifier que l'API écoute bien sur cette IP**, pas seulement sur la boucle
   locale. Un serveur lié à `127.0.0.1` reste invisible du téléphone :

   ```bash
   symfony server:start --listen-ip=0.0.0.0     # Symfony CLI
   php -S 0.0.0.0:8000 -t public                # serveur PHP intégré
   ```

   Côté Docker, exposer `0.0.0.0:8080->80` et non `127.0.0.1:8080->80`.

5. **Contrôler depuis la machine de dev**, puis depuis le navigateur du
   téléphone (même Wi-Fi) :

   ```bash
   curl -i -H "Accept: application/json" http://<VOTRE_IP_LAN>:<PORT>/api/categories
   ```

6. **Relancer Metro** après modification :
   `npm run start -- --clear` (le module d'environnement est figé dans le
   bundle ; un simple Fast Refresh ne suffit pas toujours).

### Cas particuliers par plateforme

| Cible | `apiUrl` |
| --- | --- |
| Appareil physique (Expo Go / dev build) | `http://<IP_LAN>:<PORT>` — appareil et machine sur **le même réseau** |
| Émulateur Android (AVD) | `http://10.0.2.2:<PORT>` (alias de l'hôte) ou l'IP LAN |
| Simulateur iOS | `http://localhost:<PORT>` ou l'IP LAN |
| `npm run web` | `http://localhost:<PORT>` — prévoir le **CORS** côté API (`nelmio_cors`) |
| Tunnel (`expo start --tunnel`) | l'IP LAN ne suffit plus : exposer l'API publiquement (ngrok, Cloudflare Tunnel) et mettre cette URL |

## 4. HTTP en clair

L'API locale est servie en `http://`, sans TLS.

- **Android** : les builds de développement Expo autorisent le trafic en clair,
  mais une build de release le refuse par défaut. Pour un palier de recette
  accessible en HTTP, il faut ajouter `usesCleartextTraffic` via
  `expo-build-properties` dans `app.json` — ou, mieux, servir l'API en HTTPS.
- **iOS** : même logique avec ATS pour une build distribuée.

En production, `apiUrl` doit être en `https://` : cela évite entièrement le
sujet.

## 5. Ce que `client.ts` ajoute à chaque appel

À connaître avant de tester un endpoint à la main :

- **`Accept: application/json`** — sans cet en-tête, les endpoints API Platform
  natifs répondent en JSON-LD (`@context` / `@id` / `@type`). Toujours le
  joindre dans un `curl` de vérification.
- **`Authorization: Bearer <token>`** dès qu'un jeton a été enregistré par
  `setAuthToken()`, sauf option `skipAuth: true` (login, register).
- **`Content-Type: application/json`** et méthode `POST` dès qu'un `body` est
  fourni.
- **`ApiError`** en cas d'échec, porteuse de `status`, `payload`, `url`.
  **`status === 0` signifie que l'appareil n'a jamais atteint l'hôte** : c'est
  la signature d'un `apiUrl` erroné, d'un serveur lié à `127.0.0.1`, d'un
  pare-feu, ou d'un Wi-Fi différent — pas d'une erreur applicative.

### Formats de réponse

Trois formes cohabitent ; les modules de `_config/api/` s'en chargent :

| Forme | Endpoints |
| --- | --- |
| Enveloppe maison `{ message, status, data }` | `/api/events`, `/api/events/{id}`, `/api/categories`, … |
| Objet **à plat**, hors enveloppe | `/api/user/me`, `/api/auth/login`, `/api/auth/register` |
| JSON-LD / Hydra | endpoints API Platform natifs |

Pagination maison : `{ itemsTotal, currentPage, nombreParPage, items }` —
attention, `nombreParPage`, pas `itemsPerPage`. Plafonds : **20** items pour
`/api/events`, **50** pour `/api/categories`.

## 6. Authentification

`_core/context/SessionContext` est la source de vérité unique du couple
connecté / déconnecté.

- `POST /api/auth/login` (`{ email, password }`) → `{ token, refresh_token }`,
  puis `GET /api/user/me` pour le profil complet.
- `POST /api/auth/register` → crée le compte **et** délivre les jetons en un
  appel ; le `user` renvoyé est partiel, le contexte re-lit `getMe()`.

Trois limites en vigueur, à connaître avant de brancher une fonctionnalité
authentifiée :

1. **Le jeton ne vit qu'en mémoire** — ni `expo-secure-store` ni
   `async-storage` n'est installé : la session meurt avec l'app.
2. **Le jeton expire au bout de 15 minutes** (`exp = iat + 900`) et
   `POST /api/auth/refresh` n'est jamais appelé, bien que `refresh_token` soit
   conservé dans le contexte.
3. **L'API répond 500 sur les erreurs métier de `register`** (e-mail déjà pris,
   DTO invalide) ; `registerErrorMessage()` distingue les cas en lisant
   `detail`. Ces heuristiques sont à supprimer le jour où le back renvoie
   409 / 422.

## 7. Vérifier la chaîne complète

```bash
# 1. l'API répond, enveloppe maison attendue
curl -s -H "Accept: application/json" http://<IP>:<PORT>/api/categories | head -c 300

# 2. le login délivre un jeton
curl -s -X POST http://<IP>:<PORT>/api/auth/login \
     -H "Accept: application/json" -H "Content-Type: application/json" \
     -d '{"email":"...","password":"..."}'

# 3. le jeton ouvre bien /api/user/me (réponse à plat)
curl -s http://<IP>:<PORT>/api/user/me \
     -H "Accept: application/json" -H "Authorization: Bearer <TOKEN>"
```

Si les trois passent depuis la machine mais que l'app affiche une erreur
réseau, le problème est entre l'appareil et l'hôte : `apiUrl`, IP d'écoute,
réseau ou pare-feu.

## 8. Dépannage

| Symptôme | Cause probable |
| --- | --- |
| `ApiError` avec `status === 0` | `apiUrl` faux, API liée à `127.0.0.1`, appareil sur un autre réseau, pare-feu |
| Réponse en JSON-LD (`@context`, `@id`) | en-tête `Accept: application/json` manquant (dans un `curl` manuel) |
| `//api/events` dans l'URL | slash final dans `apiUrl` |
| 401 sur `/api/user/me` | jeton absent (mémoire vidée au redémarrage) ou expiré (15 min) |
| 500 à l'inscription | erreur métier renvoyée en 500 par l'API — voir §6.3 |
| Changement d'`apiUrl` sans effet | Metro sert l'ancien bundle : `npm run start -- --clear` |
| Erreur CORS sur `npm run web` | configurer `nelmio_cors` côté API pour l'origine du dev server |

## 9. Note pour l'équipe

`environement.ts` est **suivi par Git** et contient une IP LAN personnelle :
chaque développeur le modifie et risque de committer la sienne. Pour éviter
d'écraser celle des autres :

```bash
git update-index --skip-worktree environment/environement.ts
```

(à annuler avec `--no-skip-worktree` avant toute modification volontaire du
fichier). La solution durable reste de faire lire `apiUrl` depuis une variable
`EXPO_PUBLIC_API_URL` via `app.config.js`, avec repli sur la valeur actuelle.

## Contribution

Les contributions sont les bienvenues ! Veuillez ouvrir une issue ou une pull request.
