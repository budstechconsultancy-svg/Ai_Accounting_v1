/**
 * ============================================================================
 * MAIN APPLICATION COMPONENT (App.tsx)
 * ============================================================================
 * This is the heart of the application. It manages:
 * - User authentication (login/logout)
 * - Application routing (which page to show)
 * - Global state (ledgers, vouchers, stock items, etc.)
 * - Data synchronization with backend API
 * - AI features (invoice extraction, AI agent)
 * 
 * ARCHITECTURE:
 * - Uses React hooks for state management (useState, useEffect, useCallback)
 * - Communicates with Django backend via REST API
 * - Stores authentication tokens in HttpOnly cookies (secure)
 * - Implements role-based access control (RBAC)
 * - Supports multi-tenancy (each company has isolated data)
 * 
 * FOR NEW DEVELOPERS:
 * - Start by understanding the state variables (lines 80-115)
 * - Then review the data handlers (lines 437-835)
 * - Finally, look at the render logic (lines 840-973)
 */

// ============================================================================
// REACT IMPORTS
// ============================================================================
// Import core React functionality
import React, { useState, useCallback, useEffect } from 'react';
// Import TypeScript types for type safety
// These define the shape of our data structures (see ../types/types.ts)
import type { Page, Ledger, Voucher, ExtractedInvoiceData, CompanyDetails, LedgerGroupMaster, AgentMessage, SalesPurchaseVoucher, StockItem } from '../types';

// ============================================================================
// COMPONENT IMPORTS
// ============================================================================
// Shared UI Components
import Sidebar from '../components/Sidebar';  // Left navigation sidebar
// Page Components - Each represents a different section of the app
import DashboardPage from '../pages/Dashboard';           // Main dashboard with overview
import MastersPage from '../pages/Masters';               // Ledger and account management
import InventoryPage from '../pages/Inventory';           // Stock items and inventory
import VouchersPage from '../pages/Vouchers';             // Transaction vouchers (sales, purchase, etc.)
import ReportsPage from '../pages/Reports';               // Financial reports
import SettingsPage from '../pages/Settings';             // Company settings
import UsersAndRolesPage from '../pages/UsersAndRoles';   // User management and permissions
import VendorPortalPage from '../pages/VendorPortal';     // Vendor management portal
import CustomerPortalPage from '../pages/CustomerPortal'; // Customer management portal
import PayrollPage from '../pages/Payroll';               // Employee payroll management
import LoginPage from '../pages/Login';                   // User login page
import SignupPage from '../pages/Register';               // New user registration
// Additional UI Components
import Modal from '../components/Modal';                  // Reusable modal dialog
import AIAgent from '../components/AIAgent';              // AI Agent (Kiki)
import Icon from '../components/Icon';                    // Icon component
import ErrorBoundary from '../components/ErrorBoundary';  // Error handling wrapper
import MassUploadResultPage from '../pages/MassUploadResult'; // Bulk upload results page
// ============================================================================
// SERVICE IMPORTS
// ============================================================================
// AI Services - Google Gemini integration for invoice extraction and AI agent
import { extractInvoiceDataWithRetry, getAgentResponse, getGroundedAgentResponse } from '../services/geminiService';

// API Service - Handles all HTTP requests to Django backend
import { apiService } from '../services';

// Initial Data - Default data for new companies (fallback if backend is empty)
import { initialLedgers, initialLedgerGroups } from '../store/initialData';
import { initialVouchers } from '../store/initialVouchers';

// ============================================================================
// CONFIGURATION
// ============================================================================
// API Base URL - Read from environment variable or use default
// In production, set VITE_API_URL in .env file
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5003';

// Default company details - Used for new companies or as fallback
// This includes default voucher numbering configuration
const defaultCompanyDetails: CompanyDetails = {
  name: 'Your Company', address: '', gstin: '', state: 'Maharashtra',
  logo: '', email: '', phone: '', website: '', pan: '', cin: '',
  voucherNumbering: {
    Sales: { autoIncrement: true, prefix: 'INV-', nextNumber: 1, width: 4, suffix: '/24-25' },
    Purchase: { autoIncrement: true, prefix: 'PO-', nextNumber: 1, width: 4, suffix: '/24-25' }
  }
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
const App: React.FC = () => {
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get feature limits based on user's subscription plan
   * Plans: Basic, Pro, Enterprise
   * Returns: Object with feature flags and limits
   */
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

  /**
   * Get the user's subscription plan from localStorage
   * Used to determine which features are available
   * Returns: 'Basic', 'Pro', or 'Enterprise'
   */
  const getUserPlan = () => {
    // Try to get plan from user data stored in localStorage
    const userPlan = localStorage.getItem('userPlan');
    return userPlan;
  };

  // ============================================================================
  // STATE VARIABLES - Authentication & UI
  // ============================================================================

  // Authentication state - tracks if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // View state - determines whether to show login or signup page
  const [view, setView] = useState<'login' | 'signup'>('login');

  // Current page - which section of the app is being displayed
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');

  // Data loading state - prevents rendering before data is loaded
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // User permissions - No longer used (RBAC removed)
  // const [permissions, setPermissions] = useState<string[]>([]);

  // ============================================================================
  // STATE VARIABLES - Business Data (In-Memory Database)
  // ============================================================================
  // These store the main business data loaded from the backend
  // All data is tenant-specific (isolated per company)

  // Company information (name, address, GST, etc.)
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(defaultCompanyDetails);

  // Chart of Accounts - individual ledger accounts (Cash, Bank, Sales, etc.)
  const [ledgers, setLedgers] = useState<Ledger[]>([]);

  // Ledger Groups - hierarchical grouping of ledgers (Assets, Liabilities, etc.)
  const [ledgerGroups, setLedgerGroups] = useState<LedgerGroupMaster[]>([]);

  // Vouchers - all transactions (sales, purchase, payment, receipt, etc.)
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Stock Items - inventory items for sales/purchase
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  // ============================================================================
  // STATE VARIABLES - AI Features
  // ============================================================================

  // AI invoice extraction loading state
  const [isLoading, setIsLoading] = useState(false);

  // Error message display
  const [error, setError] = useState<string | null>(null);

  // Prefilled voucher data from AI invoice extraction
  const [prefilledVoucherData, setPrefilledVoucherData] = useState<ExtractedInvoiceData | null>(null);

  // AI Agent (Kiki) - open/closed state
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  // AI Agent conversation history
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    { role: 'model', text: 'Hello! I am Kiki. How can I help you with your accounting data today? Use the toggle below to search the web for up-to-date information.' }
  ]);

  // AI Agent loading state (when waiting for response)
  const [isAgentLoading, setIsAgentLoading] = useState(false);

  // ============================================================================
  // STATE VARIABLES - UI Modals & Notifications
  // ============================================================================

  // Import summary - shows success/failure count after bulk import
  const [importSummary, setImportSummary] = useState<{ success: number, failed: number } | null>(null);

  // Mass upload results - stores vouchers from bulk upload for review
  const [massUploadResult, setMassUploadResult] = useState<Voucher[] | null>(null);

  // Deactivation modal - shown when user account is deactivated
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);

  // ============================================================================
  // NAVIGATION HANDLER
  // ============================================================================

  /**
   * Handle page navigation
   * Called when user clicks on sidebar menu items
   */
  const handleNavigate = (page: Page) => setCurrentPage(page);

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
        backendVouchers,
        backendStockItems
      ] = await Promise.all([
        apiService.getCompanyDetails().catch(() => defaultCompanyDetails),
        apiService.getLedgers().catch(() => []),
        apiService.getLedgerGroups().catch(() => []),
        apiService.getVouchers().catch(() => []),
        apiService.getStockItems().catch(() => [])
      ]);

      // Update state with tenant data
      const newData = {
        companyDetails: backendCompanyDetails && typeof backendCompanyDetails === 'object' ? backendCompanyDetails : defaultCompanyDetails,
        ledgers: Array.isArray(backendLedgers) ? backendLedgers : [],
        ledgerGroups: Array.isArray(backendLedgerGroups) ? backendLedgerGroups : [],
        vouchers: Array.isArray(backendVouchers) ? backendVouchers : [],
        stockItems: Array.isArray(backendStockItems) ? backendStockItems : []
      };

      if (newData.companyDetails) {
        setCompanyDetails(prev => ({ ...prev, ...newData.companyDetails }));
      }
      setLedgers(newData.ledgers);
      setLedgerGroups(newData.ledgerGroups);
      setVouchers(newData.vouchers);
      setStockItems(newData.stockItems);

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

        // Load permissions - RBAC removed
        // (Logic removed)

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
          setVouchers([]);
          setIsDataLoaded(true);
        }
      } catch (err) {
        console.error('❌ Failed to initialize app data:', err);
        // Fallback to empty state
        setLedgers([]);
        setLedgerGroups([]);
        setVouchers([]);
        setStockItems([]);
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

      // Save permissions - RBAC removed
      // (Logic removed)

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
    setVouchers([]);
    setCompanyDetails({ ...defaultCompanyDetails, name: 'Your Company Name' });
    setStockItems([]);
  };

  // Check user active status frequently when logged in (exclude admin users)
  // DISABLED: This was causing 401 errors when cookies expired
  // The deactivation check can be re-enabled later with proper session management
  useEffect(() => {
    // Disabled for now to prevent 401 errors
    return;

    /* Original code - disabled
    if (!isLoggedIn) return;

    const tenantId = localStorage.getItem('tenantId');

    // Don't check status for admin users (they can't be deactivated)
    if (!tenantId) return;

    const checkUserStatus = async () => {
      try {
        // Only check if we have authentication cookies
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
      } catch (error: any) {
        // Silently ignore 401 errors (user not authenticated)
        if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
          console.log('User not authenticated, skipping status check');
          return;
        }
        console.warn('Failed to check user status:', error);
        // Don't logout on API errors, just log the warning
      }
    };

    // Check immediately, then every 5 seconds when online
    checkUserStatus();
    const statusInterval = setInterval(checkUserStatus, 5000); // More frequent checks

    return () => clearInterval(statusInterval);
    */
  }, [isLoggedIn, handleLogout]);


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
      />;
      case 'Inventory': return <InventoryPage />;
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
      />;
      case 'Reports': return <ErrorBoundary><ReportsPage
        vouchers={vouchers}
        ledgers={ledgers}
        ledgerGroups={ledgerGroups}
      /></ErrorBoundary>; // Available for all plans
      case 'Settings': return <SettingsPage companyDetails={companyDetails} onSave={handleSaveSettings} />; // Available for all plans
      case 'Vendor Portal': return <VendorPortalPage onLogout={handleLogout} />;
      case 'Customer Portal': return <CustomerPortalPage />;
      case 'Payroll': return <PayrollPage />;
      case 'MassUploadResult': return <MassUploadResultPage
        results={massUploadResult || []}
        onDone={() => { setCurrentPage('Vouchers'); setMassUploadResult(null); }}
        onUpdateVoucher={handleUpdateVoucher}
        ledgers={ledgers}
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
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        companyName={companyDetails.name}
        userPlan={userPlan}
      />
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


      {/* Floating AI Agent Button */}
      <button
        onClick={() => setIsAgentOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 rounded-full text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center group"
        title="Chat with AI Agent"
      >
        <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </button>

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
