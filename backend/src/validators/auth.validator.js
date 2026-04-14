import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName:  Joi.string().min(2).max(50).required(),
  lastName:   Joi.string().min(2).max(50).required(),
  email:      Joi.string().email().required(),
  password:   Joi.string().min(8).max(128).required(),
  tenantName: Joi.string().min(2).max(100).required(),
});

export const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

export const inviteUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName:  Joi.string().min(2).max(50).required(),
  email:     Joi.string().email().required(),
  role:      Joi.string().valid('admin', 'manager', 'sales').default('sales'),
  password:  Joi.string().min(8).max(128).required(),
});
