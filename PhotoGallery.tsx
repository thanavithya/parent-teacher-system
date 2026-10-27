import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Maximize2,
  Calendar,
  X,
  Filter,
  Camera
} from 'lucide-react';
import { User, GalleryPhoto } from '../../types';
import { StorageService } from '../../services/storage';

interface PhotoGalleryProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  currentUser,
  onShowToast
}) => {
  const photos = StorageService.getGalleryPhotos();

  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  // Add Photo Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GalleryPhoto['category']>('Sports');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');

  const filteredPhotos = categoryFilter === 'All'
    ? photos
    : photos.filter(p => p.category === categoryFilter);

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) {
      onShowToast('error', 'Validation Error', 'Title and valid image URL are required.');
      return;
    }

    StorageService.addGalleryPhoto({
      title: newTitle.trim(),
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
      imageUrl: newImageUrl.trim(),
      caption: newCaption.trim() || newTitle.trim()
    });

    setIsAddOpen(false);
    setNewTitle('');
    setNewImageUrl('');
    setNewCaption('');
    onShowToast('success', 'Photo Added', 'School memory added to gallery.');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-pink-600" />
            <span>School Life &amp; Events Gallery</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Photographic memories celebrating student achievements, athletic championships, and exhibitions
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Memory</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['All', 'Sports', 'Cultural', 'Science & Tech', 'Campus Life'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-16 text-center text-slate-400 border border-pink-100 dark:border-slate-800">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">No photographs available in this category</p>
          </div>
        ) : (
          filteredPhotos.map(photo => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-pink-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                    {photo.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{photo.title}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{photo.caption}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-2">
                  <Calendar className="w-3 h-3 text-pink-600" />
                  <span>{photo.date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-pink-100 dark:border-slate-800"
          >
            <div className="relative aspect-16/9 bg-black">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                  {activePhoto.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{activePhoto.date}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activePhoto.title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-600" />
                <span>Add School Event Photo</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event / Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Science Olympiad Winners"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Science & Tech">Science &amp; Tech</option>
                  <option value="Campus Life">Campus Life</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Caption / Description
                </label>
                <textarea
                  rows={3}
                  value={newCaption}
                  onChange={e => setNewCaption(e.target.value)}
                  placeholder="Short description of the event..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Upload Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
