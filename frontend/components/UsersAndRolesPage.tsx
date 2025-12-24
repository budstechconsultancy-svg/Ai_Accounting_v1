import React, { useState, useEffect } from 'react';
import { apiService } from '../src/services';
import { User, Role, Permission, PermissionGroup, RoleSummary } from '../src/types';
import ModulePicker from './ModulePicker';
import PermissionTreeSelector from './PermissionTreeSelector';
import { useRoleModules } from '../src/hooks/useModuleData';

type RoleOption = {
  id: number;
  name: string;
};

const CreateUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedSubmoduleIds, setSelectedSubmoduleIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modules with their submodules (excluding SETTINGS, USERS, ACCOUNTING - owner only)
  const MODULES = {
    'DASHBOARD': [
      { id: 1, name: 'View Dashboard' }
    ],
    'MASTERS': [
      { id: 2, name: 'Ledgers' },
      { id: 3, name: 'Ledger Groups' },
      { id: 4, name: 'Voucher Configuration' }
    ],
    'INVENTORY': [
      { id: 5, name: 'Stock Items' },
      { id: 6, name: 'Stock Groups' },
      { id: 7, name: 'Units' }
    ],
    'VOUCHERS': [
      { id: 8, name: 'Sales' },
      { id: 9, name: 'Purchase' },
      { id: 10, name: 'Payment' },
      { id: 11, name: 'Receipt' },
      { id: 12, name: 'Contra' },
      { id: 13, name: 'Journal' }
    ],
    'REPORTS': [
      { id: 14, name: 'Day Book' },
      { id: 15, name: 'Ledger Report' },
      { id: 16, name: 'Trial Balance' },
      { id: 17, name: 'Stock Summary' },
      { id: 18, name: 'GST Reports' }
    ],
    'AI': [
      { id: 22, name: 'AI Assistant' },
      { id: 23, name: 'Invoice Extraction' }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    if (!formData.password) {
      alert('Password is required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (selectedSubmoduleIds.length === 0) {
      alert('At least one permission must be selected');
      return;
    }

    setIsLoading(true);

    try {
      await apiService.createUser({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        submodule_ids: selectedSubmoduleIds
      });

      onSuccess();
      onClose();
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setSelectedSubmoduleIds([]);
    } catch (error) {
      console.error('Create user error:', error);
      alert(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setSelectedSubmoduleIds([]);
  };

  const togglePermission = (id: number) => {
    setSelectedSubmoduleIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = Object.values(MODULES).flat().map(s => s.id);
    if (selectedSubmoduleIds.length === allIds.length) {
      setSelectedSubmoduleIds([]);
    } else {
      setSelectedSubmoduleIds(allIds);
    }
  };

  const selectAllInModule = (moduleSubmodules: { id: number; name: string }[]) => {
    const moduleIds = moduleSubmodules.map(s => s.id);
    const allSelected = moduleIds.every(id => selectedSubmoduleIds.includes(id));

    if (allSelected) {
      setSelectedSubmoduleIds(prev => prev.filter(id => !moduleIds.includes(id)));
    } else {
      setSelectedSubmoduleIds(prev => [...new Set([...prev, ...moduleIds])]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Create New User
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter user name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Module & Submodule Access * <span className="text-xs text-gray-500 font-normal">({selectedSubmoduleIds.length}/33 selected)</span>
                        </label>
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {selectedSubmoduleIds.length === Object.values(MODULES).flat().length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="max-h-96 overflow-y-auto border rounded-md p-3 space-y-3">
                        {Object.entries(MODULES).map(([moduleName, submodules]) => (
                          <div key={moduleName} className="border-b pb-2 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm text-gray-900">{moduleName}</span>
                              <button
                                type="button"
                                onClick={() => selectAllInModule(submodules)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {submodules.every(s => selectedSubmoduleIds.includes(s.id)) ? 'Deselect All' : 'Select All'}
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {submodules.map(submodule => (
                                <label key={submodule.id} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedSubmoduleIds.includes(submodule.id)}
                                    onChange={() => togglePermission(submodule.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700">{submodule.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

type TabType = 'users' | 'roles' | 'permissions';

const UsersAndRolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Permission checks
  // Permission checks
  const perms = localStorage.getItem('userPermissions') || '';
  const hasMetaAccess = perms.includes('USERS') || perms.includes('OWNER');

  const hasUserView = hasMetaAccess || perms.includes('SETTINGS_USER_VIEW');
  const hasUserManage = hasMetaAccess || perms.includes('SETTINGS_USER_MANAGE');
  const hasRoleView = hasMetaAccess || perms.includes('SETTINGS_ROLE_VIEW');
  const hasRoleManage = hasMetaAccess || perms.includes('SETTINGS_ROLE_MANAGE');

  // Modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingUserRoles, setEditingUserRoles] = useState<number[]>([]);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    selectedSubmoduleIds: [] as number[]
  });


  const [editingRole, setEditingRole] = useState<{ id: number; name: string; description: string } | null>(null);
  const editRoleModules = useRoleModules(editingRole?.id || undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const loadPromises = [];
      if (hasUserView) loadPromises.push(apiService.getUsers());
      // REMOVED: getRoles() - no longer using roles table
      // if (hasRoleView) loadPromises.push(apiService.getRoles());

      const results = await Promise.all(loadPromises);

      if (hasUserView && results[0]) {
        setUsers((results[0] as { users: User[] }).users || []);
      }
      // REMOVED: Role loading - no longer using roles table
      // if (hasRoleView && results[1]) {
      //   const rolesResult = results[1] as { roles: RoleSummary[] };
      //   setRoles(rolesResult.roles || []);
      //   if (rolesResult.roles && rolesResult.roles.length === 0) {
      //     console.log('No roles found, attempting to seed module roles...');
      //     await seedModuleRoles();
      //   }
      // }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // REMOVED: seedModuleRoles - no longer using roles table
  // const seedModuleRoles = async () => {
  //   ...
  // };



  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setEditingUserRoles(user.roles.map(role => role.id));
    setShowEditUserModal(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await apiService.updateUserRoles(editingUser.id, editingUserRoles);

      if (response.success) {
        setShowEditUserModal(false);
        setEditingUser(null);
        setEditingUserRoles([]);
        loadData(); // Refresh the list
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      alert('Failed to update user');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      if (user.is_active) {
        await apiService.deactivateUser(user.id);
      } else {
        await apiService.activateUser(user.id);
      }
      loadData(); // Refresh the list
    } catch (error) {
      console.error('Toggle user status error:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiService.deleteUser(userId);
      // Remove the user from state immediately without full reload
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      alert('User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Failed to delete user');
    }
  };

  const handleUserRoleToggle = (roleId: number, isEditing: boolean = false) => {
    if (isEditing) {
      setEditingUserRoles(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
    }
  };

  // REMOVED: handleCreateRole - no longer using roles table
  // const handleCreateRole = async (e: React.FormEvent) => {
  //   ...
  // };

  const openEditRoleModal = async (role: RoleSummary) => {
    setEditingRole({ id: role.id, name: role.name, description: role.description || '' });
    setShowEditRoleModal(true);
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    try {
      // Save the current selections from the hook
      await editRoleModules.saveRoleModules(editRoleModules.selectedSubmoduleIds);
      setShowEditRoleModal(false);
      setEditingRole(null);
      loadData(); // Refresh the list
    } catch (error) {
      console.error('Update role error:', error);
      alert('Failed to update role');
    }
  };



  // Group permissions by module and group name
  const groupPermissionsByModule = (perms: Permission[]): PermissionGroup[] => {
    const modules: { [key: string]: { [group: string]: Permission[] } } = {};

    perms.forEach(perm => {
      if (!modules[perm.module]) {
        modules[perm.module] = {};
      }
      if (!modules[perm.module][perm.groupName]) {
        modules[perm.module][perm.groupName] = [];
      }
      modules[perm.module][perm.groupName].push(perm);
    });

    return Object.entries(modules).map(([module, groups]) => ({
      module,
      groups
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasUserView && !hasRoleView) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view users and roles.</p>
        </div>
      </div>
    );
  }

  const permissionGroups = groupPermissionsByModule(permissions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users & Roles</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'users' as TabType, label: 'Users', canAccess: hasUserView },
              { id: 'roles' as TabType, label: 'Roles & Permissions', canAccess: hasRoleView },
              { id: 'permissions' as TabType, label: 'All Permissions', canAccess: hasRoleManage }
            ].map(tab => tab.canAccess && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && hasUserView && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            {hasUserManage && (
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Add User
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {hasUserManage && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-600">
                            {user.selected_submodule_ids?.length || 0} permissions
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {hasUserManage && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openEditUserModal(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit Roles
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`hover:underline ${user.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={hasUserManage ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && hasRoleView && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">User Roles & Permissions</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module Access</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    // Get permission count
                    const permissionCount = user.selected_submodule_ids?.length || 0;
                    const moduleAccess = permissionCount > 0 ? `${permissionCount} permissions` : 'No Access';

                    // Format last login
                    const lastLogin = user.last_login
                      ? new Date(user.last_login).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : 'Never';

                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {permissionCount} permissions
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs">
                            {moduleAccess}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lastLogin}
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && hasRoleManage && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Permissions</h2>
            <p className="text-sm text-gray-600">Complete list of all permissions available in the system, organized by module and group.</p>
          </div>

          <div className="space-y-6">
            {permissionGroups.map((moduleGroup) => (
              <div key={moduleGroup.module} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">{moduleGroup.module}</h3>
                </div>

                {Object.entries(moduleGroup.groups).map(([groupName, groupPerms]) => (
                  <div key={groupName} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-6 py-3 bg-gray-25 border-b border-gray-100">
                      <h4 className="font-medium text-gray-800">{groupName}</h4>
                    </div>
                    <div className="px-6 py-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {groupPerms.map((perm) => (
                          <div key={perm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-sm text-gray-900">{perm.description}</div>
                              <div className="text-xs text-gray-500 font-mono">{perm.code}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSuccess={() => {
          setShowCreateUserModal(false);
          loadData();
        }}
      />

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditUser}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit User: {editingUser.name}
                      </h3>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Roles
                        </label>
                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                          {roles.map((role) => (
                            <label key={role.id} className="flex items-center mb-1">
                              <input
                                type="checkbox"
                                checked={editingUserRoles.includes(role.id)}
                                onChange={() => handleUserRoleToggle(role.id, true)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">{role.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setEditingUser(null);
                      setEditingUserRoles([]);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REMOVED: Create Role Modal - no longer using roles
      {showCreateRoleModal && (
        ...
      )}
      */}

      {/* REMOVED: Edit Role Modal - no longer using roles  
      {showEditRoleModal && editingRole && (
        ...
      )}
      */}
    </div>
  );
};


export default UsersAndRolesPage;
