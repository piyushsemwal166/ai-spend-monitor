import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT, SORT_ORDERS, type SortOrder } from "@/config/constants";
import type { PaginationMeta, PaginationQuery } from "@/types/api.types";

export interface PaginationOptions {
  defaultSortBy: string;
  allowedSortBy: string[];
}

export function parsePaginationQuery(query: PaginationQuery, options: PaginationOptions) {
  const page = Math.max(Number(query.page ?? DEFAULT_PAGE), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);
  const search = query.search?.trim();
  const sortBy = options.allowedSortBy.includes(String(query.sortBy ?? options.defaultSortBy))
    ? String(query.sortBy ?? options.defaultSortBy)
    : options.defaultSortBy;
  const sortOrder = SORT_ORDERS.includes(String(query.sortOrder ?? "desc") as SortOrder)
    ? (String(query.sortOrder ?? "desc") as SortOrder)
    : "desc";

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    search,
    sortBy,
    sortOrder,
  };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}