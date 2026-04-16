import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { generateInsights } from '../utils/ai';
import { FiZap, FiRefreshCw } from 'react-icons/fi';
import './Insights.css';

export default function Insights() {
  const { groups, expenses } = useApp();
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredExpenses = useMemo(() => {
    if (selectedGroup === 'all') return expenses;
    return expenses.filter(e => e.groupId === selectedGroup);
  }, [expenses, selectedGroup]);

  const allMembers = useMemo(() => {
    if (selectedGroup === 'all') {
      return [...new Set(groups.flatMap(g => g.members))];
    }
    const group = groups.find(g => g.id === selectedGroup);
    return group ? group.members : [];
  }, [groups, selectedGroup]);

  const insights = useMemo(() => {
    return generateInsights(filteredExpenses, allMembers);
    // eslint-disable-next-line
  }, [filteredExpenses, allMembers, refreshKey]);

  const severityIcons = {
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className="insights-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiZap style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            AI Insights
          </h1>
          <p className="page-subtitle">Smart spending analysis powered by AI</p>
        </div>
        <div className="insights-controls">
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
          <button
            className="btn btn-secondary"
            onClick={() => setRefreshKey(k => k + 1)}
            title="Refresh insights"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* AI Banner */}
      <div className="ai-banner glass-card">
        <div className="ai-banner-icon">🤖</div>
        <div className="ai-banner-content">
          <h2 className="ai-banner-title">Intelligent Expense Analysis</h2>
          <p className="ai-banner-text">
            Our AI analyzes your spending patterns, categorizes expenses automatically, 
            and provides actionable insights to help you manage finances better.
          </p>
        </div>
        <div className="ai-banner-features">
          <div className="ai-feature">
            <span className="ai-feature-icon">🏷️</span>
            <span>Auto Categorization</span>
          </div>
          <div className="ai-feature">
            <span className="ai-feature-icon">📊</span>
            <span>Trend Analysis</span>
          </div>
          <div className="ai-feature">
            <span className="ai-feature-icon">💡</span>
            <span>Smart Suggestions</span>
          </div>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">🧠</div>
            <div className="empty-state-title">No insights available</div>
            <div className="empty-state-text">
              Add some expenses to get AI-powered spending insights
            </div>
          </div>
        </div>
      ) : (
        <div className="insights-grid">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`insight-card glass-card insight-${insight.severity} animate-fadeInUp stagger-${(i % 5) + 1}`}
            >
              <div className="insight-header">
                <span className="insight-icon">{insight.icon}</span>
                <span className="insight-severity">{severityIcons[insight.severity]}</span>
              </div>
              <h3 className="insight-title">{insight.title}</h3>
              <p className="insight-message">{insight.message}</p>
              <div className="insight-type-badge">{insight.type}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Capabilities */}
      <div className="glass-card ai-capabilities">
        <h2 className="card-title" style={{ marginBottom: '20px' }}>🔮 AI Capabilities</h2>
        <div className="capabilities-grid">
          <div className="capability-item">
            <div className="capability-icon">🏷️</div>
            <h3 className="capability-title">Smart Categorization</h3>
            <p className="capability-desc">
              Automatically categorizes expenses into Food, Travel, Entertainment, Shopping, and more 
              based on the description. Uses keyword matching with weighted scoring.
            </p>
          </div>
          <div className="capability-item">
            <div className="capability-icon">📈</div>
            <h3 className="capability-title">Spending Trends</h3>
            <p className="capability-desc">
              Compares weekly spending to identify trends and alert you when spending increases 
              significantly compared to previous periods.
            </p>
          </div>
          <div className="capability-item">
            <div className="capability-icon">👤</div>
            <h3 className="capability-title">Contributor Analysis</h3>
            <p className="capability-desc">
              Identifies top contributors, tracks individual spending patterns, 
              and highlights who's paying the most.
            </p>
          </div>
          <div className="capability-item">
            <div className="capability-icon">⚡</div>
            <h3 className="capability-title">Activity Insights</h3>
            <p className="capability-desc">
              Analyzes expense frequency, average amounts, and spending distribution 
              to give you a complete picture of group finances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
