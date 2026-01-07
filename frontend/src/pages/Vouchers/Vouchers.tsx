import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { VoucherType, Ledger, StockItem, Voucher, SalesPurchaseVoucher, PaymentReceiptVoucher, ContraVoucher, JournalVoucher, JournalEntry, VoucherItem, ExtractedInvoiceData, CompanyDetails } from '../../types';
import Icon from '../../components/Icon';
import { apiService } from '../../services';
import MassUploadModal from '../../components/MassUploadModal';
import InvoiceScannerModal from '../../components/InvoiceScannerModal';
import ErrorBoundary from '../../components/ErrorBoundary';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5003';

// Let TypeScript know that the XLSX library is available globally
declare const XLSX: any;

interface VouchersPageProps {
  vouchers: Voucher[];
  ledgers: Ledger[];
  stockItems: StockItem[];
  onAddVouchers: (vouchers: Voucher[]) => void;
  prefilledData: ExtractedInvoiceData | null;
  clearPrefilledData: () => void;
  onInvoiceUpload: (file: File, voucherType?: string) => void;
  companyDetails: CompanyDetails;
  onMassUploadComplete: (vouchers: Voucher[]) => void;
  permissions: string[];
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, onChange, options, placeholder = "Select...", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          className="form-input pr-10"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Icon name="chevron-down" className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => (
              <div
                key={i}
                className="px-4 py-2 text-sm hover:bg-orange-50 cursor-pointer"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

const VouchersPage: React.FC<VouchersPageProps> = ({ vouchers, ledgers, stockItems, onAddVouchers, prefilledData, clearPrefilledData, onInvoiceUpload, companyDetails, onMassUploadComplete, permissions = [] }) => {

  const allVoucherTypes: { id: VoucherType; label: string; perm: string }[] = [
    { id: 'Purchase', label: 'Purchase', perm: 'VOUCHERS_PURCHASE' },
    { id: 'Sales', label: 'Sales', perm: 'VOUCHERS_SALES' },
    { id: 'Payment', label: 'Payment', perm: 'VOUCHERS_PAYMENT' },
    { id: 'Receipt', label: 'Receipt', perm: 'VOUCHERS_RECEIPT' },
    { id: 'Contra', label: 'Contra', perm: 'VOUCHERS_CONTRA' },
    { id: 'Journal', label: 'Journal', perm: 'VOUCHERS_JOURNAL' }
  ];

  const availableVoucherTypes = allVoucherTypes.filter(v => permissions.includes(v.perm));
  const defaultVoucherType = availableVoucherTypes.length > 0 ? availableVoucherTypes[0].id : 'Purchase';

  const [voucherType, setVoucherType] = useState<VoucherType>(defaultVoucherType);

  useEffect(() => {
    if (availableVoucherTypes.length > 0 && !availableVoucherTypes.find(v => v.id === voucherType)) {
      setVoucherType(availableVoucherTypes[0].id);
    }
  }, [permissions]);

  if (availableVoucherTypes.length === 0) {
    return <div className="p-8 text-center text-gray-500">You do not have permission to view any voucher types.</div>;
  }

  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const importMenuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [isMassUploadOpen, setIsMassUploadOpen] = useState(false);

  // Invoice Scanner Modal state
  const [isInvoiceScannerOpen, setIsInvoiceScannerOpen] = useState(false);
  const [uploadedInvoiceFiles, setUploadedInvoiceFiles] = useState<File[]>([]);
  const [extractedInvoiceData, setExtractedInvoiceData] = useState<any[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Common state
  const [date, setDate] = useState(getTodayDate());
  const [party, setParty] = useState('');
  const [narration, setNarration] = useState('');
  const [isNarrationLoading, setIsNarrationLoading] = useState(false);

  // Sales/Purchase
  const [invoiceNo, setInvoiceNo] = useState('');
  const [isInterState, setIsInterState] = useState(false);
  const [items, setItems] = useState<VoucherItem[]>([{ name: '', qty: 1, rate: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 }]);

  // Payment/Receipt
  const [account, setAccount] = useState('');
  const [simpleAmount, setSimpleAmount] = useState(0);

  // Contra
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');

  // Journal
  const [entries, setEntries] = useState<JournalEntry[]>([{ ledger: '', note: '', refNo: '', debit: 0, credit: 0 }, { ledger: '', note: '', refNo: '', debit: 0, credit: 0 }]);

  // Import feedback
  const [importSummary, setImportSummary] = useState<{ success: number, failed: number } | null>(null);

  // Payment voucher specific state
  const [paymentMode, setPaymentMode] = useState<'single' | 'bulk'>('single');
  const [voucherNumber, setVoucherNumber] = useState('Auto-generated');
  const [balance, setBalance] = useState(0);
  const [supplierInvNo, setSupplierInvNo] = useState('');
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [runningBalance, setRunningBalance] = useState(0);
  const [postingNote, setPostingNote] = useState('');
  const [showAdvance, setShowAdvance] = useState(false);
  const [advanceRefNo, setAdvanceRefNo] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [advanceDate, setAdvanceDate] = useState(getTodayDate());
  const [showBulkAdvance, setShowBulkAdvance] = useState(false);



  const triggerFileUpload = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
    setIsImportMenuOpen(false);
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onInvoiceUpload(file, voucherType);
    }
  };



  const isVoucher = (obj: any): obj is Voucher => {
    return obj && typeof obj.type === 'string' && typeof obj.date === 'string';
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        const data = JSON.parse(content as string);
        if (Array.isArray(data)) {
          const validVouchers: Voucher[] = [];
          let failed = 0;
          data.forEach(item => {
            if (isVoucher(item)) {
              // Override type to respect current voucherType
              item.type = voucherType;
              validVouchers.push(item);
            } else {
              failed++;
            }
          });
          if (validVouchers.length > 0) {
            onAddVouchers(validVouchers);
          }
          setImportSummary({ success: validVouchers.length, failed });
        } else {
          setImportSummary({ success: 0, failed: 1 });
        }
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        setImportSummary({ success: 0, failed: file.size > 0 ? 1 : 0 });
      }
    };
    reader.readAsText(file);
  };

  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        let allVouchers: Voucher[] = [];
        let failed = 0;

        const processSheet = (sheetName: string, type: 'SalesPurchases' | 'PaymentsReceipts' | 'Contra' | 'Journal') => {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            const rows = XLSX.utils.sheet_to_json(sheet);
            rows.forEach((row: any) => {
              try {
                // Override type with current voucherType to ensure consistency
                let voucher: Partial<Voucher> = { date: new Date((row.date - (25567 + 1)) * 86400 * 1000).toISOString().split('T')[0], type: voucherType, narration: row.narration };

                if (type === 'SalesPurchases') {
                  voucher = { ...voucher, party: row.party, invoiceNo: row.invoiceNo, isInterState: row.isInterState === 'TRUE', items: JSON.parse(row.items) } as Partial<SalesPurchaseVoucher>;
                  // Recalculate totals for data integrity
                  const { items, isInterState } = voucher as SalesPurchaseVoucher;
                  const totals = items.reduce((acc, item) => {
                    const stockItem = stockItems.find(si => si.name === item.name);
                    const gstRate = stockItem?.gstRate || 0;
                    const taxable = item.qty * item.rate;
                    const tax = taxable * (gstRate / 100);
                    item.taxableAmount = taxable;
                    if (isInterState) {
                      item.igstAmount = tax; item.cgstAmount = 0; item.sgstAmount = 0;
                    } else {
                      item.igstAmount = 0; item.cgstAmount = tax / 2; item.sgstAmount = tax / 2;
                    }
                    item.totalAmount = taxable + tax;
                    acc.taxable += item.taxableAmount; acc.cgst += item.cgstAmount; acc.sgst += item.sgstAmount; acc.igst += item.igstAmount; acc.total += item.totalAmount;
                    return acc;
                  }, { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
                  (voucher as SalesPurchaseVoucher).totalTaxableAmount = totals.taxable;
                  (voucher as SalesPurchaseVoucher).totalCgst = totals.cgst;
                  (voucher as SalesPurchaseVoucher).totalSgst = totals.sgst;
                  (voucher as SalesPurchaseVoucher).totalIgst = totals.igst;
                  (voucher as SalesPurchaseVoucher).total = totals.total;
                } else if (type === 'PaymentsReceipts') {
                  voucher = { ...voucher, party: row.party, account: row.account, amount: row.amount } as PaymentReceiptVoucher;
                } else if (type === 'Contra') {
                  voucher = { ...voucher, fromAccount: row.fromAccount, toAccount: row.toAccount, amount: row.amount } as ContraVoucher;
                } else if (type === 'Journal') {
                  const entries = JSON.parse(row.entries);
                  const { debit, credit } = entries.reduce((acc: any, e: any) => ({ debit: acc.debit + e.debit, credit: acc.credit + e.credit }), { debit: 0, credit: 0 });
                  voucher = { ...voucher, entries, totalDebit: debit, totalCredit: credit } as JournalVoucher;
                }

                if (isVoucher(voucher)) allVouchers.push(voucher as Voucher); else failed++;
              } catch { failed++; }
            });
          }
        };

        // Only process the sheet that matches the current voucherType
        if (voucherType === 'Purchase' || voucherType === 'Sales') {
          processSheet('SalesPurchases', 'SalesPurchases');
        } else if (voucherType === 'Payment' || voucherType === 'Receipt') {
          processSheet('PaymentsReceipts', 'PaymentsReceipts');
        } else if (voucherType === 'Contra') {
          processSheet('Contra', 'Contra');
        } else if (voucherType === 'Journal') {
          processSheet('Journal', 'Journal');
        }

        if (allVouchers.length > 0) {
          onAddVouchers(allVouchers);
        }
        setImportSummary({ success: allVouchers.length, failed });

      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setImportSummary({ success: 0, failed: 1 });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Define headers
    const spHeaders = [["date", "type", "invoiceNo", "party", "isInterState", "narration", "items"]];
    const prHeaders = [["date", "type", "account", "party", "amount", "narration"]];
    const cHeaders = [["date", "type", "fromAccount", "toAccount", "amount", "narration"]];
    const jHeaders = [["date", "type", "narration", "entries"]];

    // Example data
    spHeaders.push(["2023-01-01", "Sales", "INV-101", "Local Customer", "FALSE", "Sold goods", '[{"name": "Laptop", "qty": 1, "rate": 50000}]']);
    prHeaders.push(["2023-01-02", "Payment", "HDFC Bank", "Local Supplier", "25000", "Paid for supplies"]);
    cHeaders.push(["2023-01-03", "Contra", "Cash", "HDFC Bank", "10000", "Cash deposited"]);
    jHeaders.push(["2023-01-04", "Journal", "Adjustment entry", '[{"ledger": "Rent Expense", "debit": 15000, "credit": 0}, {"ledger": "Cash", "debit": 0, "credit": 15000}]']);

    // Create worksheets
    const spSheet = XLSX.utils.aoa_to_sheet(spHeaders);
    const prSheet = XLSX.utils.aoa_to_sheet(prHeaders);
    const cSheet = XLSX.utils.aoa_to_sheet(cHeaders);
    const jSheet = XLSX.utils.aoa_to_sheet(jHeaders);

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, spSheet, "SalesPurchases");
    XLSX.utils.book_append_sheet(wb, prSheet, "PaymentsReceipts");
    XLSX.utils.book_append_sheet(wb, cSheet, "Contra");
    XLSX.utils.book_append_sheet(wb, jSheet, "Journal");

    XLSX.writeFile(wb, "AI-Accounting_Voucher_Template.xlsx");
    setIsImportMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (importMenuRef.current && !importMenuRef.current.contains(event.target as Node)) {
        setIsImportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [importMenuRef]);

  const resetForm = useCallback(() => {
    setDate(getTodayDate());
    setInvoiceNo('');
    setParty('');
    setItems([{ name: '', qty: 1, rate: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 }]);
    setAccount('');
    setSimpleAmount(0);
    setNarration('');
    setFromAccount('');
    setToAccount('');
    setEntries([{ ledger: '', debit: 0, credit: 0 }, { ledger: '', debit: 0, credit: 0 }]);
    // Removed image clearing
  }, []);

  // Auto-set Inter-State flag based on party ledger's state
  useEffect(() => {
    if (voucherType === 'Purchase' || voucherType === 'Sales') {
      const partyLedger = ledgers.find(l => l.name === party);
      if (partyLedger && partyLedger.state && companyDetails.state) {
        const isInter = partyLedger.state.toLowerCase() !== companyDetails.state.toLowerCase();
        setIsInterState(isInter);
      } else {
        setIsInterState(false);
      }
    }
  }, [party, ledgers, companyDetails.state, voucherType]);

  // Recalculate all item taxes when transaction type (isInterState) changes
  useEffect(() => {
    setItems(currentItems => currentItems.map(item => {
      const stockItem = stockItems.find(si => si.name.toLowerCase() === item.name.toLowerCase());
      if (!stockItem || !item.name) {
        return item;
      }

      const gstRate = stockItem.gstRate || 0;
      const taxableAmount = item.qty * item.rate;
      const totalTax = taxableAmount * (gstRate / 100);

      const newItem = { ...item, taxableAmount };

      if (isInterState) {
        newItem.cgstAmount = 0;
        newItem.sgstAmount = 0;
        newItem.igstAmount = totalTax;
      } else {
        newItem.cgstAmount = totalTax / 2;
        newItem.sgstAmount = totalTax / 2;
        newItem.igstAmount = 0;
      }
      newItem.totalAmount = taxableAmount + totalTax;
      return newItem;
    }));
  }, [isInterState, stockItems]);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    // Handles YYYY-MM-DD and DD-MM-YYYY
    const parts = dateString.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) { // YYYY-MM-DD
        return dateString;
      }
      if (parts[2].length === 4) { // DD-MM-YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    // Fallback for other formats, might not be perfect
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (prefilledData) {
      // Keep current voucher type - don't change tabs, just populate form data

      if (voucherType === 'Purchase' || voucherType === 'Sales') {
        const partyLedger = ledgers.find(l => l.name.toLowerCase() === prefilledData.sellerName.toLowerCase());
        const newIsInterState = (partyLedger && partyLedger.state && companyDetails.state)
          ? partyLedger.state.toLowerCase() !== companyDetails.state.toLowerCase()
          : false;

        setDate(formatDateForInput(prefilledData.invoiceDate) || getTodayDate());
        setInvoiceNo(prefilledData.invoiceNumber || '');
        setParty(prefilledData.sellerName || '');
        setIsInterState(newIsInterState);

        if (prefilledData.lineItems && prefilledData.lineItems.length > 0) {
          const newItems = prefilledData.lineItems.map(item => {
            const stockItem = stockItems.find(si => si.name.toLowerCase() === item.itemDescription.toLowerCase());
            const gstRate = stockItem?.gstRate || 18;
            const taxableAmount = item.quantity * item.rate;
            const tax = taxableAmount * (gstRate / 100);

            return {
              name: item.itemDescription,
              qty: item.quantity,
              rate: item.rate,
              taxableAmount,
              cgstAmount: newIsInterState ? 0 : tax / 2,
              sgstAmount: newIsInterState ? 0 : tax / 2,
              igstAmount: newIsInterState ? tax : 0,
              totalAmount: taxableAmount + tax,
            };
          });
          setItems(newItems);
        } else {
          setItems([{ name: '', qty: 1, rate: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 }]);
        }
      } else if (voucherType === 'Payment' || voucherType === 'Receipt') {
        setDate(formatDateForInput(prefilledData.invoiceDate) || getTodayDate());
        setParty(prefilledData.sellerName || '');
        setAccount(prefilledData.invoiceNumber || ''); // Use invoice number as account
        setSimpleAmount(prefilledData.totalAmount || 0);
      } else if (voucherType === 'Contra') {
        setDate(formatDateForInput(prefilledData.invoiceDate) || getTodayDate());
        setFromAccount(prefilledData.sellerName || '');
        setToAccount(prefilledData.invoiceNumber || ''); // Use invoice number as to account
        setSimpleAmount(prefilledData.totalAmount || 0);
      } else if (voucherType === 'Journal') {
        setDate(formatDateForInput(prefilledData.invoiceDate) || getTodayDate());
        // For journal, we could create entries based on the invoice data
        setEntries([
          { ledger: prefilledData.sellerName || '', debit: prefilledData.totalAmount || 0, credit: 0 },
          { ledger: '', debit: 0, credit: prefilledData.totalAmount || 0 }
        ]);
      }

      clearPrefilledData();
    }
  }, [prefilledData, clearPrefilledData, stockItems, ledgers, companyDetails.state]);

  const { partyLedgers, accountLedgers, allLedgers } = useMemo(() => {
    const partyLedgers = [...ledgers]; // Allow all ledgers to be selected as a party across all voucher types
    const accountLedgers = ledgers.filter(l => l.group === 'Bank Accounts' || l.group === 'Cash-in-Hand');
    const allLedgers = [...ledgers];
    return { partyLedgers, accountLedgers, allLedgers };
  }, [ledgers]);

  const { totalTaxableAmount, totalCgst, totalSgst, totalIgst, grandTotal } = useMemo(() => {
    return items.reduce((acc, item) => {
      acc.totalTaxableAmount += item.taxableAmount;
      acc.totalCgst += item.cgstAmount;
      acc.totalSgst += item.sgstAmount;
      acc.totalIgst += item.igstAmount;
      acc.grandTotal += item.totalAmount;
      return acc;
    }, { totalTaxableAmount: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, grandTotal: 0 });
  }, [items]);

  const { totalDebit, totalCredit, isJournalBalanced } = useMemo(() => {
    const totalDebit = entries.reduce((acc, entry) => acc + entry.debit, 0);
    const totalCredit = entries.reduce((acc, entry) => acc + entry.credit, 0);
    const isJournalBalanced = totalDebit === totalCredit && totalDebit > 0;
    return { totalDebit, totalCredit, isJournalBalanced };
  }, [entries]);

  const handleItemChange = (index: number, field: keyof VoucherItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'name') {
      item.name = value as string;
    } else {
      // FIX: Ensure value is treated as a number to avoid type errors.
      (item as any)[field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    }

    const stockItem = stockItems.find(si => si.name.toLowerCase() === item.name.toLowerCase());
    const gstRate = stockItem?.gstRate || 0;

    item.taxableAmount = item.qty * item.rate;
    const totalTax = item.taxableAmount * (gstRate / 100);

    if (isInterState) {
      item.cgstAmount = 0;
      item.sgstAmount = 0;
      item.igstAmount = totalTax;
    } else {
      item.cgstAmount = totalTax / 2;
      item.sgstAmount = totalTax / 2;
      item.igstAmount = 0;
    }
    item.totalAmount = item.taxableAmount + totalTax;

    newItems[index] = item;
    setItems(newItems);
  };

  const handleEntryChange = (index: number, field: keyof JournalEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  }

  const handleAddItemRow = () => setItems([...items, { name: '', qty: 1, rate: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 }]);
  const handleRemoveItemRow = (index: number) => items.length > 1 && setItems(items.filter((_, i) => i !== index));
  const handleAddEntryRow = () => setEntries([...entries, { ledger: '', debit: 0, credit: 0 }]);
  const handleRemoveEntryRow = (index: number) => entries.length > 2 && setEntries(entries.filter((_, i) => i !== index));

  const handleSaveVoucher = () => {
    let voucher: Voucher | null = null;

    switch (voucherType) {
      case 'Purchase':
      case 'Sales':
        voucher = { id: '', type: voucherType, date, isInterState, invoiceNo, party, items, totalTaxableAmount, totalCgst, totalSgst, totalIgst, total: grandTotal, narration };
        break;
      case 'Payment':
      case 'Receipt':
        voucher = { id: '', type: voucherType, date, account, party, amount: simpleAmount, narration };
        break;
      case 'Contra':
        voucher = { id: '', type: voucherType, date, fromAccount, toAccount, amount: simpleAmount, narration };
        break;
      case 'Journal':
        if (isJournalBalanced) {
          voucher = { id: '', type: voucherType, date, entries, totalDebit, totalCredit, narration };
        } else {
          alert("Journal entries are not balanced!");
        }
        break;
    }

    if (voucher) {
      onAddVouchers([voucher]);
      resetForm();
    }
  };

  const handleGenerateNarration = async () => {
    setIsNarrationLoading(true);
    let voucherData: any = null;

    switch (voucherType) {
      case 'Purchase':
      case 'Sales':
        voucherData = { type: voucherType, party, invoiceNo, total: grandTotal, items };
        break;
      case 'Payment':
      case 'Receipt':
        voucherData = { type: voucherType, party, account, amount: simpleAmount };
        break;
      case 'Contra':
        voucherData = { type: voucherType, fromAccount, toAccount, amount: simpleAmount };
        break;
      case 'Journal':
        voucherData = { type: voucherType, entries, totalDebit };
        break;
    }

    if (voucherData) {
      try {
        const result = await apiService.generateNarration(voucherData);
        setNarration(result);
      } catch (error) {
        console.error('Failed to generate narration:', error);
        setNarration('Error generating narration. Please try again.');
      }
    }
    setIsNarrationLoading(false);
  };


  const renderSalesPurchaseForm = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" /></div>
        <div><label className="form-label">Invoice No.</label><input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="form-input" /></div>
        <div><label className="form-label">Party</label><SearchableSelect value={party} onChange={setParty} options={partyLedgers.map(l => l.name)} placeholder="Select Party" /></div>
      </div>
      <div className="mb-4 p-2 bg-slate-100 rounded-md text-center">
        <p className="text-sm font-semibold text-gray-700">
          Transaction Type: <span className="text-orange-600">{isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST & SGST)'}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full"><thead className="bg-slate-100"><tr>
          <th className="table-header">Item</th><th className="table-header w-24">Qty</th><th className="table-header w-28">Rate</th>
          <th className="table-header w-32">Taxable Amt</th>
          {!isInterState && <><th className="table-header w-28">CGST</th><th className="table-header w-28">SGST</th></>}
          {isInterState && <th className="table-header w-28">IGST</th>}
          <th className="table-header w-32">Total</th><th className="w-12"></th></tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (<tr key={index}>
              <td><input type="text" list="stock-items-datalist" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="table-input" /></td>
              <td><input type="number" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} className="table-input text-right" /></td>
              <td><input type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="table-input text-right" /></td>
              <td><input type="number" value={item.taxableAmount.toFixed(2)} readOnly className="table-input text-right" /></td>
              {!isInterState && <>
                <td><input type="number" value={item.cgstAmount.toFixed(2)} readOnly className="table-input text-right" /></td>
                <td><input type="number" value={item.sgstAmount.toFixed(2)} readOnly className="table-input text-right" /></td>
              </>}
              {isInterState && <td><input type="number" value={item.igstAmount.toFixed(2)} readOnly className="table-input text-right" /></td>}
              <td><input type="number" value={item.totalAmount.toFixed(2)} readOnly className="table-input text-right font-semibold" /></td>
              <td><button onClick={() => handleRemoveItemRow(index)} className="text-red-500 hover:text-red-700 p-1"><Icon name="trash" className="w-4 h-4" /></button></td>
            </tr>))}
          </tbody>
        </table>
        <datalist id="stock-items-datalist">{stockItems.map(i => <option key={i.name} value={i.name} />)}</datalist>
      </div>
      <button onClick={handleAddItemRow} className="mt-2 text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"><Icon name="plus" className="w-4 h-4 mr-1" /> Add Row</button>
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="relative"><label className="form-label">Narration</label><textarea value={narration} onChange={e => setNarration(e.target.value)} className="form-input w-80 pr-10" rows={3}></textarea><button onClick={handleGenerateNarration} disabled={isNarrationLoading} className="absolute top-7 right-2 text-orange-500 hover:text-orange-700 disabled:text-gray-300" title="Generate Narration with AI">{isNarrationLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <Icon name="wand-sparkles" className="w-5 h-5" />}</button></div>
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total Taxable Amount</span><span className="font-semibold text-gray-800">{totalTaxableAmount.toFixed(2)}</span></div>
            {!isInterState && <>
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total CGST</span><span className="font-semibold text-gray-800">{totalCgst.toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total SGST</span><span className="font-semibold text-gray-800">{totalSgst.toFixed(2)}</span></div>
            </>}
            {isInterState && <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total IGST</span><span className="font-semibold text-gray-800">{totalIgst.toFixed(2)}</span></div>}
            <div className="flex justify-between items-center border-t pt-2 mt-2"><span className="text-lg font-bold text-gray-800">Grand Total</span><span className="text-lg font-bold text-gray-800">{grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

      </div>
    </>
  );

  const renderSimpleForm = (type: 'Payment' | 'Receipt' | 'Contra') => {
    if (type === 'Payment' || type === 'Receipt') {
      const isPayment = type === 'Payment';
      const labelA = isPayment ? 'Pay from' : 'Received From';
      const labelB = isPayment ? 'Pay to' : 'Received In';
      const labelInv = isPayment ? 'Supplier Inv. No.' : 'Inv. No.';
      const labelFull = isPayment ? 'Pay' : 'Full receipt';
      const labelPartial = isPayment ? 'Pay Partially' : 'Partial receipt';

      return (
        <div className="space-y-6">
          {/* Single/Bulk Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setPaymentMode('single')}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${paymentMode === 'single'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                }`}
            >
              {type} Voucher - Single
            </button>
            <button
              onClick={() => setPaymentMode('bulk')}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${paymentMode === 'bulk'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                }`}
            >
              {type} Voucher - Bulk
            </button>
          </div>

          {/* Conditional rendering based on mode */}
          {paymentMode === 'single' ? (
            /* Single Mode */
            <>
              {/* Top Row: Date, Voucher Number, Balance */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Number</label>
                  <input
                    type="text"
                    value={voucherNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number"
                    value={balance}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Account/Party Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{labelA}</label>
                  <SearchableSelect
                    value={account}
                    onChange={setAccount}
                    options={accountLedgers.map(l => l.name)}
                    placeholder={`Select ${labelA}`}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{labelB}</label>
                    <SearchableSelect
                      value={party}
                      onChange={setParty}
                      options={partyLedgers.map(l => l.name)}
                      placeholder={`Select ${labelB}`}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setShowAdvance(!showAdvance)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${showAdvance
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                    >
                      Advance
                    </button>
                  </div>
                </div>
              </div>

              {/* Details Box - Conditional based on showAdvance */}
              {showAdvance ? (
                /* Advance Section */
                <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Top Row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Advance ref. no.</label>
                      <input
                        type="text"
                        value={advanceRefNo}
                        onChange={e => setAdvanceRefNo(e.target.value)}
                        placeholder="Enter advance reference"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <input
                        type="number"
                        value={advanceAmount}
                        onChange={e => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Bottom Row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Posting Note</label>
                      <textarea
                        value={postingNote}
                        onChange={e => setPostingNote(e.target.value)}
                        placeholder="Enter posting note..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Running Balance</label>
                      <input
                        type="number"
                        value={runningBalance}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Details Box */
                <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{labelInv}</label>
                        <input
                          type="text"
                          value={supplierInvNo}
                          onChange={e => setSupplierInvNo(e.target.value)}
                          placeholder="Enter reference number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Posting Note</label>
                        <textarea
                          value={postingNote}
                          onChange={e => setPostingNote(e.target.value)}
                          placeholder="Enter posting note..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                          type="number"
                          value={simpleAmount}
                          onChange={e => setSimpleAmount(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <div className="flex items-center gap-4 mt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="paymentType"
                              value="full"
                              checked={paymentType === 'full'}
                              onChange={() => setPaymentType('full')}
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{labelFull}</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="paymentType"
                              value="partial"
                              checked={paymentType === 'partial'}
                              onChange={() => setPaymentType('partial')}
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{labelPartial}</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Running Balance</label>
                        <input
                          type="number"
                          value={runningBalance}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Bulk Mode */
            <>
              {/* Top Row: Voucher Number, Account, Balance */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Number</label>
                  <input
                    type="text"
                    value={voucherNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{labelA}</label>
                  <SearchableSelect
                    value={account}
                    onChange={setAccount}
                    options={accountLedgers.map(l => l.name)}
                    placeholder={`Select ${labelA}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number"
                    value={balance}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Party Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{labelB}</label>
                <SearchableSelect
                  value={party}
                  onChange={setParty}
                  options={partyLedgers.map(l => l.name)}
                  placeholder={`Select ${labelB}`}
                />
              </div>

              {/* Conditional rendering based on advance mode */}
              {showBulkAdvance ? (
                /* Bulk Advance Table */
                <div className="border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex justify-end mb-4">
                    <button
                      type="button"
                      onClick={() => setShowBulkAdvance(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 text-sm font-medium"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{labelB}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Receipt Note</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Advance ref. no.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              value={date}
                              onChange={e => setDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <SearchableSelect
                              value={party}
                              onChange={setParty}
                              options={partyLedgers.map(l => l.name)}
                              placeholder="Select"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder="Receipt note"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={advanceRefNo}
                              onChange={e => setAdvanceRefNo(e.target.value)}
                              placeholder="Ref #"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={advanceAmount}
                              onChange={e => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-start mt-4">
                    <button
                      type="button"
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                    >
                      <span>+</span> Add Row
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Posting Note</label>
                      <textarea
                        value={postingNote}
                        onChange={e => setPostingNote(e.target.value)}
                        placeholder="Enter posting note..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <input
                        type="number"
                        value={simpleAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Running Balance</label>
                      <input
                        type="number"
                        value={runningBalance}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Bulk Table Column Layout */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Details */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-700">Details</h4>
                      <button
                        type="button"
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                      >
                        <span>+</span> Add Row
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase">{labelB}</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase">{labelInv}</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-2 py-2">
                              <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <SearchableSelect
                                value={party}
                                onChange={setParty}
                                options={partyLedgers.map(l => l.name)}
                                placeholder="Select"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                placeholder="Ref #"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                placeholder="Note"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Posting Note</label>
                        <textarea
                          value={postingNote}
                          onChange={e => setPostingNote(e.target.value)}
                          placeholder="Enter posting note..."
                          rows={3}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount</label>
                        <input
                          type="number"
                          value={simpleAmount}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-500 text-xs"
                        />
                        <label className="block text-xs font-medium text-gray-700 mb-1 mt-2">Running Balance</label>
                        <input
                          type="number"
                          value={runningBalance}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Advance Section */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex justify-end mb-4">
                      <button
                        type="button"
                        onClick={() => setShowBulkAdvance(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 text-sm font-medium"
                      >
                        Advance
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase">{labelInv}</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase">{labelFull}</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase">{labelPartial}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-2 py-2">
                              <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                placeholder="Ref #"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                defaultValue={0}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 rounded"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                defaultChecked={false}
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 rounded"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 italic">
                      Use this section for advance receipts. Click the "Advance" button to enable.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // Custom layout for Contra voucher
    if (type === 'Contra') {
      return (
        <div className="space-y-6">
          {/* Top Row: Date and Voucher Number */}
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Number</label>
              <input
                type="text"
                value={voucherNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* Main Form Container */}
          <div className="border-2 border-gray-200 rounded-lg p-6 max-w-6xl">
            {/* Paid from */}
            <div className="grid grid-cols-[160px_1fr_auto_120px] gap-4 items-center mb-4">
              <label className="text-sm font-medium text-gray-700">Paid from</label>
              <SearchableSelect
                value={fromAccount}
                onChange={setFromAccount}
                options={accountLedgers.map(l => l.name)}
                placeholder="Select Account"
              />
              <div></div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Balance</div>
                <input
                  type="text"
                  value="xxxxxxx"
                  readOnly
                  className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm text-center"
                />
              </div>
            </div>

            {/* Received in */}
            <div className="grid grid-cols-[160px_1fr_auto_120px] gap-4 items-center mb-4">
              <label className="text-sm font-medium text-gray-700">Received in</label>
              <SearchableSelect
                value={toAccount}
                onChange={setToAccount}
                options={accountLedgers.map(l => l.name)}
                placeholder="Select Account"
              />
              <div></div>
              <div className="text-right">
                <input
                  type="text"
                  value="xxxxxxx"
                  readOnly
                  className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm text-center"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={simpleAmount}
                onChange={e => setSimpleAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Posting Note */}
          <div className="max-w-2xl">
            <label className="block text-sm font-medium text-gray-700 mb-1">Posting Note:</label>
            <textarea
              value={narration}
              onChange={e => setNarration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows={4}
              placeholder="Enter posting note..."
            />
          </div>
        </div>
      );
    }

    // Original simple form for other types (shouldn't reach here)
    return (
      <div className="max-w-md mx-auto space-y-4">
        <div><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" /></div>
        {type !== 'Contra' && <div><label className="form-label">Account (Cash/Bank)</label><SearchableSelect value={account} onChange={setAccount} options={accountLedgers.map(l => l.name)} placeholder="Select Account" /></div>}
        {type === 'Contra' && <>
          <div><label className="form-label">From Account</label><SearchableSelect value={fromAccount} onChange={setFromAccount} options={accountLedgers.map(l => l.name)} placeholder="Select From Account" /></div>
          <div><label className="form-label">To Account</label><SearchableSelect value={toAccount} onChange={setToAccount} options={accountLedgers.map(l => l.name)} placeholder="Select To Account" /></div>
        </>}
        {type !== 'Contra' && <div><label className="form-label">Party</label><SearchableSelect value={party} onChange={setParty} options={partyLedgers.map(l => l.name)} placeholder="Select Party" /></div>}
        <div><label className="form-label">Amount</label><input type="number" value={simpleAmount} onChange={e => setSimpleAmount(parseFloat(e.target.value))} className="form-input" /></div>
        <div className="relative"><label className="form-label">Narration</label><textarea value={narration} onChange={e => setNarration(e.target.value)} className="form-input w-full pr-10" rows={3}></textarea><button onClick={handleGenerateNarration} disabled={isNarrationLoading} className="absolute top-7 right-2 text-orange-500 hover:text-orange-700 disabled:text-gray-300" title="Generate Narration with AI">{isNarrationLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <Icon name="wand-sparkles" className="w-5 h-5" />}</button></div>
      </div>
    );
  };

  const renderJournalForm = () => (
    <>
      {/* Top Row: Date and Voucher Number */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Number</label>
          <input
            type="text"
            value={voucherNumber}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
          />
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Ledger</th>
              <th className="table-header">Note</th>
              <th className="table-header w-32">Ref. No.</th>
              <th className="table-header w-40">Debit</th>
              <th className="table-header w-40">Credit</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <SearchableSelect
                    value={entry.ledger}
                    onChange={(val) => handleEntryChange(index, 'ledger', val)}
                    options={allLedgers.map(l => l.name)}
                    placeholder="Select Ledger"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={entry.note}
                    onChange={e => handleEntryChange(index, 'note', e.target.value)}
                    placeholder="Note"
                    className="table-input"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={entry.refNo}
                    onChange={e => handleEntryChange(index, 'refNo', e.target.value)}
                    placeholder="Ref #"
                    className="table-input"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={entry.debit}
                    onChange={e => handleEntryChange(index, 'debit', parseFloat(e.target.value) || 0)}
                    className="table-input"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={entry.credit}
                    onChange={e => handleEntryChange(index, 'credit', parseFloat(e.target.value) || 0)}
                    className="table-input"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleRemoveEntryRow(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-sm">Total</td>
              <td className="px-4 py-3 text-sm">{totalDebit.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm">{totalCredit.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <button
          onClick={handleAddEntryRow}
          className="mt-4 text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"
        >
          <Icon name="plus" className="w-4 h-4 mr-1" /> Add Row
        </button>
      </div>

      {/* Posting Note Section */}
      <div className="mt-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1">Posting Note</label>
        <textarea
          value={narration}
          onChange={e => setNarration(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          rows={3}
          placeholder="Enter posting note..."
        />
        {!isJournalBalanced && totalDebit > 0 && (
          <p className="text-red-500 text-sm mt-2">Totals do not match!</p>
        )}
      </div>
    </>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Voucher Entry</h2>

      <div className="mb-6 flex flex-wrap justify-center items-center gap-2 p-1 bg-slate-200 rounded-lg max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center flex-1 gap-1">
          {availableVoucherTypes.map(type => (
            <button key={type.id} onClick={() => { setVoucherType(type.id); resetForm(); }} className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors ${voucherType === type.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:bg-slate-300'}`}>{type.label}</button>
          ))}
        </div>
        <button
          onClick={() => setIsInvoiceScannerOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Upload and scan invoices"
        >
          <Icon name="upload" className="w-4 h-4 mr-2" />
          Upload Invoices
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{voucherType} Voucher</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMassUploadOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-purple-200 text-sm font-medium rounded-md shadow-sm text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Icon name="upload" className="w-4 h-4 mr-2" />
              Mass Upload
            </button>
            <div className="relative" ref={importMenuRef}>
              <button
                onClick={() => setIsImportMenuOpen(prev => !prev)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Icon name="upload" className="w-5 h-5 mr-2" />
                Import Vouchers
              </button>
              {isImportMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsInvoiceScannerOpen(true); setIsImportMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Upload Invoices (Scan)</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); triggerFileUpload(imageInputRef); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">From Image {(voucherType === 'Purchase' || voucherType === 'Sales') ? '(AI)' : ''}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); triggerFileUpload(jsonInputRef); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">From JSON</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); triggerFileUpload(excelInputRef); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">From Excel</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadTemplate(); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                      <Icon name="download" className="w-4 h-4 mr-2" />
                      Download Template
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          <input type="file" ref={imageInputRef} onChange={handleImageFileChange} accept="image/png, image/jpeg" className="hidden" />
          <input type="file" ref={jsonInputRef} onChange={handleJsonFileChange} accept=".json" className="hidden" />
          <input type="file" ref={excelInputRef} onChange={handleExcelFileChange} accept=".xlsx, .xls" className="hidden" />
        </div>
        <style>{`
          .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
          .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
          .form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
          .table-input { 
            width: 100%; 
            border: 1px solid transparent; 
            padding: 0.5rem 0.75rem;
            background-color: transparent;
            outline: none; 
            border-radius: 0.375rem;
            transition: all 0.2s;
            color: #1e293b;
          }
           .table-input:focus { 
            background-color: white;
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }
          .table-input[readOnly] {
            background-color: #f9fafb;
            color: #4b5563;
            cursor: not-allowed;
          }
          .table-header { padding: 0.75rem 1rem; text-align: center; font-size: 0.75rem; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; background-color: #f9fafb; }
        `}</style>
        {(voucherType === 'Purchase' || voucherType === 'Sales') && renderSalesPurchaseForm()}
        {(voucherType === 'Payment' || voucherType === 'Receipt' || voucherType === 'Contra') && renderSimpleForm(voucherType)}
        {voucherType === 'Journal' && renderJournalForm()}

        <div className="mt-8 pt-4 border-t flex justify-end space-x-3">
          <button onClick={resetForm} className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Cancel
          </button>
          <button onClick={handleSaveVoucher} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            Save Voucher
          </button>
        </div>
      </div>

      {isMassUploadOpen && (
        <ErrorBoundary>
          <MassUploadModal
            onClose={() => setIsMassUploadOpen(false)}
            onComplete={onMassUploadComplete}
            ledgers={ledgers}
            stockItems={stockItems}
            companyDetails={companyDetails}
            voucherType={voucherType}
          />
        </ErrorBoundary>
      )}

      {/* Invoice Scanner Modal */}
      {isInvoiceScannerOpen && (
        <InvoiceScannerModal
          onClose={() => setIsInvoiceScannerOpen(false)}
        />
      )}

      {/* Recent / Imported Vouchers - show below the form so imports are visible immediately */}
      {vouchers && vouchers.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Vouchers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-100"><tr>
                <th className="table-header">Date</th>
                <th className="table-header">Type</th>
                <th className="table-header">Invoice No.</th>
                <th className="table-header">Party</th>
                <th className="table-header">Image</th>
                <th className="table-header text-right">Total</th>
              </tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vouchers.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((v, idx) => (
                  <tr key={`${v.type}-${v.date}-${(v as any).invoiceNo || (v as any).party || ''}-${idx}`}>
                    <td className="px-4 py-2 text-sm text-gray-700">{v.date}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{v.type}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{(v as any).invoiceNo || ''}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{(v as any).party || ''}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {v.image ? (
                        <img src={`${API_BASE_URL}${v.image}`} alt="Voucher" className="w-12 h-12 object-cover border rounded" />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 text-right font-semibold">{Number((v as any).total || (v as any).amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VouchersPage;
