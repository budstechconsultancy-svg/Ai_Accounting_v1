/**
 * ============================================================================
 * SIDEBAR COMPONENT (Sidebar.tsx)
 * ============================================================================
 * Left navigation sidebar - provides navigation to all main sections of the app.
 * 
 * FEATURES:
 * - Company name display at top
 * - Navigation menu with icons
 * - Active page highlighting
 * - Role-based access control (hides menu items based on permissions)
 * - Logout button at bottom
 * 
 * NAVIGATION ITEMS:
 * - Dashboard - Overview and metrics
 * - Masters - Ledgers and chart of accounts
 * - Inventory - Stock items and inventory management
 * - Vouchers - Transaction entry (sales, purchase, payments)
 * - Vendor Portal - Vendor management
 * - Customer Portal - Customer management
 * - Payroll - Employee payroll
 * - Reports - Financial reports
 * - Settings - Company settings
 * - Users & Roles - User management and permissions
 * 
 * PERMISSIONS:
 * - Dashboard is always visible
 * - Other items require specific permissions (MASTERS, INVENTORY, etc.)
 * - OWNER role has access to everything
 * 
 * FOR NEW DEVELOPERS:
 * - Add new menu items to the `allNavItems` array
 * - Specify a role if the item requires permissions
 * - Use Icon component for consistent icon display
 */

// Import React
import React from 'react';

// Import Page type for navigation
import type { Page } from '../types';

// Import Icon component for menu icons
import Icon from './Icon';

/**
 * Props for Sidebar component
 */
interface SidebarProps {
  currentPage: Page;              // Currently active page (for highlighting)
  onNavigate: (page: Page) => void;  // Callback when user clicks a menu item
  onLogout: () => void;           // Callback when user clicks logout
  companyName: string;            // Company name to display at top
  userPlan?: string;              // User's subscription plan (Basic, Pro, Enterprise)
  permissions?: string[];         // User's permissions for role-based access control
}

/**
 * Sidebar Component - Main navigation sidebar
 */
const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, companyName, userPlan, permissions }) => {
  // Define all available navigation items
  // Each item has a name, icon, and optional role requirement
  const allNavItems: { name: Page; icon: React.ReactElement; role?: string }[] = [
    { name: 'Dashboard', icon: <Icon name="dashboard" /> },
    { name: 'Masters', icon: <Icon name="masters" />, role: 'MASTERS' },
    { name: 'Inventory', icon: <Icon name="inventory" />, role: 'INVENTORY' },
    { name: 'Vouchers', icon: <Icon name="vouchers" />, role: 'VOUCHERS' },
    { name: 'Vendor Portal', icon: <Icon name="users" /> },
    { name: 'Customer Portal', icon: <Icon name="users" /> },
    { name: 'Payroll', icon: <Icon name="users" /> },
    { name: 'Reports', icon: <Icon name="reports" />, role: 'REPORTS' },
    { name: 'Settings', icon: <Icon name="settings" />, role: 'SETTINGS' },
    { name: 'Users & Roles', icon: <Icon name="users" />, role: 'USERS' },
  ];

  // Filter navigation items based on user permissions
  // Dashboard is always visible, other items require specific permissions
  const navItems = allNavItems.filter(item => {
    if (!permissions) return true; // Legacy fallback - show all if no permissions defined
    if (item.name === 'Dashboard') return true; // Dashboard always visible
    if (item.role) {
      // Check if user has the required role or is an OWNER (full access)
      return permissions.includes(item.role) || permissions.includes('OWNER');
    }
    return true; // Show items without role requirements
  });

  return (
    <aside className="w-64 bg-white text-gray-800 flex flex-col fixed h-full border-r border-slate-200">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-orange-600 truncate" title={companyName}>{companyName || 'Your Company Name'}</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.name;
          return (
            <a
              key={item.name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.name);
              }}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                ? 'bg-orange-50 text-orange-700'
                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
                }`}
            >
              <span className={`w-6 h-6 ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-200">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onLogout();
          }}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-slate-100 hover:text-gray-900"
        >
          <Icon name="logout" className="w-6 h-6 text-gray-400" />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
