import React from 'react';
import { MemoBill } from '../types';
import { FileCheck, Clock, ExternalLink, ArrowRightLeft } from 'lucide-react';

interface MemoManagerProps {
  memos: MemoBill[];
}

export const MemoManager: React.FC<MemoManagerProps> = ({ memos }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
            Memo Challan Management (Out-on-Approval)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Physical diamonds handed over to brokers & buyers before final sale invoice
          </p>
        </div>
        <button className="btn-primary">
          <FileCheck size={16} /> Issue New Memo Challan
        </button>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Memo Number</th>
              <th>Recipient Party & Broker</th>
              <th>Issue Date</th>
              <th>Return Due Date</th>
              <th>Carats on Memo</th>
              <th>Asking Value</th>
              <th>Challan Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {memos.map((memo) => {
              const totalCarats = memo.items.reduce((acc, i) => acc + Number(i.carat), 0);
              const totalVal = memo.items.reduce((acc, i) => acc + Number(i.asking_price), 0);
              return (
                <tr key={memo.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{memo.memo_number}</span>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{memo.memo_type}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{memo.party_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                      Broker: {memo.broker_name || 'Direct Deal'}
                    </div>
                  </td>
                  <td>{memo.issue_date}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fb7185', fontWeight: 600 }}>
                      <Clock size={14} /> {memo.return_due_date}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{totalCarats.toFixed(2)} Cts</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                      ₹{totalVal.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-memo">{memo.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-dial" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                        <ArrowRightLeft size={13} /> Return Packet
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
