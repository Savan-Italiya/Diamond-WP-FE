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
import { Search, Split, Share2, Hammer, Filter } from 'lucide-react';

interface DiamondTableProps {
  lots: DiamondLot[];
  solitaires: SingleDiamond[];
}

export const DiamondTable: React.FC<DiamondTableProps> = ({ lots, solitaires }) => {
  const [activeSubTab, setActiveSubTab] = useState<'lots' | 'solitaires'>('lots');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Columns for Bulk Lots
  const lotColumns = useMemo<ColumnDef<DiamondLot>[]>(
    () => [
      {
        accessorKey: 'lot_number',
        header: 'Lot Number / Parcha',
        cell: (info) => (
          <span style={{ fontWeight: 600, color: '#38bdf8' }}>{String(info.getValue())}</span>
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
          <span style={{ fontWeight: 700, color: '#f8fafc' }}>
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
        cell: ({ row }) => (
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>
            ₹{(row.original.current_carat * row.original.cost_per_carat).toLocaleString('en-IN')}
          </span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Stock Status',
        cell: (info) => {
          const val = String(info.getValue());
          const badgeClass =
            val === 'IN_STOCK' ? 'badge-in-stock' : val === 'MEMO' ? 'badge-memo' : 'badge-overdue';
          return <span className={`badge ${badgeClass}`}>{val}</span>;
        }
      }
    ],
    []
  );

  // Columns for Single Certified Solitaires
  const solitaireColumns = useMemo<ColumnDef<SingleDiamond>[]>(
    () => [
      {
        accessorKey: 'cert_number',
        header: 'Certificate #',
        cell: ({ row }) => (
          <div>
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>{row.original.cert_number || 'NON-CERT'}</span>
            <span style={{ marginLeft: '6px' }} className="badge badge-gia">{row.original.cert_type}</span>
          </div>
        )
      },
      {
        accessorKey: 'shape',
        header: 'Shape',
        cell: (info) => <span style={{ fontWeight: 600 }}>{String(info.getValue())}</span>
      },
      {
        accessorKey: 'carat',
        header: 'Carat Weight',
        cell: (info) => <span style={{ fontWeight: 700, color: '#f8fafc' }}>{Number(info.getValue()).toFixed(2)} Ct</span>
      },
      {
        accessorKey: 'color',
        header: 'Color',
        cell: (info) => <span style={{ fontWeight: 700, color: '#34d399' }}>{String(info.getValue())}</span>
      },
      {
        accessorKey: 'clarity',
        header: 'Clarity',
        cell: (info) => <span style={{ fontWeight: 700, color: '#38bdf8' }}>{String(info.getValue())}</span>
      },
      {
        accessorKey: 'cut',
        header: 'Cut / Polish / Symm',
        cell: ({ row }) => (
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {row.original.cut || 'EX'} / {row.original.polish || 'EX'} / {row.original.symmetry || 'EX'}
          </span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const val = String(info.getValue());
          const badgeClass = val === 'IN_STOCK' ? 'badge-in-stock' : 'badge-memo';
          return <span className={`badge ${badgeClass}`}>{val}</span>;
        }
      }
    ],
    []
  );

  const tableData: any = activeSubTab === 'lots' ? lots : solitaires;
  const tableColumns: any = activeSubTab === 'lots' ? lotColumns : solitaireColumns;

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Table Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('lots')}
            className={activeSubTab === 'lots' ? 'btn-primary' : 'btn-dial'}
          >
            Bulk Parcels / Parcha ({lots.length})
          </button>
          <button
            onClick={() => setActiveSubTab('solitaires')}
            className={activeSubTab === 'solitaires' ? 'btn-primary' : 'btn-dial'}
          >
            Certified Solitaires (GIA/IGI) ({solitaires.length})
          </button>
        </div>

        {/* Global Search and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search lot, cert, shape, color..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{
                background: '#0a0d14',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                width: '260px'
              }}
            />
          </div>
        </div>
      </div>

      {/* TanStack Table Grid */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ▲',
                        desc: ' ▼'
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
