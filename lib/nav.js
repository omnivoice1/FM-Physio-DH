// Shared navigation config — every page appears in the side menu.
export const NAV = [
  { group: 'Admin' },
  { href: '/', label: 'Overview', icon: 'grid' },
  { href: '/tasks', label: 'Task board', icon: 'board' },
  { href: '/enquiries', label: 'Enquiries & leads', icon: 'inbox' },
  { href: '/cancellations', label: 'Cancellations & DNAs', icon: 'alert' },
  { href: '/payments', label: 'Payments', icon: 'card' },
  { group: 'Clinical' },
  { href: '/team', label: 'Team & packages', icon: 'users' },
  { href: '/progress', label: 'Patient progress', icon: 'pulse' },
  { group: 'AI' },
  { href: '/ai', label: 'AI system', icon: 'spark' },
  { href: '/assistants', label: 'Assistants', icon: 'bot' },
];

export const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
  board: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18" opacity=".5"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5z"/>',
  alert: '<path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 .01M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  pulse: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
  spark: '<path d="M12 3a4 4 0 0 1 4 4 4 4 0 0 1 0 8 4 4 0 0 1-8 0 4 4 0 0 1 0-8 4 4 0 0 1 4-4z"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 2v6M8 2v2M16 2v2M9 14h.01M15 14h.01"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  phone: '<path d="M22 16.9V21a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h4a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L9.9 11a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/>',
};

export const SECTION_SUBTITLE = {
  '/': 'Live snapshot from Supabase',
  '/tasks': 'Admin tasks, timed and tracked',
  '/enquiries': 'New enquiries and lead conversion',
  '/cancellations': 'Attendance and retention',
  '/payments': 'Payment reconciliation',
  '/team': 'Physio performance and packages',
  '/progress': 'Check-ins, pain scores and NPS',
  '/ai': 'Calls, chats and hand-overs',
  '/assistants': 'Voice assistant cost and outcomes',
};
