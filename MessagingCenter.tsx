import React, { useState } from 'react';
import {
  MessageSquare,
  Inbox,
  Send,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  User,
  ArrowRight,
  X,
  MailCheck,
  ShieldAlert
} from 'lucide-react';
import { User as UserType, Message } from '../../types';
import { StorageService } from '../../services/storage';

interface MessagingCenterProps {
  currentUser: UserType;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  currentUser,
  onShowToast,
  onRequestConfirm
}) => {
  const users = StorageService.getUsers();
  const students = StorageService.getStudents();
  const messages = StorageService.getMessages();

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Compose state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Filter messages for current user
  const userInbox = messages.filter(
    m => m.recipientEmail.toLowerCase() === currentUser.email.toLowerCase()
  );
  const userSent = messages.filter(
    m => m.senderEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const activeMessages = activeFolder === 'inbox' ? userInbox : userSent;

  const filteredMessages = activeMessages.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.subject.toLowerCase().includes(q) ||
      m.body.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q) ||
      m.recipientName.toLowerCase().includes(q)
    );
  });

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || filteredMessages[0];

  // Candidates for recipient dropdown
  const potentialRecipients = users.filter(
    u => u.email.toLowerCase() !== currentUser.email.toLowerCase()
  );

  const handleSelectMessage = (m: Message) => {
    setSelectedMessageId(m.id);
    if (!m.isRead && m.recipientEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      StorageService.markMessageAsRead(m.id);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject.trim() || !body.trim()) {
      onShowToast('error', 'Validation Error', 'Recipient, subject, and message body are required.');
      return;
    }

    const recipient = users.find(u => u.email.toLowerCase() === recipientEmail.toLowerCase());
    if (!recipient) {
      onShowToast('error', 'Recipient Not Found', 'Please select a valid registered recipient.');
      return;
    }

    const sent = StorageService.sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderEmail: currentUser.email,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      recipientEmail: recipient.email,
      subject: subject.trim(),
      body: body.trim(),
      studentId: currentUser.linkedStudentId
    });

    setIsComposeOpen(false);
    setSubject('');
    setBody('');
    setActiveFolder('sent');
    setSelectedMessageId(sent.id);
    onShowToast('success', 'Message Sent', `Dispatched to ${recipient.name} (${recipient.role}).`);
  };

  const handleDeleteMessage = (id: string) => {
    onRequestConfirm(
      'Delete Message',
      'Are you sure you want to delete this message thread from demo storage?',
      () => {
        StorageService.deleteMessage(id);
        onShowToast('info', 'Message Deleted', 'The message was removed.');
        if (selectedMessageId === id) setSelectedMessageId(null);
      }
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Compose */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-pink-600" />
            <span>Parent-Teacher Communication Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive messaging between parents, educators, and school leadership
          </p>
        </div>

        <button
          onClick={() => {
            setRecipientEmail(potentialRecipients[0]?.email || '');
            setIsComposeOpen(true);
          }}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Compose New Message</span>
        </button>
      </div>

      {/* Main Mail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Folders & Message List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          
          {/* Folder Tabs */}
          <div className="flex items-center gap-2 p-1 bg-pink-50/60 dark:bg-slate-800 rounded-2xl border border-pink-100/60 dark:border-slate-700">
            <button
              onClick={() => setActiveFolder('inbox')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeFolder === 'inbox'
                  ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Inbox ({userInbox.filter(m => !m.isRead).length} new)</span>
            </button>
            <button
              onClick={() => setActiveFolder('sent')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeFolder === 'sent'
                  ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Sent ({userSent.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Message List */}
          <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No {activeFolder} messages found.</p>
              </div>
            ) : (
              filteredMessages.map(m => {
                const isSelected = selectedMessage?.id === m.id;
                const otherParty = activeFolder === 'inbox' ? m.senderName : m.recipientName;
                const otherRole = activeFolder === 'inbox' ? m.senderRole : m.recipientRole;

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMessage(m)}
                    className={`pt-2.5 first:pt-0 p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 shadow-xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    } ${!m.isRead && activeFolder === 'inbox' ? 'font-bold' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {otherParty}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {otherRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 truncate mt-1">
                      {m.subject}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                      {m.body}
                    </p>

                    {!m.isRead && activeFolder === 'inbox' && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-2 h-2 rounded-full bg-pink-600" />
                        <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold">New message</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Viewer */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Message Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                    Subject
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedMessage.subject}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs flex items-center gap-1"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Sender & Recipient Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">From:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedMessage.senderName}</span>
                    <span className="text-[11px] text-pink-600 font-mono">({selectedMessage.senderEmail})</span>
                    <span className="px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-950 text-[10px] font-bold uppercase text-pink-700 dark:text-pink-300">
                      {selectedMessage.senderRole}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">To:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMessage.recipientName}</span>
                  <span className="text-slate-500 font-mono text-[11px]">({selectedMessage.recipientEmail})</span>
                </div>
              </div>

              {/* Message Body Content */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 shadow-xs">
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {selectedMessage.body}
                </p>
              </div>

              {/* Quick Reply Box */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quick Reply to {selectedMessage.senderEmail === currentUser.email ? selectedMessage.recipientName : selectedMessage.senderName}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const replyTo = selectedMessage.senderEmail === currentUser.email ? selectedMessage.recipientEmail : selectedMessage.senderEmail;
                      setRecipientEmail(replyTo);
                      setSubject(`Re: ${selectedMessage.subject}`);
                      setIsComposeOpen(true);
                    }}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Reply Editor</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center text-slate-400 border border-pink-100 dark:border-slate-800">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold">Select a conversation from the left to read</p>
            </div>
          )}
        </div>

      </div>

      {/* Compose Message Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-pink-600" />
                <span>New Message</span>
              </h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient *
                </label>
                <select
                  required
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                >
                  <option value="">Select recipient...</option>
                  {potentialRecipients.map(u => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.role.toUpperCase()} - {u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Question on Friday Homework"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body *
                </label>
                <textarea
                  required
                  rows={5}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-hidden resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
