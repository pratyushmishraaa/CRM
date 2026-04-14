import Contact from './contact.model.js';
import Account from './account.model.js';
import { ok, created, paginated, error } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { buildQuery, applySearch } from '../../utils/queryBuilder.js';
import { audit } from '../../middleware/audit.middleware.js';

// ── Contacts ──────────────────────────────────────────────────────────────────

export const getContacts = asyncHandler(async (req, res) => {
  const { skip, limit, sort, search, filters, page } = buildQuery(req.query);
  let query = Contact.find({ tenantId: req.tenantId, ...filters })
    .populate('account', 'name')
    .populate('owner', 'firstName lastName');
  query = applySearch(query, search, ['firstName', 'lastName', 'email', 'jobTitle', 'studentId']);
  const [contacts, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit),
    Contact.countDocuments({ tenantId: req.tenantId, ...filters }),
  ]);
  paginated(res, { contacts }, total, page, limit);
});

export const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, tenantId: req.tenantId })
    .populate('account', 'name industry')
    .populate('owner', 'firstName lastName email');
  if (!contact) return error(res, 'Contact not found', 404);
  ok(res, { contact });
});

export const createContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create({ ...req.body, tenantId: req.tenantId, createdBy: req.user._id });
  await audit({ user: req.user, tenantId: req.tenantId, action: 'contact.created', resource: 'Contact', resourceId: contact._id, req });
  created(res, { contact }, 'Contact created');
});

export const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!contact) return error(res, 'Contact not found', 404);
  await audit({ user: req.user, tenantId: req.tenantId, action: 'contact.updated', resource: 'Contact', resourceId: contact._id, req });
  ok(res, { contact }, 'Contact updated');
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!contact) return error(res, 'Contact not found', 404);
  ok(res, {}, 'Contact deleted');
});

// ── Accounts ──────────────────────────────────────────────────────────────────

export const getAccounts = asyncHandler(async (req, res) => {
  const { skip, limit, sort, search, filters, page } = buildQuery(req.query);
  let query = Account.find({ tenantId: req.tenantId, ...filters })
    .populate('owner', 'firstName lastName');
  query = applySearch(query, search, ['name', 'industry', 'email']);
  const [accounts, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit),
    Account.countDocuments({ tenantId: req.tenantId, ...filters }),
  ]);
  paginated(res, { accounts }, total, page, limit);
});

export const getAccount = asyncHandler(async (req, res) => {
  const [account, contacts] = await Promise.all([
    Account.findOne({ _id: req.params.id, tenantId: req.tenantId }).populate('owner', 'firstName lastName'),
    Contact.find({ account: req.params.id, tenantId: req.tenantId }).select('firstName lastName email jobTitle type'),
  ]);
  if (!account) return error(res, 'Account not found', 404);
  ok(res, { account, contacts });
});

export const createAccount = asyncHandler(async (req, res) => {
  const account = await Account.create({ ...req.body, tenantId: req.tenantId, createdBy: req.user._id });
  await audit({ user: req.user, tenantId: req.tenantId, action: 'account.created', resource: 'Account', resourceId: account._id, req });
  created(res, { account }, 'Account created');
});

export const updateAccount = asyncHandler(async (req, res) => {
  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!account) return error(res, 'Account not found', 404);
  ok(res, { account }, 'Account updated');
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!account) return error(res, 'Account not found', 404);
  ok(res, {}, 'Account deleted');
});
