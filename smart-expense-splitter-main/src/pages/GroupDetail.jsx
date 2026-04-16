import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateBalances, calculateDebts, formatCurrency } from '../utils/calculations';
import { categorizeExpense, getCategories, getCategoryIcon, getCategoryColor } from '../utils/ai';
import { getAvatarColor, getInitials, formatDate, getTodayDate } from '../utils/helpers';
import {
  FiPlus, FiX, FiArrowLeft, FiTrash2, FiDollarSign,
  FiUsers, FiTrendingUp, FiCheckCircle, FiEdit2
} from 'react-icons/fi';
import './GroupDetail.css';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, expenses, addExpense, deleteExpense, updateGroup } = useApp();

  const group = groups.find(g => g.id === id);
  const groupExpenses = useMemo(
    () => expenses.filter(e => e.groupId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [expenses, id]
  );

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  // Expense form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [category, setCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayDate());

  // Add member state
  const [newMemberName, setNewMemberName] = useState('');

  if (!group) {
    return (
      <div className="group-detail animate-fadeIn">
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Group not found</div>
            <button className="btn btn-primary" onClick={() => navigate('/groups')} style={{ marginTop: 16 }}>
              <FiArrowLeft /> Back to Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  const balances = calculateBalances(groupExpenses, group.members);
  const debts = calculateDebts(balances);
  const totalSpent = groupExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setPaidBy('');
    setSplitType('equal');
    setSelectedMembers([]);
    setCustomSplits({});
    setPercentageSplits({});
    setCategory('');
    setExpenseDate(getTodayDate());
  };

  const openExpenseModal = () => {
    resetForm();
    setPaidBy(group.members[0] || '');
    setSelectedMembers([...group.members]);
    const initialCustom = {};
    const initialPct = {};
    group.members.forEach(m => {
      initialCustom[m] = '';
      initialPct[m] = (100 / group.members.length).toFixed(1);
    });
    setCustomSplits(initialCustom);
    setPercentageSplits(initialPct);
    setShowExpenseModal(true);
  };

  const handleDescriptionChange = (val) => {
    setDescription(val);
    if (val.length > 2) {
      const auto = categorizeExpense(val);
      if (auto !== 'Other') setCategory(auto);
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || !paidBy) return;

    const expenseData = {
      groupId: id,
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitType,
      splits: splitType === 'equal' ? selectedMembers : group.members,
      customSplits: splitType === 'custom' ? customSplits : {},
      percentageSplits: splitType === 'percentage' ? percentageSplits : {},
      category: category || categorizeExpense(description),
      date: expenseDate,
    };

    // Validation for custom splits
    if (splitType === 'custom') {
      const totalCustom = Object.values(customSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0);
      if (Math.abs(totalCustom - parseFloat(amount)) > 0.01) {
        alert(`Custom split total (₹${totalCustom.toFixed(2)}) doesn't match expense amount (₹${parseFloat(amount).toFixed(2)})`);
        return;
      }
    }

    if (splitType === 'percentage') {
      const totalPct = Object.values(percentageSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0);
      if (Math.abs(totalPct - 100) > 0.1) {
        alert(`Percentages must add up to 100% (currently ${totalPct.toFixed(1)}%)`);
        return;
      }
    }

    addExpense(expenseData);
    setShowExpenseModal(false);
    resetForm();
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    const name = newMemberName.trim();
    if (name && !group.members.includes(name)) {
      updateGroup({ ...group, members: [...group.members, name] });
      setNewMemberName('');
      setShowMemberModal(false);
    }
  };

  const toggleMemberSelection = (member) => {
    setSelectedMembers(prev =>
      prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]
    );
  };

  return (
    <div className="group-detail animate-fadeIn">
      {/* Header */}
      <div className="detail-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/groups')}>
          <FiArrowLeft /> Back
        </button>
        <div className="detail-header-info">
          <h1 className="page-title">{group.name}</h1>
          <p className="page-subtitle">{group.members.length} members • {groupExpenses.length} expenses</p>
        </div>
        <div className="detail-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
            <FiUsers /> Add Member
          </button>
          <button className="btn btn-primary" onClick={openExpenseModal}>
            <FiPlus /> Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <FiDollarSign />
          </div>
          <div className="stat-value">{formatCurrency(totalSpent)}</div>
          <div className="stat-label">Total Spent</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <FiUsers />
          </div>
          <div className="stat-value">{group.members.length}</div>
          <div className="stat-label">Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-value">
            {group.members.length > 0 ? formatCurrency(totalSpent / group.members.length) : '₹0'}
          </div>
          <div className="stat-label">Per Person (Avg)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-value">{debts.length}</div>
          <div className="stat-label">Settlements Needed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'expenses' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses ({groupExpenses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'balances' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('balances')}
        >
          Balances
        </button>
        <button
          className={`tab-btn ${activeTab === 'settlements' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('settlements')}
        >
          Settlements ({debts.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'members' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
      </div>

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="glass-card">
          {groupExpenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💰</div>
              <div className="empty-state-title">No expenses yet</div>
              <div className="empty-state-text">Add your first expense to start tracking</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openExpenseModal}>
                <FiPlus /> Add Expense
              </button>
            </div>
          ) : (
            <div className="expense-list">
              {groupExpenses.map((expense, i) => (
                <div key={expense.id} className={`expense-item animate-fadeInUp stagger-${(i % 5) + 1}`}>
                  <div className="expense-cat-icon">{getCategoryIcon(expense.category)}</div>
                  <div className="expense-info">
                    <div className="expense-desc">{expense.description}</div>
                    <div className="expense-meta">
                      <span
                        className="expense-category-badge"
                        style={{ color: getCategoryColor(expense.category), borderColor: getCategoryColor(expense.category) + '40', background: getCategoryColor(expense.category) + '15' }}
                      >
                        {expense.category}
                      </span>
                      <span className="expense-paid-by">
                        Paid by <strong>{expense.paidBy}</strong>
                      </span>
                      <span className="expense-date">{formatDate(expense.date || expense.createdAt)}</span>
                    </div>
                    <div className="expense-split-info">
                      {expense.splitType === 'equal' && (
                        <span>Split equally among {expense.splits.length} people</span>
                      )}
                      {expense.splitType === 'custom' && <span>Custom split</span>}
                      {expense.splitType === 'percentage' && <span>Percentage split</span>}
                    </div>
                  </div>
                  <div className="expense-right">
                    <div className="expense-amount">{formatCurrency(expense.amount)}</div>
                    <button
                      className="btn btn-icon btn-danger btn-sm"
                      onClick={() => {
                        if (window.confirm('Delete this expense?')) deleteExpense(expense.id);
                      }}
                      title="Delete expense"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="glass-card">
          <div className="balance-list">
            {group.members.map((member, i) => {
              const balance = balances[member] || 0;
              return (
                <div key={member} className={`balance-item animate-fadeInUp stagger-${(i % 5) + 1}`}>
                  <div className="balance-user">
                    <div className="avatar" style={{ background: getAvatarColor(member) }}>
                      {getInitials(member)}
                    </div>
                    <div className="balance-name">{member}</div>
                  </div>
                  <div className={`balance-amount ${balance > 0.01 ? 'text-success' : balance < -0.01 ? 'text-danger' : ''}`}>
                    {balance > 0.01 ? '+' : ''}{formatCurrency(balance)}
                  </div>
                  <div className="balance-status">
                    {balance > 0.01 && <span className="badge badge-success">Gets back</span>}
                    {balance < -0.01 && <span className="badge badge-danger">Owes</span>}
                    {Math.abs(balance) <= 0.01 && <span className="badge badge-info">Settled</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <div className="glass-card">
          {debts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-title">All settled up!</div>
              <div className="empty-state-text">Everyone is square</div>
            </div>
          ) : (
            <div className="settlement-detail-list">
              <div className="settlement-header-info">
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                  ✨ Simplified to the minimum number of transactions needed
                </p>
              </div>
              {debts.map((debt, i) => (
                <div key={i} className={`settlement-detail-item animate-fadeInUp stagger-${(i % 5) + 1}`}>
                  <div className="settlement-detail-from">
                    <div className="avatar" style={{ background: getAvatarColor(debt.from) }}>
                      {getInitials(debt.from)}
                    </div>
                    <span className="settlement-detail-name">{debt.from}</span>
                  </div>
                  <div className="settlement-detail-arrow">
                    <div className="arrow-line" />
                    <div className="arrow-amount">{formatCurrency(debt.amount)}</div>
                    <div className="arrow-line" />
                    <span className="arrow-tip">→</span>
                  </div>
                  <div className="settlement-detail-to">
                    <div className="avatar" style={{ background: getAvatarColor(debt.to) }}>
                      {getInitials(debt.to)}
                    </div>
                    <span className="settlement-detail-name">{debt.to}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="glass-card">
          <div className="members-list-detail">
            {group.members.map((member, i) => {
              const paid = groupExpenses
                .filter(e => e.paidBy === member)
                .reduce((s, e) => s + parseFloat(e.amount), 0);
              const balance = balances[member] || 0;
              return (
                <div key={member} className={`member-detail-item animate-fadeInUp stagger-${(i % 5) + 1}`}>
                  <div className="avatar avatar-lg" style={{ background: getAvatarColor(member) }}>
                    {getInitials(member)}
                  </div>
                  <div className="member-detail-info">
                    <div className="member-detail-name">{member}</div>
                    <div className="member-detail-stats">
                      <span>Paid: {formatCurrency(paid)}</span>
                      <span>•</span>
                      <span className={balance >= 0 ? 'text-success' : 'text-danger'}>
                        Balance: {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '16px' }}
            onClick={() => setShowMemberModal(true)}
          >
            <FiPlus /> Add New Member
          </button>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Expense</h2>
              <button className="modal-close" onClick={() => setShowExpenseModal(false)}><FiX /></button>
            </div>

            <form onSubmit={handleAddExpense}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Dinner at restaurant"
                    value={description}
                    onChange={e => handleDescriptionChange(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginTop: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Paid By</label>
                  <select className="form-select" value={paidBy} onChange={e => setPaidBy(e.target.value)} required>
                    {group.members.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Auto-detect</option>
                    {getCategories().map(c => (
                      <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                  />
                </div>
              </div>

              {/* AI Category suggestion */}
              {category && description.length > 2 && (
                <div className="ai-suggestion">
                  <FiEdit2 /> AI Suggestion: <strong>{getCategoryIcon(category)} {category}</strong>
                </div>
              )}

              {/* Split type */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Split Type</label>
                <div className="split-type-options">
                  <button
                    type="button"
                    className={`split-option ${splitType === 'equal' ? 'split-option--active' : ''}`}
                    onClick={() => setSplitType('equal')}
                  >
                    ⚖️ Equal
                  </button>
                  <button
                    type="button"
                    className={`split-option ${splitType === 'custom' ? 'split-option--active' : ''}`}
                    onClick={() => setSplitType('custom')}
                  >
                    ✏️ Custom
                  </button>
                  <button
                    type="button"
                    className={`split-option ${splitType === 'percentage' ? 'split-option--active' : ''}`}
                    onClick={() => setSplitType('percentage')}
                  >
                    📊 Percentage
                  </button>
                </div>
              </div>

              {/* Equal split - member selection */}
              {splitType === 'equal' && (
                <div className="split-members" style={{ marginTop: '12px' }}>
                  <label className="form-label" style={{ marginBottom: '8px' }}>Split Among</label>
                  <div className="member-checkboxes">
                    {group.members.map(member => (
                      <label key={member} className={`member-checkbox ${selectedMembers.includes(member) ? 'member-checkbox--active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member)}
                          onChange={() => toggleMemberSelection(member)}
                        />
                        <div className="avatar avatar-sm" style={{ background: getAvatarColor(member) }}>
                          {getInitials(member)}
                        </div>
                        <span>{member}</span>
                        {selectedMembers.includes(member) && amount && (
                          <span className="per-person-amount">
                            {formatCurrency(parseFloat(amount) / selectedMembers.length)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom split */}
              {splitType === 'custom' && (
                <div className="split-custom" style={{ marginTop: '12px' }}>
                  <label className="form-label" style={{ marginBottom: '8px' }}>Custom Amounts</label>
                  {group.members.map(member => (
                    <div key={member} className="custom-split-row">
                      <div className="custom-split-user">
                        <div className="avatar avatar-sm" style={{ background: getAvatarColor(member) }}>
                          {getInitials(member)}
                        </div>
                        <span>{member}</span>
                      </div>
                      <input
                        type="number"
                        className="form-input custom-split-input"
                        placeholder="0.00"
                        value={customSplits[member] || ''}
                        onChange={e => setCustomSplits({ ...customSplits, [member]: e.target.value })}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  ))}
                  <div className="custom-split-total">
                    Total: {formatCurrency(Object.values(customSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0))}
                    {amount && <span> / {formatCurrency(parseFloat(amount))}</span>}
                  </div>
                </div>
              )}

              {/* Percentage split */}
              {splitType === 'percentage' && (
                <div className="split-custom" style={{ marginTop: '12px' }}>
                  <label className="form-label" style={{ marginBottom: '8px' }}>Percentage Split</label>
                  {group.members.map(member => (
                    <div key={member} className="custom-split-row">
                      <div className="custom-split-user">
                        <div className="avatar avatar-sm" style={{ background: getAvatarColor(member) }}>
                          {getInitials(member)}
                        </div>
                        <span>{member}</span>
                      </div>
                      <div className="pct-input-wrapper">
                        <input
                          type="number"
                          className="form-input custom-split-input"
                          placeholder="0"
                          value={percentageSplits[member] || ''}
                          onChange={e => setPercentageSplits({ ...percentageSplits, [member]: e.target.value })}
                          step="0.1"
                          min="0"
                          max="100"
                        />
                        <span className="pct-symbol">%</span>
                      </div>
                      {amount && percentageSplits[member] && (
                        <span className="pct-amount">
                          {formatCurrency((parseFloat(amount) * parseFloat(percentageSplits[member])) / 100)}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="custom-split-total">
                    Total: {Object.values(percentageSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0).toFixed(1)}%
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '20px' }}
                disabled={!description.trim() || !amount || !paidBy}
              >
                <FiPlus /> Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Member</h2>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Member Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter name"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '16px' }}
                disabled={!newMemberName.trim() || group.members.includes(newMemberName.trim())}
              >
                <FiPlus /> Add Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}