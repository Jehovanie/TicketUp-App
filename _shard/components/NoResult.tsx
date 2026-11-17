import EmptyState from "@/_shard/components/EmptyState";

/**
 * Conservé pour les écrans qui l'importent déjà (`explore`) ; l'état vide réel
 * est rendu par `EmptyState`.
 *
 * L'ancienne version peignait son titre en `font-rubik-bold`, une famille
 * absente de la configuration Tailwind depuis le passage à Poppins : la classe
 * n'était jamais générée et le texte retombait sur la police système.
 */
const NoResults = () => <EmptyState variant="search" />;

export default NoResults;
