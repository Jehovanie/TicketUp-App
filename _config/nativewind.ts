import { cssInterop } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Composants tiers stylés par `className`.
 *
 * NativeWind ne traduit `className` en `style` que pour les composants qu'il
 * connaît (ceux de React Native). `LinearGradient` lui passe le prop tel quel
 * jusqu'à sa `View` interne, qui l'ignore : depuis le SDK 58, padding,
 * `flex-row` et arrondis posés sur un dégradé disparaissaient sans erreur.
 *
 * Importé une fois, en tête de `app/_layout.tsx`, avant tout rendu.
 */
cssInterop(LinearGradient, { className: "style" });
