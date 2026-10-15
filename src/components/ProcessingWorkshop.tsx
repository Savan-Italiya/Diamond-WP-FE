import React, { useState } from 'react';
import { RepairSlip, Party } from '../types';
import { Hammer, Plus, ArrowRightLeft, ShieldCheck, Clock, X, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DiamondApi } from '../services/api';

interface ProcessingWorkshopProps {
  repairSlips: RepairSlip[];
  parties: Party[];
  onRefresh?: () => void;
}

export const ProcessingWorkshop: React.FC<ProcessingWorkshopProps> = ({
  repairSlips: initialSlips,
  parties,
  onRefresh
}) => {
  const [slips, setSlips] = useState<RepairSlip[]>(initialSlips);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<RepairSlip | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [issueForm, setIssueForm] = useState({
    processor_name: 'Shree Ram Laser & Sawing Karkhana (Surat)',
    original_weight: '',
    reason: 'Laser sawing & table facet cleavage repair'
  });

  const [returnForm, setReturnForm] = useState({
    returned_weight: '',
    processing_charge: ''
  });

  React.useEffect(() => {
    setSlips(initialSlips);
  }, [initialSlips]);

  const handleIssueSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.original_weight) return;

    const newSlip: RepairSlip = {
      id: `rs-${Date.now()}`,
      slip_number: `REP-SURAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      issue_date: new Date().toISOString().split('T')[0],
      processor_party_id: 'p-4',
      processor_name: issueForm.processor_name,
      status: 'SENT_TO_WORKSHOP',
      items: [
        {
          id: `ri-${Date.now()}`,
          original_weight: parseFloat(issueForm.original_weight),
          reason: issueForm.reason,
          processing_charge: 0,
          status: 'IN_PROCESS'
        }
      ]
    };

    setSlips([newSlip, ...slips]);
    setShowIssueModal(false);
    setIssueForm({
      processor_name: 'Shree Ram Laser & Sawing Karkhana (Surat)',
      original_weight: '',
      reason: 'Laser sawing & table facet cleavage repair'
    });
    setToast(`Repair Slip ${newSlip.slip_number} dispatched to Surat Workshop`);
    setTimeout(() => setToast(null), 3000);
    if (onRefresh) onRefresh();
  };

  const handleReturnSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlip || !returnForm.returned_weight) return;

    const origWeight = selectedSlip.items?.[0]?.original_weight || 0;
    const retWeight = parseFloat(returnForm.returned_weight);
    const loss = Math.max(0, origWeight - retWeight);
    const charge = parseFloat(returnForm.processing_charge || '0');

    setSlips(
      slips.map((s) =>
        s.id === selectedSlip.id
          ? {
              ...s,
              status: 'COMPLETED',
              items: s.items?.map((i) => ({
                ...i,
                returned_weight: retWeight,
                carat_loss: loss,
                processing_charge: charge,
                status: 'RETURNED'
              }))
            }
          : s
      )
    );

    setShowReturnModal(false);
    setSelectedSlip(null);
    setReturnForm({ returned_weight: '', processing_charge: '' });
    setToast(
      `Diamond safely returned! Weight: ${retWeight} Cts (Carat loss: ${loss.toFixed(3)} Cts, Charges: ₹${charge})`
    );
    setTimeout(() => setToast(null), 4000);
  };

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
      {toast && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-sm)',
            color: '#065f46',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Karkhana & Surat Processing Workshops
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Laser sawing, table cleavage repairs, and re-polishing with automated carat loss reconciliation
          </p>
        </div>

        <button onClick={() => setShowIssueModal(true)} className="btn-primary">
          <Plus size={16} /> Issue Stone to Karkhana
        </button>
      </div>

      {/* Workshop Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '22px' }}>
        <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <div style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 600 }}>Active Surat Processing Slips</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {slips.filter((s) => s.status !== 'COMPLETED').length} Parcels
          </div>
          <div style={{ fontSize: '0.75rem', color: '#c2410c', marginTop: '3px' }}>Under repair in Katargam/Varachha</div>
        </div>

        <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>Total Repaired Diamonds Returned</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {slips.filter((s) => s.status === 'COMPLETED').length} Finished
          </div>
          <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '3px' }}>Inspected & stored in Safe Vault</div>
        </div>

        <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>Avg Carat Loss Recorded</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            0.30 Cts / Stone
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '3px' }}>Within 14% Bourse tolerance</div>
        </div>
      </div>

      {/* Repair Slips Table */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Slip Number</th>
              <th>Processor / Karkhana</th>
              <th>Dispatched Date</th>
              <th>Original Weight</th>
              <th>Returned Weight</th>
              <th>Carat Loss</th>
              <th>Labor Charge (INR)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {slips.map((slip) => {
              const item = slip.items?.[0];
              const isCompleted = slip.status === 'COMPLETED';

              return (
                <tr key={slip.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>{slip.slip_number}</span>
                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{item?.reason}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{slip.processor_name}</div>
                  </td>
                  <td>{slip.issue_date}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {item ? `${item.original_weight.toFixed(2)} Cts` : '-'}
                    </span>
                  </td>
                  <td>
                    {isCompleted && item?.returned_weight ? (
                      <span style={{ fontWeight: 700, color: '#059669' }}>
                        {item.returned_weight.toFixed(2)} Cts
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>In Workshop</span>
                    )}
                  </td>
                  <td>
                    {isCompleted && item?.carat_loss !== undefined ? (
                      <span style={{ fontWeight: 700, color: '#e11d48' }}>
                        - {item.carat_loss.toFixed(3)} Cts
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      ₹{item?.processing_charge?.toLocaleString('en-IN') || 0}
                    </span>
                  </td>
                  <td>
                    {isCompleted ? (
                      <span className="badge badge-in-stock">RETURNED & VERIFIED</span>
                    ) : (
                      <span className="badge badge-process">UNDER REPAIR</span>
                    )}
                  </td>
                  <td>
                    {!isCompleted ? (
                      <button
                        onClick={() => {
                          setSelectedSlip(slip);
                          setShowReturnModal(true);
                        }}
                        className="btn-secondary"
                        style={{ padding: '5px 11px', fontSize: '0.775rem' }}
                      >
                        <ArrowRightLeft size={13} /> Receive Return
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Reconciled</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL: ISSUE STONE TO KARKHANA */}
      {showIssueModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Issue Diamond Slip to Surat / Mumbai Workshop
              </h3>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleIssueSlip}>
              <div className="modal-body">
                <div>
                  <label className="form-label">Processing Center / Karkhana</label>
                  <input
                    type="text"
                    required
                    value={issueForm.processor_name}
                    onChange={(e) => setIssueForm({ ...issueForm, processor_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Original Stone Weight (Carats)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 3.25"
                    value={issueForm.original_weight}
                    onChange={(e) => setIssueForm({ ...issueForm, original_weight: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Processing / Repair Instructions</label>
                  <textarea
                    rows={3}
                    required
                    value={issueForm.reason}
                    onChange={(e) => setIssueForm({ ...issueForm, reason: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowIssueModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Dispatch Slip to Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECEIVE RETURN & CALCULATE CARAT LOSS */}
      {showReturnModal && selectedSlip && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Receive Repaired Stone: {selectedSlip.slip_number}
              </h3>
              <button
                onClick={() => setShowReturnModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReturnSlip}>
              <div className="modal-body">
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Dispatched Weight:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedSlip.items?.[0]?.original_weight} Carats
                  </div>
                </div>

                <div>
                  <label className="form-label">Returned Weight (Physical Scale Reading)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="e.g. 2.95"
                    value={returnForm.returned_weight}
                    onChange={(e) => setReturnForm({ ...returnForm, returned_weight: e.target.value })}
                    className="form-input"
                  />
                </div>

                {returnForm.returned_weight && (
                  <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>
                      Calculated Carat Loss:
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#b91c1c' }}>
                      {(
                        (selectedSlip.items?.[0]?.original_weight || 0) -
                        parseFloat(returnForm.returned_weight || '0')
                      ).toFixed(3)}{' '}
                      Carats
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label">Workshop Processing / Labor Charge (INR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 8500"
                    value={returnForm.processing_charge}
                    onChange={(e) => setReturnForm({ ...returnForm, processing_charge: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowReturnModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Confirm Receipt & Vault Stone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
