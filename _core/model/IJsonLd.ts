/**
 * Champs ajoutés uniquement par les endpoints API Platform natifs (JSON-LD / Hydra) :
 * `/api/categories/{id}`, `/api/locations`, `/api/location/{id}`,
 * `/api/organizers`, `/api/organizer/{id}`, `POST /api/events`.
 *
 * Les endpoints à contrôleur personnalisé (`/api/events`, `/api/events/{id}`,
 * `/api/categories`, ...) sérialisent en `json` simple : ces champs y sont ABSENTS.
 */
export interface IJsonLd {
	"@context"?: string;
	"@id"?: string;
	"@type"?: string;
}
