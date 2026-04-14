import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from './user.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { enforceTenant } from '../../middleware/tenant.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { inviteUserSchema } from '../../validators/auth.validator.js';

const router = Router();
router.use(protect, enforceTenant);

router.get('/', authorize('admin', 'manager'), getUsers);
router.post('/', authorize('admin'), validate(inviteUserSchema), createUser);
router.get('/:id', getUser);
router.patch('/:id', authorize('admin', 'manager'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
