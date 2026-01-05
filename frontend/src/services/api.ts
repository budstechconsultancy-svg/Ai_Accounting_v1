/**
 * ============================================================================
 * API SERVICE (api.ts)
 * ============================================================================
 * This file contains ALL API endpoint methods for communicating with the backend.
 * It's a wrapper around httpClient that provides typed, easy-to-use methods.
 * 
 * ARCHITECTURE:
 * - Uses httpClient for HTTP communication (handles auth, errors, retries)
 * - Organized by feature area (Company, Masters, Inventory, Vouchers, etc.)
 * - All methods return Promises with typed data
 * - Handles data transformation between frontend and backend formats
 * 
 * MAIN SECTIONS:
 * 1. Company Settings - Company details, logo upload
 * 2. Masters - Ledgers, ledger groups, voucher configuration
 * 3. Inventory - Units, stock groups, stock items
 * 4. Vouchers - All transaction types (sales, purchase, payment, etc.)
 * 5. AI Features - Invoice extraction, narration generation
 * 6. Authentication - Login, register, logout
 * 7. Users & Permissions - User management, roles, permissions
 * 
 * FOR NEW DEVELOPERS:
 * - Always use apiService instead of httpClient directly
 * - All methods handle authentication automatically
 * - Check the return types for what data you'll receive
 * - Backend uses snake_case, frontend uses camelCase (transformation happens here)
 * 
 * USAGE EXAMPLE:
 * ```typescript
 * import { apiService } from './services';
 * 
 * // Get all ledgers
 * const ledgers = await apiService.getLedgers();
 * 
 * // Save a new voucher
 * const voucher = await apiService.saveVoucher(voucherData);
 * ```
 */

// Import HTTP client for making requests
import { httpClient } from './httpClient';

// Import TypeScript types for type safety
import type {
    CompanyDetails,
    Ledger,
    LedgerGroupMaster,
    Unit,
    StockGroup,
    StockItem,
    Voucher,
    VoucherTypeMaster,
    VoucherNumbering,
    UserTable,
    RoleModulesData
} from '../types';

/**
 * ApiService class - Provides methods for all backend API endpoints
 * Singleton pattern - only one instance exists (exported as apiService)
 */
class ApiService {
    // ============================================================================
    // COMPANY SETTINGS
    // ============================================================================
    // Methods for managing company information (name, address, logo, etc.)

    /**
     * Get company details for the current tenant
     * Returns: Company name, address, GST, logo URL, etc.
     */
    async getCompanyDetails() {
        return httpClient.get<CompanyDetails>('/api/company-settings/');
    }

    /**
     * Save or update company details
     * Handles both JSON data and file uploads (for logo)
     * @param data - Company details including optional logo file
     */
    async saveCompanyDetails(data: CompanyDetails & { logoFile?: File | null }) {
        // If logo file is provided, use FormData for file upload
        if (data.logoFile) {
            const formData = new FormData();
            formData.append('company_name', data.name);
            formData.append('logo', data.logoFile);
            if (data.tax_id) formData.append('tax_id', data.tax_id);
            if (data.address) formData.append('address', data.address);
            if (data.phone) formData.append('phone', data.phone);
            if (data.email) formData.append('email', data.email);
            if (data.website) formData.append('website', data.website);
            return httpClient.postFormData<CompanyDetails>('/api/company-settings/', formData);
        }
        // Otherwise, send JSON data
        return httpClient.post<CompanyDetails>('/api/company-settings/', data);
    }

    // ============================================================================
    // MASTERS - LEDGERS
    // ============================================================================
    // Ledgers are individual accounts in the chart of accounts
    // Examples: "HDFC Bank", "Cash", "Sales - Product A", "Customer XYZ"

    /**
     * Get all ledgers for the current tenant
     * Returns: Array of ledger objects
     */
    async getLedgers() {
        return httpClient.get<Ledger[]>('/api/masters/ledgers/');
    }

    async saveLedger(data: Ledger) {
        return httpClient.post<Ledger>('/api/masters/ledgers/', data);
    }

    async updateLedger(id: number, data: Partial<Ledger>) {
        return httpClient.put<{ success: boolean }>(`/api/masters/ledgers/${id}/`, data);
    }

    async deleteLedger(id: number) {
        return httpClient.delete<{ success: boolean }>(`/api/masters/ledgers/${id}/`);
    }

    // ============================================================================
    // MASTERS - LEDGER GROUPS
    // ============================================================================

    async getLedgerGroups() {
        return httpClient.get<LedgerGroupMaster[]>('/api/masters/ledger-groups/');
    }

    async saveLedgerGroup(data: LedgerGroupMaster) {
        return httpClient.post<LedgerGroupMaster>('/api/masters/ledger-groups/', data);
    }

    async updateLedgerGroup(id: number, data: Partial<LedgerGroupMaster>) {
        return httpClient.put<{ success: boolean }>(`/api/masters/ledger-groups/${id}/`, data);
    }

    async deleteLedgerGroup(id: number) {
        return httpClient.delete<{ success: boolean }>(`/api/masters/ledger-groups/${id}/`);
    }

    // ============================================================================
    // MASTERS - VOUCHER CONFIG
    // ============================================================================

    async getVoucherNumbering() {
        // Backend returns a list of configs (should be one per tenant)
        const response = await httpClient.get<any[]>('/api/masters/voucher-config/');
        const config = response.length > 0 ? response[0] : {};

        // Map flat backend fields to nested frontend structure
        return {
            id: config.id, // Keep ID for updates
            sales: {
                enableAuto: config.sales_enable_auto ?? true,
                prefix: config.sales_prefix || '',
                suffix: config.sales_suffix || '',
                nextNumber: config.sales_next_number || 1,
                padding: config.sales_padding || 4,
                preview: config.sales_preview || ''
            },
            purchase: {
                enableAuto: config.purchase_enable_auto ?? true,
                prefix: config.purchase_prefix || '',
                suffix: config.purchase_suffix || '',
                nextNumber: config.purchase_next_number || 1,
                padding: config.purchase_padding || 4,
                preview: config.purchase_preview || ''
            }
        };
    }

    async saveVoucherNumbering(data: { id?: number; sales?: Partial<VoucherNumbering>; purchase?: Partial<VoucherNumbering> }) {
        // Map nested frontend structure to flat backend fields
        const payload: any = {};

        if (data.sales) {
            payload.sales_enable_auto = data.sales.enableAuto;
            payload.sales_prefix = data.sales.prefix;
            payload.sales_suffix = data.sales.suffix;
            payload.sales_next_number = data.sales.nextNumber;
            payload.sales_padding = data.sales.padding;
            payload.sales_preview = data.sales.preview;
        }

        if (data.purchase) {
            payload.purchase_enable_auto = data.purchase.enableAuto;
            payload.purchase_prefix = data.purchase.prefix;
            payload.purchase_suffix = data.purchase.suffix;
            payload.purchase_next_number = data.purchase.nextNumber;
            payload.purchase_padding = data.purchase.padding;
            payload.purchase_preview = data.purchase.preview;
        }

        if (data.id) {
            // Update existing
            return httpClient.patch<any>(`/api/masters/voucher-config/${data.id}/`, payload);
        } else {
            // Create new (only if not exists, but getVoucherNumbering should handle existence check theoretically)
            // Ideally we check existence first or the backend handles singleton.
            // For now, assume if ID is missing we create.
            return httpClient.post<any>('/api/masters/voucher-config/', payload);
        }
    }

    // ============================================================================
    // INVENTORY - UNITS
    // ============================================================================

    async getUnits() {
        return httpClient.get<Unit[]>('/api/inventory/units/');
    }

    async saveUnit(data: Unit) {
        return httpClient.post<Unit>('/api/inventory/units/', data);
    }

    async updateUnit(id: number, data: Partial<Unit>) {
        return httpClient.put<{ success: boolean }>(`/api/inventory/units/${id}/`, data);
    }

    async deleteUnit(id: number) {
        return httpClient.delete<{ success: boolean }>(`/api/inventory/units/${id}/`);
    }

    // ============================================================================
    // INVENTORY - STOCK GROUPS
    // ============================================================================

    async getStockGroups() {
        return httpClient.get<StockGroup[]>('/api/inventory/stock-groups/');
    }

    async saveStockGroup(data: StockGroup) {
        return httpClient.post<StockGroup>('/api/inventory/stock-groups/', data);
    }

    async updateStockGroup(id: number, data: Partial<StockGroup>) {
        return httpClient.put<{ success: boolean }>(`/api/inventory/stock-groups/${id}/`, data);
    }

    async deleteStockGroup(id: number) {
        return httpClient.delete<{ success: boolean }>(`/api/inventory/stock-groups/${id}/`);
    }

    // ============================================================================
    // INVENTORY - STOCK ITEMS
    // ============================================================================

    async getStockItems() {
        return httpClient.get<StockItem[]>('/api/inventory/stock-items/');
    }

    async saveStockItem(data: StockItem) {
        return httpClient.post<StockItem>('/api/inventory/stock-items/', data);
    }

    async saveStockItems(data: StockItem[]) {
        return httpClient.post<{ success: boolean }>('/api/inventory/stock-items/bulk/', data);
    }

    async updateStockItem(id: number, data: Partial<StockItem>) {
        return httpClient.put<{ success: boolean }>(`/api/inventory/stock-items/${id}/`, data);
    }

    async deleteStockItem(id: number) {
        return httpClient.delete<{ success: boolean }>(`/api/inventory/stock-items/${id}/`);
    }

    // ============================================================================
    // VOUCHERS - UNIFIED ENDPOINT
    // ============================================================================
    // Vouchers are transactions: Sales, Purchase, Payment, Receipt, Contra, Journal
    // All voucher types use the same endpoint with type differentiation

    /**
     * Helper method to normalize voucher type to lowercase
     * Backend expects lowercase, frontend uses TitleCase
     * @param type - Voucher type (e.g., "Sales", "Purchase")
     * @returns Lowercase type (e.g., "sales", "purchase")
     */
    private normalizeVoucherType(type: string): string {
        return type.toLowerCase();
    }

    /**
     * Get all vouchers, optionally filtered by type
     * @param type - Optional voucher type filter ("Sales", "Purchase", etc.)
     * @returns Array of vouchers with normalized types
     */
    async getVouchers(type?: string) {
        const normalizedType = type ? this.normalizeVoucherType(type) : undefined;
        const endpoint = normalizedType ? `/api/vouchers/?type=${normalizedType}` : '/api/vouchers/';
        const vouchers = await httpClient.get<Voucher[]>(endpoint);

        // Map backend lowercase types to frontend TitleCase
        const typeMap: Record<string, string> = {
            'sales': 'Sales',
            'purchase': 'Purchase',
            'payment': 'Payment',
            'receipt': 'Receipt',
            'contra': 'Contra',
            'journal': 'Journal'
        };

        return vouchers.map(v => ({
            ...v,
            type: (typeMap[v.type.toLowerCase()] || v.type) as any
        }));
    }

    async saveVoucher(data: Voucher) {
        const normalizedData = { ...data, type: this.normalizeVoucherType(data.type) };
        const response = await httpClient.post<Voucher>('/api/vouchers/', normalizedData);

        const typeMap: Record<string, string> = {
            'sales': 'Sales',
            'purchase': 'Purchase',
            'payment': 'Payment',
            'receipt': 'Receipt',
            'contra': 'Contra',
            'journal': 'Journal'
        };

        return {
            ...response,
            type: (typeMap[response.type.toLowerCase()] || response.type) as any
        };
    }

    async saveVouchers(data: Voucher[]) {
        const normalizedData = data.map(v => ({ ...v, type: this.normalizeVoucherType(v.type) }));
        return httpClient.post<{ success: boolean }>('/api/vouchers/bulk/', normalizedData);
    }

    async updateVoucher(id: number, data: Partial<Voucher>) {
        const normalizedData = data.type ? { ...data, type: this.normalizeVoucherType(data.type) } : data;
        const response = await httpClient.put<Voucher>(`/api/vouchers/${id}/`, normalizedData);

        const typeMap: Record<string, string> = {
            'sales': 'Sales',
            'purchase': 'Purchase',
            'payment': 'Payment',
            'receipt': 'Receipt',
            'contra': 'Contra',
            'journal': 'Journal'
        };

        return {
            ...response,
            type: (typeMap[response.type.toLowerCase()] || response.type) as any
        };
    }

    async deleteVoucher(id: number) {
        return httpClient.delete<{ success: boolean }>(`/api/vouchers/${id}/`);
    }

    // ============================================================================
    // AI FEATURES
    // ============================================================================
    // AI-powered features using Google Gemini

    /**
     * Extract invoice data from an uploaded image/PDF using AI
     * @param file - Invoice file (image or PDF)
     * @param type - Voucher type ("Sales" or "Purchase")
     * @param save - Whether to save the extracted voucher to database
     * @returns Extracted invoice data (party, items, amounts, etc.)
     */
    async extractInvoiceData(file: File, type?: string, save: boolean = true) {
        const formData = new FormData();
        formData.append('file', file);
        if (type) formData.append('type', type);
        formData.append('save', String(save));
        return httpClient.postFormData('/api/ai/invoice-extract/', formData);
    }

    async extractStockItemsFromFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return httpClient.postFormData('/api/ai/stock-extract/', formData);
    }

    async sendAgentMessage(message: string, useGrounding: boolean, contextData?: string) {
        return httpClient.post('/api/agent/message/', { message, useGrounding, contextData });
    }

    async generateNarration(voucherData: any) {
        const response = await httpClient.post<{ narration: string }>('/api/ai/generate-narration/', voucherData);
        return response.narration;
    }

    async uploadVoucherImage(file: File) {
        const formData = new FormData();
        formData.append('image', file);
        return httpClient.postFormData('/api/ai/voucher-image/', formData);
    }

    // ============================================================================
    // AUTHENTICATION
    // ============================================================================
    // User login, registration, and session management

    /**
     * Login user with credentials
     * @param email - User email
     * @param username - Username
     * @param password - Password
     * @returns User data, tokens, and permissions
     */
    async login(email: string, username: string, password: string) {
        const data = await httpClient.post<any>('/api/auth/login/', { email, username, password });

        // Save tokens to localStorage (backup for HttpOnly cookies)
        if (data.access) {
            localStorage.setItem('token', data.access);
        }
        if (data.refresh) {
            localStorage.setItem('refreshToken', data.refresh);
        }

        // Save tenant and company info
        if (data.user) {
            httpClient.saveAuthData({
                tenant_id: data.user?.tenant_id || data.tenant_id,
                company_name: data.user?.company_name || data.company_name,
            });
        }

        return data;
    }

    async register(userData: {
        username: string;
        companyName: string;
        email?: string;
        password: string;
        phone: string;
        selectedPlan: string;
        logoFile?: File | null;
    }) {
        if (userData.logoFile) {
            const formData = new FormData();
            formData.append('username', userData.username);
            formData.append('company_name', userData.companyName);
            formData.append('email', userData.email || '');
            formData.append('password', userData.password);
            formData.append('phone', userData.phone);
            formData.append('selected_plan', userData.selectedPlan);
            formData.append('logo', userData.logoFile);
            return httpClient.postFormData('/api/auth/register/', formData);
        }

        return httpClient.post('/api/auth/register/', {
            username: userData.username,
            company_name: userData.companyName,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            selected_plan: userData.selectedPlan,
        });
    }

    async logout() {
        try {
            await httpClient.post('/api/auth/logout/');
        } catch (e) {
            console.error('Logout failed', e);
        }
        httpClient.clearAuthData();
        window.location.href = '/login';
    }

    async createUserAccount(phone: string) {
        return httpClient.post<any>('/api/auth/create-account/', { phone });
    }

    async checkUserStatus() {
        return httpClient.get<{ isActive: boolean }>('/api/auth/check-status/');
    }

    // ============================================================================
    // USER & PERMISSIONS
    // ============================================================================

    async getModuleSchema() {
        return httpClient.get<Record<string, any>>('/api/module-permissions/schema/');
    }

    async getUserModulePermissions(userId: string) {
        return httpClient.get<{ user_id: string; tenant_id: string; codes: string[] }>(`/api/module-permissions/user/${userId}/`);
    }

    async updateUserModulePermissions(userId: string, codes: string[]) {
        return httpClient.put<{ success: boolean; message: string; codes: string[] }>(`/api/module-permissions/user/${userId}/`, { codes });
    }

    async getUsers() {
        return httpClient.get<{ users: any[] }>('/api/settings/users/');
    }

    async createUser(data: any) {
        return httpClient.post<{ success: boolean }>('/api/settings/users/', data);
    }

    async updateUser(userId: number, permissions: any[]) {
        return httpClient.put<{ success: boolean }>(`/api/settings/users/${userId}/`, { userId, permissions });
    }

    async updateUserRoles(userId: number, roleIds: number[]) {
        return httpClient.put<{ success: boolean }>(`/api/settings/users/${userId}/roles/`, { roleIds });
    }

    async deactivateUser(userId: number) {
        return httpClient.post<{ success: boolean }>(`/api/settings/users/${userId}/deactivate/`);
    }

    async activateUser(userId: number) {
        return httpClient.post<{ success: boolean }>(`/api/settings/users/${userId}/activate/`);
    }

    async deleteUser(userId: number) {
        return httpClient.delete<{ success: boolean }>(`/api/settings/users/${userId}/`);
    }

    async getUserTables() {
        return httpClient.get<UserTable[]>('/api/settings/user-tables/');
    }

    async getRoleModules(roleId: number) {
        return httpClient.get<RoleModulesData>(`/api/settings/role-modules/${roleId}/`);
    }

    async saveRoleModules(roleId: number, selectedSubmoduleIds: number[]) {
        return httpClient.post<{ success: boolean; message: string }>(`/api/settings/role-modules/${roleId}/`, { selectedSubmoduleIds });
    }

    // ============================================================================
    // HEALTH CHECK
    // ============================================================================

    async healthCheck() {
        return httpClient.get<{ status: string; timestamp: string }>('/api/health/');
    }
}

export const apiService = new ApiService();
export { API_BASE_URL } from './httpClient';
