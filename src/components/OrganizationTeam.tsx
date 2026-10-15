import React, { useState } from 'react';
import { Organization, OrganizationMember, SmsLog } from '../types';
import { DiamondApi } from '../services/api';
import {
  Building2, Users, UserPlus, Phone, Mail, MapPin,
  Shield, Check, X, Lock, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react';

interface OrganizationTeamProps {
  organization: Organization | null;
  members: OrganizationMember[];
  smsLogs: SmsLog[];
  onRefresh?: () => void;
}

export const OrganizationTeam: React.FC<OrganizationTeamProps> = ({
  organization,
  members,
  smsLogs,
  onRefresh
}) => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form: Add Member
  const [memberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'DIAMOND_TRADER',
    user_scope: 'INDIVIDUAL' // INDIVIDUAL = own books, GLOBAL = all org books
  });

  // Form: Edit Org
  const [orgForm, setOrgForm] = useState({
    name: organization?.name || 'BKC Diamond Bourse Trading Firm',
    registration_number: organization?.registration_number || 'BDB-TWR-G-402',
    phone: organization?.phone || '+919820011223',
    email: organization?.email || 'admin@bkc-diamonds.com',
    city: organization?.city || 'Mumbai',
    address: organization?.address || 'G-Block, Bandra Kurla Complex, Mumbai 400051'
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateOrUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await DiamondApi.createOrUpdateOrganization(orgForm);
      showToast('Organization profile saved successfully');
      setShowEditOrgModal(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const added = await DiamondApi.addOrganizationMember(memberForm);
      showToast(`User ${added.name} successfully added! Login enabled with separate hisab.`);
      setShowAddMemberModal(false);
      setMemberForm({
        name: '', phone: '', email: '', password: '',
        role: 'DIAMOND_TRADER', user_scope: 'INDIVIDUAL'
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to register member', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (member: OrganizationMember) => {
    const nextStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await DiamondApi.updateMemberStatus(member.id, nextStatus);
      showToast(`User ${member.name} status updated to ${nextStatus}`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Status update failed', 'error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.785rem',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '5px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed', top: '76px', right: '20px', zIndex: 9999,
          padding: '12px 18px', borderRadius: '10px',
          background: toast.type === 'error' ? '#fff1f2' : '#ecfdf5',
          border: `1px solid ${toast.type === 'error' ? '#fecdd3' : '#a7f3d0'}`,
          color: toast.type === 'error' ? '#be123c' : '#065f46',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600, fontSize: '0.85rem'
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Organization Card ── */}
      <div style={{
        background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0',
        padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(2,132,199,0.3)'
          }}>
            <Building2 size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {organization?.name || 'BKC Diamond Bourse Trading Firm'}
              </h2>
              <span style={{
                background: '#e0f2fe', color: '#0369a1', padding: '3px 9px',
                borderRadius: '6px', fontSize: '0.725rem', fontWeight: 700
              }}>
                PRIMARY FIRM
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px', fontSize: '0.825rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={15} color="#0284c7" /> {organization?.address || 'G-Block, BDB, BKC, Mumbai'} ({organization?.city || 'Mumbai'})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={15} color="#059669" /> {organization?.phone || '+919820011223'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Mail size={15} color="#d97706" /> {organization?.email || 'admin@bkc-diamonds.com'}
              </span>
              {organization?.registration_number && (
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  Gala/Office: {organization.registration_number}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setOrgForm({
              name: organization?.name || 'BKC Diamond Bourse Trading Firm',
              registration_number: organization?.registration_number || 'BDB-TWR-G-402',
              phone: organization?.phone || '+919820011223',
              email: organization?.email || 'admin@bkc-diamonds.com',
              city: organization?.city || 'Mumbai',
              address: organization?.address || 'G-Block, Bandra Kurla Complex, Mumbai 400051'
            });
            setShowEditOrgModal(true);
          }}
          className="btn-secondary"
          style={{ padding: '9px 16px', fontSize: '0.85rem' }}
        >
          Edit Organization Profile
        </button>
      </div>

      {/* ── Multi-User Architecture Notice ── */}
      <div style={{
        padding: '16px 20px', background: '#f0f9ff', borderRadius: '12px',
        border: '1px solid #bae6fd', display: 'flex', alignItems: 'flex-start', gap: '12px'
      }}>
        <Users size={20} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem', color: '#0369a1', lineHeight: '1.5' }}>
          <strong>Multi-User Organization Desk:</strong> Aapki organization ek hi rahegi, lekin har staff/partner (User) ka login aur ledger <strong>alag aur isolated</strong> hoga.
          Trader A ko sirf apna hisab dikhega, aur Trader B ko apna hisab. Super Admin organization ka consolidated hisab dekh sakte hain.
        </div>
      </div>

      {/* ── Team Members List ── */}
      <div style={{
        background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Organization Staff & Traders ({members.length} Users)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.785rem', color: '#64748b' }}>
              Users who can log in to manage diamond transactions under this organization
            </p>
          </div>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="btn-primary"
            style={{ padding: '9px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} /> Add Team Member
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Member / Trader</th>
                <th>Role & Desk</th>
                <th>Hisab Scope</th>
                <th>Deals Recorded</th>
                <th>Login Credentials</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No staff members added yet. Click <strong>Add Team Member</strong> to invite traders or accountants.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Joined {m.created_at?.split('T')[0]}</div>
                    </td>
                    <td>
                      <span className="badge badge-broker">
                        {m.roles?.[0] || 'DIAMOND_TRADER'}
                      </span>
                    </td>
                    <td>
                      {m.user_scope === 'GLOBAL' ? (
                        <span style={{
                          background: '#fef3c7', color: '#b45309', padding: '3px 8px',
                          borderRadius: '6px', fontSize: '0.725rem', fontWeight: 700
                        }}>
                          GLOBAL (Full Firm)
                        </span>
                      ) : (
                        <span style={{
                          background: '#ecfdf5', color: '#047857', padding: '3px 8px',
                          borderRadius: '6px', fontSize: '0.725rem', fontWeight: 700
                        }}>
                          INDIVIDUAL (Own Hisab)
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0284c7' }}>
                        {m.my_deals_count ?? 0} invoices
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.785rem', color: '#0f172a', fontWeight: 600 }}>{m.phone}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{m.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${m.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-overdue'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(m)}
                        style={{
                          background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px',
                          padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600,
                          cursor: 'pointer', color: m.status === 'ACTIVE' ? '#e11d48' : '#059669'
                        }}
                      >
                        {m.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SMS Dispatches Log ── */}
      <div style={{
        background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0',
        padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <MessageSquare size={18} color="#0284c7" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Automated SMS Notification History (Payment Reminders)
          </h3>
        </div>
        {smsLogs.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            No SMS reminders sent yet. SMS are automatically sent to registered mobile numbers whenever a payment becomes overdue or a reminder is triggered.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {smsLogs.slice(0, 5).map((log) => (
              <div key={log.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '0.825rem'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.phone}: </span>
                  <span style={{ color: '#475569' }}>{log.message_body}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{log.created_at?.split('T')[0]}</span>
                  <span className="badge badge-in-stock">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: ADD TEAM MEMBER ── */}
      {showAddMemberModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Register Staff / Partner User
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                  Add a member with individual hisab login under {organization?.name}
                </p>
              </div>
              <button onClick={() => setShowAddMemberModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Bhavesh Shah"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Login Mobile Phone</label>
                    <input
                      type="text"
                      required
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      style={inputStyle}
                      placeholder="+919820012345"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Login Email</label>
                    <input
                      type="email"
                      required
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      style={inputStyle}
                      placeholder="bhavesh@bkc.com"
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Initial Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={memberForm.password}
                    onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                    style={inputStyle}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Staff Role</label>
                    <select
                      value={memberForm.role}
                      onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="DIAMOND_TRADER">Diamond Trader (Sales Desk)</option>
                      <option value="ACCOUNTANT">Accountant (Khata & Ledgers)</option>
                      <option value="BROKER">Broker Associate</option>
                      <option value="SUPER_ADMIN">Managing Partner / Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Hisab & Books Scope</label>
                    <select
                      value={memberForm.user_scope}
                      onChange={(e) => setMemberForm({ ...memberForm, user_scope: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="INDIVIDUAL">Personal Hisab (Own Deals Only)</option>
                      <option value="GLOBAL">Global (View Full Firm Deals)</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.785rem', color: '#166534' }}>
                  ✓ <strong>Khud Ka Hisab:</strong> Selecting <em>Personal Hisab</em> ensures this user's transactions are tracked separately and not mixed with other traders' transactions.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddMemberModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Registering...' : <><Check size={16} /> Confirm & Add User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT ORGANIZATION ── */}
      {showEditOrgModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Edit Organization Profile
              </h3>
              <button onClick={() => setShowEditOrgModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateOrg}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Company / Firm Legal Name</label>
                  <input
                    type="text"
                    required
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Gala / Office No / GSTIN</label>
                    <input
                      type="text"
                      value={orgForm.registration_number}
                      onChange={(e) => setOrgForm({ ...orgForm, registration_number: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. BDB-TWR-G-402"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input
                      type="text"
                      value={orgForm.city}
                      onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Contact Phone</label>
                    <input
                      type="text"
                      value={orgForm.phone}
                      onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Official Email</label>
                    <input
                      type="email"
                      value={orgForm.email}
                      onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Bourse / Office Address</label>
                  <textarea
                    rows={2}
                    value={orgForm.address}
                    onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditOrgModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
