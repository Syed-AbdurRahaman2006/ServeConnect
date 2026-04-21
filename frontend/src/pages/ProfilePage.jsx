import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useRequestStore from '../store/requestStore';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera,
  Shield, Award, Star, TrendingUp, Clock, CheckCircle2, Package,
  ArrowLeft, Settings, LogOut, Trash2, Eye, EyeOff
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const { requests } = useRequestStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // Calculate user statistics
  const stats = {
    totalBookings: requests.length,
    activeBookings: requests.filter(r => ['CREATED', 'ACCEPTED'].includes(r.status)).length,
    completedBookings: requests.filter(r => r.status === 'COMPLETED').length,
    totalSpent: requests
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.serviceId?.price || 0), 0),
    averageRating: (() => {
      const rated = requests.filter(r => r.rating);
      if (rated.length === 0) return 0;
      return (rated.reduce((sum, r) => sum + r.rating, 0) / rated.length).toFixed(1);
    })(),
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A',
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.error('Account deletion is not yet implemented');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 bg-white border border-surface-200 rounded-xl flex items-center justify-center hover:bg-surface-50 hover:border-indigo-200 transition-all group"
            >
              <ArrowLeft size={18} className="text-surface-600 group-hover:text-indigo-600 transition-colors" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-surface-900 tracking-tight">My Profile</h1>
              <p className="text-surface-500 font-medium">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-surface-200 rounded-3xl p-8 shadow-sm"
            >
              {/* Avatar */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-lg">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover rounded-3xl" />
                  ) : (
                    formData.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-1/2 translate-x-16 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg">
                    <Camera size={18} />
                  </button>
                )}
              </div>

              {/* Name & Email */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-surface-900 mb-1">{user?.name}</h2>
                <p className="text-surface-500 font-medium text-sm">{user?.email}</p>
              </div>

              {/* Member Badge */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Award size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Member Since</p>
                    <p className="text-sm font-black text-surface-900">{stats.memberSince}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
                >
                  {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-surface-100 text-surface-700 px-4 py-3 rounded-xl font-bold hover:bg-surface-200 transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-red-200 rounded-3xl p-6 shadow-sm mt-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} className="text-red-600" />
                <h3 className="font-black text-surface-900">Danger Zone</h3>
              </div>
              <p className="text-sm text-surface-600 mb-4">Once you delete your account, there is no going back.</p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border-2 border-red-200 px-4 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            </motion.div>
          </div>

          {/* Right Column - Details & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl font-black text-surface-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                Your Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Bookings', value: stats.totalBookings, icon: Package, gradient: 'from-blue-500 to-indigo-500' },
                  { label: 'Active', value: stats.activeBookings, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
                  { label: 'Completed', value: stats.completedBookings, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
                  { label: 'Avg Rating', value: stats.averageRating || 'N/A', icon: Star, gradient: 'from-pink-500 to-rose-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="bg-white border border-surface-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all group"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <p className="text-2xl font-black text-surface-900 mb-1">{stat.value}</p>
                    <p className="text-xs font-bold text-surface-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Total Spent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 font-bold mb-2">Total Spent</p>
                  <h2 className="text-5xl font-black">₹{stats.totalSpent.toLocaleString()}</h2>
                  <p className="text-white/60 text-sm mt-2">Across {stats.completedBookings} completed services</p>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp size={40} className="text-white" />
                </div>
              </div>
            </motion.div>

            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-surface-200 rounded-3xl p-8 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-surface-900 flex items-center gap-2">
                  <Settings size={20} className="text-indigo-600" />
                  Account Information
                </h3>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-surface-400" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface-50 border-2 border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium">
                      {user?.name || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-surface-400" />
                    Email Address
                  </label>
                  <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium flex items-center justify-between">
                    <span>{user?.email || 'Not provided'}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold">Verified</span>
                  </div>
                  <p className="text-xs text-surface-500 mt-1 ml-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-surface-400" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-surface-50 border-2 border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium">
                      {user?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-surface-400" />
                    Location
                  </label>
                  <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium">
                    {localStorage.getItem('locationName') || 'Not set'}
                  </div>
                  <p className="text-xs text-surface-500 mt-1 ml-1">Update location from the header</p>
                </div>

                {/* Account Created */}
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-surface-400" />
                    Account Created
                  </label>
                  <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-surface-900 text-center mb-3">Delete Account?</h3>
              <p className="text-surface-600 text-center mb-8">
                This action cannot be undone. All your data, bookings, and history will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 bg-surface-100 text-surface-700 rounded-xl font-bold hover:bg-surface-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-500/20"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
