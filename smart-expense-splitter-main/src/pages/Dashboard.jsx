import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { calculateBalances, calculateDebts, formatCurrency } from '../utils/calculations';
import { getCategoryIcon } from '../utils/ai';
import { getAvatarColor, getInitials, formatDate } from '../utils/helpers';
import { FiUsers, FiDollarSign, FiTrendingUp, FiArrowRight, FiPlus, FiZap } from 'react-icons/fi';
import './Dashboard.css';

export default function Dashboard() {
  const { groups, expenses } = useApp();
  const navigate = useNavigate();

  // Compute global stats
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalGroups = groups.length;
  const totalMembers = new Set(groups.flatMap(g => g.members)).size;

  // Compute all settlements
  const allSettlements = [];
  groups.forEach(group => {
    const groupExpenses = expenses.filter(e => e.groupId === group.id);
    if (groupExpenses.length > 0) {
      const balances = calculateBalances(groupExpenses, group.members);
      const debts = calculateDebts(balances);
      debts.forEach(d => allSettlements.push({ ...d, groupName: group.name, groupId: group.id }));
    }
  });

  // Recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="dashboard animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of all your shared expenses</p>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card animate-fadeInUp stagger-1">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <FiDollarSign />
          </div>
          <div className="stat-value">{formatCurrency(totalExpenses)}</div>
          <div className="stat-label">Total Expenses</div>
        </div>
        <div className="stat-card animate-fadeInUp stagger-2">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <FiUsers />
          </div>
          <div className="stat-value">{totalGroups}</div>
          <div className="stat-label">Active Groups</div>
        </div>
        <div className="stat-card animate-fadeInUp stagger-3">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-value">{totalMembers}</div>
          <div className="stat-label">People Involved</div>
        </div>
        <div className="stat-card animate-fadeInUp stagger-4">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <FiZap />
          </div>
          <div className="stat-value">{allSettlements.length}</div>
          <div className="stat-label">Pending Settlements</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="glass-card dashboard-activity">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            {expenses.length > 0 && (
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/groups')}>
                View All <FiArrowRight />
              </button>
            )}
          </div>
          {recentExpenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No expenses yet</div>
              <div className="empty-state-text">Create a group and start adding expenses</div>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/groups')}>
                <FiPlus /> Create Group
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {recentExpenses.map((expense, index) => {
                const group = groups.find(g => g.id === expense.groupId);
                return (
                  <div
                    key={expense.id}
                    className={`activity-item animate-fadeInUp stagger-${index + 1}`}
                    onClick={() => group && navigate(`/groups/${group.id}`)}
                  >
                    <div className="activity-icon">{getCategoryIcon(expense.category)}</div>
                    <div className="activity-info">
                      <div className="activity-desc">{expense.description}</div>
                      <div className="activity-meta">
                        <span className="activity-group">{group?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDate(expense.createdAt)}</span>
                      </div>
                    </div>
                    <div className="activity-amount">{formatCurrency(expense.amount)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settlements */}
        <div className="glass-card dashboard-settlements">
          <div className="card-header">
            <h2 className="card-title">Pending Settlements</h2>
          </div>
          {allSettlements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">All settled up!</div>
              <div className="empty-state-text">No pending settlements</div>
            </div>
          ) : (
            <div className="settlement-list">
              {allSettlements.slice(0, 6).map((s, i) => (
                <div
                  key={i}
                  className={`settlement-item animate-fadeInUp stagger-${i + 1}`}
                  onClick={() => navigate(`/groups/${s.groupId}`)}
                >
                  <div className="settlement-users">
                    <div
                      className="avatar avatar-sm"
                      style={{ background: getAvatarColor(s.from) }}
                    >
                      {getInitials(s.from)}
                    </div>
                    <div className="settlement-arrow">→</div>
                    <div
                      className="avatar avatar-sm"
                      style={{ background: getAvatarColor(s.to) }}
                    >
                      {getInitials(s.to)}
                    </div>
                  </div>
                  <div className="settlement-info">
                    <div className="settlement-names">
                      <span className="text-danger">{s.from}</span>
                      <span className="text-muted"> pays </span>
                      <span className="text-success">{s.to}</span>
                    </div>
                    <div className="settlement-group-name">{s.groupName}</div>
                  </div>
                  <div className="settlement-amount">{formatCurrency(s.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Groups Overview */}
      {groups.length > 0 && (
        <div className="glass-card groups-overview">
          <div className="card-header">
            <h2 className="card-title">Your Groups</h2>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/groups')}>
              <FiPlus /> New Group
            </button>
          </div>
          <div className="groups-grid">
            {groups.map((group, i) => {
              const groupExpenses = expenses.filter(e => e.groupId === group.id);
              const totalSpent = groupExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
              return (
                <div
                  key={group.id}
                  className={`group-overview-card animate-fadeInUp stagger-${(i % 5) + 1}`}
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="group-overview-header">
                    <h3 className="group-overview-name">{group.name}</h3>
                    <span className="badge badge-info">{group.members.length} members</span>
                  </div>
                  <div className="group-overview-stats">
                    <div className="group-overview-stat">
                      <span className="group-stat-value">{formatCurrency(totalSpent)}</span>
                      <span className="group-stat-label">Total Spent</span>
                    </div>
                    <div className="group-overview-stat">
                      <span className="group-stat-value">{groupExpenses.length}</span>
                      <span className="group-stat-label">Expenses</span>
                    </div>
                  </div>
                  <div className="group-overview-members">
                    {group.members.slice(0, 5).map(member => (
                      <div
                        key={member}
                        className="avatar avatar-sm"
                        style={{ background: getAvatarColor(member) }}
                        title={member}
                      >
                        {getInitials(member)}
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div className="avatar avatar-sm" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}