// App.tsx (token-aware version)
import React, { useState, useCallback, useEffect } from 'react';
import type { Page, Ledger, Unit, StockItem, Voucher, ExtractedInvoiceData, CompanyDetails, LedgerGroupMaster, StockGroup, AgentMessage, SalesPurchaseVoucher } from './src/types';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import MastersPage from './components/MastersPage';
import InventoryPage from './components/InventoryPage';
import VouchersPage from './components/VouchersPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import UsersAndRolesPage from './components/UsersAndRolesPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Modal from './components/Modal';
import AIAgent from './components/AIAgent';
import Icon from './components/Icon';
import ErrorBoundary from './components/ErrorBoundary';
import MassUploadResultPage from './components/MassUploadResultPage';
import { extractInvoiceDataWithRetry, getAgentResponse, getGroundedAgentResponse } from './src/services/geminiService';
import { apiService } from './src/services';
import { initialLedgers, initialLedgerGroups, initialUnits, initialStockItems, initialStockGroups } from './src/initialData';
import { initialVouchers } from './src/initialVouchers';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5003';

const defaultCompanyDetails: CompanyDetails = {
  name: 'Your Company', address: '', gstin: '', state: 'Maharashtra',
  logo: '', email: '', phone: '', website: '', pan: '', cin: '',
  voucherNumbering: {
    Sales: { autoIncrement: true, prefix: 'INV-', nextNumber: 1, width: 4, suffix: '/24-25' },
    Purchase: { autoIncrement: true, prefix: 'PO-', nextNumber: 1, width: 4, suffix: '/24-25' }
  }
};

const App: React.FC = () => {
  // Authentication via HttpOnly cookies - no manual headers needed

  // Plan-based feature access control
  const getPlanLimits = (plan?: string) => {
    const plans = {
      'Basic': {
        maxUploads: 100,
        hasAI: false,
        hasReports: true, // Reports available for all plans
        hasSettings: true, // Settings available for all plans
        hasMultipleCompanies: false,
        hasAdvancedFeatures: false
      },
      'Pro': {
        maxUploads: 1000,
        hasAI: true,
        hasReports: true,
        hasSettings: true,
        hasMultipleCompanies: true,
        hasAdvancedFeatures: false
      },
      'Enterprise': {
        maxUploads: 5000,
        hasAI: true,
        hasReports: true,
        hasSettings: true,
        hasMultipleCompanies: true,
        hasAdvancedFeatures: true
      }
    };

    return plans[plan || 'Basic'] || plans['Basic'];
  };

  // Get user's plan from localStorage
  const getUserPlan = () => {
    // Try to get plan from user data stored in localStorage
    const userPlan = localStorage.getItem('userPlan');
    return userPlan;
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  // In-memory database state
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(defaultCompanyDetails);

  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [ledgerGroups, setLedgerGroups] = useState<LedgerGroupMaster[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // AI Flow State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilledVoucherData, setPrefilledVoucherData] = useState<ExtractedInvoiceData | null>(null);

  // AI Agent State
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    { role: 'model', text: 'Hello! I am Kiki. How can I help you with your accounting data today? Use the toggle below to search the web for up-to-date information.' }
  ]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);

  // Import summary state
  const [importSummary, setImportSummary] = useState<{ success: number, failed: number } | null>(null);

  // Mass upload result state
  const [massUploadResult, setMassUploadResult] = useState<Voucher[] | null>(null);

  // Deactivation modal state
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);

  // Cache keys for tenant data
  const getCacheKeys = (tenantId: string) => ({
    // Only keeping essential UI state or small prefs if needed
    // companyDetails: `tenant_${tenantId}_companyDetails`, // Removed large data
    lastUpdated: `tenant_${tenantId}_lastUpdated`
  });

  // Load cached tenant data - DATA CACHING DISABLED FOR PRODUCTION
  const loadCachedData = useCallback((tenantId: string) => {
    // We intentionally return false to force loading from the API.
    // This prevents stale data and storage limit issues (5MB limit).
    return false;
  }, []);

  // Cache tenant data - DISABLED FOR PRODUCTION
  const cacheTenantData = useCallback((tenantId: string, data: any) => {
    // No-op: Do not save data to localStorage.
    // This protects against XSS (reading plain text data) and storage quotas.
  }, []);

  // Clear all tenant cache data
  const clearTenantCache = useCallback(() => {
    try {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      // Filter keys that start with 'tenant_'
      const tenantKeys = keys.filter(key => key.startsWith('tenant_'));
      // Remove all tenant cache keys
      tenantKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear tenant cache:', error);
    }
  }, []);

  // Load tenant-scoped data from backend after login
  const loadTenantData = useCallback(async (tenantId?: string) => {
    try {
      setIsDataLoaded(false);

      // Check if user is admin (tenantId is null)
      const isAdmin = tenantId === null || tenantId === undefined;

      // Try to load from cache first
      const hasCachedData = tenantId ? loadCachedData(tenantId) : false;

      // Load data using apiService (which includes JWT tokens)
      const [
        backendCompanyDetails,
        backendLedgers,
        backendLedgerGroups,
        backendUnits,
        backendStockGroups,
        backendStockItems,
        backendVouchers
      ] = await Promise.all([
        apiService.getCompanyDetails().catch(() => defaultCompanyDetails),
        apiService.getLedgers().catch(() => []),
        apiService.getLedgerGroups().catch(() => []),
        apiService.getUnits().catch(() => []),
        apiService.getStockGroups().catch(() => []),
        apiService.getStockItems().catch(() => []),
        apiService.getVouchers().catch(() => [])
      ]);

      // Update state with tenant data
      const newData = {
        companyDetails: backendCompanyDetails && typeof backendCompanyDetails === 'object' ? backendCompanyDetails : defaultCompanyDetails,
        ledgers: Array.isArray(backendLedgers) ? backendLedgers : [],
        ledgerGroups: Array.isArray(backendLedgerGroups) ? backendLedgerGroups : [],
        units: Array.isArray(backendUnits) ? backendUnits : [],
        stockGroups: Array.isArray(backendStockGroups) ? backendStockGroups : [],
        stockItems: Array.isArray(backendStockItems) ? backendStockItems : [],
        vouchers: Array.isArray(backendVouchers) ? backendVouchers : []
      };

      if (newData.companyDetails) {
        setCompanyDetails(prev => ({ ...prev, ...newData.companyDetails }));
      }
      setLedgers(newData.ledgers);
      setLedgerGroups(newData.ledgerGroups);
      setUnits(newData.units);
      setStockGroups(newData.stockGroups);
      setStockItems(newData.stockItems);
      setVouchers(newData.vouchers);

      // Cache the data if we have a tenant ID
      if (tenantId) {
        cacheTenantData(tenantId, newData);
      }

    } catch (error) {
      console.error('❌ Failed to load tenant data:', error);
      // Keep cached data on error if available
    } finally {
      setIsDataLoaded(true);
    }
  }, [loadCachedData, cacheTenantData]);

  // Handle URL query parameters for routing (e.g. ?view=signup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'signup') {
      setView('signup');
    } else if (viewParam === 'login') {
      setView('login');
    }
  }, []);

  // Always show login page first - no auto-login
  useEffect(() => {
    setIsDataLoaded(true);
  }, []); // Run only on mount

  // Load data on initial mount and login state changes
  useEffect(() => {
    const loadInitialData = async () => {
      try {

        const savedCompanyName = localStorage.getItem('companyName');
        const savedTenantId = localStorage.getItem('tenantId');

        // Load permissions
        try {
          const savedPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
          if (Array.isArray(savedPermissions)) {
            setPermissions(savedPermissions);
          }
        } catch (e) {
          console.warn('Failed to parse saved permissions');
        }

        // Load permissions
        try {
          const savedPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
          if (Array.isArray(savedPermissions)) {
            setPermissions(savedPermissions);
          }
        } catch (e) {
          console.warn('Failed to parse saved permissions');
        }

        // Set initial company details
        const initialCompanyDetails = { ...defaultCompanyDetails, name: savedCompanyName || 'Your Company Name' };
        setCompanyDetails(initialCompanyDetails);

        // If user is logged in and has a tenant ID, try to load cached data first
        if (isLoggedIn && savedTenantId) {
          const hasCachedData = loadCachedData(savedTenantId);

          if (hasCachedData) {
            // Cached data loaded, now refresh from backend in background
            setIsDataLoaded(true);
            loadTenantData(savedTenantId).catch(err => console.warn('Background data refresh failed:', err));
          } else {
            // No cached data, load from backend
            await loadTenantData(savedTenantId);
          }
        } else {
          // Not logged in or no tenant ID, just show empty state
          setLedgers([]);
          setLedgerGroups([]);
          setUnits([]);
          setStockGroups([]);
          setStockItems([]);
          setVouchers([]);
          setIsDataLoaded(true);
        }
      } catch (err) {
        console.error('❌ Failed to initialize app data:', err);
        // Fallback to empty state
        setLedgers([]);
        setLedgerGroups([]);
        setUnits([]);
        setStockGroups([]);
        setStockItems([]);
        setVouchers([]);
        setIsDataLoaded(true);
      }
    };

    loadInitialData();
  }, [isLoggedIn]); // re-run when login state changes



  // Handle login: be forgiving about the shape of incoming data (client may pass either full response or just user)
  const handleLogin = async (payload: any) => {
    try {
      // payload could be:
      // 1) full response { success: true, user: {...}, permissions: [...] }
      // 2) user object only (older LoginPage code passed data.user)
      const user = payload?.user || payload;
      const permissions = payload?.permissions || [];

      // Extract tenant ID from user data
      const tenantId = user?.tenantId || user?.tenant_id || null;

      // Save tenant ID (tokens are in HttpOnly cookies)
      if (tenantId) {
        localStorage.setItem('tenantId', tenantId);
      }

      // Save permissions
      if (permissions.length > 0) {
        localStorage.setItem('userPermissions', JSON.stringify(permissions));
        setPermissions(permissions);
      } else {
        // If no permissions returned (e.g. legacy), maybe empty or defaults?
        setPermissions([]);
      }

      // Save user-related data (company name) - always update from user data
      const userCompanyName = user?.company_name || user?.companyName || 'Your Company';
      localStorage.setItem('companyName', userCompanyName);
      setCompanyDetails(prev => ({ ...prev, name: userCompanyName }));

      // Save user's plan for access control
      const userSelectedPlan = user?.selected_plan || user?.selectedPlan || 'Basic';
      localStorage.setItem('userPlan', userSelectedPlan);

      // Clear logout flag since user is logging in
      localStorage.removeItem('loggedOut');

      // Set login state first
      setIsLoggedIn(true);
      setView('login'); // reset view

      // Immediately load tenant-scoped data after login
      await loadTenantData(tenantId);

    } catch (err) {
      console.warn('handleLogin: unexpected payload', payload, err);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = async () => {
    try {
      // Update server login status to Offline before clearing local data
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Send cookies
      });
    } catch (error) {
      console.warn('Failed to update logout status on server:', error);
    }

    // Clear authentication data (cookies cleared by server)
    localStorage.removeItem('companyName');
    localStorage.removeItem('tenantId');

    // Set logout flag to prevent auto-login
    localStorage.setItem('loggedOut', 'true');

    // Clear all tenant cache data
    clearTenantCache();

    // Reset login state
    setIsLoggedIn(false);
    setCurrentPage('Dashboard');
    setView('login'); // Show login page after logout

    // Clear in-memory state
    setLedgers([]);
    setLedgerGroups([]);
    setUnits([]);
    setStockGroups([]);
    setStockItems([]);
    setVouchers([]);
    setCompanyDetails({ ...defaultCompanyDetails, name: 'Your Company Name' });
  };

  // Check user active status frequently when logged in (exclude admin users)
  useEffect(() => {
    if (!isLoggedIn) return;

    const tenantId = localStorage.getItem('tenantId');

    // Don't check status for admin users (they can't be deactivated)
    if (!tenantId) return;

    const checkUserStatus = async () => {
      try {
        const statusResponse = await apiService.checkUserStatus();
        if (!statusResponse.isActive) {
          // User has been deactivated
          console.log('🔒 User account deactivated, showing modal and logging out');
          setShowDeactivationModal(true);
          setTimeout(() => {
            handleLogout();
            setShowDeactivationModal(false);
          }, 3000); // Show modal for 3 seconds then logout (faster)
        }
      } catch (error) {
        console.warn('Failed to check user status:', error);
        // Don't logout on API errors, just log the warning
      }
    };

    // Check immediately, then every 5 seconds when online
    checkUserStatus();
    const statusInterval = setInterval(checkUserStatus, 5000); // More frequent checks

    return () => clearInterval(statusInterval);
  }, [isLoggedIn, handleLogout]);

  const handleNavigate = (page: Page) => setCurrentPage(page);

  // --- Data mutation handlers --- (all include Authorization header when token present)
  const handleAddLedger = useCallback(async (ledger: Ledger) => {
    try {
      const response = await apiService.saveLedger(ledger);
      if (response && response.id) {
        console.log(`✅ Saved ledger ${ledger.name}`);
        setLedgers(prev => [...prev, response].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        console.error(`Failed to save ledger ${ledger.name}`);
        setLedgers(prev => [...prev, ledger].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err: any) {
      console.error(`Error saving ledger ${ledger.name}:`, err);
      setLedgers(prev => [...prev, ledger].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, []);

  const handleUpdateLedger = useCallback(async (idOrName: number | string, ledger: Partial<Ledger>) => {
    try {
      // If it's a number, use it as ID. Otherwise, find by name
      const ledgerId = typeof idOrName === 'number' ? idOrName : ledgers.find(l => l.name === idOrName)?.id;

      if (ledgerId) {
        const response = await apiService.updateLedger(ledgerId, ledger);
        if (response.success) {
          console.log(`✅ Updated ledger ${ledgerId}`);
          setLedgers(prev => prev.map(l => l.id === ledgerId ? { ...l, ...ledger } : l).sort((a, b) => a.name.localeCompare(b.name)));
        }
      } else {
        // Fallback: update by name if no ID available
        console.log(`⚠️ Updating ledger by name: ${idOrName}`);
        setLedgers(prev => prev.map(l => l.name === idOrName ? { ...l, ...ledger } : l).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error updating ledger ${idOrName}:`, err);
      alert('Failed to update ledger. Please try again.');
    }
  }, [ledgers]);

  const handleDeleteLedger = useCallback(async (idOrName: number | string) => {
    try {
      // If it's a number, use it as ID. Otherwise, find by name
      const ledgerId = typeof idOrName === 'number' ? idOrName : ledgers.find(l => l.name === idOrName)?.id;

      if (ledgerId) {
        await apiService.deleteLedger(ledgerId);
        console.log(`✅ Deleted ledger ${ledgerId}`);
        setLedgers(prev => prev.filter(l => l.id !== ledgerId));
      } else {
        // Fallback: delete by name if no ID available
        console.log(`⚠️ Deleting ledger by name: ${idOrName}`);
        setLedgers(prev => prev.filter(l => l.name !== idOrName));
      }
    } catch (err) {
      console.error(`Error deleting ledger ${idOrName}:`, err);
      alert('Failed to delete ledger. Please try again.');
    }
  }, [ledgers]);

  const handleAddLedgerGroup = useCallback(async (group: LedgerGroupMaster) => {
    try {
      const response = await apiService.saveLedgerGroup(group);
      if (response && response.id) {
        console.log(`✅ Saved ledger group ${group.name}`);
        setLedgerGroups(prev => [...prev, response].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        console.error(`Failed to save ledger group ${group.name}`);
        setLedgerGroups(prev => [...prev, group].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error saving ledger group ${group.name}:`, err);
      setLedgerGroups(prev => [...prev, group].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, []);

  const handleUpdateLedgerGroup = useCallback(async (idOrName: number | string, group: Partial<LedgerGroupMaster>) => {
    try {
      const groupId = typeof idOrName === 'number' ? idOrName : ledgerGroups.find(g => g.name === idOrName)?.id;

      if (groupId) {
        const response = await apiService.updateLedgerGroup(groupId, group);
        if (response.success) {
          console.log(`✅ Updated ledger group ${groupId}`);
          setLedgerGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...group } : g).sort((a, b) => a.name.localeCompare(b.name)));
        }
      } else {
        console.log(`⚠️ Updating ledger group by name: ${idOrName}`);
        setLedgerGroups(prev => prev.map(g => g.name === idOrName ? { ...g, ...group } : g).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error updating ledger group ${idOrName}:`, err);
      alert('Failed to update group. Please try again.');
    }
  }, [ledgerGroups]);

  const handleDeleteLedgerGroup = useCallback(async (idOrName: number | string) => {
    try {
      const groupId = typeof idOrName === 'number' ? idOrName : ledgerGroups.find(g => g.name === idOrName)?.id;

      if (groupId) {
        await apiService.deleteLedgerGroup(groupId);
        console.log(`✅ Deleted ledger group ${groupId}`);
        setLedgerGroups(prev => prev.filter(g => g.id !== groupId));
      } else {
        console.log(`⚠️ Deleting ledger group by name: ${idOrName}`);
        setLedgerGroups(prev => prev.filter(g => g.name !== idOrName));
      }
    } catch (err) {
      console.error(`Error deleting ledger group ${idOrName}:`, err);
      alert('Failed to delete group. Please try again.');
    }
  }, [ledgerGroups]);

  const handleAddUnit = useCallback(async (unit: Unit) => {
    try {
      const response = await apiService.saveUnit(unit);
      if (response && response.id) {
        console.log(`✅ Saved unit ${unit.name}`);
        setUnits(prev => [...prev, response].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        console.error(`Failed to save unit ${unit.name}`);
        setUnits(prev => [...prev, unit].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error saving unit ${unit.name}:`, err);
      setUnits(prev => [...prev, unit].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, []);

  const handleUpdateUnit = useCallback(async (id: number, unit: Partial<Unit>) => {
    try {
      const response = await apiService.updateUnit(id, unit);
      if (response.success) {
        console.log(`✅ Updated unit ${id}`);
        setUnits(prev => prev.map(u => u.id === id ? { ...u, ...unit } : u).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error updating unit ${id}:`, err);
    }
  }, []);

  const handleDeleteUnit = useCallback(async (id: number) => {
    try {
      await apiService.deleteUnit(id);
      console.log(`✅ Deleted unit ${id}`);
      setUnits(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(`Error deleting unit ${id}:`, err);
    }
  }, []);

  const handleAddStockGroup = useCallback(async (group: StockGroup) => {
    try {
      const response = await apiService.saveStockGroup(group);
      if (response && response.id) {
        console.log(`✅ Saved stock group ${group.name}`);
        setStockGroups(prev => [...prev, response].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        console.error(`Failed to save stock group ${group.name}`);
        setStockGroups(prev => [...prev, group].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error saving stock group ${group.name}:`, err);
      setStockGroups(prev => [...prev, group].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, []);

  const handleUpdateStockGroup = useCallback(async (id: number, group: Partial<StockGroup>) => {
    try {
      const response = await apiService.updateStockGroup(id, group);
      if (response.success) {
        console.log(`✅ Updated stock group ${id}`);
        setStockGroups(prev => prev.map(g => g.id === id ? { ...g, ...group } : g).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error updating stock group ${id}:`, err);
    }
  }, []);

  const handleDeleteStockGroup = useCallback(async (id: number) => {
    try {
      await apiService.deleteStockGroup(id);
      console.log(`✅ Deleted stock group ${id}`);
      setStockGroups(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error(`Error deleting stock group ${id}:`, err);
    }
  }, []);

  const handleAddStockItem = useCallback(async (item: StockItem) => {
    try {
      const response = await apiService.saveStockItem(item);
      if (response && response.id) {
        console.log(`✅ Saved stock item ${item.name}`);
        setStockItems(prev => [...prev, response].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        console.error(`Failed to save stock item ${item.name}`);
        setStockItems(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error saving stock item ${item.name}:`, err);
      setStockItems(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, []);

  const handleUpdateStockItem = useCallback(async (id: number, item: Partial<StockItem>) => {
    try {
      const response = await apiService.updateStockItem(id, item);
      if (response.success) {
        console.log(`✅ Updated stock item ${id}`);
        setStockItems(prev => prev.map(i => i.id === id ? { ...i, ...item } : i).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(`Error updating stock item ${id}:`, err);
    }
  }, []);

  const handleDeleteStockItem = useCallback(async (id: number) => {
    try {
      await apiService.deleteStockItem(id);
      console.log(`✅ Deleted stock item ${id}`);
      setStockItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(`Error deleting stock item ${id}:`, err);
    }
  }, []);

  const handleAddVouchers = useCallback(async (vouchersToAdd: Voucher[], saveToMySQL: boolean = true) => {
    const newVouchers = vouchersToAdd.map(v => ({ ...v, id: v.id || new Date().toISOString() + Math.random() }));

    // Handle auto-incrementing voucher numbers
    let newCompanyDetails = { ...companyDetails };
    let detailsChanged = false;

    newVouchers.forEach(v => {
      if (v.type === 'Sales' || v.type === 'Purchase') {
        const config = newCompanyDetails.voucherNumbering?.[v.type];
        if (config?.autoIncrement) {
          const paddedNumber = String(config.nextNumber).padStart(config.width || 0, '0');
          const expectedInvoiceNo = `${config.prefix || ''}${paddedNumber}${config.suffix || ''}`;
          if (v.invoiceNo === expectedInvoiceNo) {
            config.nextNumber++;
            detailsChanged = true;
          }
        }
      }
    });

    if (detailsChanged) setCompanyDetails(newCompanyDetails);

    if (saveToMySQL) {
      console.log('Saving vouchers to backend MySQL...');
      try {
        await apiService.saveVouchers(newVouchers);
        console.log(`✅ Saved ${newVouchers.length} voucher(s) to backend MySQL`);
      } catch (err) {
        console.error(`Error saving vouchers to backend:`, err);
      }
    } else {
      console.log('Skipping MySQL save - voucher will be saved when user clicks Save button');
    }

    setVouchers(prev => [...prev, ...newVouchers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [companyDetails]);

  const handleUpdateVoucher = useCallback(async (updatedVoucher: Voucher) => {
    try {
      await apiService.saveVouchers([updatedVoucher]);
      console.log(`✅ Updated voucher ${updatedVoucher.id} in backend MySQL`);
    } catch (err) {
      console.error(`Error updating voucher ${updatedVoucher.id} in backend:`, err);
    }

    setVouchers(prevVouchers => prevVouchers.map(v => v.id === updatedVoucher.id ? updatedVoucher : v));
    setMassUploadResult(prevResult => prevResult ? prevResult.map(v => v.id === updatedVoucher.id ? updatedVoucher : v) as Voucher[] : null);
  }, []);

  const handleMassUploadComplete = useCallback(async (vouchersToCreate: Voucher[]) => {
    try {
      console.log('Starting mass upload save...');
      const createdVouchers = vouchersToCreate.map(v => ({ ...v, id: v.id || new Date().toISOString() + Math.random() }));
      console.log('Saving vouchers to backend MySQL...');

      try {
        await apiService.saveVouchers(createdVouchers);
        console.log(`✅ Saved ${createdVouchers.length} voucher(s) to backend MySQL`);
      } catch (err) {
        console.error(`Error saving vouchers to backend:`, err);
      }

      setVouchers(prev => [...prev, ...createdVouchers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setMassUploadResult(createdVouchers);
      setImportSummary({ success: createdVouchers.length, failed: 0 });
      setCurrentPage('MassUploadResult');
    } catch (err) {
      console.error('Mass upload save error:', err);
      setError('Failed to save mass uploaded vouchers');
    }
  }, []);

  const handleInvoiceUpload = useCallback(async (file: File, voucherType?: string) => {
    // Check upload limits before processing
    const userPlan = getUserPlan();
    const planLimits = getPlanLimits(userPlan);

    if (vouchers.length >= planLimits.maxUploads) {
      setError(`Upload limit exceeded! Your ${userPlan} plan only allows ${planLimits.maxUploads} voucher uploads. Please upgrade your plan for more uploads.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const extractedData = await extractInvoiceDataWithRetry(file);
      const updatedExtractedData = { ...extractedData, voucherType: voucherType || 'Purchase' };
      setPrefilledVoucherData(updatedExtractedData);
      // Removed import summary modal - extracting data is not the same as saving it.
      // setImportSummary({ success: 1, failed: 0 });
      setCurrentPage('Vouchers');
    } catch (err) {
      console.error('Invoice upload error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during AI extraction.');
    } finally {
      setIsLoading(false);
    }
  }, [vouchers.length, getUserPlan, getPlanLimits]);

  // AI Agent state for queue status
  const [agentQueueStatus, setAgentQueueStatus] = useState<{ queuePosition?: number; estimatedWaitSeconds?: number; code?: string } | undefined>();

  const handleSendMessageToAgent = async (message: string, useGrounding: boolean) => {
    const userMessage: AgentMessage = { role: 'user', text: message };
    setAgentMessages(prev => [...prev, userMessage]);
    setIsAgentLoading(true);
    setAgentQueueStatus(undefined); // Clear previous queue status

    try {
      let modelMessage: AgentMessage;
      let queueStatus;

      if (useGrounding) {
        const response = await getGroundedAgentResponse(message);
        modelMessage = { role: 'model', text: response.text, sources: response.sources };
      } else {
        const contextData = JSON.stringify({
          vouchers,
          ledgers,
          stockItems,
          companyDetails,
        });
        const response = await getAgentResponse(contextData, message);
        modelMessage = { role: 'model', text: response.reply };

        // Set queue status if applicable
        if (response.code === 'QUEUED' || response.code === 'RATE_LIMIT') {
          queueStatus = {
            code: response.code,
            retryAfter: response.retryAfter,
            queuePosition: response.queuePosition,
            estimatedWaitSeconds: response.estimatedWaitSeconds
          };
        }
      }

      setAgentMessages(prev => [...prev, modelMessage]);
      if (queueStatus) {
        setAgentQueueStatus(queueStatus);
      }

      // Clear queue status after 10 seconds
      if (queueStatus) {
        setTimeout(() => setAgentQueueStatus(undefined), 10000);
      }

    } catch (err) {
      const errorMessage: AgentMessage = { role: 'model', text: 'Sorry, I had trouble connecting to the AI. Please try again.' };
      setAgentMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAgentLoading(false);
    }
  };

  const clearPrefilledData = useCallback(() => setPrefilledVoucherData(null), []);

  const handleSaveSettings = useCallback(async (details: CompanyDetails) => {
    try {
      const response = await apiService.saveCompanyDetails(details);

      // apiService now returns the object (or throws on error)
      if (response) {
        console.log('✅ Company settings saved');
        // Update local state with the details we saved
        // (Response might be snake_case from backend, so safer to keep using 'details' 
        // which matches frontend model, relying on success)
        setCompanyDetails(details);
      }
    } catch (err) {
      console.error('Error saving company settings:', err);
    }
  }, []);

  const userPlan = getUserPlan();
  const planLimits = getPlanLimits(userPlan);

  const renderPage = () => {
    if (!isDataLoaded) {
      return <div className="flex items-center justify-center h-full text-gray-500">Loading Data...</div>;
    }

    // Plan-based feature restrictions (only for premium features now)
    switch (currentPage) {
      case 'Dashboard': return <DashboardPage companyName={companyDetails.name} vouchers={vouchers} ledgers={ledgers} isAdmin={localStorage.getItem('tenantId') === null || localStorage.getItem('tenantId') === 'null'} />;
      case 'Masters': return <MastersPage
        ledgers={ledgers}
        ledgerGroups={ledgerGroups}
        onAddLedger={handleAddLedger}
        onAddLedgerGroup={handleAddLedgerGroup}
        onUpdateLedger={handleUpdateLedger}
        onDeleteLedger={handleDeleteLedger}
        onUpdateLedgerGroup={handleUpdateLedgerGroup}
        onDeleteLedgerGroup={handleDeleteLedgerGroup}
        permissions={permissions || []}
      />;
      case 'Inventory': return <InventoryPage
        units={units}
        stockGroups={stockGroups}
        stockItems={stockItems}
        onAddUnit={handleAddUnit}
        onAddStockGroup={handleAddStockGroup}
        onAddStockItem={handleAddStockItem}
        onAddStockItems={handleMassUploadComplete} // Reuse existing mass upload handler wrapper if applicable, or generic
        onUpdateStockItem={handleUpdateStockItem}
        onDeleteStockItem={handleDeleteStockItem}
        onUpdateStockGroup={handleUpdateStockGroup}
        onDeleteStockGroup={handleDeleteStockGroup}
        onUpdateUnit={handleUpdateUnit}
        onDeleteUnit={handleDeleteUnit}
        permissions={permissions || []}
      />;
      case 'Vouchers': return <VouchersPage
        vouchers={vouchers}
        ledgers={ledgers}
        stockItems={stockItems}
        onAddVouchers={handleAddVouchers}
        prefilledData={prefilledVoucherData}
        clearPrefilledData={() => setPrefilledVoucherData(null)}
        onInvoiceUpload={handleInvoiceUpload}
        companyDetails={companyDetails}
        onMassUploadComplete={handleMassUploadComplete}
        permissions={permissions || []}
      />;
      case 'Reports': return <ErrorBoundary><ReportsPage
        vouchers={vouchers}
        ledgers={ledgers}
        ledgerGroups={ledgerGroups}
        stockItems={stockItems}
        permissions={permissions || []}
      /></ErrorBoundary>; // Available for all plans
      case 'Settings': return <SettingsPage companyDetails={companyDetails} onSave={handleSaveSettings} />; // Available for all plans
      case 'Users & Roles': return <UsersAndRolesPage />; // Available for all plans
      case 'MassUploadResult': return <MassUploadResultPage
        results={massUploadResult || []}
        onDone={() => { setCurrentPage('Vouchers'); setMassUploadResult(null); }}
        onUpdateVoucher={handleUpdateVoucher}
        ledgers={ledgers}
        stockItems={stockItems}
        companyDetails={companyDetails}
      />;
      default: return <div>Page not found</div>;
    }
  };

  if (!isLoggedIn) {
    if (view === "signup") return <SignupPage onSwitchToLogin={() => setView("login")} onBack={() => window.location.href = (import.meta as any).env.VITE_LANDING_URL || 'http://localhost:3000'} />;
    return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setView("signup")} onBack={() => window.location.href = (import.meta as any).env.VITE_LANDING_URL || 'http://localhost:3000'} />;
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} companyName={companyDetails.name} userPlan={userPlan} permissions={permissions} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {renderPage()}
      </main>
      <Modal isOpen={isLoading} title="AI Processing" type="loading">
        <p>Extracting invoice data with Gemini AI. This may take a moment...</p>
      </Modal>
      <Modal isOpen={!!error} onClose={() => setError(null)} title="Error" type="error">
        <p>{error}</p>
      </Modal>
      {importSummary && (
        <Modal isOpen={!!importSummary} onClose={() => setImportSummary(null)} title="Import Complete" type="success">
          <p>Successfully imported {importSummary.success} vouchers.</p>
          {importSummary.failed > 0 && <p className="text-yellow-700 mt-1">{importSummary.failed} rows were skipped due to errors or incorrect formatting.</p>}
        </Modal>
      )}

      {/* Deactivation Modal */}
      <Modal isOpen={showDeactivationModal} title="Account Deactivated" type="warning">
        <div className="text-center">
          <Icon name="exclamation-triangle" className="mx-auto h-12 w-12 text-orange-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Your account has been deactivated</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please contact your administrator or support for assistance.
          </p>
          <p className="mt-3 text-xs text-gray-400">You will be logged out automatically...</p>
        </div>
      </Modal>

      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsAgentOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open Kiki"
        >
          <Icon name="bot" className="w-8 h-8" />
        </button>
      </div>

      <AIAgent
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        messages={agentMessages}
        onSendMessage={handleSendMessageToAgent}
        isLoading={isAgentLoading}
        queueStatus={agentQueueStatus}
      />
    </div>
  );
};

export default App;
