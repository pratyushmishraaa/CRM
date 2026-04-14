import { error } from '../utils/apiResponse.js';

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error: err, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (err) {
    const errors = err.details.map((d) => ({
      field:   d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return error(res, 'Validation failed', 422, errors);
  }

  // Remove NaN values that come from empty number inputs
  req[source] = Object.fromEntries(
    Object.entries(value).filter(([, v]) => !(typeof v === 'number' && isNaN(v)))
  );

  next();
};

export default validate;
