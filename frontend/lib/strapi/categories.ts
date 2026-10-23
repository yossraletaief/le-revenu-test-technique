import 'server-only';
import { strapiGet } from './client';
import { categoriesResponseSchema, Category } from './schemas';

/** Categories change rarely: cached 5 minutes. */
export async function getCategories(): Promise<Category[]> {
  const res = await strapiGet('/categories', categoriesResponseSchema, {
    searchParams: {
      'fields[0]': 'name', 'fields[1]': 'slug', 'fields[2]': 'description',
      sort: 'name:asc', 'pagination[pageSize]': 100,
    },
    revalidate: 300,
    tags: ['categories'],
  });
  return res.data;
}