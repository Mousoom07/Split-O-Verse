# 💸 Split-O-Verse - Smart Expense Splitter

A modern, AI-powered web application for splitting shared expenses among friends, roommates, and teams. Built with React + Vite and featuring intelligent expense categorization and spending insights.

<img width="259" height="74" alt="image" src="https://github.com/user-attachments/assets/4e844342-6341-4bcb-b52d-91f7d7a1f6f1" />




## 🚀 Live Demo

> Deployed on Vercel - (https://split-o-verse.vercel.app/)

---

## ✨ Features

### Core Features
- **👥 Group Management** - Create and manage multiple expense groups
- **💰 Expense Tracking** - Add expenses with descriptions, amounts, and dates
- **⚖️ Flexible Splitting** - Equal, Custom amount, or Percentage-based splits
- **📊 Real-Time Balances** - Instant balance calculation for all members
- **🔄 Smart Settlements** - Minimized transactions to settle all debts
- **💾 Data Persistence** - All data saved in browser localStorage
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🤖 AI-Powered Features
- **🏷️ Smart Categorization** - Automatically categorizes expenses (Food, Travel, Entertainment, Shopping, etc.) based on descriptions using AI keyword analysis
- **📈 Spending Insights** - AI analyzes spending patterns and provides actionable insights:
  - Weekly spending trend comparison
  - Top spending category analysis
  - Per-person contribution tracking
  - Expense frequency analysis
  - Food spending alerts
- **📊 Analytics Dashboard** - Interactive charts (Doughnut, Line, Bar) for spending visualization

### Additional Features
- **🎨 Premium Dark UI** - Glassmorphism design with smooth animations
- **📤 Export/Import** - Backup and restore data as JSON files
- **🔔 Toast Notifications** - Real-time feedback for all actions
- **🏷️ 9 Expense Categories** - Food, Travel, Entertainment, Shopping, Rent, Utilities, Health, Education, Other

---

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
│   ├── Sidebar.jsx      # Navigation sidebar with mobile drawer
│   ├── Sidebar.css
│   ├── Toast.jsx        # Toast notification system  
│   └── Toast.css
├── context/
│   └── AppContext.jsx   # Global state management (React Context + useReducer)
├── pages/
│   ├── Dashboard.jsx    # Overview dashboard with stats & activity
│   ├── Groups.jsx       # Group listing and creation
│   ├── GroupDetail.jsx  # Group expenses, balances, settlements
│   ├── Insights.jsx     # AI-powered spending insights
│   ├── Analytics.jsx    # Charts and visualizations
│   └── Settings.jsx     # App settings, backup/restore
├── utils/
│   ├── ai.js            # AI categorization & insight generation
│   ├── calculations.js  # Balance & debt calculation engine
│   ├── helpers.js       # Utility functions (formatting, etc.)
│   └── storage.js       # LocalStorage persistence layer
├── App.jsx              # Root component with routing
├── main.jsx             # Application entry point
└── index.css            # Global design system & styles
```

### Design Patterns
- **State Management**: React Context + useReducer pattern for predictable state updates
- **Data Persistence**: localStorage with automatic sync on state changes
- **AI Engine**: Keyword-based scoring algorithm for expense categorization
- **Debt Simplification**: Greedy algorithm for minimum transactions to settle all balances

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Chart.js + react-chartjs-2** | Data visualization |
| **React Icons** | Icon library |
| **UUID** | Unique ID generation |
| **LocalStorage** | Client-side data persistence |

---


## 📱 Usage Guide

### 1. Create a Group
1. Click **"Create Group"** on the Groups page
2. Enter a group name (e.g., "Goa Trip")
3. Add members (minimum 2)
4. Click **Create**

### 2. Add Expenses
1. Navigate to your group
2. Click **"Add Expense"**
3. Enter description - AI will auto-suggest the category
4. Enter amount and select who paid
5. Choose split type:
   - **Equal**: Split evenly among selected members
   - **Custom**: Enter exact amounts for each member
   - **Percentage**: Assign percentage shares
6. Click **Add Expense**

### 3. View Balances & Settlements
- **Balances tab**: See who owes and who gets back
- **Settlements tab**: View optimized transactions to settle all debts

### 4. AI Insights
- Navigate to **AI Insights** page
- View automated spending analysis
- Filter by specific group or view all

### 5. Analytics
- Navigate to **Analytics** page
- View spending by category (Doughnut chart)
- Track spending over time (Line chart)
- Compare member contributions (Bar chart)

---

## 🚀 Deployment

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag & drop the 'dist' folder to Netlify
```

Both `vercel.json` and `netlify.toml` are pre-configured for SPA routing.

---

## 🧠 AI Features - Technical Details

### Smart Categorization
The AI engine uses a weighted keyword matching algorithm:
- Maps expense descriptions against a curated dictionary of 150+ keywords
- Covers 9 categories: Food & Dining, Travel & Transport, Entertainment, Shopping, Rent & Housing, Utilities & Bills, Health & Medical, Education, Other
- Longer keyword matches receive higher confidence scores
- Real-time categorization as you type

### Spending Insights
The insight engine performs multiple analyses:
- **Trend Detection**: Compares current vs previous week spending
- **Category Distribution**: Identifies dominant spending categories
- **Frequency Analysis**: Calculates average expense rate
- **Member Analysis**: Tracks individual contribution patterns
- **Alert System**: Flags unusual spending patterns (e.g., >30% on food)

---


## 👨‍💻 Developer

**Mousoom Samanta**
- GitHub: [@Mousoom07](https://github.com/Mousoom07)
