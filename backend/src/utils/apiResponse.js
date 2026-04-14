export const ok = (res, data = {}, message = 'Success', meta = {}) =>
  res.status(200).json({
    success: true,
    message,
    data,
    ...(Object.keys(meta).length && { meta }),
  });

export const created = (res, data = {}, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

export const paginated = (res, data, total, page, limit, message = 'Success') =>
  res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });

export const error = (res, message = 'Error', statusCode = 500, errors = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
