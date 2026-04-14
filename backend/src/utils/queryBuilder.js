/**
 * Builds pagination/sort/filter params from req.query.
 * Returns { skip, limit, sort, filters, page }
 */
export const buildQuery = (queryParams) => {
  const { page = 1, limit = 10, sort = '-createdAt', search, ...filters } = queryParams;
  const skip = (Number(page) - 1) * Number(limit);
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
  );
  return { skip, limit: Number(limit), sort, search, filters: cleanFilters, page: Number(page) };
};

export const applySearch = (query, search, fields) => {
  if (!search) return query;
  const regex = new RegExp(search, 'i');
  return query.or(fields.map((f) => ({ [f]: regex })));
};
