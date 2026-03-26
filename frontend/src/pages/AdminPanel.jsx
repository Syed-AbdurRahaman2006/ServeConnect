import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import {
  Users, Shield, BarChart3, UserX, UserCheck,
  Activity, Briefcase, Wrench
} from 'lucide-react';

const AdminPanel = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    if (tab === 'analytics') fetchStats();
  }, [tab, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page };
      if (roleFilter) params.role = roleFilter;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.users);
      setPagination({ page: res.data.page, pages: res.data.pages });
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
    } catch (err) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const res = await adminAPI.toggleBlock(userId);
      toast.success(res.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield size={28} className="text-primary-400" />
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>
        <p className="text-dark-400">Monitor and manage the ServeConnect platform</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'bg-dark-800/60 text-dark-300 hover:bg-dark-700 border border-dark-700/50'
            }`}
          >
            <t.icon size={16} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <select
              className="input-field w-auto"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="USER">Users</option>
              <option value="PROVIDER">Providers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="text-left text-xs text-dark-400 font-medium uppercase tracking-wider px-6 py-4">User</th>
                    <th className="text-left text-xs text-dark-400 font-medium uppercase tracking-wider px-6 py-4">Role</th>
                    <th className="text-left text-xs text-dark-400 font-medium uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs text-dark-400 font-medium uppercase tracking-wider px-6 py-4">Joined</th>
                    <th className="text-right text-xs text-dark-400 font-medium uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-dark-800/50 hover:bg-dark-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-dark-400 text-sm">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge-primary">{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-6 py-4 text-dark-400 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleBlock(u._id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              u.status === 'active'
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 border border-accent-500/20'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <span className="flex items-center space-x-1"><UserX size={14} /><span>Block</span></span>
                            ) : (
                              <span className="flex items-center space-x-1"><UserCheck size={14} /><span>Unblock</span></span>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div>
          {loading || !stats ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <Users size={28} className="text-primary-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white">{stats.users}</p>
                <p className="text-dark-400 text-sm mt-1">Total Users</p>
              </div>
              <div className="card text-center">
                <Wrench size={28} className="text-accent-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white">{stats.providers}</p>
                <p className="text-dark-400 text-sm mt-1">Providers</p>
              </div>
              <div className="card text-center">
                <Briefcase size={28} className="text-amber-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white">{stats.services}</p>
                <p className="text-dark-400 text-sm mt-1">Services</p>
              </div>
              <div className="card text-center">
                <Activity size={28} className="text-red-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white">
                  {Object.values(stats.requests || {}).reduce((a, b) => a + b, 0)}
                </p>
                <p className="text-dark-400 text-sm mt-1">Total Requests</p>
              </div>
              {/* Request breakdown */}
              {stats.requests && Object.entries(stats.requests).map(([status, count]) => (
                <div key={status} className="card">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={status} />
                    <p className="text-2xl font-bold text-white">{count}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
