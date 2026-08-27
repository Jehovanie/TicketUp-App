import { client } from "./client";
import { ICategory } from "@/_core/model/ICategory";
import { IApiEnvelope, IPaginatedData, IPaginationParams } from "@/_core/model/IApiResponse";

/** Plafond imposé par `GetCategoriesController` : `min(50, max(1, itemsPerPage))`. */
export const CATEGORIES_MAX_ITEMS_PER_PAGE = 50;

/** Garde-fou : évite une boucle infinie si `itemsTotal` est incohérent. */
const MAX_PAGES = 10;

/** `GET /api/categories` — liste paginée, triée par `name` ASC (groupe `category:lists`). */
export async function getCategories({
	page = 1,
	itemsPerPage = CATEGORIES_MAX_ITEMS_PER_PAGE,
}: IPaginationParams = {}): Promise<IPaginatedData<ICategory>> {
	const response = await client.get<IApiEnvelope<IPaginatedData<ICategory>>>("/api/categories", {
		query: { page, itemsPerPage: Math.min(itemsPerPage, CATEGORIES_MAX_ITEMS_PER_PAGE) },
	});

	return response.data.data;
}

/**
 * Récupère toutes les catégories en enchaînant les pages.
 *
 * L'API pagine à 50 maximum alors que l'UI (filtres) a besoin de la liste complète ;
 * les catégories sont une petite table de référence, le coût reste marginal.
 */
export async function getAllCategories(): Promise<{ items: ICategory[]; itemsTotal: number }> {
	const first = await getCategories({ page: 1 });
	const items = [...first.items];

	const totalPages = Math.min(Math.ceil(first.itemsTotal / first.nombreParPage), MAX_PAGES);

	for (let page = 2; page <= totalPages; page++) {
		const next = await getCategories({ page });
		items.push(...next.items);
	}

	return { items, itemsTotal: first.itemsTotal };
}
