import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials, formatDate } from '../utils/helpers';
import { formatCurrency } from '../utils/calculations';
import { FiPlus, FiX, FiUsers, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import './Groups.css';

export default function Groups() {
  const { groups, expenses, addGroup, deleteGroup } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);

  const handleAddMember = () => {
    const name = memberInput.trim();
    if (name && !members.includes(name)) {
      setMembers([...members, name]);
      setMemberInput('');
    }
  };

  const handleRemoveMember = (member) => {
    setMembers(members.filter(m => m !== member));
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim() || members.length < 2) return;
    const group = addGroup({ name: groupName.trim(), members });
    setShowModal(false);
    setGroupName('');
    setMembers([]);
    navigate(`/groups/${group.id}`);
  };

  const handleDeleteGroup = (e, groupId) => {
    e.stopPropagation();
    if (window.confirm('Delete this group and all its expenses?')) {
      deleteGroup(groupId);
    }
  };

  return (
    <div className="groups-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">Manage your expense groups</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No groups yet</div>
            <div className="empty-state-text">Create your first group to start splitting expenses</div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>
              <FiPlus /> Create Group
            </button>
          </div>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map((group, i) => {
            const groupExpenses = expenses.filter(e => e.groupId === group.id);
            const totalSpent = groupExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
            return (
              <div
                key={group.id}
                className={`group-card glass-card animate-fadeInUp stagger-${(i % 5) + 1}`}
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <div className="group-card-top">
                  <div className="group-card-info">
                    <h3 className="group-card-name">{group.name}</h3>
                    <div className="group-card-meta">
                      <span>{group.members.length} members</span>
                      <span>•</span>
                      <span>{groupExpenses.length} expenses</span>
                      <span>•</span>
                      <span>Created {formatDate(group.createdAt)}</span>
                    </div>
                  </div>
                  <div className="group-card-actions">
                    <button
                      className="btn btn-icon btn-danger"
                      onClick={(e) => handleDeleteGroup(e, group.id)}
                      title="Delete group"
                    >
                      <FiTrash2 />
                    </button>
                    <FiArrowRight className="group-arrow" />
                  </div>
                </div>
                <div className="group-card-bottom">
                  <div className="group-card-members">
                    {group.members.slice(0, 6).map(member => (
                      <div
                        key={member}
                        className="avatar avatar-sm"
                        style={{ background: getAvatarColor(member) }}
                        title={member}
                      >
                        {getInitials(member)}
                      </div>
                    ))}
                    {group.members.length > 6 && (
                      <span className="more-members">+{group.members.length - 6}</span>
                    )}
                  </div>
                  <div className="group-card-total">
                    <span className="group-total-label">Total</span>
                    <span className="group-total-value">{formatCurrency(totalSpent)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Group</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Group Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Goa Trip, Flat Expenses"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Add Members (min. 2)</label>
                <div className="member-input-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter member name"
                    value={memberInput}
                    onChange={e => setMemberInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddMember}>
                    <FiPlus />
                  </button>
                </div>
              </div>

              {members.length > 0 && (
                <div className="members-list-modal">
                  {members.map(member => (
                    <div key={member} className="member-tag">
                      <div
                        className="avatar avatar-sm"
                        style={{ background: getAvatarColor(member) }}
                      >
                        {getInitials(member)}
                      </div>
                      <span>{member}</span>
                      <button
                        type="button"
                        className="member-tag-remove"
                        onClick={() => handleRemoveMember(member)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '20px' }}
                disabled={!groupName.trim() || members.length < 2}
              >
                <FiUsers /> Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
