import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  Key, 
  PowerOff, 
  Trash2
} from 'lucide-react';

// UI components
import PageHeader from '../components/ui/PageHeader';
import FilterBar from '../components/ui/FilterBar';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';

const ROLES_OPTIONS = ['Admin', 'Driver', 'Safety Officer', 'Financial Analyst'];

const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'Admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';

    case 'Driver': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
    case 'Safety Officer': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
    case 'Financial Analyst': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
  }
};


const ActionMenu = ({ user, onView, onEdit, onToggleStatus, onResetPassword, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-md hover:bg-brand-slate-100 dark:hover:bg-brand-slate-800 text-brand-slate-500"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-brand-slate-900 rounded-xl shadow-lg border border-brand-slate-200 dark:border-brand-slate-800 py-1 z-50">
          <button onClick={() => { setIsOpen(false); onView(user); }} className="w-full text-left px-4 py-2 text-sm text-brand-slate-700 dark:text-brand-slate-200 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-800 flex items-center">
            <Eye className="w-4 h-4 mr-2" /> View Details
          </button>
          <button onClick={() => { setIsOpen(false); onEdit(user); }} className="w-full text-left px-4 py-2 text-sm text-brand-slate-700 dark:text-brand-slate-200 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-800 flex items-center">
            <Edit2 className="w-4 h-4 mr-2" /> Edit User
          </button>
          <button onClick={() => { setIsOpen(false); onResetPassword(user); }} className="w-full text-left px-4 py-2 text-sm text-brand-slate-700 dark:text-brand-slate-200 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-800 flex items-center">
            <Key className="w-4 h-4 mr-2" /> Reset Password
          </button>
          <button onClick={() => { setIsOpen(false); onToggleStatus(user); }} className="w-full text-left px-4 py-2 text-sm text-brand-slate-700 dark:text-brand-slate-200 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-800 flex items-center">
            <PowerOff className="w-4 h-4 mr-2" /> {user.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          <div className="border-t border-brand-slate-100 dark:border-brand-slate-800 my-1"></div>
          <button onClick={() => { setIsOpen(false); onDelete(user); }} className="w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-brand-red/5 flex items-center">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const UserManagement = React.memo(() => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const mapped = (res.data?.data || []).map(u => {
        const nameParts = (u.name || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        return {
          id: u._id || u.id,
          name: u.name,
          firstName,
          lastName,
          email: u.email,
          role: u.role,
          phone: u.phone || 'N/A',
          status: u.isActive ? 'Active' : 'Inactive',
          createdDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A',
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString().split('T')[0] : 'Never'
        };
      });
      setUsers(mapped);
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to fetch users', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = users;
    
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }
    
    if (roleFilter !== 'All') {
      result = result.filter(u => u.role === roleFilter);
    }
    
    if (statusFilter !== 'All') {
      result = result.filter(u => u.status === statusFilter);
    }
    
    return result;
  }, [users, search, roleFilter, statusFilter]);

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  // --- Handlers ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      await api.post('/users', {
        name: formData.get('name') || `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email'),
        password,
        role: formData.get('role')
      });
      setIsAddModalOpen(false);
      addToast('User added successfully', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to add user', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await api.put(`/users/${selectedUser.id}`, {
        name: formData.get('name') || `${formData.get('firstName')} ${formData.get('lastName')}`,
        role: formData.get('role'),
        isActive: formData.get('status') === 'Active'
      });
      setIsEditModalOpen(false);
      addToast('User updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${selectedUser.id}`);
      setIsDeleteModalOpen(false);
      addToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to delete user', 'error');
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post(`/users/${selectedUser.id}/reset-password`, { newPassword: 'TransitOps@123' });
      setIsResetPasswordModalOpen(false);
      addToast('Password reset successfully to TransitOps@123', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to reset password', 'error');
    }
  };

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/users/${selectedUser.id}/status`);
      setIsToggleStatusModalOpen(false);
      addToast('User status updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to toggle status', 'error');
    }
  };

  const columns = [
    { 
      key: 'user', 
      header: 'User', 
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-sm">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-brand-slate-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-brand-slate-500">{user.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Role', 
      render: (role) => (
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getRoleBadgeColor(role)}`}>
          {role}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (status) => <StatusBadge status={status} />
    },
    { 
      key: 'createdDate', 
      header: 'Created Date' 
    },
    { 
      key: 'lastLogin', 
      header: 'Last Login' 
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (_, user) => (
        <ActionMenu 
          user={user}
          onView={(u) => { setSelectedUser(u); setIsViewModalOpen(true); }}
          onEdit={(u) => { setSelectedUser(u); setIsEditModalOpen(true); }}
          onToggleStatus={(u) => { setSelectedUser(u); setIsToggleStatusModalOpen(true); }}
          onResetPassword={(u) => { setSelectedUser(u); setIsResetPasswordModalOpen(true); }}
          onDelete={(u) => { setSelectedUser(u); setIsDeleteModalOpen(true); }}
        />
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle="Manage system users and roles."
      >
        <Button onClick={() => setIsAddModalOpen(true)} icon={Plus} variant="primary">
          Add User
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-brand-slate-900 p-4 rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 shadow-sm">
        <div className="w-full md:w-1/3">
          <FilterBar
            searchVal={search}
            onSearchChange={(e) => { setSearch(e.target.value); setPage(1); }}
            searchPlaceholder="Search by Name or Email"
            onReset={search ? () => { setSearch(''); setPage(1); } : null}
          />
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-brand-slate-600 dark:text-brand-slate-300">Role:</span>
            <select 
              aria-label="Role Filter"
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="bg-brand-slate-50 dark:bg-brand-slate-800 border border-brand-slate-200 dark:border-brand-slate-700 text-brand-slate-900 dark:text-white text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue block p-2"
            >
              <option value="All">All Roles</option>
              {ROLES_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-brand-slate-600 dark:text-brand-slate-300">Status:</span>
            <select 
              aria-label="Status Filter"
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-brand-slate-50 dark:bg-brand-slate-800 border border-brand-slate-200 dark:border-brand-slate-700 text-brand-slate-900 dark:text-white text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue block p-2"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 border-l border-brand-slate-200 dark:border-brand-slate-700 pl-3">
            <span className="text-sm font-semibold text-brand-slate-600 dark:text-brand-slate-300">Show:</span>
            <select 
              aria-label="Page Size"
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-brand-slate-50 dark:bg-brand-slate-800 border border-brand-slate-200 dark:border-brand-slate-700 text-brand-slate-900 dark:text-white text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue block p-2"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={pagedUsers} 
          emptyState={
            <EmptyState 
              type="users" 
              title="No Users Found"
              description="No users match your current filter criteria."
              actionText="Clear Filters" 
              onActionClick={() => { setSearch(''); setRoleFilter('All'); setStatusFilter('All'); setPage(1); }} 
            />
          } 
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* --- ADD USER MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New User" size="md">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First Name" id="firstName" name="firstName" required />
            <Input label="Last Name" id="lastName" name="lastName" required />
            <Input label="Email" id="email" name="email" type="email" required />
            <Input label="Phone" id="phone" name="phone" required />
            <Input label="Password" id="password" name="password" type="password" required />
            <Input label="Confirm Password" id="confirmPassword" name="confirmPassword" type="password" required />
            <Select label="Role" id="role" name="role" options={ROLES_OPTIONS} required />
            <Select label="Status" id="status" name="status" options={['Active', 'Inactive']} required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
            <Button type="button" onClick={() => setIsAddModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Add User</Button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT USER MODAL --- */}
      {selectedUser && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User" size="md">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First Name" id="editFirstName" name="firstName" defaultValue={selectedUser.firstName} required />
              <Input label="Last Name" id="editLastName" name="lastName" defaultValue={selectedUser.lastName} required />
              <Input label="Email" id="editEmail" name="email" type="email" defaultValue={selectedUser.email} disabled className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
              <Input label="Phone" id="editPhone" name="phone" defaultValue={selectedUser.phone} required />
              <Select label="Role" id="editRole" name="role" options={ROLES_OPTIONS} defaultValue={selectedUser.role} required />
              <Select label="Status" id="editStatus" name="status" options={['Active', 'Inactive']} defaultValue={selectedUser.status} required />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
              <Button type="button" onClick={() => setIsEditModalOpen(false)} variant="secondary">Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- VIEW USER MODAL --- */}
      {selectedUser && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="User Details" size="sm">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-2xl">
                {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-slate-900 dark:text-white">{selectedUser.name}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-brand-slate-500">Email</p>
                <p className="font-semibold text-brand-slate-900 dark:text-white">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-brand-slate-500">Phone</p>
                <p className="font-semibold text-brand-slate-900 dark:text-white">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-brand-slate-500">Status</p>
                <p className="mt-1"><StatusBadge status={selectedUser.status} /></p>
              </div>
              <div>
                <p className="text-brand-slate-500">Created Date</p>
                <p className="font-semibold text-brand-slate-900 dark:text-white">{selectedUser.createdDate}</p>
              </div>
              <div className="col-span-2 border-t border-brand-slate-100 dark:border-brand-slate-800 pt-4">
                <p className="text-brand-slate-500">Last Login</p>
                <p className="font-semibold text-brand-slate-900 dark:text-white">{selectedUser.lastLogin}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsViewModalOpen(false)} variant="secondary">Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- CONFIRMATION DIALOGS --- */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onConfirm={handleResetPassword}
        title="Reset Password"
        description={`Are you sure you want to send a password reset link to ${selectedUser?.email}?`}
        confirmText="Reset Password"
        cancelText="Cancel"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={isToggleStatusModalOpen}
        onClose={() => setIsToggleStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        title={`${selectedUser?.status === 'Active' ? 'Deactivate' : 'Activate'} User`}
        description={`Are you sure you want to ${selectedUser?.status === 'Active' ? 'deactivate' : 'activate'} ${selectedUser?.name}?`}
        confirmText={selectedUser?.status === 'Active' ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={selectedUser?.status === 'Active' ? 'danger' : 'primary'}
      />

    </div>
  );
});

export default UserManagement;
