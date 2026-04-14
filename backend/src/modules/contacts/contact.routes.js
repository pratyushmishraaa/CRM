import { Router } from 'express';
import {
  getContacts, getContact, createContact, updateContact, deleteContact,
  getAccounts, getAccount, createAccount, updateAccount, deleteAccount,
} from './contact.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { enforceTenant } from '../../middleware/tenant.middleware.js';

const router = Router();
router.use(protect, enforceTenant);

// Contacts
router.get('/contacts', getContacts);
router.post('/contacts', createContact);
router.get('/contacts/:id', getContact);
router.patch('/contacts/:id', updateContact);
router.delete('/contacts/:id', authorize('admin', 'manager'), deleteContact);

// Accounts
router.get('/accounts', getAccounts);
router.post('/accounts', createAccount);
router.get('/accounts/:id', getAccount);
router.patch('/accounts/:id', updateAccount);
router.delete('/accounts/:id', authorize('admin', 'manager'), deleteAccount);

export default router;
