import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Ledger, Voucher, StockItem, SalesPurchaseVoucher, LedgerGroupMaster } from '../../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5003';

// Hardcoded groups and ledgers for dropdown
const hardcodedGroups = [
  "Bank Accounts",
  "Cash-in-Hand",
  "Duties & Taxes",
  "Provisions",
  "Reserves & Surplus",
  "Secured Loans",
  "Sundry Creditors",
  "Sundry Debtors",
  "Unsecured Loans",
  "Stock-in-Hand",
  "Bank OD A/c"
];

const hardcodedLedgers = [
  "Cash",
  "HDFC Bank",
  "Sales",
  "Purchases",
  "Consulting Income",
  "CGST",
  "SGST",
  "IGST",
  "Balamurugan Fabricators",
  "Local Supplier",
  "Global Tech Supplies",
  "Local Customer",
  "Prime Retail Customer",
  "Rent Expense",
  "Office Supplies",
  "Owner Capital"
];

// Ledger Selector Component
interface LedgerSelectorProps {
  selectedValue: string;
  onChange: (value: string) => void;
  groups: string[];
  ledgers: string[];
}

const LedgerSelector: React.FC<LedgerSelectorProps> = ({
  selectedValue,
  onChange,
  groups,
  ledgers
}) => {
  return (
    <select
      value={selectedValue}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
    >
      <option value="">All Ledgers</option>
      <optgroup label="Groups">
        {groups.map(g => <option key={g} value={`group:${g}`}>{g}</option>)}
      </optgroup>
      <optgroup label="Ledgers">
        {ledgers.map(l => <option key={l} value={`ledger:${l}`}>{l}</option>)}
      </optgroup>
    </select>
  );
};

interface ReportsPageProps {
  vouchers: Voucher[];
  ledgers: Ledger[];
  ledgerGroups: LedgerGroupMaster[];
  stockItems: StockItem[];
}

type ReportType = 'DayBook' | 'LedgerReport' | 'TrialBalance' | 'StockSummary' | 'GSTReports';

type GSTForm = 'GSTR-1' | 'GSTR-2' | 'GSTR-2A' | 'GSTR-2B' | 'GSTR-3B' | 'GSTR-4' | 'GSTR-5' | 'GSTR-5A' | 'GSTR-6' | 'GSTR-7' | 'GSTR-8' | 'GSTR-9' | 'GSTR-9A' | 'GSTR-9C' | 'GSTR-10';

type GSTTab = 'B2B' | 'B2C-L' | 'B2C-S' | 'Exports' | 'CDN' | 'Advances' | 'ITC-Eligible' | 'ITC-Ineligible' | 'RCM-Liability' | 'ITC-Available' | 'ITC-Reversal' | 'Outward' | 'ITC' | 'Payment';

const ReportsPage: React.FC<ReportsPageProps> = ({ vouchers = [], ledgers = [], ledgerGroups = [], stockItems = [] }) => {
  // Report Options Mapping
  const allReports: { id: ReportType; label: string }[] = [
    { id: 'DayBook', label: 'Day Book' },
    { id: 'LedgerReport', label: 'Ledger Report' },
    { id: 'TrialBalance', label: 'Trial Balance' },
    { id: 'StockSummary', label: 'Stock Summary' },
    { id: 'GSTReports', label: 'GST Reports' }
  ];

  // RBAC Disabled - Show all reports
  const availableReports = allReports;
  const defaultReport = availableReports[0].id;

  const [reportType, setReportType] = useState<ReportType>(defaultReport);

  const [selectedLedger, setSelectedLedger] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Download mappings for each report type
  const downloadMappings: { [key in ReportType]: { endpoint: string; filename: string } } = {
    DayBook: { endpoint: '/api/reports/daybook/excel', filename: 'DayBook.xlsx' },
    LedgerReport: { endpoint: '/api/reports/ledger/excel', filename: 'Ledger.xlsx' },
    TrialBalance: { endpoint: '/api/reports/trialbalance/excel', filename: 'TrialBalance.xlsx' },
    StockSummary: { endpoint: '/api/reports/stocksummary/excel', filename: 'StockSummary.xlsx' },
    GSTReports: { endpoint: '/api/reports/gst/excel', filename: 'GstReport.xlsx' }
  };

  // Handle Excel download
  const handleDownload = async () => {
    const mapping = downloadMappings[reportType];
    try {
      // Construct Query Params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (reportType === 'LedgerReport' && selectedLedger) {
        // Extract actual name if it has prefix
        const cleanName = selectedLedger.includes(':') ? selectedLedger.split(':')[1] : selectedLedger;
        params.append('ledger', cleanName);
      }

      const response = await fetch(`${API_BASE_URL}${mapping.endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          // 'Authorization': ... removed, using cookies now
        },
        credentials: 'include', // Important: Send cookies
      });
      if (!response.ok) throw new Error('Failed to download');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mapping.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel file. Please try again.');
    }
  };

  const [gstForm, setGstForm] = useState<GSTForm>('GSTR-1');
  const [gstTab, setGstTab] = useState<GSTTab>('B2B');
  const [selectedGstReturn, setSelectedGstReturn] = useState<GSTForm>('GSTR-1');

  // Handle GST return dropdown changes
  useEffect(() => {
    setSelectedGstReturn(gstForm);
  }, [gstForm]);

  // Prevent rendering if data arrays are not properly initialized
  if (!Array.isArray(vouchers) || !Array.isArray(ledgers) || !Array.isArray(stockItems)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading reports data...</div>
      </div>
    );
  }

  const ledgersByName = useMemo(() => {
    if (!ledgers || !Array.isArray(ledgers)) return {};
    return ledgers.filter(ledger => ledger && ledger.name).reduce((acc, ledger) => {
      acc[ledger.name] = ledger;
      return acc;
    }, {} as { [key: string]: Ledger });
  }, [ledgers]);

  const ledgerToGroup = useMemo(() => {
    const map: { [key: string]: string } = {};
    ledgers.forEach(l => map[l.name] = l.group);
    return map;
  }, [ledgers]);

  const getInvolvedLedgers = (v: Voucher): string[] => {
    switch (v.type) {
      case 'Purchase':
      case 'Sales':
        return [v.party];
      case 'Payment':
      case 'Receipt':
        return [v.party, (v as any).account];
      case 'Contra':
        const contra = v as any;
        return [contra.fromAccount, contra.toAccount];
      case 'Journal':
        return (v as any).entries.map((e: any) => e.ledger);
      default:
        return [];
    }
  };



  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    if (vouchers && Array.isArray(vouchers)) {
      vouchers.forEach(v => {
        const d = new Date(v.date);
        // Handle potential invalid dates from user input
        if (!isNaN(d.getTime())) {
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          months.add(monthKey);
        }
      });
    }
    return Array.from(months).sort((a, b) => b.localeCompare(a)).map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        value: monthKey,
        label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
      };
    });
  }, [vouchers]);

  const trialBalanceData = useMemo(() => {
    if (reportType !== 'TrialBalance') return null;

    try {
      const balances: { [key: string]: { debit: number; credit: number } } = {};

      // Helper to safely initialize a ledger if it doesn't exist
      const ensureLedger = (name: string) => {
        if (name && typeof name === 'string' && !balances[name]) {
          balances[name] = { debit: 0, credit: 0 };
        }
      };

      // Initialize with all known ledgers from the master list
      if (ledgers && Array.isArray(ledgers)) {
        ledgers.forEach(l => ensureLedger(l.name));
      }

      if (vouchers && Array.isArray(vouchers)) {
        vouchers.forEach(v => {
          // Ensure all ledgers mentioned in the voucher exist in our balances object
          // before we start calculating. This prevents crashes if data is out of sync.
          switch (v.type) {
            case 'Purchase':
              ensureLedger(v.party);
              ensureLedger('Purchases');
              ensureLedger('IGST'); ensureLedger('CGST'); ensureLedger('SGST');

              if (balances[v.party]) balances[v.party].credit += Number(v.total || 0);
              if (balances['Purchases']) balances['Purchases'].debit += Number(v.totalTaxableAmount || 0);
              if (v.isInterState) {
                if (balances['IGST']) balances['IGST'].debit += Number(v.totalIgst || 0);
              } else {
                if (balances['CGST']) balances['CGST'].debit += Number(v.totalCgst || 0);
                if (balances['SGST']) balances['SGST'].debit += Number(v.totalSgst || 0);
              }
              break;
            case 'Sales':
              ensureLedger(v.party);
              ensureLedger('Sales');
              ensureLedger('IGST'); ensureLedger('CGST'); ensureLedger('SGST');

              if (balances[v.party]) balances[v.party].debit += Number(v.total || 0);
              if (balances['Sales']) balances['Sales'].credit += Number(v.totalTaxableAmount || 0);
              if (v.isInterState) {
                if (balances['IGST']) balances['IGST'].credit += Number(v.totalIgst || 0);
              } else {
                if (balances['CGST']) balances['CGST'].credit += Number(v.totalCgst || 0);
                if (balances['SGST']) balances['SGST'].credit += Number(v.totalSgst || 0);
              }
              break;
            case 'Payment':
              ensureLedger(v.party);
              ensureLedger((v as any).account);
              if (balances[v.party]) balances[v.party].debit += Number((v as any).amount || 0);
              if (balances[(v as any).account]) balances[(v as any).account].credit += Number((v as any).amount || 0);
              break;
            case 'Receipt':
              ensureLedger(v.party);
              ensureLedger((v as any).account);
              if (balances[v.party]) balances[v.party].credit += Number((v as any).amount || 0);
              if (balances[(v as any).account]) balances[(v as any).account].debit += Number((v as any).amount || 0);
              break;
            case 'Contra':
              ensureLedger((v as any).fromAccount);
              ensureLedger((v as any).toAccount);
              if (balances[(v as any).fromAccount]) balances[(v as any).fromAccount].credit += Number((v as any).amount || 0);
              if (balances[(v as any).toAccount]) balances[(v as any).toAccount].debit += Number((v as any).amount || 0);
              break;
            case 'Journal':
              if ((v as any).entries && Array.isArray((v as any).entries)) {
                (v as any).entries.forEach((e: any) => {
                  if (e && typeof e === 'object' && e.ledger && typeof e.ledger === 'string') {
                    ensureLedger(e.ledger);
                    if (balances[e.ledger]) {
                      balances[e.ledger].debit += Number(e.debit || 0);
                      balances[e.ledger].credit += Number(e.credit || 0);
                    }
                  }
                });
              }
              break;
          }
        });
      }

      const result = Object.entries(balances)
        .map(([ledger, { debit, credit }]) => {
          if (debit > credit) return { ledger, debit: debit - credit, credit: 0 };
          if (credit > debit) return { ledger, debit: 0, credit: credit - debit };
          return { ledger, debit: 0, credit: 0 };
        })
        .filter(item => item.debit > 0 || item.credit > 0);

      const totals = result.reduce((acc, curr) => ({
        debit: acc.debit + curr.debit,
        credit: acc.credit + curr.credit
      }), { debit: 0, credit: 0 });

      return { result, totals };
    } catch (error) {
      console.error('Error calculating trial balance:', error);
      return { result: [], totals: { debit: 0, credit: 0 } };
    }
  }, [reportType, vouchers, ledgers]);

  const stockSummaryData = useMemo(() => {
    if (reportType !== 'StockSummary') return null;

    const summary: { [key: string]: { inward: number, outward: number } } = {};
    if (stockItems && Array.isArray(stockItems)) {
      stockItems.filter(i => i && i.name).forEach(i => {
        summary[i.name] = { inward: 0, outward: 0 };
      });
    }

    if (vouchers && Array.isArray(vouchers)) {
      vouchers.forEach(v => {
        if (v.type === 'Purchase' || v.type === 'Sales') {
          const voucher = v as SalesPurchaseVoucher;
          if (voucher.items && Array.isArray(voucher.items)) {
            voucher.items.filter(item => item && item.name).forEach(item => {
              if (summary[item.name]) {
                if (v.type === 'Purchase') {
                  summary[item.name].inward += item.qty || 0;
                } else {
                  summary[item.name].outward += item.qty || 0;
                }
              }
            });
          }
        }
      });
    }

    return Object.entries(summary).map(([name, data]) => ({
      name,
      opening: 0,
      ...data,
      closing: data.inward - data.outward,
    }));
  }, [reportType, vouchers, stockItems]);

  const gstr1Data = useMemo(() => {
    if (reportType !== 'GSTR1') return null;
    if (!vouchers || !Array.isArray(vouchers)) return { b2b: [], b2c: [] };

    const salesVouchers = vouchers.filter(v => v.type === 'Sales') as SalesPurchaseVoucher[];

    const b2b = salesVouchers.filter(v => {
      const partyLedger = ledgersByName[v.party];
      return partyLedger?.registrationType === 'Registered' && partyLedger?.gstin;
    });

    const b2c = salesVouchers.filter(v => {
      const partyLedger = ledgersByName[v.party];
      return !partyLedger || partyLedger.registrationType !== 'Registered' || !partyLedger.gstin;
    });

    return { b2b, b2c };
  }, [reportType, vouchers, ledgersByName]);




  const filteredVouchers = useMemo(() => {
    if (!vouchers || !Array.isArray(vouchers)) return [];

    let filtered = vouchers;

    if (reportType === 'LedgerReport' && selectedLedger) {
      filtered = filtered.filter(v => {
        switch (v.type) {
          case 'Purchase':
          case 'Sales':
          case 'Payment':
          case 'Receipt':
            return v.party === selectedLedger || ('account' in v && v.account === selectedLedger);
          case 'Contra':
            return v.fromAccount === selectedLedger || v.toAccount === selectedLedger;
          case 'Journal':
            return v.entries && Array.isArray(v.entries) && v.entries.some(e => e && e.ledger === selectedLedger);
          default:
            return false;
        }
      });
    }

    if ((reportType === 'DayBook' || reportType === 'LedgerReport') && (startDate || endDate)) {
      filtered = filtered.filter(v => {
        const vDate = new Date(v.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && vDate < start) return false;
        if (end && vDate > end) return false;
        return true;
      });
    }

    return filtered;
  }, [vouchers, reportType, selectedLedger, startDate, endDate]);

  const getVoucherAmount = (v: Voucher) => {
    if ('total' in v && v.total != null) {
      const num = Number(v.total);
      if (!isNaN(num)) return num;
    }
    if ('amount' in v && v.amount != null) {
      const num = Number(v.amount);
      if (!isNaN(num)) return num;
    }
    return 0;
  };
  const getVoucherParty = (v: Voucher) => ('party' in v ? v.party : 'N/A');

  const ledgerEntries = useMemo(() => {
    if (reportType !== 'LedgerReport' || !selectedLedger || !filteredVouchers.length) return [];

    let balance = 0;
    return filteredVouchers.map(v => {
      let debit = 0, credit = 0, particulars = '';

      switch (v.type) {
        case 'Purchase':
          if (v.party === selectedLedger) {
            credit = v.total || 0;
            particulars = 'Purchases';
          } else if ('account' in v && v.account === selectedLedger) {
            debit = v.total || 0;
            particulars = v.party;
          }
          break;
        case 'Sales':
          if (v.party === selectedLedger) {
            debit = v.total || 0;
            particulars = 'Sales';
          } else if ('account' in v && v.account === selectedLedger) {
            credit = v.total || 0;
            particulars = v.party;
          }
          break;
        case 'Payment':
          if (v.party === selectedLedger) {
            debit = v.amount || 0;
            particulars = v.account;
          } else if (v.account === selectedLedger) {
            credit = v.amount || 0;
            particulars = v.party;
          }
          break;
        case 'Receipt':
          if (v.party === selectedLedger) {
            credit = v.amount || 0;
            particulars = v.account;
          } else if (v.account === selectedLedger) {
            debit = v.amount || 0;
            particulars = v.party;
          }
          break;
        case 'Contra':
          if (v.fromAccount === selectedLedger) {
            credit = v.amount || 0;
            particulars = v.toAccount;
          } else if (v.toAccount === selectedLedger) {
            debit = v.amount || 0;
            particulars = v.fromAccount;
          }
          break;
        case 'Journal':
          if (v.entries && Array.isArray(v.entries)) {
            const entry = v.entries.find(e => e.ledger === selectedLedger);
            if (entry) {
              debit = entry.debit || 0;
              credit = entry.credit || 0;
              particulars = v.entries.filter(e => e.ledger !== selectedLedger).map(e => e.ledger).join(', ') || 'Journal Entry';
            }
          }
          break;
      }

      balance += debit - credit;

      return {
        id: v.id,
        date: v.date,
        type: v.type,
        particulars,
        debit,
        credit,
        balance
      };
    });
  }, [reportType, selectedLedger, filteredVouchers]);

  const renderDayBook = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Voucher Type</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Party</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {filteredVouchers.length > 0 ? filteredVouchers.map((v, idx) => (
            <tr key={`daybook-${v.type}-${v.date}-${v.id || idx}`} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(v.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{v.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getVoucherParty(v)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹{getVoucherAmount(v).toFixed(2)}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-sm text-center text-gray-500">
                {(startDate || endDate) ? 'No transactions found for the selected filter.' : 'No transactions found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderLedger = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Particulars</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Voucher Type</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Debit</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {ledgerEntries.length > 0 ? ledgerEntries.map((entry, idx) => (
            <tr key={`ledger-${entry.date}-${entry.type}-${entry.id || idx}`} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(entry.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{entry.particulars}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">{entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : ''}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">{entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : ''}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹{entry.balance.toFixed(2)}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-sm text-center text-gray-500">
                {!selectedLedger ? 'Please select a ledger.' :
                  (startDate || endDate) ? 'No transactions found for the selected filter.' :
                    'No transactions found.'
                }
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTrialBalance = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ledger</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Debit</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {trialBalanceData?.result.map(item => (
            <tr key={item.ledger} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.ledger}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">{item.debit > 0 ? `₹${item.debit.toFixed(2)}` : ''}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">{item.credit > 0 ? `₹${item.credit.toFixed(2)}` : ''}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-900">Total</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-bold text-gray-900">₹{trialBalanceData?.totals.debit.toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-bold text-gray-900">₹{trialBalanceData?.totals.credit.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const renderStockSummary = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Opening Stock</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Inward</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Outward</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Closing Stock</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {stockSummaryData?.map(item => (
            <tr key={item.name} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">{item.opening}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">{item.inward}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">{item.outward}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">{item.closing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // GST Report Render Functions
  const renderGSTR1 = () => (
    <>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">GSTR-1: Details of outward supplies of goods or services</h3>

      {/* Section 1: B2B Invoices */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-800 mb-4">1. B2B Invoices (Registered Dealers)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">GSTIN</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PARTY NAME</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">TAXABLE VALUE</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">TOTAL TAX</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">INVOICE VALUE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {/* Sample mock data for B2B */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">22AAAAA0000A1Z5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">ABC Corporation Ltd</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹50,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹9,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹59,000.00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">33BBBBB1111B2Y6</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">XYZ Enterprises Pvt Ltd</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹75,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹13,500.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹88,500.00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">44CCCCC2222C3X7</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Global Tech Solutions</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹30,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹5,400.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹35,400.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: B2C Invoices */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-800 mb-4">2. B2C Invoices (Unregistered Dealers)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PARTY NAME</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">TAXABLE VALUE</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">TOTAL TAX</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">INVOICE VALUE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {/* Sample mock data for B2C */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Local Customer A</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹25,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹4,500.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹29,500.00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Walk-in Customer B</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹15,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹2,700.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹17,700.00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Online Customer C</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹40,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹7,200.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹47,200.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderGSTR2A = () => (
    <>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">GSTR-2A: Details of inward supplies from registered persons</h3>

      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Purchase Invoices from Registered Suppliers</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">GSTIN</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SUPPLIER NAME</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">INVOICE NO</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DATE</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">TAXABLE VALUE</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">IGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">CGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">SGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">INVOICE VALUE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">22AAAAA0000A1Z5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">ABC Suppliers Ltd</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">INV-001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">15/11/2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹45,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹4,050.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹4,050.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹53,100.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderGSTR3B = () => (
    <>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">GSTR-3B: Monthly Return</h3>

      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-800 mb-4">3.1 Details of Outward Supplies</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DESCRIPTION</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">TAXABLE VALUE</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">IGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">CGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">SGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">CESS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">(a) Outward Taxable supplies (other than zero rated, nil rated and exempted)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹155,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹13,950.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹13,950.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">(b) Outward Taxable supplies (zero rated)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-800 mb-4">4. Eligible ITC</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DESCRIPTION</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">IGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">CGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">SGST</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">CESS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">(A) ITC Available (whether in full or part)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹4,050.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹4,050.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-right font-semibold text-gray-900">₹0.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // Default render function for other GST forms
  const renderDefaultGST = (form: GSTForm) => (
    <>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{form}: GST Return</h3>
      <div className="text-center py-12">
        <p className="text-gray-500">{form} report is under development.</p>
        <p className="text-sm text-gray-400 mt-2">This GST return type will be implemented in future updates.</p>
      </div>
    </>
  );

  // Dynamic GST renderer
  const renderGSTReport = () => {
    switch (selectedGstReturn) {
      case 'GSTR-1':
        return renderGSTR1();
      case 'GSTR-2A':
        return renderGSTR2A();
      case 'GSTR-3B':
        return renderGSTR3B();
      default:
        return renderDefaultGST(selectedGstReturn);
    }
  };






  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Reports</h2>

      <div className="mb-8 flex p-1 bg-gray-200 rounded-xl max-w-4xl shadow-sm">
        {availableReports.map(({ id, label }, idx) => (
          <button
            key={`report-tab-${id}-${idx}`}
            onClick={() => setReportType(id as ReportType)}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${reportType === id
              ? 'bg-white text-blue-600 shadow-md border border-gray-200'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        {reportType === 'DayBook' && (
          <>
            <div className="mb-6 flex flex-wrap items-end gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="min-w-[200px]">
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="min-w-[200px]">
                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="px-6 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                {reportType === 'DayBook' && 'Download Day Book Excel'}
                {reportType === 'LedgerReport' && 'Download Ledger Excel'}
                {reportType === 'TrialBalance' && 'Download Trial Balance Excel'}
                {reportType === 'StockSummary' && 'Download Stock Summary Excel'}
                {reportType === 'GSTReports' && 'Download GST Excel'}
              </button>
            </div>
          </>
        )}
        {reportType === 'LedgerReport' && (
          <>
            <div className="mb-6 flex flex-wrap items-end gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="min-w-[250px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Ledger/Group</label>
                <LedgerSelector
                  selectedValue={selectedLedger}
                  onChange={setSelectedLedger}
                  groups={hardcodedGroups}
                  ledgers={hardcodedLedgers}
                />
              </div>
              <div className="min-w-[200px]">
                <label htmlFor="ledgerStartDate" className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  id="ledgerStartDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="min-w-[200px]">
                <label htmlFor="ledgerEndDate" className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  id="ledgerEndDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="px-6 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                {reportType === 'LedgerReport' && 'Download Ledger Excel'}
              </button>
            </div>
          </>
        )}
        {reportType === 'TrialBalance' && (
          <>
            <div className="mb-6 flex flex-wrap items-end gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="min-w-[200px]">
                <label htmlFor="trialStartDate" className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  id="trialStartDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="min-w-[200px]">
                <label htmlFor="trialEndDate" className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  id="trialEndDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                {reportType === 'TrialBalance' && 'Download Trial Balance Excel'}
              </button>
            </div>
          </>
        )}
        {reportType === 'StockSummary' && (
          <>
            <div className="mb-6 flex flex-wrap items-end gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="min-w-[200px]">
                <label htmlFor="stockStartDate" className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  id="stockStartDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="min-w-[200px]">
                <label htmlFor="stockEndDate" className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  id="stockEndDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                {reportType === 'StockSummary' && 'Download Stock Summary Excel'}
              </button>
            </div>
          </>
        )}
        {reportType === 'GSTReports' && (
          <>
            {/* Filter Section Row */}
            <div className="mb-6 flex flex-wrap items-end gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">GST Return</label>
                <select
                  value={gstForm}
                  onChange={(e) => setGstForm(e.target.value as GSTForm)}
                  className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="GSTR-1">GSTR-1</option>
                  <option value="GSTR-2">GSTR-2</option>
                  <option value="GSTR-2A">GSTR-2A</option>
                  <option value="GSTR-2B">GSTR-2B</option>
                  <option value="GSTR-3B">GSTR-3B</option>
                  <option value="GSTR-4">GSTR-4</option>
                  <option value="GSTR-5">GSTR-5</option>
                  <option value="GSTR-5A">GSTR-5A</option>
                  <option value="GSTR-6">GSTR-6</option>
                  <option value="GSTR-7">GSTR-7</option>
                  <option value="GSTR-8">GSTR-8</option>
                  <option value="GSTR-9">GSTR-9</option>
                  <option value="GSTR-9A">GSTR-9A</option>
                  <option value="GSTR-9C">GSTR-9C</option>
                  <option value="GSTR-10">GSTR-10</option>
                </select>
              </div>
              <div className="min-w-[200px]">
                <label htmlFor="gstStartDate" className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  id="gstStartDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="min-w-[200px]">
                <label htmlFor="gstEndDate" className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  id="gstEndDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                {reportType === 'GSTReports' && 'Download GST Excel'}
              </button>
            </div>

            {/* Dynamic GST Report Content */}
            <div className="mb-8">
              {renderGSTReport()}
            </div>
          </>
        )}
        <div className="overflow-x-auto">
          {reportType === 'DayBook' && renderDayBook()}
          {reportType === 'LedgerReport' && renderLedger()}
          {reportType === 'TrialBalance' && renderTrialBalance()}
          {reportType === 'StockSummary' && renderStockSummary()}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
