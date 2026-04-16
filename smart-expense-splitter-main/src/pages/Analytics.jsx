import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getSpendingByCategory, getSpendingOverTime, getSpendingByMember, formatCurrency } from '../utils/calculations';
import { getCategoryColor, getCategoryIcon } from '../utils/ai';
import { getAvatarColor } from '../utils/helpers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { FiPieChart } from 'react-icons/fi';
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

// Chart.js defaults
ChartJS.defaults.color = '#9ca3af';
ChartJS.defaults.borderColor = 'rgba(255,255,255,0.06)';
ChartJS.defaults.font.family = "'Inter', sans-serif";

export default function Analytics() {
  const { groups, expenses } = useApp();
  const [selectedGroup, setSelectedGroup] = useState('all');

  const filteredExpenses = useMemo(() => {
    if (selectedGroup === 'all') return expenses;
    return expenses.filter(e => e.groupId === selectedGroup);
  }, [expenses, selectedGroup]);

  const selectedGroupObj = groups.find(g => g.id === selectedGroup);
  const allMembers = useMemo(() => {
    if (selectedGroup === 'all') return [...new Set(groups.flatMap(g => g.members))];
    return selectedGroupObj ? selectedGroupObj.members : [];
  }, [groups, selectedGroup, selectedGroupObj]);

  // Category data
  const categoryData = useMemo(() => getSpendingByCategory(filteredExpenses), [filteredExpenses]);
  const categoryLabels = Object.keys(categoryData);
  const categoryValues = Object.values(categoryData);
  const categoryColors = categoryLabels.map(c => getCategoryColor(c));

  const doughnutData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryValues,
      backgroundColor: categoryColors.map(c => c + '40'),
      borderColor: categoryColors,
      borderWidth: 2,
      hoverOffset: 8,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18, 18, 26, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { weight: '700' },
        callbacks: {
          label: (ctx) => ` ₹${ctx.raw.toFixed(2)}`,
        }
      }
    }
  };

  // Monthly spending
  const monthlyData = useMemo(() => getSpendingOverTime(filteredExpenses), [filteredExpenses]);
  const monthLabels = Object.keys(monthlyData).map(k => {
    const [y, m] = k.split('-');
    const date = new Date(y, parseInt(m) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });

  const lineData = {
    labels: monthLabels,
    datasets: [{
      label: 'Spending',
      data: Object.values(monthlyData),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18, 18, 26, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => ` ₹${ctx.raw.toFixed(2)}`,
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { callback: (v) => `₹${v}` }
      },
      x: {
        grid: { display: false },
      }
    }
  };

  // Member spending
  const memberData = useMemo(() => getSpendingByMember(filteredExpenses, allMembers), [filteredExpenses, allMembers]);

  const barData = {
    labels: allMembers,
    datasets: [
      {
        label: 'Paid',
        data: allMembers.map(m => memberData.spendingPaid[m] || 0),
        backgroundColor: allMembers.map(m => getAvatarColor(m) + '60'),
        borderColor: allMembers.map(m => getAvatarColor(m)),
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Owed',
        data: allMembers.map(m => memberData.spendingOwed[m] || 0),
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderColor: '#06b6d4',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, pointStyle: 'circle' }
      },
      tooltip: {
        backgroundColor: 'rgba(18, 18, 26, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.raw.toFixed(2)}`,
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { callback: (v) => `₹${v}` }
      },
      x: {
        grid: { display: false },
      }
    }
  };

  const totalSpent = filteredExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div className="analytics-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiPieChart style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Analytics
          </h1>
          <p className="page-subtitle">Detailed spending breakdown and visualizations</p>
        </div>
        <select
          className="form-select"
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="all">All Groups</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No data to analyze</div>
            <div className="empty-state-text">Add expenses to see analytics and charts</div>
          </div>
        </div>
      ) : (
        <>
          <div className="analytics-grid">
            {/* Category Doughnut */}
            <div className="glass-card">
              <h2 className="card-title" style={{ marginBottom: '20px' }}>Spending by Category</h2>
              <div className="chart-container" style={{ height: '280px' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="category-legend">
                {categoryLabels.map((cat, i) => (
                  <div key={cat} className="legend-item">
                    <div className="legend-color" style={{ background: categoryColors[i] }} />
                    <span className="legend-icon">{getCategoryIcon(cat)}</span>
                    <span className="legend-label">{cat}</span>
                    <span className="legend-value">{formatCurrency(categoryValues[i])}</span>
                    <span className="legend-pct">
                      {((categoryValues[i] / totalSpent) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Spending */}
            <div className="glass-card">
              <h2 className="card-title" style={{ marginBottom: '20px' }}>Spending Over Time</h2>
              <div className="chart-container" style={{ height: '320px' }}>
                {monthLabels.length > 0 ? (
                  <Line data={lineData} options={lineOptions} />
                ) : (
                  <div className="empty-state" style={{ padding: '40px 0' }}>
                    <div className="empty-state-text">Not enough data for time chart</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Member Spending */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h2 className="card-title" style={{ marginBottom: '20px' }}>Spending by Member</h2>
            <div className="chart-container" style={{ height: '320px' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="analytics-quick-stats">
            <div className="quick-stat glass-card">
              <div className="quick-stat-label">Total Spent</div>
              <div className="quick-stat-value">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="quick-stat glass-card">
              <div className="quick-stat-label">Total Expenses</div>
              <div className="quick-stat-value">{filteredExpenses.length}</div>
            </div>
            <div className="quick-stat glass-card">
              <div className="quick-stat-label">Avg per Expense</div>
              <div className="quick-stat-value">{formatCurrency(totalSpent / filteredExpenses.length)}</div>
            </div>
            <div className="quick-stat glass-card">
              <div className="quick-stat-label">Categories Used</div>
              <div className="quick-stat-value">{categoryLabels.length}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
