# Home Expense Tracker

A full-stack web application for managing household income deposits and daily expenses built with Next.js (App Router), MongoDB, Mongoose, and Tailwind CSS.

## Features

- **Authentication**: Hardcoded users (arafat, arif, baba) with simple login/logout
- **Deposit Management**: Add, edit, delete income entries with user-wise tracking
- **Expense Management**: Categorized expense tracking with full CRUD operations
- **Category Management**: Create and manage expense categories
- **Loan Tracking**: Track loans taken and repaid separately from expenses
- **Dashboard**: View summary cards (total deposit, expense, remaining balance)
- **Filters**: Filter by date range (today, this week, this month, this year, custom)
- **Audit Log**: Track all changes with user and action details
- **PDF Export**: Export expenses to PDF
- **Mobile Responsive**: Works on all device sizes
- **Dark Mode**: Built-in dark/light theme support
- **Toast Notifications**: User feedback for all operations

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB
- **ODM**: Mongoose 9
- **PDF Export**: PDFKit

## Prerequisites

- Node.js 18+
- MongoDB instance (local or cloud)
- npm or yarn

## Installation

1. Navigate to project directory:

```bash
cd expense_tracker
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/expense_track
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Replace MongoDB URI with your connection string.

## Quick Start

### 1. Start Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### 2. Seed Hardcoded Users

Visit `http://localhost:3000/api/seed`

This creates three users:
- **arafat** / password: `112233` (admin - can edit/delete deposits)
- **arif** / password: `123`
- **baba** / password: `123`

### 3. Login

Go to `http://localhost:3000/login` and use credentials above

### 4. Navigate Using Sidebar

- **Dashboard**: Summary and user-wise totals
- **Deposits**: Income entries
- **Expenses**: Categorized spending
- **Categories**: Manage expense categories
- **Loans**: Track borrowed/repaid amounts
- **Reports**: View summaries and export PDF
- **Audit Log**: Activity history
- **Settings**: User settings

## Database Schema

### Users
```
{ username: String, password: String, role: String, timestamps }
```

### Deposits
```
{ userId: ObjectId, amount: Number, note: String, date: Date, timestamps }
```

### Categories
```
{ name: String, timestamps }
```

### Expenses
```
{ userId: ObjectId, categoryId: ObjectId, amount: Number, description: String, date: Date, timestamps }
```

### Loans
```
{ userId: ObjectId, amount: Number, type: "taken"|"repaid", date: Date, note: String, timestamps }
```

### Audit Logs
```
{ action: String, model: String, documentId: ObjectId, userId: ObjectId, changes: Object, timestamps }
```

## Business Logic

**Balance = Total Deposits + Loans Taken - Loans Repaid - Total Expenses**

- All calculations are dynamic (no stored totals)
- Loan Taken increases balance
- Loan Repaid decreases balance
- Each transaction is immutable; edits create new versions

## Permissions

| Action | arafat | Creator | Other Users |
|--------|--------|---------|-------------|
| Edit Deposit | ✓ | ✗ | ✗ |
| Delete Deposit | ✓ | ✗ | ✗ |
| Edit Expense | ✓ | ✓ | ✗ |
| Delete Expense | ✓ | ✓ | ✗ |
| View All | ✓ | ✓ | ✓ |

## Pages & Components

### Pages
- `/login` - Authentication
- `/dashboard` - Summary overview
- `/deposits` - Income CRUD
- `/expenses` - Expense CRUD
- `/categories` - Category management
- `/loans` - Loan tracking
- `/reports` - Analytics
- `/audit` - Activity log

### Components
- `Sidebar.js` - Navigation
- `Header.js` - User & logout
- `ToastProvider.js` - Notifications
- `Filters.js` - Date & category filtering

## License

MIT

