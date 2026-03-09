import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }
  },
  { timestamps: true }
);

const depositSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    date: { type: Date, required: true }
  },
  { timestamps: true }
);

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }
  },
  { timestamps: true }
);

const expenseSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true }
  },
  { timestamps: true }
);

const loanSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['taken', 'repaid'], required: true },
    date: { type: Date, required: true },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

const auditSchema = new Schema(
  {
    action: { type: String, required: true },
    model: { type: String, required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changes: { type: Object, default: {} }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Deposit = mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
export const Loan = mongoose.models.Loan || mongoose.model('Loan', loanSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);
