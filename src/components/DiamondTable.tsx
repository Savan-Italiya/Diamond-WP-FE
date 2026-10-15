import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from '@tanstack/react-table';
import { DiamondLot, SingleDiamond } from '../types';
import { Search, Split, Share2, Hammer, Filter, Plus, FileSpreadsheet, X, Check } from 'lucide-react';
import { DiamondApi } from '../services/api';

interface DiamondTableProps {
  lots: DiamondLot[];
  solitaires: SingleDiamond[];
  onRefresh?: () => void;
}

export const DiamondTable: React.FC<DiamondTableProps> = ({ lots: initialLots, solitaires: initialSolitaires, onRefresh }) => {
  const [lots, setLots] = useState<DiamondLot[]>(initialLots);
  const [solitaires, setSolitaires] = useState<SingleDiamond[]>(initialSolitaires);
  const [activeSubTab, setActiveSubTab] = useState<'lots' | 'solitaires'>('lots');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modals state
  const [showAddLotModal, setShowAddLotModal] = useState(false);
  const [showAddDiamondModal, setShowAddDiamondModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<DiamondLot | null>(null);

  // Form states
  const [newLotForm, setNewLotForm] = useState({
    lot_number: '',
    category_name: 'PARCEL_LOT',
    total_carat: '',
    cost_per_carat: ''
  });

  const [newDiamondForm, setNewDiamondForm] = useState({
    cert_type: 'GIA',
    cert_number: '',
    shape: 'ROUND',
    carat: '',
    color: 'D',
    clarity: 'VVS1',
    cut: 'EXCELLENT',
    polish: 'EXCELLENT',
    symmetry: 'EXCELLENT',
    fluorescence: 'NONE'
  });

  const [breakdownForm, setBreakdownForm] = useState({
    carats_to_transfer: '',
    new_lot_number: ''
  });

  // Keep state synced when props change
  React.useEffect(() => {
    setLots(initialLots);
  }, [initialLots]);

  React.useEffect(() => {
    setSolitaires(initialSolitaires);
  }, [initialSolitaires]);

  // Handlers
  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLotForm.lot_number || !newLotForm.total_carat || !newLotForm.cost_per_carat) return;
    const created = await DiamondApi.createLot({
      lot_number: newLotForm.lot_number,
      category_name: newLotForm.category_name,
      total_carat: parseFloat(newLotForm.total_carat),
      cost_per_carat: parseFloat(newLotForm.cost_per_carat),
      purchase_date: new Date().toISOString().split('T')[0]
    });
    setLots([created, ...lots]);
    setShowAddLotModal(false);
    setNewLotForm({ lot_number: '', category_name: 'PARCEL_LOT', total_carat: '', cost_per_carat: '' });
    if (onRefresh) onRefresh();
  };

  const handleCreateDiamond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiamondForm.cert_number || !newDiamondForm.carat) return;
    const created = await DiamondApi.createSingleDiamond({
      cert_type: newDiamondForm.cert_type,
      cert_number: newDiamondForm.cert_number,
      shape: newDiamondForm.shape,
      carat: parseFloat(newDiamondForm.carat),
      color: newDiamondForm.color,
      clarity: newDiamondForm.clarity,
      cut: newDiamondForm.cut,
      polish: newDiamondForm.polish,
      symmetry: newDiamondForm.symmetry,
      fluorescence: newDiamondForm.fluorescence
    });
    setSolitaires([created, ...solitaires]);
    setShowAddDiamondModal(false);
    setNewDiamondForm({
      cert_type: 'GIA',
      cert_number: '',
      shape: 'ROUND',
      carat: '',
      color: 'D',
      clarity: 'VVS1',
      cut: 'EXCELLENT',
      polish: 'EXCELLENT',
      symmetry: 'EXCELLENT',
      fluorescence: 'NONE'
    });
    if (onRefresh) onRefresh();
  };

  const handleBreakdownLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot || !breakdownForm.carats_to_transfer) return;
    const transferCts = parseFloat(breakdownForm.carats_to_transfer);
    try {
      await DiamondApi.breakdownLot({
        parent_lot_id: selectedLot.id,
        new_lot_number: breakdownForm.new_lot_number || `${selectedLot.lot_number}-SUB`,
        carats_transferred: transferCts
      });

      // Update parent lot in state
      setLots(
        lots.map((l) =>
          l.id === selectedLot.id ? { ...l, current_carat: Math.max(0, l.current_carat - transferCts) } : l
        )
      );
      setShowBreakdownModal(false);
      setSelectedLot(null);
      setBreakdownForm({ carats_to_transfer: '', new_lot_number: '' });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to breakdown lot');
    }
  };

  // Columns for Bulk Lots
  const lotColumns = useMemo<ColumnDef<DiamondLot>[]>(
    () => [
      {
        accessorKey: 'lot_number',
        header: 'Lot Number / Parcha',
        cell: (info) => (
          <span style={{ fontWeight: 700, color: '#0284c7' }}>{String(info.getValue())}</span>
        )
      },
      {
        accessorKey: 'category_name',
        header: 'Category',
        cell: (info) => <span className="badge badge-gia">{String(info.getValue() || 'PARCEL')}</span>
      },
      {
        accessorKey: 'total_carat',
        header: 'Original Cts',
        cell: (info) => `${Number(info.getValue()).toFixed(3)} Cts`
      },
      {
        accessorKey: 'current_carat',
        header: 'Available Cts',
        cell: (info) => (
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            {Number(info.getValue()).toFixed(3)} Cts
          </span>
        )
      },
      {
        accessorKey: 'cost_per_carat',
        header: 'Cost / Ct (INR)',
        cell: (info) => `₹${Number(info.getValue()).toLocaleString('en-IN')}`
      },
      {
        id: 'total_val',
        header: 'Lot Valuation',
        cell: ({ row }) => {
          const val = row.original.current_carat * row.original.cost_per_carat;
          return <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{val.toLocaleString('en-IN')}</span>;
        }
      },
      {
        accessorKey: 'status',
        header: 'Vault Status',
        cell: (info) => {
          const val = String(info.getValue());
          if (val === 'IN_STOCK') return <span className="badge badge-in-stock">In Safe Vault</span>;
          if (val === 'MEMO') return <span className="badge badge-memo">On Memo</span>;
          if (val === 'IN_PROCESS') return <span className="badge badge-process">Surat Karkhana</span>;
          return <span className="badge badge-overdue">{val}</span>;
        }
      },
      {
        id: 'actions',
        header: 'Quick Action',
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedLot(row.original);
              setShowBreakdownModal(true);
            }}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.775rem' }}
          >
            <Split size={13} /> Split Lot
          </button>
        )
      }
    ],
    []
  );

  // Columns for Single Certified Solitaires
  const solitaireColumns = useMemo<ColumnDef<SingleDiamond>[]>(
    () => [
      {
        accessorKey: 'cert_number',
        header: 'Certificate & Lab',
        cell: ({ row }) => (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-gia">{row.original.cert_type}</span>
              <span style={{ fontWeight: 700, color: '#0284c7' }}>{row.original.cert_number}</span>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'shape',
        header: 'Shape',
        cell: (info) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{String(info.getValue())}</span>
      },
      {
        accessorKey: 'carat',
        header: 'Weight',
        cell: (info) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{Number(info.getValue()).toFixed(2)} Ct</span>
      },
      {
        id: '4cs',
        header: 'Color / Clarity',
        cell: ({ row }) => (
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            {row.original.color} / {row.original.clarity}
          </span>
        )
      },
      {
        id: 'cut_details',
        header: 'Cut • Pol • Sym',
        cell: ({ row }) => (
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {row.original.cut || 'EX'} • {row.original.polish || 'EX'} • {row.original.symmetry || 'EX'}
          </span>
        )
      },
      {
        accessorKey: 'fluorescence',
        header: 'Fluorescence',
        cell: (info) => <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{String(info.getValue() || 'NONE')}</span>
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const val = String(info.getValue());
          return val === 'IN_STOCK' ? (
            <span className="badge badge-in-stock">Available</span>
          ) : (
            <span className="badge badge-memo">{val}</span>
          );
        }
      }
    ],
    []
  );

  const tableLots = useReactTable({
    data: lots,
    columns: lotColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const tableSolitaires = useReactTable({
    data: solitaires,
    columns: solitaireColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

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
      {/* Top Header & Actions */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('lots')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: activeSubTab === 'lots' ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
              background: activeSubTab === 'lots' ? '#eff6ff' : '#ffffff',
              color: activeSubTab === 'lots' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Bulk Parcels / Lots ({lots.length})
          </button>
          <button
            onClick={() => setActiveSubTab('solitaires')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: activeSubTab === 'solitaires' ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
              background: activeSubTab === 'solitaires' ? '#eff6ff' : '#ffffff',
              color: activeSubTab === 'solitaires' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Single Certified Solitaires ({solitaires.length})
          </button>
        </div>

        {/* Search & New Lot/Solitaire Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search lot, cert, shape..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
            />
          </div>

          {activeSubTab === 'lots' ? (
            <button onClick={() => setShowAddLotModal(true)} className="btn-primary">
              <Plus size={16} /> Add Diamond Lot
            </button>
          ) : (
            <button onClick={() => setShowAddDiamondModal(true)} className="btn-primary">
              <Plus size={16} /> Add Single Diamond
            </button>
          )}
        </div>
      </div>

      {/* Render Active Table */}
      <div className="custom-table-container">
        {activeSubTab === 'lots' ? (
          <table className="custom-table">
            <thead>
              {tableLots.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {tableLots.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="custom-table">
            <thead>
              {tableSolitaires.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {tableSolitaires.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: ADD LOT */}
      {showAddLotModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Add New Diamond Lot / Parcel (Parcha)
              </h3>
              <button
                onClick={() => setShowAddLotModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLot}>
              <div className="modal-body">
                <div>
                  <label className="form-label">Lot Number / Identification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-BKC-2026-009"
                    value={newLotForm.lot_number}
                    onChange={(e) => setNewLotForm({ ...newLotForm, lot_number: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      value={newLotForm.category_name}
                      onChange={(e) => setNewLotForm({ ...newLotForm, category_name: e.target.value })}
                      className="form-select"
                    >
                      <option value="PARCEL_LOT">PARCEL_LOT (Melee / Parcha)</option>
                      <option value="ROUGH">ROUGH (Uncut African/Antwerp)</option>
                      <option value="POLISHED">POLISHED (Commercial)</option>
                      <option value="SOLITAIRE">SOLITAIRE</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Total Carats (Weight)</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="e.g. 154.25"
                      value={newLotForm.total_carat}
                      onChange={(e) => setNewLotForm({ ...newLotForm, total_carat: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Cost Rate Per Carat (INR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 32000"
                    value={newLotForm.cost_per_carat}
                    onChange={(e) => setNewLotForm({ ...newLotForm, cost_per_carat: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddLotModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Save Lot to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SINGLE CERTIFIED DIAMOND */}
      {showAddDiamondModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Add Certified Single Diamond (GIA / IGI / HRD)
              </h3>
              <button
                onClick={() => setShowAddDiamondModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateDiamond}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Certification Lab</label>
                    <select
                      value={newDiamondForm.cert_type}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, cert_type: e.target.value })}
                      className="form-select"
                    >
                      <option value="GIA">GIA (USA)</option>
                      <option value="IGI">IGI (India/Belgium)</option>
                      <option value="HRD">HRD (Antwerp)</option>
                      <option value="NON_CERT">NON_CERT</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Certificate Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2234901821"
                      value={newDiamondForm.cert_number}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, cert_number: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Shape</label>
                    <select
                      value={newDiamondForm.shape}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, shape: e.target.value })}
                      className="form-select"
                    >
                      <option value="ROUND">ROUND (BRILLIANT)</option>
                      <option value="OVAL">OVAL</option>
                      <option value="PEAR">PEAR</option>
                      <option value="EMERALD">EMERALD</option>
                      <option value="CUSHION">CUSHION</option>
                      <option value="MARQUISE">MARQUISE</option>
                      <option value="PRINCESS">PRINCESS</option>
                      <option value="RADIANT">RADIANT</option>
                      <option value="HEART">HEART</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Carat Weight</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 2.01"
                      value={newDiamondForm.carat}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, carat: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Color Grade</label>
                    <select
                      value={newDiamondForm.color}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, color: e.target.value })}
                      className="form-select"
                    >
                      <option value="D">D (Colorless)</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                      <option value="G">G (Near Colorless)</option>
                      <option value="H">H</option>
                      <option value="I">I</option>
                      <option value="J">J</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Clarity Grade</label>
                    <select
                      value={newDiamondForm.clarity}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, clarity: e.target.value })}
                      className="form-select"
                    >
                      <option value="FL">FL (Flawless)</option>
                      <option value="IF">IF (Internally Flawless)</option>
                      <option value="VVS1">VVS1</option>
                      <option value="VVS2">VVS2</option>
                      <option value="VS1">VS1</option>
                      <option value="VS2">VS2</option>
                      <option value="SI1">SI1</option>
                      <option value="SI2">SI2</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label">Cut</label>
                    <select
                      value={newDiamondForm.cut}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, cut: e.target.value })}
                      className="form-select"
                    >
                      <option value="EXCELLENT">EXCELLENT</option>
                      <option value="VERY_GOOD">VERY GOOD</option>
                      <option value="GOOD">GOOD</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Polish</label>
                    <select
                      value={newDiamondForm.polish}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, polish: e.target.value })}
                      className="form-select"
                    >
                      <option value="EXCELLENT">EXCELLENT</option>
                      <option value="VERY_GOOD">VERY GOOD</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Symmetry</label>
                    <select
                      value={newDiamondForm.symmetry}
                      onChange={(e) => setNewDiamondForm({ ...newDiamondForm, symmetry: e.target.value })}
                      className="form-select"
                    >
                      <option value="EXCELLENT">EXCELLENT</option>
                      <option value="VERY_GOOD">VERY GOOD</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddDiamondModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Register Solitaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BREAKDOWN LOT */}
      {showBreakdownModal && selectedLot && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Split / Breakdown Lot: {selectedLot.lot_number}
              </h3>
              <button
                onClick={() => setShowBreakdownModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBreakdownLot}>
              <div className="modal-body">
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Available Weight:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedLot.current_carat.toFixed(3)} Carats
                  </div>
                </div>
                <div>
                  <label className="form-label">Carats to Extract / Split</label>
                  <input
                    type="number"
                    step="0.001"
                    max={selectedLot.current_carat}
                    required
                    placeholder="e.g. 25.50"
                    value={breakdownForm.carats_to_transfer}
                    onChange={(e) => setBreakdownForm({ ...breakdownForm, carats_to_transfer: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">New Child Lot Number</label>
                  <input
                    type="text"
                    placeholder={`e.g. ${selectedLot.lot_number}-SUB1`}
                    value={breakdownForm.new_lot_number}
                    onChange={(e) => setBreakdownForm({ ...breakdownForm, new_lot_number: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowBreakdownModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Split size={16} /> Confirm Lot Breakdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
