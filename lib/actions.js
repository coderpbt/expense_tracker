'use server';

import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Category, User, Expense, AuditLog, Deposit, Loan } from '@/db/schema/models';
import { cookies } from 'next/headers';

async function getRequestUser() {
  const c = await cookies();
  const cookie = c.get('expense_user')?.value;
  if (!cookie) return null;
  try {
    return JSON.parse(cookie);
  } catch (e) {
    return null;
  }
}

export async function createCategory(name, userId) {
  await dbConnect();
  const exists = await Category.findOne({ name }).lean();
  if (exists) throw new Error('Category exists');

  const cat = await Category.create({ name });
  try {
    if (userId) await AuditLog.create({ action: 'create', model: 'Category', documentId: cat._id, userId });
  } catch (e) {
    console.error('audit error', e);
  }
  return JSON.parse(JSON.stringify(cat));
}

export async function createDeposit(userId, amount, note, date) {
  await dbConnect();
  const user = await getRequestUser();
  if (!user) throw new Error('Unauthorized');

  const doc = await Deposit.create({ userId, amount: Number(amount), note: note || '', date: new Date(date) });
  try {
    await AuditLog.create({ action: 'create', model: 'Deposit', documentId: doc._id, userId, changes: { amount: doc.amount, note: doc.note } });
  } catch (e) {
    console.error('audit error', e);
  }
  return JSON.parse(JSON.stringify(doc));
}

export async function updateDeposit(id, { amount, note, date }) {
  await dbConnect();
  const user = await getRequestUser();
  if (!user || user.username !== 'arafat') throw new Error('Forbidden');

  const updated = await Deposit.findByIdAndUpdate(
    id,
    { ...(amount !== undefined ? { amount } : {}), ...(note !== undefined ? { note } : {}), ...(date ? { date: new Date(date) } : {}) },
    { new: true }
  );
  try {
    await AuditLog.create({ action: 'update', model: 'Deposit', documentId: updated._id, userId: user.id, changes: { amount: updated.amount, note: updated.note } });
  } catch (e) {
    console.error('audit error', e);
  }
  return JSON.parse(JSON.stringify(updated));
}
 

export async function deleteDeposit(id) {
  await dbConnect();
  const user = await getRequestUser();
  if (!user || user.username !== 'arafat') throw new Error('Forbidden');

  await Deposit.findByIdAndDelete(id);
  try {
    await AuditLog.create({ action: 'delete', model: 'Deposit', documentId: id, userId: user.id });
  } catch (e) {
    console.error('audit error', e);
  }
}

export async function createExpense(userId, categoryId, amount, description, date) {
  await dbConnect();
  const user = await getRequestUser();
  if (!user) throw new Error('Unauthorized');

  const doc = await Expense.create({ userId, categoryId, amount: Number(amount), description: description || '', date: new Date(date) });
  try {
    await AuditLog.create({ action: 'create', model: 'Expense', documentId: doc._id, userId });
  } catch (e) {
    console.error('audit error', e);
  }
  return JSON.parse(JSON.stringify(doc));
}

export async function updateExpense(id, { amount, description, date, categoryId }) {
  await dbConnect();
  const user = await getRequestUser();
  if (!user) throw new Error('Unauthorized');

  const existing = await Expense.findById(id);
  if (!existing) throw new Error('Not found');
  if (String(existing.userId) !== user.id && user.username !== 'arafat') throw new Error('Forbidden');

  if (amount !== undefined) existing.amount = amount;
  if (description !== undefined) existing.description = description;
  if (date) existing.date = new Date(date);
  if (categoryId) existing.categoryId = categoryId;

  await existing.save();
  try {
    await AuditLog.create({ action: 'update', model: 'Expense', documentId: existing._id, userId: user.id, changes: { amount: existing.amount, description: existing.description } });
  } catch (e) {
    console.error('audit error', e);
  }
  return JSON.parse(JSON.stringify(existing));
}

export async function deleteExpense(id) {
  await dbConnect();
  const user = await getRequestUser();
  if (!user) throw new Error('Unauthorized');

  const existing = await Expense.findById(id);
  if (!existing) throw new Error('Not found');
  if (String(existing.userId) !== user.id && user.username !== 'arafat') throw new Error('Forbidden');

  await Expense.findByIdAndDelete(id);
  try {
    await AuditLog.create({ action: 'delete', model: 'Expense', documentId: id, userId: user.id });
  } catch (e) {
    console.error('audit error', e);
  }
}

export async function createLoan(userId, amount, type, date, note) {
  await dbConnect();
  const user = await getRequestUser();
  if (!user) throw new Error('Unauthorized');

  const doc = await Loan.create({ userId, amount: Number(amount), type, date: new Date(date), note: note || '' });
  try {
    if (userId) await AuditLog.create({ action: 'create', model: 'Loan', documentId: doc._id, userId });
  } catch (e) {
    console.error('audit error', e);
  }
  return JSON.parse(JSON.stringify(doc));
}

export async function deleteLoan(id) {
  await dbConnect();
  await Loan.findByIdAndDelete(id);
  try {
    await AuditLog.create({ action: 'delete', model: 'Loan', documentId: id });
  } catch (e) {
    console.error('audit error', e);
  }
}

export async function getUsers() {
  await dbConnect();
  const users = await User.find({}, { username: 1 }).lean();
  return users.map(u => ({ _id: u._id.toString(), username: u.username }));
}

export async function getCategories() {
  await dbConnect();
  const cats = await Category.find({}, { name: 1 }).sort({ name: 1 }).lean();
  return cats.map(c => ({ _id: c._id.toString(), name: c.name }));
}

export async function getSummary(startDate, endDate) {
  await dbConnect();
  const rangeFilter = {};
  if (startDate || endDate) {
    rangeFilter.date = {};
    if (startDate) rangeFilter.date.$gte = new Date(startDate);
    if (endDate) rangeFilter.date.$lte = new Date(endDate);
  }

  // Deposits
  const depositAgg = await Deposit.aggregate([
    { $match: rangeFilter },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalDeposit = depositAgg[0]?.total || 0;

  // Expenses
  const expenseAgg = await Expense.aggregate([
    { $match: rangeFilter },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalExpense = expenseAgg[0]?.total || 0;

  // Loans
  const loans = await Loan.find(rangeFilter).lean();
  const loansTaken = loans.filter((l) => l.type === 'taken').reduce((s, l) => s + (l.amount || 0), 0);
  const loansRepaid = loans.filter((l) => l.type === 'repaid').reduce((s, l) => s + (l.amount || 0), 0);

  // User-wise deposits
  const userDeposits = await Deposit.aggregate([
    { $match: rangeFilter },
    { $group: { _id: '$userId', total: { $sum: '$amount' } } }
  ]);
  const userDepositMap = {};
  for (const ud of userDeposits) {
    const u = await User.findById(ud._id).lean();
    userDepositMap[u?.username || ud._id] = ud.total;
  }

  // User-wise expenses
  const userExpenses = await Expense.aggregate([
    { $match: rangeFilter },
    { $group: { _id: '$userId', total: { $sum: '$amount' } } }
  ]);
  const userExpenseMap = {};
  for (const ue of userExpenses) {
    const u = await User.findById(ue._id).lean();
    userExpenseMap[u?.username || ue._id] = ue.total;
  }

  // Category-wise expense summary
  const catAgg = await Expense.aggregate([
    { $match: rangeFilter },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } }
  ]);
  const categoryMap = {};
  for (const c of catAgg) {
    const cat = await Category.findById(c._id).lean();
    categoryMap[cat?.name || c._id] = c.total;
  }

  const remainingBalance = totalDeposit + loansTaken - loansRepaid - totalExpense;

  return {
    totalDeposit,
    totalExpense,
    loansTaken,
    loansRepaid,
    remainingBalance,
    userDepositMap,
    userExpenseMap,
    categoryMap
  };
}
