import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { User, Announcement } from '../../types';
import { StorageService } from '../../services/storage';

interface EventsAnnouncementsProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const EventsAnnouncements: React.FC<EventsAnnouncementsProps> = ({
  currentUser,
  onShowToast,
  onRequestConfirm
}) => {
  const announcements = StorageService.getAnnouncements();

  const isParent = currentUser.role === 'parent';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  // Filter announcements based on user role and filters
  const filteredAnnouncements = announcements.filter(item => {
    // Role check: parents don't need "All Teachers" internal notices
    if (isParent && item.targetAudience === 'All Teachers') return false;

    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem({
      id: `ann-${Date.now()}`,
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      location: 'School Main Auditorium',
      targetAudience: 'All',
      category: 'Event',
      author: currentUser.name
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title.trim() || !editingItem.description.trim()) {
      onShowToast('error', 'Validation Error', 'Title and description are required.');
      return;
    }

    StorageService.saveAnnouncement(editingItem);
    setIsModalOpen(false);
    onShowToast('success', 'Announcement Saved', `"${editingItem.title}" has been published.`);
  };

  const handleDelete = (id: string, title: string) => {
    onRequestConfirm('Delete Notice', `Are you sure you want to delete "${title}"?`, () => {
      StorageService.deleteAnnouncement(id);
      onShowToast('info', 'Notice Deleted', 'The circular was removed.');
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-pink-600" />
            <span>School Circulars &amp; Calendar Events</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official school announcements, academic schedules, examinations, and community activities
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-pink-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Academic', 'Event', 'Sports', 'Holiday', 'Administration'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-16 text-center text-slate-400 border border-pink-100 dark:border-slate-800">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">No announcements found in this category</p>
          </div>
        ) : (
          filteredAnnouncements.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-pink-600" />
                    Audience: <strong>{item.targetAudience}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-pink-600" />
                    <span>{item.date} {item.time ? `· ${item.time}` : ''}</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>By: <strong>{item.author}</strong></span>
                {(isAdmin || isTeacher) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="text-pink-600 dark:text-pink-400 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-pink-600" />
                <span>{editingItem.title ? 'Edit Notice' : 'New School Notice'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Science Fair Registration Open"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Event">Event</option>
                    <option value="Sports">Sports</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={editingItem.targetAudience}
                    onChange={e => setEditingItem({ ...editingItem, targetAudience: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="All">All School (Parents &amp; Teachers)</option>
                    <option value="All Parents">All Parents</option>
                    <option value="All Teachers">All Teachers</option>
                    <option value="Grade 8-A">Grade 8-A Only</option>
                    <option value="Grade 8-B">Grade 8-B Only</option>
                    <option value="Grade 9-A">Grade 9-A Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingItem.date}
                    onChange={e => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time / Hours
                  </label>
                  <input
                    type="text"
                    value={editingItem.time || ''}
                    onChange={e => setEditingItem({ ...editingItem, time: e.target.value })}
                    placeholder="e.g. 9:00 AM - 3:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  value={editingItem.location || ''}
                  onChange={e => setEditingItem({ ...editingItem, location: e.target.value })}
                  placeholder="e.g. Main Auditorium / Track Ground"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Description &amp; Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Provide all details for students and guardians..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
