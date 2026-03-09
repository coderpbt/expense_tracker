import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Deposit, Expense, Loan, User, Category } from '@/db/schema/models';

function parseDateRange(url) {
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  const filter = {};
  if (start || end) {
    filter.date = {};
    if (start) filter.date.$gte = new Date(start);
    if (end) filter.date.$lte = new Date(end);
  }
  return filter;
}

export async function GET(req) {
  await dbConnect();
  const url = new URL(req.url);
  const rangeFilter = parseDateRange(url);

  // Deposits
  const depositMatch = rangeFilter.date ? { date: rangeFilter.date } : {};
  const depositAgg = await Deposit.aggregate([
    { $match: depositMatch },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalDeposit = depositAgg[0]?.total || 0;

  // Expenses
  const expenseMatch = rangeFilter.date ? { date: rangeFilter.date } : {};
  const expenseAgg = await Expense.aggregate([
    { $match: expenseMatch },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalExpense = expenseAgg[0]?.total || 0;

  // Loans
  const loanMatch = rangeFilter.date ? { date: rangeFilter.date } : {};
  const loans = await Loan.find(loanMatch).lean();
  const loansTaken = loans.filter((l) => l.type === 'taken').reduce((s, l) => s + (l.amount || 0), 0);
  const loansRepaid = loans.filter((l) => l.type === 'repaid').reduce((s, l) => s + (l.amount || 0), 0);

  // User-wise deposits
  const userDeposits = await Deposit.aggregate([
    { $match: depositMatch },
    { $group: { _id: '$userId', total: { $sum: '$amount' } } }
  ]);
  // populate usernames
  const userDepositMap = {};
  for (const ud of userDeposits) {
    const u = await User.findById(ud._id).lean();
    userDepositMap[u?.username || ud._id] = ud.total;
  }

  // User-wise expenses
  const userExpenses = await Expense.aggregate([
    { $match: expenseMatch },
    { $group: { _id: '$userId', total: { $sum: '$amount' } } }
  ]);
  const userExpenseMap = {};
  for (const ue of userExpenses) {
    const u = await User.findById(ue._id).lean();
    userExpenseMap[u?.username || ue._id] = ue.total;
  }

  // Category-wise expense summary
  const catAgg = await Expense.aggregate([
    { $match: expenseMatch },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } }
  ]);
  const categoryMap = {};
  for (const c of catAgg) {
    const cat = await Category.findById(c._id).lean();
    categoryMap[cat?.name || c._id] = c.total;
  }

  const remainingBalance = totalDeposit + loansTaken - loansRepaid - totalExpense;

  return NextResponse.json({
    totalDeposit,
    totalExpense,
    loansTaken,
    loansRepaid,
    remainingBalance,
    userDepositMap,
    userExpenseMap,
    categoryMap
  });
}
