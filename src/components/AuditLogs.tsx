import React, { useState } from 'react';
import { SystemAuditRecord, WhatsAppTemplate } from '../types';
import { ShieldCheck, MessageSquare, Download, Filter, Search, Eye } from 'lucide-react';

interface AuditLogsProps {
  logs: SystemAuditRecord[];
  templates: WhatsAppTemplate[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs, templates }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'templates'>('audit');
  const [selectedLog, setSelectedLog] = useState<SystemAuditRecord | null>(null);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            System Audit Trail & WhatsApp Templates
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Immutable financial audit trail for stock transfers, ledger entries, and automated Bourse messaging
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: activeTab === 'audit' ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
              background: activeTab === 'audit' ? '#eff6ff' : '#ffffff',
              color: activeTab === 'audit' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} /> Audit Trail ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: activeTab === 'templates' ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
              background: activeTab === 'templates' ? '#eff6ff' : '#ffffff',
              color: activeTab === 'templates' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={16} /> WhatsApp Templates ({templates.length})
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Target Table</th>
                <th>Record ID</th>
                <th>IP Address</th>
                <th>Payload Diff</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.timestamp}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.user_name || 'System Auto'}</span>
                  </td>
                  <td>
                    {log.action === 'CREATE' && <span className="badge badge-in-stock">CREATE</span>}
                    {log.action === 'UPDATE' && <span className="badge badge-gia">UPDATE</span>}
                    {log.action === 'DELETE' && <span className="badge badge-overdue">DELETE</span>}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>
                      {log.table_name}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                      {log.record_id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.ip_address || '127.0.0.1'}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <Eye size={12} /> View Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                padding: '18px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{tpl.template_name}</span>
                <span className="badge badge-broker">{tpl.category}</span>
              </div>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#334155',
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  lineHeight: '1.45'
                }}
              >
                "{tpl.message_body}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* JSON Payload Modal */}
      {selectedLog && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Audit Record Diff: {selectedLog.table_name} ({selectedLog.action})
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Logged at: {selectedLog.timestamp} by {selectedLog.user_name}
              </div>
              <pre
                style={{
                  padding: '14px',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace',
                  fontSize: '0.825rem',
                  overflowX: 'auto',
                  color: '#0f172a'
                }}
              >
                {JSON.stringify(selectedLog.new_value_json || selectedLog.old_value_json || {}, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedLog(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
