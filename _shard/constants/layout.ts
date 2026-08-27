/**
 * Constantes de gabarit partagées entre le navigateur et les écrans.
 *
 * La barre d'onglets est en `position: "absolute"` : le contenu défile dessous,
 * et chaque liste doit réserver sa propre garde en bas.
 *
 * ⚠️ React Navigation ne *mesure* pas la barre : il lit `tabBarStyle.height`,
 * et retombe sur sa hauteur par défaut (49) quand celle-ci n'est pas un nombre.
 * Déclarer un `minHeight` ne suffit donc pas — la hauteur annoncée par
 * `BottomTabBarHeightContext` serait fausse, et toutes les listes calculeraient
 * leur garde sur une barre plus courte que la réalité. D'où cette constante,
 * posée en `height` explicite dans `(tabs)/_layout.tsx`.
 */

/** Hauteur de la barre d'onglets, hors safe area basse. */
export const TAB_BAR_HEIGHT = 70;

/** Respiration entre le dernier élément d'une liste et la barre d'onglets. */
export const LIST_BOTTOM_GUTTER = 24;
