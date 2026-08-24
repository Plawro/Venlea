import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import "@/App.css";
import { notificationService } from "./lib/NotificationService";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

// ============ ICONS ============
const Icons = {
  Search: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Home: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Notes: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Calendar: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Inbox: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
    </svg>
  ),
  Journal: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  Dream: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 009 5.2A9 9 0 1111 2.2a6 6 0 001 .8z"/>
    </svg>
  ),
  Wins: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
    </svg>
  ),
  Habits: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  ),
  Plus: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Check: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Folder: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  ),
  User: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// ============ DATE HELPERS ============
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const getDateLabel = (dateStr) => {
  if (!dateStr) return 'No date';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  
  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
};

const isUpcoming = (dateStr, days = 7) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = new Date(today);
  future.setDate(future.getDate() + days);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date > today && date <= future;
};

const getTodayStr = () => formatDate(new Date());
const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDate(d);
};

// ============ TAG HELPERS ============
const parseTags = (text) => {
  const tagRegex = /#(\w+)/g;
  const tags = [];
  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  return [...new Set(tags)];
};

// Render text with styled tags
const renderTextWithTags = (text) => {
  if (!text) return null;
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return <span key={i} className="inline-tag">{part}</span>;
    }
    return part;
  });
};

// ============ STORAGE ============
const STORAGE_KEY = 'venlea_storage';

// ============ INITIAL DATA ============
const initialEvents = [
  { id: 1, name: 'Dentist appointment', time: '9:00', duration: 45, color: '#7ab896', date: getTodayStr(), tags: ['health'] },
  { id: 2, name: 'Coffee with Sarah #crush', time: '11:30', duration: 60, color: '#ff9a4a', date: getTodayStr(), tags: ['crush'] },
  { id: 3, name: 'Team meeting #work', time: '14:00', duration: 120, color: '#5b9fd4', date: getTodayStr(), tags: ['work'] },
  { id: 4, name: 'Gym session', time: '18:00', duration: 60, color: '#7ab896', date: getTomorrowStr(), tags: ['health'] },
];

const initialTodos = [
  { id: 1, title: 'Team standup #work', date: getTodayStr(), done: false, important: true, tags: ['work'] },
  { id: 2, title: 'Review PRs #work', date: getTodayStr(), done: false, important: true, tags: ['work'] },
  { id: 3, title: 'Deep work session', date: getTodayStr(), done: false, important: false, tags: [] },
  { id: 4, title: 'Call mom', date: getTomorrowStr(), done: false, important: false, tags: ['family'] },
  { id: 5, title: 'Buy groceries', date: null, done: false, important: false, tags: [] },
  { id: 6, title: 'Research vacation spots #travel', date: null, done: false, important: false, tags: ['travel'] },
];

const initialProjects = [
  { 
    id: 1, name: 'Work Projects', icon: '💼', color: '#5b9fd4',
    folders: [
      { id: 11, name: 'Q1 Planning', items: [
        { id: 111, type: 'note', title: 'Q1 Goals', content: 'Focus on user retention...', tags: ['work'] },
      ]},
      { id: 12, name: 'Design System', items: [] },
    ]
  },
  { id: 2, name: 'Personal', icon: '🏠', color: '#7ab896', folders: [] },
  { id: 3, name: 'Learning', icon: '📚', color: '#ff9a4a', folders: [] },
  { id: 4, name: 'Health', icon: '❤️', color: '#c97a8a', folders: [] },
];

const initialNotes = [
  { id: 1, title: 'Q1 Planning', content: 'Focus on core features and user feedback.', tags: ['work'], images: [] },
  { id: 2, title: 'Design System', content: 'Update button components with new states', tags: ['work'], images: [] },
  { id: 3, title: 'Weekend Plans', content: 'Visit the new art museum downtown', tags: ['freetime'], images: [] },
  { id: 4, title: 'Book Notes', content: 'Atomic Habits - small changes compound', tags: ['myself'], images: [] },
];

const initialHabits = [
  { id: 1, name: 'Morning pages', icon: '✍️', streak: 14, days: [1, 1, 1, 1, 1, 1, 0], done: false },
  { id: 2, name: 'Exercise', icon: '🏃', streak: 8, days: [1, 1, 0, 1, 1, 1, 0], done: false },
  { id: 3, name: 'Meditation', icon: '🧘', streak: 5, days: [0, 1, 1, 1, 1, 1, 0], done: false },
  { id: 4, name: 'Read', icon: '📖', streak: 21, days: [1, 1, 1, 1, 1, 1, 0], done: false },
  { id: 5, name: 'Journal', icon: '📓', streak: 5, days: [1, 1, 0, 1, 1, 1, 0], done: false },
];

const initialCountdowns = [
  { id: 1, name: 'Product launch', date: '2026-06-28', days: 15, pct: 44 },
  { id: 2, name: 'Spring break', date: '2026-09-15', days: 36, pct: 65 },
];

const initialJournalEntries = [
  { id: 1, date: 'FEB 13', text: 'Had a really productive day. Finished the main features. #productive', mood: '😊', tags: ['productive'] },
];

const initialDreams = [
  { id: 1, date: 'FEB 13', text: 'Floating in space, surrounded by colorful nebulas.', mood: 2, quality: 'Vivid', tags: [] },
];

const initialWins = [
  { id: 1, text: 'Shipped new onboarding flow ahead of schedule #work', date: 'Today', size: 'big', tags: ['work'] },
  { id: 2, text: 'Helped teammate debug a tricky issue', date: 'Today', size: 'med', tags: [] },
];

// ============ UTILITY ============
const getDateStr = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
};

const getGreeting = () => {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good Morning';
  if (hr < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Demo Data Injection
const demoTodos = [
  { id: 101, title: 'Finalize Q3 Marketing Strategy', category: 'work', done: false, important: true, date: getTodayStr() },
  { id: 102, title: 'Call Mom', category: 'personal', done: false, important: true, date: getTodayStr() },
  { id: 103, title: 'Buy groceries (Milk, Eggs, Bread)', category: 'personal', done: true, important: false, date: getTodayStr() },
  { id: 104, title: 'Review PRs for Venlea redesign', category: 'work', done: false, important: false, date: null },
];
const demoEvents = [
  { id: 201, name: 'Team Sync', date: getTodayStr(), time: '10:00 AM', duration: 45, color: '#4aa3e8' },
  { id: 202, name: 'Lunch with Sarah', date: getTodayStr(), time: '1:00 PM', duration: 60, color: '#f2a24c' },
];
const demoProjects = [
  { id: 301, name: 'Web Dev', icon: '🌐', color: '#5b9fd4', folders: [] },
  { id: 302, name: 'Personal', icon: '🏃', color: '#ff6b1a', folders: [] },
];




// ============ DRAGGABLE SHEET ============
const DraggableSheet = ({ isOpen, onClose, className, children }) => {
  const [dragY, setDragY] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const startY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { setIsFull(false); setDragY(0); }, 300);
    }
  }, [isOpen]);

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };
  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    const y = e.touches[0].clientY;
    const dy = y - startY.current;
    
    if (isFull && dy < 0) return;
    setDragY(dy);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    if (!isFull) {
      if (dragY > 80) onClose();
      else if (dragY < -80) setIsFull(true);
    } else {
      if (dragY > 80) setIsFull(false);
    }
    setDragY(0);
  };

  let ty = dragY;
  if (isFull && dragY < 0) ty = 0;
  if (!isFull && dragY < 0 && ty < -100) ty = -100;

  const style = {
    transform: ty ? `translateY(${ty}px)` : 'translateY(0)',
    transition: isDragging.current ? 'none' : 'transform 0.3s ease, max-height 0.3s ease',
    maxHeight: isFull ? '95vh' : '85vh',
  };

  return (
    <>
      {isOpen && <div className="sheet-overlay" onClick={onClose} />}
      <div className={`${className} ${isOpen ? 'open' : ''}`} style={style}>
        <div className="sheet-handle" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} />
        {children}
      </div>
    </>
  );
};


const moodColors = {
  '😊': '#7ab896', 'Lucid': '#7ab896', 'Clear': '#7ab896', // Happy/Good
  '😐': '#e8b051', // Neutral
  '😢': '#5b9fd4', // Sad
  '😰': '#e07a5f', '😱': '#e07a5f', 'Nightmare': '#e07a5f', // Anxious
  '😠': '#c97a8a', '🤯': '#c97a8a', // Angry
  'Vivid': '#5b9fd4', 'Hazy': '#e8b051' // Dream specific
};

// ============ COMPONENTS ============
// ============ TAG AUTOCOMPLETE COMPONENT ============
const TagSuggestInput = ({ value, onChange, placeholder, className, isTextarea, rows, autoFocus, allTags }) => {
  const [showSuggest, setShowSuggest] = useState(false);
  const [filter, setFilter] = useState('');
  
  const handleInput = (e) => {
    const val = e.target.value;
    onChange(e); // Trigger original handler
    
    // Naive end-of-string hashtag matching for autocomplete
    const lastWordMatch = val.match(/(#[a-zA-Z0-9_]+)$/);
    if (lastWordMatch) {
       setShowSuggest(true);
       setFilter(lastWordMatch[1].replace('#', '').toLowerCase());
    } else if (val.endsWith('#')) {
       setShowSuggest(true);
       setFilter('');
    } else {
       setShowSuggest(false);
    }
  };

  const insertTag = (tag) => {
    const newVal = value.replace(/(#[a-zA-Z0-9_]*)$/, `#${tag} `);
    onChange({ target: { value: newVal }});
    setShowSuggest(false);
  };

  const suggestions = (allTags || []).filter(t => t?.includes && t.includes(filter)).slice(0, 5);

  return (
    <div className="tag-suggest-wrap" style={{ position: 'relative', width: '100%' }}>
      {isTextarea ? (
        <textarea className={className} placeholder={placeholder} value={value} onChange={handleInput} rows={rows} autoFocus={autoFocus} />
      ) : (
        <input type="text" className={className} placeholder={placeholder} value={value} onChange={handleInput} autoFocus={autoFocus} />
      )}
      {showSuggest && suggestions.length > 0 && (
        <div className="tag-suggest-popover">
          {suggestions.map(t => (
            <div key={t} className="tag-suggest-item" onClick={() => insertTag(t)}>#{t}</div>
          ))}
        </div>
      )}
    </div>
  );
};


// Sun Effect
const SunEffect = () => (
  <div className="sun-wrap">
    <div className="sun-glow2" />
    <div className="sun-glow1" />
    <div className="sun-core" />
  </div>
);

// Top Bar - global header with profile and edit toggle
const TopBar = ({ mode, onModeSwitch, onOpenProfile, onOpenSearch, onOpenStats, userProfile }) => (
  <div className="topbar" onClick={onModeSwitch} data-testid="topbar-mode-switch">
    <div className="topbar-row">
      <button
        className="topbar-edit"
        onClick={(e) => {
          e.stopPropagation();
          if (onOpenSearch) onOpenSearch();
        }}
        type="button"
      >
        <Icons.Search size={16} />
      </button>
      <div className="topbar-center">
        <div className="topbar-center-row">
          <div className="topbar-title">Venlea</div>
          <div className={`mode-badge ${mode}`}>
            <span className="mode-badge-text">{mode === 'work' ? 'Work' : 'Myself'}</span>
          </div>
        </div>
      </div>
      <div className="topbar-profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenStats) onOpenStats();
          }}
          type="button"
          style={{ fontSize: 18 }}
        >
          📊
        </button>
        <div 
          className="profile-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenProfile) onOpenProfile();
          }}
        >
          {userProfile?.avatar || (userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '🌿')}
        </div>
      </div>
    </div>
    <div className="topbar-date">{getDateStr()}</div>
  </div>
);

// Bottom Nav with Center ZEN Button + FAB Menu
const BottomNav = ({ activeTab, onTabChange, mode, fabOpen, onFabToggle, onFabSelect }) => {
  const workTabs = [
    { key: 'home', icon: Icons.Home, label: 'HOME' },
    { key: 'calendar', icon: Icons.Calendar, label: 'CAL' },
    { key: 'notes', icon: Icons.Notes, label: 'NOTES' },
    { key: 'inbox', icon: Icons.Inbox, label: 'INBOX' },
  ];

  const myselfTabs = [
    { key: 'journal', icon: Icons.Journal, label: 'JOURNAL' },
    { key: 'dreams', icon: Icons.Dream, label: 'DREAMS' },
    { key: 'wins', icon: Icons.Wins, label: 'WINS' },
    { key: 'habits', icon: Icons.Habits, label: 'HABITS' },
  ];

  const workOptions = [
    { type: 'todo', icon: '✓', label: 'Todo', bg: 'rgba(122,184,150,.2)' },
    { type: 'event', icon: '📅', label: 'Event', bg: 'rgba(91,159,212,.2)' },
    { type: 'note', icon: '📝', label: 'Note', bg: 'rgba(255,154,74,.2)' },
    { type: 'project', icon: '📁', label: 'Project', bg: 'rgba(91,159,212,.18)' },
  ];

  const myselfOptions = [
    { type: 'journal', icon: '✏️', label: 'Journal', bg: 'rgba(255,154,74,.2)' },
    { type: 'dream', icon: '🌙', label: 'Dream', bg: 'rgba(157,123,199,.2)' },
    { type: 'win', icon: '⭐', label: 'Win', bg: 'rgba(255,203,138,.2)' },
    { type: 'habit', icon: '🔥', label: 'Habit', bg: 'rgba(122,184,150,.18)' },
    { type: 'countdown', icon: '⏳', label: 'Countdown', bg: 'rgba(255,203,138,.18)' },
  ];

  const tabs = mode === 'work' ? workTabs : myselfTabs;
  const fabOptions = mode === 'work' ? workOptions : myselfOptions;
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2, 4);

  return (
    <>
      {/* FAB Menu Overlay */}
      {fabOpen && <div className="fab-overlay" onClick={onFabToggle} />}
      
      {/* FAB Floating Options */}
      <div className={`fab-menu ${fabOpen ? 'open' : ''}`}>
        {fabOptions.map((opt, i) => (
          <div
            key={opt.type}
            className="fab-opt"
            style={{ '--delay': `${i * 0.05}s`, '--bg': opt.bg }}
            onClick={() => onFabSelect(opt.type)}
            data-testid={`fab-opt-${opt.type}`}
          >
            <div className="fab-opt-icon">{opt.icon}</div>
            <div className="fab-opt-label">{opt.label}</div>
          </div>
        ))}
      </div>

      <nav className="bnav" data-testid="bottom-nav">
        {leftTabs.map(tab => (
          <div
            key={tab.key}
            className={`nav-item ${activeTab === tab.key ? 'act' : ''}`}
            onClick={() => onTabChange(tab.key)}
            data-testid={`nav-${tab.key}`}
          >
            <tab.icon size={15} />
            <span className="nav-label">{tab.label}</span>
          </div>
        ))}
        
        <div
          className={`zen-btn ${mode} ${fabOpen ? 'open' : ''}`}
          onClick={onFabToggle}
          data-testid="zen-button"
        >
          <Icons.Plus size={18} />
        </div>

        {rightTabs.map(tab => (
          <div
            key={tab.key}
            className={`nav-item ${activeTab === tab.key ? 'act' : ''}`}
            onClick={() => onTabChange(tab.key)}
            data-testid={`nav-${tab.key}`}
          >
            <tab.icon size={15} />
            <span className="nav-label">{tab.label}</span>
          </div>
        ))}
      </nav>
    </>
  );
};

// Add Form Sheet (shows after selecting from FAB)
const AddFormSheet = ({ isOpen, onClose, itemType, onAdd, allTags = [] }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [important, setImportant] = useState(false);
  const [mood, setMood] = useState(null);
  const [winSize, setWinSize] = useState('med');
  const [dreamQuality, setDreamQuality] = useState('Clear');
  const [habitName, setHabitName] = useState('');
  const [countdownDate, setCountdownDate] = useState('');

  const moods = ['😊', '😐', '😢', '😠', '😰'];
  const dreamMoods = ['😴', '😐', '😊', '😱', '🤯'];
  const qualities = ['Lucid', 'Clear', 'Vivid', 'Hazy', 'Nightmare'];

  const getActualDate = () => {
    if (date === 'today') return getTodayStr();
    if (date === 'tomorrow') return getTomorrowStr();
    if (date === 'custom') return customDate;
    return null;
  };

  const getTitle = () => {
    switch (itemType) {
      case 'todo': return 'New Todo';
      case 'event': return 'New Event';
      case 'note': return 'New Note';
      case 'journal': return 'Journal Entry';
      case 'dream': return 'Dream Log';
      case 'win': return 'Log Win';
      case 'project': return 'New Project';
      case 'habit': return 'New Habit';
      case 'countdown': return 'New Countdown';
      default: return 'Add';
    }
  };

  const handleSave = () => {
    const tags = parseTags(title + ' ' + content);
    const actualDate = getActualDate();

    switch (itemType) {
      case 'todo':
        onAdd('todo', { title, date: actualDate, important, tags, done: false });
        break;
      case 'event':
        onAdd('event', { name: title, date: actualDate, time, duration, color: '#5b9fd4', tags });
        break;
      case 'note':
        onAdd('note', { title, content, tags, images: [] });
        break;
      case 'journal':
        onAdd('journal', { title, text: content, mood: mood !== null ? moods[mood] : '', tags });
        break;
      case 'dream':
        onAdd('dream', { title, text: content, mood: mood ?? 0, quality: dreamQuality, tags });
        break;
      case 'win':
        onAdd('win', { text: title, size: winSize, tags });
        break;
      case 'project':
        onAdd('project', { name: title || 'New Project' });
        break;
      case 'habit':
        if (!habitName.trim()) return;
        onAdd('habit', { name: habitName.trim(), icon: '🔥', streak: 0, days: [0, 0, 0, 0, 0, 0, 0], done: false });
        break;
      case 'countdown':
        if (!title.trim() || !countdownDate) return;
        {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const target = new Date(countdownDate);
          target.setHours(0, 0, 0, 0);
          const diffMs = target.getTime() - today.getTime();
          const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
          onAdd('countdown', { name: title.trim(), date: countdownDate, days: diffDays, pct: 0 });
        }
        break;
    }

    // Reset
    setTitle('');
    setContent('');
    setDate('today');
    setCustomDate('');
    setTime('09:00');
    setImportant(false);
    setMood(null);
    setWinSize('med');
    setHabitName('');
    setCountdownDate('');
    onClose();
  };

  if (!isOpen || !itemType) return null;

  return (
      <DraggableSheet isOpen={isOpen} onClose={onClose} className="add-sheet">
        <div className="sheet-content">
          <div className="sheet-title">{getTitle()}</div>

          {/* Todo Form */}
          {itemType === 'todo' && (
            <>
              <TagSuggestInput
    className="sheet-input"
    placeholder="What needs to be done? Use #tags"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    autoFocus
    allTags={allTags}
  />
              <div className="form-section">
                <div className="form-label">When?</div>
                <div className="option-row">
                  {['today', 'tomorrow', 'custom', 'none'].map(d => (
                    <div key={d} className={`option-btn ${date === d ? 'sel' : ''}`} onClick={() => setDate(d)}>
                      {d === 'none' ? 'No date' : d.charAt(0).toUpperCase() + d.slice(1)}
                    </div>
                  ))}
                </div>
                {date === 'custom' && (
                  <input type="date" className="sheet-input date-input" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
                )}
              </div>
              <div className="checkbox-row" onClick={() => setImportant(!important)}>
                <div className={`checkbox ${important ? 'on' : ''}`}><Icons.Check size={10} /></div>
                <span>Mark as important</span>
              </div>
            </>
          )}

          {/* Event Form */}
          {itemType === 'event' && (
            <>
              <TagSuggestInput className="sheet-input" placeholder="Event name... Use #tags" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus allTags={allTags} />
              <div className="form-section">
                <div className="form-label">Date</div>
                <div className="option-row">
                  {['today', 'tomorrow', 'custom'].map(d => (
                    <div key={d} className={`option-btn ${date === d ? 'sel' : ''}`} onClick={() => setDate(d)}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </div>
                  ))}
                </div>
                {date === 'custom' && <input type="date" className="sheet-input date-input" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />}
              </div>
              <div className="form-section">
                <div className="form-label">Time</div>
                <input type="time" className="sheet-input time-input" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="form-section">
                <div className="form-label">Duration</div>
                <div className="option-row">
                  {[15, 30, 45, 60, 90, 120].map(d => (
                    <div key={d} className={`option-btn sm ${duration === d ? 'sel' : ''}`} onClick={() => setDuration(d)}>{d}m</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Note Form */}
          {itemType === 'note' && (
            <>
              <TagSuggestInput className="sheet-input" placeholder="Note title..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus allTags={allTags} />
              <div className="form-section">
                <div className="form-label">Category</div>
                <div className="option-row">
                  {['work', 'myself', 'freetime'].map(t => (
                    <div key={t} className={`option-btn ${content.includes('#' + t) ? 'sel' : ''}`} onClick={() => setContent(prev => prev.includes('#' + t) ? prev.replace('#' + t, '').trim() : prev + ' #' + t)}>{t}</div>
                  ))}
                </div>
              </div>
              <TagSuggestInput isTextarea className="sheet-textarea" placeholder="Write your note... Use #tags" value={content} onChange={(e) => setContent(e.target.value)} rows={4} allTags={allTags} />
            </>
          )}

          {/* Journal Form */}
          {itemType === 'journal' && (
            <>
              <div className="form-section">
                <div className="form-label">How are you feeling?</div>
                <div className="mood-row">
                  {moods.map((m, i) => (
                    <div key={i} className={`mood-btn ${mood === i ? 'sel' : ''}`} onClick={() => setMood(i)}>{m}</div>
                  ))}
                </div>
              </div>
              <TagSuggestInput className="sheet-input" placeholder="Title (optional)..." value={title} onChange={(e) => setTitle(e.target.value)} allTags={allTags} />
              <TagSuggestInput isTextarea className="sheet-textarea" placeholder="What's on your mind? Use #tags" value={content} onChange={(e) => setContent(e.target.value)} rows={5} autoFocus allTags={allTags} />
            </>
          )}

          {/* Dream Form */}
          {itemType === 'dream' && (
            <>
              <div className="form-section">
                <div className="form-label">Dream feeling</div>
                <div className="mood-row">
                  {dreamMoods.map((m, i) => (
                    <div key={i} className={`mood-btn ${mood === i ? 'sel' : ''}`} onClick={() => setMood(i)}>{m}</div>
                  ))}
                </div>
              </div>
              <div className="form-section">
                <div className="form-label">Quality</div>
                <div className="option-row">
                  {qualities.map(q => (
                    <div key={q} className={`option-btn sm ${dreamQuality === q ? 'sel' : ''}`} onClick={() => setDreamQuality(q)}>{q}</div>
                  ))}
                </div>
              </div>
              <TagSuggestInput className="sheet-input" placeholder="Title (optional)..." value={title} onChange={(e) => setTitle(e.target.value)} allTags={allTags} />
              <TagSuggestInput isTextarea className="sheet-textarea" placeholder="Describe your dream... Use #tags like #crush" value={content} onChange={(e) => setContent(e.target.value)} rows={4} autoFocus allTags={allTags} />
            </>
          )}

          {/* Win Form */}
          {itemType === 'win' && (
            <>
              <TagSuggestInput className="sheet-input" placeholder="What did you accomplish? Use #tags" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus allTags={allTags} />
              <div className="form-section">
                <div className="form-label">Win size</div>
                <div className="option-row">
                  {[{ k: 'small', l: 'Small ✨' }, { k: 'med', l: 'Medium ⭐' }, { k: 'big', l: 'Big 🏆' }].map(s => (
                    <div key={s.k} className={`option-btn ${winSize === s.k ? 'sel' : ''}`} onClick={() => setWinSize(s.k)}>{s.l}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Project Form */}
          {itemType === 'project' && (
            <>
              <input
                type="text"
                className="sheet-input"
                placeholder="Project name..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </>
          )}

          {/* Habit Form */}
          {itemType === 'habit' && (
            <>
              <input
                type="text"
                className="sheet-input"
                placeholder="Habit name..."
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                autoFocus
              />
            </>
          )}

          {/* Countdown Form */}
          {itemType === 'countdown' && (
            <>
              <input
                type="text"
                className="sheet-input"
                placeholder="Countdown name..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <div className="form-section">
                <div className="form-label">Target date</div>
                <input
                  type="date"
                  className="sheet-input date-input"
                  value={countdownDate}
                  onChange={(e) => setCountdownDate(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            className="save-btn"
            onClick={handleSave}
            disabled={
              (itemType === 'habit' && !habitName.trim()) ||
              (itemType === 'countdown' && (!title.trim() || !countdownDate)) ||
              (!itemType || (!title && !content && itemType !== 'habit' && itemType !== 'countdown'))
            }
          >
            Save
          </button>
        </div>
      </DraggableSheet>
  );
};

// Project Sheet
const ProjectSheet = ({ isOpen, onClose, project, onUpdate }) => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editMode, setEditMode] = useState(false);

  if (!isOpen || !project) return null;

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = { id: Date.now(), name: newFolderName, items: [] };
    onUpdate({ ...project, folders: [...project.folders, newFolder] });
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleAddItemToFolder = (folder, item) => {
    const updatedFolder = { ...folder, items: [...(folder.items || []), item] };
    const updatedProject = {
      ...project,
      folders: project.folders.map(f => (f.id === folder.id ? updatedFolder : f)),
    };
    onUpdate(updatedProject);
    setSelectedFolder(updatedFolder);
  };

  const handleAddTodo = () => {
    if (!selectedFolder) return;
    const text = window.prompt('Todo text');
    if (!text) return;
    const newItem = { id: Date.now(), type: 'todo', title: text.trim(), done: false };
    handleAddItemToFolder(selectedFolder, newItem);
  };

  const handleAddLabel = () => {
    if (!selectedFolder) return;
    const text = window.prompt('Label text');
    if (!text) return;
    const newItem = { id: Date.now(), type: 'label', title: text.trim(), content: text.trim() };
    handleAddItemToFolder(selectedFolder, newItem);
  };

  const handleToggleTodo = (itemId) => {
    if (!selectedFolder) return;
    const updatedFolder = {
      ...selectedFolder,
      items: (selectedFolder.items || []).map(item =>
        item.id === itemId && item.type === 'todo'
          ? { ...item, done: !item.done }
          : item
      ),
    };
    const updatedProject = {
      ...project,
      folders: project.folders.map(f => (f.id === updatedFolder.id ? updatedFolder : f)),
    };
    onUpdate(updatedProject);
    setSelectedFolder(updatedFolder);
  };

  const handleEditItem = (item) => {
    if (!selectedFolder) return;
    let newTitle = item.title || '';
    let newContent = item.content || '';

    if (item.type === 'todo') {
      const text = window.prompt('Edit todo text', item.title || '');
      if (!text) return;
      newTitle = text.trim();
    } else if (item.type === 'label') {
      const text = window.prompt('Edit label text', item.content || item.title || '');
      if (!text) return;
      newTitle = text.trim();
      newContent = text.trim();
    }

    const updatedFolder = {
      ...selectedFolder,
      items: (selectedFolder.items || []).map(it =>
        it.id === item.id
          ? { ...it, title: newTitle, content: newContent || it.content }
          : it
      ),
    };
    const updatedProject = {
      ...project,
      folders: project.folders.map(f => (f.id === updatedFolder.id ? updatedFolder : f)),
    };
    onUpdate(updatedProject);
    setSelectedFolder(updatedFolder);
  };

  const handleDeleteItem = (itemId) => {
    if (!selectedFolder) return;
    const confirmed = window.confirm('Delete this item?');
    if (!confirmed) return;
    const updatedFolder = {
      ...selectedFolder,
      items: (selectedFolder.items || []).filter(item => item.id !== itemId),
    };
    const updatedProject = {
      ...project,
      folders: project.folders.map(f => (f.id === updatedFolder.id ? updatedFolder : f)),
    };
    onUpdate(updatedProject);
    setSelectedFolder(updatedFolder);
  };

  const handleRenameFolder = (folder) => {
    const text = window.prompt('Folder name', folder.name || '');
    if (!text) return;
    const updatedFolder = { ...folder, name: text.trim() };
    const updatedProject = {
      ...project,
      folders: project.folders.map(f => (f.id === folder.id ? updatedFolder : f)),
    };
    onUpdate(updatedProject);
    if (selectedFolder && selectedFolder.id === folder.id) {
      setSelectedFolder(updatedFolder);
    }
  };

  const handleDeleteFolder = (folderId) => {
    const confirmed = window.confirm('Delete this folder and its items?');
    if (!confirmed) return;
    const updatedProject = {
      ...project,
      folders: project.folders.filter(f => f.id !== folderId),
    };
    onUpdate(updatedProject);
    if (selectedFolder && selectedFolder.id === folderId) {
      setSelectedFolder(null);
    }
  };

  return (
      <DraggableSheet isOpen={isOpen} onClose={() => { setSelectedFolder(null); onClose(); }} className="project-sheet">

        {!selectedFolder ? (
          <div className="sheet-content">
            <div className="project-header">
              <div className="project-icon" style={{ background: `${project.color}22` }}>{project.icon}</div>
              <div className="project-title">{project.name}</div>
            </div>

            <div className="folder-list">
              {project.folders.map(folder => (
                <div key={folder.id} className="folder-item">
                  <div className="folder-main" onClick={() => setSelectedFolder(folder)}>
                    <Icons.Folder size={16} />
                    <span className="folder-name">{folder.name}</span>
                    <span className="folder-count">{folder.items.length}</span>
                  </div>
                  <div className="folder-actions-inline">
                    <button className="icon-btn" onClick={() => handleRenameFolder(folder)}>✏️</button>
                    <button className="icon-btn" onClick={() => handleDeleteFolder(folder.id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {showNewFolder ? (
              <div className="new-folder-row">
                <input type="text" className="sheet-input" placeholder="Folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()} autoFocus />
                <button className="small-btn" onClick={handleAddFolder}>Add</button>
              </div>
            ) : (
              <div className="add-folder-btn" onClick={() => setShowNewFolder(true)}>+ New Folder</div>
            )}
          </div>
        ) : (
          <div className="sheet-content">
            <div className="sheet-header-row">
              <div className="sheet-back" onClick={() => setSelectedFolder(null)}>← {project.name}</div>
              <button className="save-btn-small" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Done' : 'Edit'}
              </button>
            </div>
            <div className="sheet-title">{selectedFolder.name}</div>

            <div className="folder-items">
              {selectedFolder.items.map(item => (
                <div key={item.id} className="folder-item-card">
                  <div className="item-header">
                    <div className="item-main">
                      <div className="item-type">{item.type}</div>
                      {item.type === 'todo' ? (
                        <div className="item-todo-row">
                          <div
                            className={`chk ${item.done ? 'on' : ''}`}
                            onClick={() => handleToggleTodo(item.id)}
                          >
                            <Icons.Check size={10} />
                          </div>
                          <div className="item-title">{item.title}</div>
                        </div>
                      ) : (
                        <div className="item-title">{item.title}</div>
                      )}
                      {item.content && item.type === 'label' && (
                        <div className="item-preview">{item.content}</div>
                      )}
                    </div>
                    {editMode && (
                      <div className="item-actions">
                        <button className="icon-btn" onClick={() => handleEditItem(item)}>✏️</button>
                        <button className="icon-btn" onClick={() => handleDeleteItem(item.id)}>🗑</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {selectedFolder.items.length === 0 && <div className="empty-state">No items yet</div>}
            </div>
            <div className="folder-footer-actions">
              <button className="small-btn" onClick={handleAddFolder}>+ Folder</button>
              <button className="small-btn" onClick={handleAddTodo}>+ Todo</button>
              <button className="small-btn" onClick={handleAddLabel}>+ Label</button>
            </div>
          </div>
        )}
      </DraggableSheet>
  );
};

// Note Sheet
const NoteSheet = ({ isOpen, onClose, note, onSave, allTags = [] }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedTags, setSelectedTags] = useState(note?.tags || []);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedTags(note.tags || []);
    }
  }, [note]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSave = () => {
    const contentTags = parseTags(content);
    const allTags = [...new Set([...selectedTags, ...contentTags])];
    onSave({ ...note, title, content, tags: allTags });
    onClose();
  };

  return (
      <DraggableSheet isOpen={isOpen} onClose={onClose} className="note-sheet">
        <div className="sheet-content">
          <div className="sheet-header-row">
            <div className="sheet-back" onClick={onClose}>← Back</div>
            <button className="save-btn-small" onClick={handleSave}>Save</button>
          </div>

          <TagSuggestInput className="note-title-input" placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} allTags={allTags} />

          <div className="tag-row">
            {['work', 'myself', 'freetime'].map(tag => (
              <div key={tag} className={`tag-chip ${selectedTags.includes(tag) ? 'sel' : ''}`} onClick={() => toggleTag(tag)}>#{tag}</div>
            ))}
          </div>

          <TagSuggestInput isTextarea className="note-textarea" placeholder="Write your note... Use #tags anywhere" value={content} onChange={(e) => setContent(e.target.value)} rows={10} allTags={allTags} />
        </div >
      </DraggableSheet>
  );
};

// ============ SCREENS ============

// Home Screen
const HomeScreen = ({ events, todos, onToggleTodo, editMode, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent, onOpenToday, onOpenEdit }) => {
  const todayEvents = events.filter(e => isToday(e.date));
  const todayTodos = todos.filter(t => isToday(t.date));
  const upcomingEvents = events.filter(e => isUpcoming(e.date) && !isToday(e.date));
  const doneCount = todayTodos.filter(t => t.done).length;

  return (
    <div className="content" data-testid="home-screen">
      <div className="header">
        <div className="greet" dangerouslySetInnerHTML={{ __html: `${getGreeting()},<br><em>Marcus</em>` }} />
        <button
          type="button"
          className="topbar-edit"
          onClick={onOpenToday}
          style={{ fontSize: 10 }}
        >
          Today
        </button>
      </div>

      <div className="weather-row">
        <div className="weather-card">
          <div className="weather-ico">⛅</div>
          <div className="weather-temp">17°</div>
          <div className="weather-desc">Partly cloudy</div>
        </div>
        <div className="energy-card">
          <div className="energy-icon">⚡</div>
          <div className="energy-val">{doneCount}/{todayTodos.length}</div>
          <div className="energy-label">Tasks</div>
        </div>
      </div>

      {todayEvents.length > 0 && (
        <>
          <div className="stitle">Today's Events</div>
          <div className="event-list">
            {todayEvents.map((evt, i) => (
              <div key={evt.id} className="event-card aup" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="event-bar" style={{ background: evt.color }} />
                <div className="event-info" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('event', typeof evt !== 'undefined' ? evt : undefined)} style={{cursor:'pointer'}}>
                  <div className="event-name">{renderTextWithTags(evt.name)}</div>
                  <div className="event-time">{evt.time} · {evt.duration}min</div>
                </div>
                {editMode && (
                  <div className="item-actions">
                    <button className="icon-btn" onClick={() => onEditEvent && onEditEvent(evt.id)}>✏️</button>
                    <button className="icon-btn" onClick={() => onDeleteEvent && onDeleteEvent(evt.id)}>🗑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {todayTodos.length > 0 && (
        <>
          <div className="stitle">Today's Tasks</div>
          <div className="tlist">
            {todayTodos.map((task, i) => (
              <div key={task.id} className={`tcard aup ${task.done ? 'done' : ''}`} style={{ animationDelay: `${i * 0.03}s` }}>
                <div className={`chk ${task.done ? 'on' : ''}`} onClick={() => onToggleTodo(task.id)}><Icons.Check size={10} /></div>
                <div className="tc" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('todo', typeof task !== 'undefined' ? task : undefined)} style={{cursor:'pointer'}}><div className="ttitle">{renderTextWithTags(task.title)}</div></div>
                {task.important && <div className="imp-badge">!</div>}
                {editMode && (
                  <div className="item-actions">
                    <button className="icon-btn" onClick={() => onEditTodo && onEditTodo(task.id)}>✏️</button>
                    <button className="icon-btn" onClick={() => onDeleteTodo && onDeleteTodo(task.id)}>🗑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {upcomingEvents.length > 0 && (
        <>
          <div className="stitle">Upcoming</div>
          <div className="event-list">
            {upcomingEvents.slice(0, 3).map((evt, i) => (
              <div key={evt.id} className="event-card aup small" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="event-bar" style={{ background: evt.color }} />
                <div className="event-info" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('event', typeof evt !== 'undefined' ? evt : undefined)} style={{cursor:'pointer'}}>
                  <div className="event-name">{renderTextWithTags(evt.name)}</div>
                  <div className="event-time">{getDateLabel(evt.date)} · {evt.time}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Calendar Screen
const CalendarScreen = ({ events, todos, editMode, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent, onOpenEdit, journalEntries = [], dreams = [], wins = [] }) => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) days.push({ num: prevMonthDays - i, other: true });
  for (let j = 1; j <= daysInMonth; j++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
    const hasEvent = events.some(e => e.date === dateStr) || todos.some(t => t.date === dateStr);
    
    // Find dots
    const dayDots = [];
    const dayJ = journalEntries.find(j => j.date === dateStr);
    if (dayJ) dayDots.push(moodColors[dayJ.mood] || '#7ab896');
    const dayD = dreams.find(dr => dr.date === dateStr);
    if (dayD) dayDots.push(moodColors[dayD.quality] || '#5b9fd4');
    if (wins.some(w => w.date === dateStr)) dayDots.push('#e8b051');

    days.push({ num: j, hasEvent, dateStr, dayDots });
  }
  while (days.length % 7 !== 0) days.push({ num: days.length - (firstDay + daysInMonth) + 1, other: true });

  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const dayEvents = events.filter(e => e.date === selectedDateStr);
  const dayTodos = todos.filter(t => t.date === selectedDateStr);
  const upcomingEvents = events.filter(e => isUpcoming(e.date, 14) && !isToday(e.date)).slice(0, 5);
  const upcomingTodos = todos.filter(t => t.date && isUpcoming(t.date, 14) && !isToday(t.date)).slice(0, 5);
  const dayJournals = journalEntries.filter(j => j.date === selectedDateStr);
  const dayDreams = dreams.filter(d => d.date === selectedDateStr);
  const dayWins = wins.filter(w => w.date === selectedDateStr);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <div className="content" data-testid="calendar-screen">
      <div className="cal-header">
        <div className="cal-month">{monthNames[currentMonth]} {currentYear}</div>
        <div className="cal-nav">
          <div className="cal-btn" onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); }}>‹</div>
          <div className="cal-btn" onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); }}>›</div>
        </div>
      </div>

      <div className="cal-weekdays">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="cal-wd">{d}</div>)}</div>

      <div className="cal-grid">
        {days.map((d, i) => (
          <div key={i} className={`cal-day ${d.other ? 'other' : ''} ${d.num === today.getDate() && isCurrentMonth && !d.other ? 'today' : ''} ${d.num === selectedDay && !d.other ? 'sel' : ''} ${d.hasEvent ? 'has-event' : ''}`} onClick={() => !d.other && setSelectedDay(d.num)}>
            {d.num}
            {!d.other && d.dayDots && d.dayDots.length > 0 && (
              <div className="cal-day-dots">
                {d.dayDots.map((color, idx) => <div key={idx} className="cal-dot" style={{ backgroundColor: color }} />)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="stitle">{selectedDay === today.getDate() && isCurrentMonth ? "Today" : `${monthNames[currentMonth]} ${selectedDay}`}</div>

      {dayEvents.map((evt, i) => (
        <div key={evt.id} className="event-card aup" style={{ animationDelay: `${i * 0.03}s` }}>
          <div className="event-bar" style={{ background: evt.color }} />
          <div className="event-info" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('event', typeof evt !== 'undefined' ? evt : undefined)} style={{cursor:'pointer'}}>
            <div className="event-name">{renderTextWithTags(evt.name)}</div>
            <div className="event-time">{evt.time} · {evt.duration}min</div>
          </div>
          {editMode && (
            <div className="item-actions">
              <button className="icon-btn" onClick={() => onEditEvent && onEditEvent(evt.id)}>✏️</button>
              <button className="icon-btn" onClick={() => onDeleteEvent && onDeleteEvent(evt.id)}>🗑</button>
            </div>
          )}
        </div>
      ))}

      {dayTodos.map((task, i) => (
        <div key={task.id} className="tcard aup small" style={{ animationDelay: `${i * 0.03}s` }}>
          <div className={`chk ${task.done ? 'on' : ''}`}><Icons.Check size={10} /></div>
          <div className="tc" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('todo', typeof task !== 'undefined' ? task : undefined)} style={{cursor:'pointer'}}><div className="ttitle">{renderTextWithTags(task.title)}</div></div>
          {editMode && (
            <div className="item-actions">
              <button className="icon-btn" onClick={() => onEditTodo && onEditTodo(task.id)}>✏️</button>
              <button className="icon-btn" onClick={() => onDeleteTodo && onDeleteTodo(task.id)}>🗑</button>
            </div>
          )}
        </div>
      ))}

      {dayEvents.length === 0 && dayTodos.length === 0 && <div className="empty-state">No events or tasks</div>}

      {(upcomingEvents.length > 0 || upcomingTodos.length > 0) && (
        <>
          <div className="stitle">Upcoming</div>
          {upcomingEvents.map((evt, i) => (
            <div key={evt.id} className="event-card aup small" style={{ animationDelay: `${i * 0.02}s` }}>
              <div className="event-bar" style={{ background: evt.color }} />
              <div className="event-info" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('event', typeof evt !== 'undefined' ? evt : undefined)} style={{cursor:'pointer'}}>
                <div className="event-name">{renderTextWithTags(evt.name)}</div>
                <div className="event-time">{getDateLabel(evt.date)} · {evt.time}</div>
              </div>
            </div>
          ))}
          {upcomingTodos.map((task, i) => (
            <div key={task.id} className="tcard aup small" style={{ animationDelay: `${i * 0.02}s` }}>
              <div className="upcoming-date">{getDateLabel(task.date)}</div>
              <div className="tc" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('todo', typeof task !== 'undefined' ? task : undefined)} style={{cursor:'pointer'}}><div className="ttitle">{renderTextWithTags(task.title)}</div></div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// Notes Screen
const NotesScreen = ({ projects, notes, notesFilter, setNotesFilter, onOpenProject, onOpenNote, editMode, onEditProject, onDeleteProject, onEditNote, onDeleteNote }) => (
  <div className="content" data-testid="notes-screen">
    <div className="stitle">Projects</div>
    <div className="proj-grid">
      {projects.map((proj, i) => (
        <div key={proj.id} className="proj-card aup" style={{ '--pc': proj.color, animationDelay: `${i * 0.03}s` }}>
          <div onClick={() => onOpenProject(proj)}>
            <div className="proj-ico">{proj.icon}</div>
            <div className="proj-name">{proj.name}</div>
            <div className="proj-cnt">{proj.folders ? proj.folders.length : 0} folders</div>
          </div>
          {editMode && (
            <div className="item-actions-absolute" style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onEditProject && onEditProject(proj.id); }}>✏️</button>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onDeleteProject && onDeleteProject(proj.id); }}>🗑</button>
            </div>
          )}
        </div>
      ))}
    </div>

    <div className="stitle">Notes</div>
    <div className="filter-tabs">
      {['all', 'work', 'myself', 'freetime'].map(f => (
        <div key={f} className={`filter-tab ${notesFilter === f ? 'act' : ''}`} onClick={() => setNotesFilter(f)}>{f}</div>
      ))}
    </div>

    <div className="notes-grid">
      {(notesFilter === 'all' ? notes : notes.filter(n => n.tags.includes(notesFilter))).map((note, i) => (
        <div key={note.id} className="note-card aup" style={{ animationDelay: `${i * 0.04}s`, position: 'relative' }}>
          <div onClick={() => onOpenNote(note)}>
            <div className="note-title">{note.title}</div>
            <div className="note-prev">{note.content}</div>
            {note.tags.length > 0 && <div className="note-tags">{note.tags.slice(0, 2).map(t => <span key={t} className="inline-tag">#{t}</span>)}</div>}
          </div>
          {editMode && (
            <div className="item-actions-absolute" style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onEditNote && onEditNote(note.id); }}>✏️</button>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onDeleteNote && onDeleteNote(note.id); }}>🗑</button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Inbox Screen
const InboxScreen = ({ todos, inboxView, setInboxView, onToggleTodo, editMode, onEditTodo, onDeleteTodo, onOpenEdit }) => {
  const inboxTodos = todos.filter(t => !t.date);
  const sorted = [...inboxTodos].sort((a, b) => (a.important === b.important ? 0 : a.important ? -1 : 1));
  const urgImp = inboxTodos.filter(t => t.important);
  const notUrgNotImp = inboxTodos.filter(t => !t.important);

  return (
    <div className="content" data-testid="inbox-screen">
      <div className="inbox-header">
        <div className="stitle" style={{ padding: 0 }}><span>Inbox</span><span className="inbox-count">{inboxTodos.length} tasks</span></div>
        <div className="view-toggle">
          <div className={`view-btn ${inboxView === 'list' ? 'act' : ''}`} onClick={() => setInboxView('list')}>List</div>
          <div className={`view-btn ${inboxView === 'matrix' ? 'act' : ''}`} onClick={() => setInboxView('matrix')}>Matrix</div>
        </div>
      </div>

      <div className="inbox-desc">Tasks without a due date</div>

      {inboxView === 'list' ? (
        <div className="tlist">
          {sorted.map((task, i) => (
            <div key={task.id} className={`tcard aup ${task.done ? 'done' : ''}`} style={{ animationDelay: `${i * 0.03}s` }}>
              <div className={`chk ${task.done ? 'on' : ''}`} onClick={() => onToggleTodo(task.id)}><Icons.Check size={10} /></div>
              <div className="tc" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('todo', typeof task !== 'undefined' ? task : undefined)} style={{cursor:'pointer'}}><div className="ttitle">{renderTextWithTags(task.title)}</div></div>
              {task.important && <div className="imp-badge">!</div>}
              {editMode && (
                <div className="item-actions">
                  <button className="icon-btn" onClick={() => onEditTodo && onEditTodo(task.id)}>✏️</button>
                  <button className="icon-btn" onClick={() => onDeleteTodo && onDeleteTodo(task.id)}>🗑</button>
                </div>
              )}
            </div>
          ))}
          {inboxTodos.length === 0 && <div className="empty-state">No tasks in inbox</div>}
        </div>
      ) : (
        <div className="matrix">
          <div className="matrix-quad important"><div className="quad-label">Important</div>{urgImp.map(t => <div key={t.id} className="quad-task">{t.title}</div>)}</div>
          <div className="matrix-quad later"><div className="quad-label">Later</div>{notUrgNotImp.map(t => <div key={t.id} className="quad-task">{t.title}</div>)}</div>
        </div>
      )}
    </div>
  );
};

// Journal Screen
const JournalScreen = ({ entries, editMode, onEditJournal, onDeleteJournal, onOpenEdit }) => (
  <div className="content" data-testid="journal-screen">
    <div className="stitle">Journal Entries</div>
    <div className="hint">Tap + to add a new entry</div>
    {entries.map((entry, i) => (
      <div key={entry.id} className="entry-card aup" style={{ animationDelay: `${i * 0.03}s` }}>
        {entry.mood && <div className="entry-emoji">{entry.mood}</div>}
        <div className="entry-content" onClick={(e) => {
    e.stopPropagation();
    if (typeof onOpenEdit === 'function') {
      if (typeof entry !== 'undefined') onOpenEdit('journal', entry);
      else if (typeof dream !== 'undefined') onOpenEdit('dream', dream);
      else if (typeof win !== 'undefined') onOpenEdit('win', win);
    }
  }} style={{cursor:'pointer'}}>
          <div className="entry-date">{entry.date}</div>
          {entry.title && <div className="item-title" style={{marginBottom: 4}}>{entry.title}</div>}
          <div className="entry-text">{renderTextWithTags(entry.text)}</div>
        </div>
        {editMode && (
          <div className="item-actions">
            <button className="icon-btn" onClick={() => onEditJournal && onEditJournal(entry.id)}>✏️</button>
            <button className="icon-btn" onClick={() => onDeleteJournal && onDeleteJournal(entry.id)}>🗑</button>
          </div>
        )}
      </div>
    ))}
  </div>
);

// Dreams Screen
const DreamsScreen = ({ dreams, editMode, onEditDream, onDeleteDream, onOpenEdit }) => {
  const dreamMoods = ['😴', '😐', '😊', '😱', '🤯'];
  return (
    <div className="content" data-testid="dreams-screen">
      <div className="stitle">Dream Journal</div>
      <div className="hint">Tap + to log a dream</div>
      {dreams.map((dream, i) => (
        <div key={dream.id} className="entry-card aup" style={{ animationDelay: `${i * 0.03}s` }}>
          <div className="entry-emoji">{dreamMoods[dream.mood] || '💭'}</div>
          <div className="entry-content" onClick={(e) => {
    e.stopPropagation();
    if (typeof onOpenEdit === 'function') {
      if (typeof entry !== 'undefined') onOpenEdit('journal', entry);
      else if (typeof dream !== 'undefined') onOpenEdit('dream', dream);
      else if (typeof win !== 'undefined') onOpenEdit('win', win);
    }
  }} style={{cursor:'pointer'}}>
            <div className="entry-date">{dream.date} · {dream.quality}</div>
            {dream.title && <div className="item-title" style={{marginBottom: 4}}>{dream.title}</div>}
            <div className="entry-text">{renderTextWithTags(dream.text)}</div>
          </div>
          {editMode && (
            <div className="item-actions">
              <button className="icon-btn" onClick={() => onEditDream && onEditDream(dream.id)}>✏️</button>
              <button className="icon-btn" onClick={() => onDeleteDream && onDeleteDream(dream.id)}>🗑</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Wins Screen
const WinsScreen = ({ wins, editMode, onEditWin, onDeleteWin, onOpenEdit }) => (
  <div className="content" data-testid="wins-screen">
    <div className="stitle">Your Wins</div>
    <div className="hint">Tap + to log a win</div>
    {wins.map((win, i) => {
      const ico = win.size === 'big' ? '🏆' : win.size === 'med' ? '⭐' : '✨';
      return (
        <div key={win.id} className="entry-card aup" style={{ animationDelay: `${i * 0.03}s` }}>
          <div className="entry-emoji">{ico}</div>
          <div className="entry-content" onClick={(e) => {
    e.stopPropagation();
    if (typeof onOpenEdit === 'function') {
      if (typeof entry !== 'undefined') onOpenEdit('journal', entry);
      else if (typeof dream !== 'undefined') onOpenEdit('dream', dream);
      else if (typeof win !== 'undefined') onOpenEdit('win', win);
    }
  }} style={{cursor:'pointer'}}>
            <div className="entry-date">{win.date} · {win.size.toUpperCase()}</div>
            <div className="entry-text">{renderTextWithTags(win.text)}</div>
          </div>
          {editMode && (
            <div className="item-actions">
              <button className="icon-btn" onClick={() => onEditWin && onEditWin(win.id)}>✏️</button>
              <button className="icon-btn" onClick={() => onDeleteWin && onDeleteWin(win.id)}>🗑</button>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// Habits Screen
const HabitsScreen = ({ habits, countdowns, onToggleHabit, editMode, onEditHabit, onDeleteHabit, onEditCountdown, onDeleteCountdown, onOpenEdit }) => {
  const habitsDone = habits.filter(h => h.done).length;
  const habitsTotal = habits.length;
  const r = 35, cx = 40, cy = 40;
  const circumference = 2 * Math.PI * r;
  const pct = habitsTotal > 0 ? (habitsDone / habitsTotal) * 100 : 0;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="content" data-testid="habits-screen">
      <div className="stitle">Daily Habits</div>

      <div className="habit-progress">
        <div className="habit-circle">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
            <circle cx={cx} cy={cy} r={r} stroke="var(--sun-color)" strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px var(--sun-color))', transition: 'stroke-dashoffset 0.5s', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
          </svg>
          <div className="habit-circle-text">
            <div className="habit-num">{habitsDone}</div>
            <div className="habit-label">of {habitsTotal}</div>
          </div>
        </div>
        <div className="habit-info">
          <div className="habit-info-title">Today's Progress</div>
          <div className="habit-info-desc">Keep up the momentum!</div>
        </div>
      </div>

      {habits.map((habit, i) => (
        <div key={habit.id} className={`habit-card aup ${habit.done ? 'done' : ''}`} style={{ animationDelay: `${i * 0.03}s` }} data-testid={`habit-${habit.id}`}>
          <div className="habit-ico-wrap" onClick={() => onToggleHabit(habit.id)}>
            <div className={`habit-ico ${habit.done ? 'hidden' : ''}`}>{habit.icon}</div>
            <div className={`habit-check ${habit.done ? 'show' : ''}`}><Icons.Check size={18} /></div>
          </div>
          <div className="habit-main" onClick={() => onToggleHabit(habit.id)}>
            <div className="habit-name" onClick={(e) => { e.stopPropagation(); typeof onOpenEdit === 'function' && onOpenEdit('habit', habit); }} style={{cursor:'pointer'}}>{habit.name}</div>
            <div className="habit-streak">{habit.streak} day streak</div>
          </div>
          <div className="habit-track" onClick={() => onToggleHabit(habit.id)}>
            {habit.days.map((d, j) => <div key={j} className={`habit-dot ${d === 1 ? 'done' : ''} ${j === habit.days.length - 1 && habit.done ? 'today' : ''}`} />)}
          </div>
          {editMode && (
            <div className="item-actions" style={{ marginLeft: 'auto' }}>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onEditHabit && onEditHabit(habit.id); }}>✏️</button>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onDeleteHabit && onDeleteHabit(habit.id); }}>🗑</button>
            </div>
          )}
        </div>
      ))}

      <div className="stitle">Countdowns</div>
      {countdowns.map((cd, i) => (
        <div key={cd.id} className="countdown-card aup" style={{ animationDelay: `${i * 0.03}s` }}>
          <div className="countdown-left">
            <div className="countdown-days">{cd.days}</div>
            <div className="countdown-label">days</div>
          </div>
          <div className="countdown-main" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('countdown', typeof cd !== 'undefined' ? cd : undefined)} style={{cursor:'pointer'}}>
            <div className="countdown-name">{cd.name}</div>
            <div className="countdown-date">{cd.date}</div>
            <div className="countdown-bar"><div className="countdown-fill" style={{ width: `${cd.pct}%` }} /></div>
          </div>
          {editMode && (
            <div className="item-actions" style={{ display: 'flex', flexDirection: 'column' }}>
              <button className="icon-btn" onClick={() => onEditCountdown && onEditCountdown(cd.id)}>✏️</button>
              <button className="icon-btn" onClick={() => onDeleteCountdown && onDeleteCountdown(cd.id)}>🗑</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Today Story (Instagram like flow)
const TodayStory = ({ isOpen, onClose, events, todos }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayTodos = todos.filter(t => t.date && isToday(t.date));
  const todayEvents = events.filter(e => e.date && isToday(e.date));
  const doneCount = todayTodos.filter(t => t.done).length;

  return (
    <div className={`today-story ${isOpen ? 'open' : ''}`} onClick={onClose} data-testid="today-story">
      <div className="story-bg" />
      <div className="story-progress-wrap">
        <div className="story-progress-bg"><div className="story-progress-fill" /></div>
      </div>
      
      <div className="story-content">
        <div className="story-greeting">{getGreeting()}, User!</div>
        <div className="story-weekday">Today is a beautiful {todayStr}</div>

        <div className="story-stats">
          <div className="story-stat-card">
            <div className="story-stat-num">{todayTodos.length - doneCount}</div>
            <div className="story-stat-label">Tasks Left</div>
          </div>
          <div className="story-stat-card">
            <div className="story-stat-num">{todayEvents.length}</div>
            <div className="story-stat-label">Events</div>
          </div>
        </div>

        <div className="story-quote">"The secret of getting ahead is getting started."</div>
      </div>
    </div>
  );
};

// ============ PROGRESSION CONSTANTS & HELPERS ============
export const PROGRESSION_LEVELS = [
  { level: 1, title: 'Novice Explorer', xpRequired: 0, icon: '🌱', perks: 'Default & Light Themes, Work & Myself Modes' },
  { level: 2, title: 'Mindful Organizer', xpRequired: 100, icon: '🌊', perks: 'Ocean Vibe Theme, Year in Pixels Insights' },
  { level: 3, title: 'Focus Strategist', xpRequired: 250, icon: '🌲', perks: 'Deep Forest Theme, Advanced Tag Filters' },
  { level: 4, title: 'Habit Master', xpRequired: 500, icon: '🌅', perks: 'Sunset Glow Theme, Full JSON Data Backup' },
  { level: 5, title: 'Zen Luminary', xpRequired: 900, icon: '🌌', perks: 'Midnight Neon Theme, Self-Hosted Sync Server' },
  { level: 6, title: 'Venlea Grandmaster', xpRequired: 1500, icon: '👑', perks: 'Grandmaster Crown Badge, Infinite Customization' },
];

export const calculateLevel = (xp = 0) => {
  let current = PROGRESSION_LEVELS[0];
  for (let i = PROGRESSION_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= PROGRESSION_LEVELS[i].xpRequired) {
      current = PROGRESSION_LEVELS[i];
      break;
    }
  }
  const nextLevel = PROGRESSION_LEVELS.find(l => l.level === current.level + 1) || null;
  const currentLevelXp = current.xpRequired;
  const nextLevelXp = nextLevel ? nextLevel.xpRequired : current.xpRequired;
  const progressPercent = nextLevel 
    ? Math.min(100, Math.max(0, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))) 
    : 100;

  return {
    ...current,
    nextLevel,
    progressPercent,
    xpToNext: nextLevel ? nextLevel.xpRequired - xp : 0,
  };
};

// ============ PAYPAL DONATION MODAL ============
const PayPalModal = ({ isOpen, onClose, paypalUrl = 'https://paypal.me' }) => {
  const [selectedAmount, setSelectedAmount] = useState('5');
  const [customAmount, setCustomAmount] = useState('');

  if (!isOpen) return null;

  const presets = ['3', '5', '10', '25'];

  const handleDonate = () => {
    const amount = customAmount ? customAmount : selectedAmount;
    const cleanUrl = (paypalUrl || 'https://paypal.me').replace(/\/+$/, '');
    const donateLink = cleanUrl.includes('paypal.me') && amount 
      ? `${cleanUrl}/${amount}`
      : cleanUrl;
    window.open(donateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <DraggableSheet isOpen={isOpen} onClose={onClose} className="profile-sheet">
      <div className="sheet-content">
        <div className="sheet-header-row">
          <div className="sheet-back" onClick={onClose}>← Back</div>
        </div>
        <div className="sheet-title">Support Venlea Open Source</div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💙☕</div>
          <div style={{ fontSize: 13, fontStyle: 'normal', fontWeight: 700, marginBottom: 4 }}>No Subscriptions. 100% Free.</div>
          <div style={{ fontSize: 11, color: 'var(--txt2)', lineHeight: 1.5, maxWidth: 300, margin: '0 auto' }}>
            Venlea is an independent, de-Googled, open-source project. If it helps organize your life, you can support development with a coffee on PayPal!
          </div>
        </div>

        <div className="form-label" style={{ textAlign: 'center' }}>Choose donation amount</div>
        <div className="paypal-preset-grid">
          {presets.map(p => (
            <button
              key={p}
              type="button"
              className={`paypal-preset-btn ${selectedAmount === p && !customAmount ? 'sel' : ''}`}
              onClick={() => { setSelectedAmount(p); setCustomAmount(''); }}
            >
              ${p}
            </button>
          ))}
        </div>

        <input
          type="number"
          className="sheet-input"
          placeholder="Or custom amount ($)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          style={{ textAlign: 'center' }}
        />

        <button className="paypal-btn" onClick={handleDonate} style={{ marginTop: 8 }}>
          <span style={{ fontSize: 15 }}>🅿️</span>
          <span>Donate ${customAmount || selectedAmount} via PayPal</span>
        </button>

        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--txt3)', marginTop: 14 }}>
          Thank you for supporting private & open source software! ❤️
        </div>
      </div>
    </DraggableSheet>
  );
};

// ============ PROGRESSION SHEET ============
const ProgressionSheet = ({ isOpen, onClose, userProfile, progressionInfo }) => {
  if (!isOpen) return null;

  return (
    <DraggableSheet isOpen={isOpen} onClose={onClose} className="progression-sheet">
      <div className="sheet-content">
        <div className="sheet-header-row">
          <div className="sheet-back" onClick={onClose}>← Back</div>
        </div>
        <div className="sheet-title">Your Journey & Unlocks</div>

        {/* Hero Card */}
        <div className="profile-xp-section" style={{ margin: '0 0 16px', background: 'linear-gradient(135deg, rgba(91,159,212,0.1), rgba(255,107,26,0.1))' }}>
          <div className="profile-xp-header">
            <span className="profile-level-badge">Level {progressionInfo.level} · {progressionInfo.title}</span>
            <span className="profile-xp-counter">{userProfile?.xp || 0} Total XP</span>
          </div>
          <div className="xp-bar-bg" style={{ height: 9 }}>
            <div className="xp-bar-fill" style={{ width: `${progressionInfo.progressPercent}%` }} />
          </div>
          <div className="profile-xp-footer">
            <span className="profile-xp-next">
              {progressionInfo.nextLevel 
                ? `${progressionInfo.xpToNext} XP to Level ${progressionInfo.nextLevel.level} (${progressionInfo.nextLevel.title})`
                : 'Maximum Level reached! You are a Grandmaster 👑'}
            </span>
          </div>
        </div>

        <div className="form-label">Unlockable Milestones</div>
        <div className="milestones-list">
          {PROGRESSION_LEVELS.map((milestone) => {
            const isUnlocked = userProfile?.allUnlocked || (userProfile?.xp || 0) >= milestone.xpRequired;
            const isCurrent = progressionInfo.level === milestone.level;

            return (
              <div 
                key={milestone.level} 
                className={`milestone-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
              >
                <div className="milestone-icon-wrap">
                  {milestone.icon}
                </div>
                <div className="milestone-main">
                  <div className="milestone-header">
                    <span className="milestone-level">Level {milestone.level}</span>
                    <span className="milestone-title">· {milestone.title}</span>
                  </div>
                  <div className="milestone-perks">{milestone.perks}</div>
                </div>
                <div className={`milestone-status-badge ${isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked'}`}>
                  {isCurrent ? 'Active' : isUnlocked ? 'Unlocked' : `${milestone.xpRequired} XP`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DraggableSheet>
  );
};

// ============ PROFILE SHEET ============
const ProfileSheet = ({ 
  isOpen, onClose, 
  userProfile, onUpdateProfile,
  progressionInfo, onOpenProgression,
  onOpenPayPal,
  serverUrl, onServerUrlChange, 
  isOnline, syncStatus, 
  onExport, onOpenAppearance 
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.name || 'Explorer');
  const avatarOptions = ['🌿', '⚡', '🚀', '🦊', '🌙', '🎨', '💼', '🧘', '✨', '🪐'];

  if (!isOpen) return null;

  const handleSaveName = () => {
    setIsEditingName(false);
    onUpdateProfile({ ...userProfile, name: nameInput.trim() || 'Explorer' });
  };

  return (
    <DraggableSheet isOpen={isOpen} onClose={onClose} className="profile-sheet">
      <div className="sheet-content" style={{ paddingBottom: 40 }}>
        {/* Avatar */}
        <div className="profile-av">
          {userProfile?.avatar || '🌿'}
        </div>

        {/* Avatar picker row */}
        <div className="profile-avatar-row">
          {avatarOptions.slice(0, 6).map((av) => (
            <div
              key={av}
              className={`avatar-choice ${userProfile?.avatar === av ? 'sel' : ''}`}
              onClick={() => onUpdateProfile({ ...userProfile, avatar: av })}
            >
              {av}
            </div>
          ))}
        </div>

        {/* Name edit */}
        {isEditingName ? (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
            <input
              type="text"
              className="profile-name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
            />
            <button className="save-btn-small" onClick={handleSaveName}>Save</button>
          </div>
        ) : (
          <div 
            className="profile-name" 
            onClick={() => setIsEditingName(true)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            title="Click to change name"
          >
            {userProfile?.name || 'Explorer'}
            <span style={{ fontSize: 10, color: 'var(--txt3)' }}>✏️</span>
          </div>
        )}

        <div className="open-source-badge-tag" style={{ display: 'flex' }}>
          <span>🔓 Level {progressionInfo?.level || 1} · {progressionInfo?.title || 'Novice'}</span>
        </div>

        {/* XP Progress Hero */}
        <div className="profile-xp-section">
          <div className="profile-xp-header">
            <span className="profile-level-badge">Level {progressionInfo?.level || 1}</span>
            <span className="profile-xp-counter">{userProfile?.xp || 0} XP</span>
          </div>
          <div className="xp-bar-bg">
            <div className="xp-bar-fill" style={{ width: `${progressionInfo?.progressPercent || 0}%` }} />
          </div>
          <div className="profile-xp-footer">
            <span className="profile-xp-next">
              {progressionInfo?.nextLevel 
                ? `${progressionInfo.xpToNext} XP to Lvl ${progressionInfo.nextLevel.level}`
                : 'Max Level! 👑'}
            </span>
            <button className="view-progression-link" onClick={onOpenProgression}>
              View Journey →
            </button>
          </div>
        </div>

        {/* PayPal Donate Highlight Card */}
        <div className="donate-highlight-card">
          <div className="donate-header">
            <span className="donate-icon">💙</span>
            <div style={{ flex: 1 }}>
              <div className="donate-title">Support Open Source</div>
              <div className="donate-sub">Venlea has no paywalls. Help keep development active!</div>
            </div>
          </div>
          <button className="paypal-btn" onClick={onOpenPayPal}>
            <span>🅿️ Donate with PayPal</span>
          </button>
        </div>

        {/* Settings List */}
        <div className="settings-list" style={{ padding: 0 }}>
          {/* Appearance */}
          <div className="setting-item" onClick={onOpenAppearance}>
            <span className="setting-ico">🎨</span>
            <div className="setting-main">
              <div className="setting-label">Appearance & Themes</div>
              <div className="hint">Choose theme (unlocked via Level {progressionInfo?.level || 1})</div>
            </div>
            <span className="setting-arrow">›</span>
          </div>

          {/* Open Source Freedom Toggle */}
          <div className="setting-item" onClick={() => onUpdateProfile({ ...userProfile, allUnlocked: !userProfile?.allUnlocked })}>
            <span className="setting-ico">🔓</span>
            <div className="setting-main">
              <div className="setting-label">Open Source Freedom Mode</div>
              <div className="hint">{userProfile?.allUnlocked ? 'All themes & features unlocked' : 'Progressive unlock via XP active'}</div>
            </div>
            <div className={`custom-switch ${userProfile?.allUnlocked ? 'on' : ''}`}>
              <div className="custom-switch-thumb" />
            </div>
          </div>

          {/* Sync status & server */}
          <div className="setting-item">
            <span className="setting-ico">🌐</span>
            <div className="setting-main">
              <div className="setting-label">Self-Hosted Sync Server</div>
              <div className="hint">{isOnline ? 'Online · ' + syncStatus : 'Offline · Local storage only'}</div>
              <input
                type="text"
                className="sheet-input"
                style={{ marginTop: 6, marginBottom: 0 }}
                placeholder="http://192.168.0.10:8000"
                value={serverUrl}
                onChange={(e) => onServerUrlChange(e.target.value)}
              />
            </div>
          </div>

          {/* Export */}
          <div className="setting-item" onClick={onExport} style={{ cursor: 'pointer' }}>
            <span className="setting-ico">📤</span>
            <div className="setting-main">
              <div className="setting-label">Export Data Backup (JSON)</div>
              <div className="hint">Export full offline database</div>
            </div>
            <span className="setting-arrow">›</span>
          </div>
        </div>
      </div>
    </DraggableSheet>
  );
};

// ============ APPEARANCE SHEET ============
const AppearanceSheet = ({ isOpen, onClose, theme, onThemeChange, userLevel = 1, allUnlocked = false, onOpenProgression }) => {
  if (!isOpen) return null;
  const themes = [
    { id: 'default', label: 'Default (Dark)', requiredLevel: 1 },
    { id: 'light', label: 'Light Clean', requiredLevel: 1 },
    { id: 'ocean', label: 'Ocean Vibe', requiredLevel: 2 },
    { id: 'forest', label: 'Deep Forest', requiredLevel: 3 },
    { id: 'sunset', label: 'Sunset Glow', requiredLevel: 4 },
    { id: 'midnight', label: 'Midnight Neon', requiredLevel: 5 },
  ];

  const handleSelectTheme = (t) => {
    const isUnlocked = allUnlocked || userLevel >= t.requiredLevel;
    if (!isUnlocked) {
      alert(`🔒 '${t.label}' unlocks at Level ${t.requiredLevel}! Keep using Venlea to earn XP, or turn on 'Open Source Freedom Mode' in Settings.`);
      return;
    }
    onThemeChange(t.id);
  };

  return (
    <DraggableSheet isOpen={isOpen} onClose={onClose} className="appearance-sheet">
      <div className="sheet-content">
        <div className="sheet-header-row">
          <div className="sheet-back" onClick={onClose}>← Settings</div>
        </div>
        <div className="sheet-title">Appearance & Themes</div>

        <div className="theme-options">
          <div className="form-label">Themes (Progressive Unlocks)</div>
          <div className="theme-row">
            {themes.map(t => {
              const isUnlocked = allUnlocked || userLevel >= t.requiredLevel;
              const isSelected = theme === t.id;

              return (
                <div
                  key={t.id}
                  className={`theme-chip ${isSelected ? 'sel' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  onClick={() => handleSelectTheme(t)}
                  title={!isUnlocked ? `Unlocks at Level ${t.requiredLevel}` : ''}
                >
                  <span>{t.label}</span>
                  {!isUnlocked && <span className="lock-tag">🔒 Lvl {t.requiredLevel}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <button className="view-progression-link" onClick={onOpenProgression}>
            Check Level & Unlocks →
          </button>
        </div>
      </div>
    </DraggableSheet>
  );
};

// ============ AUTH & TUTORIAL (DE-GOOGLED / OPEN SOURCE) ============
const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('Alex');
  const [avatar, setAvatar] = useState('🌿');
  const avatarChoices = ['🌿', '⚡', '🚀', '🦊', '🌙', '🎨', '💼', '🧘'];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onLogin({ name: name.trim() || 'Explorer', avatar });
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-blob" />
      <div className="auth-bg-blob btm" />
      <div className="auth-logo"><span>Venlea</span></div>
      <div className="open-source-badge-tag">
        <span>🔓 Open Source & Local-First</span>
      </div>
      <div className="auth-sub">Your life, organized beautifully. Zero trackers, 100% private.</div>
      
      <div style={{ width: '100%', maxWidth: 280, zIndex: 2, marginBottom: 20 }}>
        <div className="form-label" style={{ textAlign: 'center', marginBottom: 8 }}>Choose Avatar & Name</div>
        <div className="profile-avatar-row">
          {avatarChoices.slice(0, 5).map((av) => (
            <div
              key={av}
              className={`avatar-choice ${avatar === av ? 'sel' : ''}`}
              onClick={() => setAvatar(av)}
            >
              {av}
            </div>
          ))}
        </div>
        <input
          type="text"
          className="sheet-input"
          style={{ textAlign: 'center', fontWeight: 600 }}
          placeholder="Your Name (e.g. Alex)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="auth-buttons">
        <button className="auth-btn primary" onClick={handleSubmit}>
          <span>🚀 Start Local Journey</span>
        </button>
        <button className="auth-btn" onClick={() => onLogin({ name: 'Guest', avatar: '🌿' })}>
          <Icons.User size={18} /> Continue as Guest
        </button>
      </div>
    </div>
  );
};

const TutorialScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const slides = [
    { icon: '🔓', title: 'Welcome to <span>Venlea</span>', desc: '100% Open Source and Local-First. Your data stays securely on your device—zero tracking, zero paywalls.' },
    { icon: '🎯', title: 'Two <span>Modes</span>', desc: 'Switch instantly between Work and Myself modes to keep your life and mind in harmony.' },
    { icon: '🌱', title: 'Progressive <span>Unlocks</span>', desc: 'Earn XP by completing tasks, habits, and journaling to level up and unlock beautiful themes and insights!' },
    { icon: '🚀', title: 'Ready to <span>Go</span>', desc: 'Start organizing your day beautifully. Let\'s build your momentum!' }
  ];

  const nextSlide = () => {
    if (step === slides.length - 1) onComplete();
    else setStep(s => s + 1);
  };

  return (
    <div className="tut-screen">
      <div className="tut-slides">
        {slides.map((s, i) => (
          <div key={i} className={`tut-slide ${i === step ? 'active' : i < step ? 'prev' : ''}`}>
            <div className="tut-icon">{s.icon}</div>
            <div className="tut-title" dangerouslySetInnerHTML={{ __html: s.title }} />
            <div className="tut-desc">{s.desc}</div>
          </div>
        ))}
      </div>
      
      <div className="tut-bottom">
        <div className="tut-dots">
          {slides.map((_, i) => <div key={i} className={`tut-dot ${i === step ? 'sel' : ''}`} />)}
        </div>
        <div className="tut-nav-row">
          <button className="tut-skip" onClick={onComplete}>Skip</button>
          <div className="tut-arrows">
            {step > 0 && <div className="tut-arrow" onClick={() => setStep(s => s - 1)}>←</div>}
            <div className={`tut-arrow ${step === slides.length - 1 ? 'primary' : ''}`} onClick={nextSlide}>
              {step === slides.length - 1 ? 'Start' : '→'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



// ============ STATS SHEET ============
const StatsSheet = ({ isOpen, onClose, journalEntries, dreams, wins, habits }) => {
  if (!isOpen) return null;

  const totalJournal = journalEntries.length;
  const totalDreams = dreams.length;
  const totalWins = wins.length;
  let highestStreak = 0;
  habits.forEach(h => { if (h.streak > highestStreak) highestStreak = h.streak; });

  // Matrix generation (last 364 days, 7 rows x 52 cols)
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const matrixData = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    
    // Check if we have an entry on this day
    const dayJournal = journalEntries.find(j => j.date === dateStr);
    const dayDream = dreams.find(dr => dr.date === dateStr);
    
    let color = null;
    if (dayJournal && dayJournal.mood) color = moodColors[dayJournal.mood] || '#7ab896';
    else if (dayDream && dayDream.quality) color = moodColors[dayDream.quality] || '#5b9fd4';
    else if (dayDream && dayDream.mood !== undefined) {
      const dreamMoodEmojis = ['😴', '😐', '😊', '😱', '🤯'];
      const em = dreamMoodEmojis[dayDream.mood];
      color = moodColors[em] || '#5b9fd4';
    } else if (wins.some(w => w.date === dateStr)) {
      color = '#e8b051'; // custom win color fallback
    }

    matrixData.push({ dateStr, color });
  }

  // Group into 7 rows (days of week)
  const rows = [[], [], [], [], [], [], []];
  matrixData.forEach((day, index) => {
    rows[index % 7].push(day);
  });

  return (
    <DraggableSheet isOpen={isOpen} onClose={onClose} className="profile-sheet">
      <div className="sheet-content">
        <div className="sheet-header-row">
          <div className="sheet-back" onClick={onClose}>← Close</div>
        </div>
        <div className="sheet-title">Your Insights</div>
        
        <div className="stats-kpi-grid">
          <div className="stat-card">
            <div className="stat-num">{totalJournal}</div>
            <div className="stat-label">Journal Entries</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{totalDreams}</div>
            <div className="stat-label">Dreams Logged</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{totalWins}</div>
            <div className="stat-label">Total Wins</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{highestStreak}</div>
            <div className="stat-label">Max Habit Streak</div>
          </div>
        </div>

        <div className="stitle">Year in Pixels</div>
        <div className="matrix-container">
          <div className="matrix-scroll">
            {rows.map((row, i) => (
              <div key={i} className="matrix-row">
                {row.map((cell, j) => (
                  <div 
                    key={j} 
                    className={`matrix-cell ${cell.color ? 'has-data' : ''}`} 
                    style={cell.color ? { backgroundColor: cell.color, '--dot-color': cell.color } : {}}
                    title={cell.dateStr}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DraggableSheet>
  );
};

// Search Sheet
const SearchSheet = ({ isOpen, onClose, events, todos, projects, notes, habits, countdowns, journalEntries, dreams, wins, onOpenItem, allTags }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    todos: true, events: true, notes: true, projects: true,
    habits: true, journal: true, dreams: true, wins: true, countdowns: true
  });

  if (!isOpen) return null;

  const toggleFilter = (f) => setFilters(prev => ({ ...prev, [f]: !prev[f] }));

  const normalizedQuery = query.toLowerCase();
  let results = [];

  if (normalizedQuery) {
    const pushResult = (type, title, subtitle, date, original) => {
      const matchText = (String(title || '') + ' ' + String(subtitle || '')).toLowerCase();
      if (matchText.includes(normalizedQuery)) {
        results.push({ id: original.id + type, type, title, subtitle, date, original });
      }
    };

    if (filters.todos) todos.forEach(t => pushResult('Todo', t.title, '', t.date, t));
    if (filters.events) events.forEach(e => pushResult('Event', e.name, e.time, e.date, e));
    if (filters.notes) notes.forEach(n => pushResult('Note', n.title, n.content, '', n));
    if (filters.projects) projects.forEach(p => pushResult('Project', p.name, '', '', p));
    if (filters.habits) habits.forEach(h => pushResult('Habit', h.name, '', '', h));
    if (filters.countdowns) countdowns.forEach(c => pushResult('Countdown', c.name, c.date, c.date, c));
    if (filters.journal) journalEntries.forEach(j => pushResult('Journal', j.title || j.text, j.title ? j.text : '', j.date, j));
    if (filters.dreams) dreams.forEach(d => pushResult('Dream', d.title || d.text, d.title ? d.text : d.quality, d.date, d));
    if (filters.wins) wins.forEach(w => pushResult('Win', w.text, w.size, w.date, w));
  }

  return (
      <DraggableSheet isOpen={isOpen} onClose={onClose} className="search-sheet">
        <div className="sheet-content">
          <div className="sheet-title">Search</div>
          <TagSuggestInput className="sheet-input search-input" placeholder="Search... e.g. text or #tag" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus allTags={allTags} />
          <div className="search-filters">
            {Object.keys(filters).map(f => (
              <div 
                key={f} 
                className={`filter-chip ${filters[f] ? 'sel' : ''}`} 
                onClick={() => toggleFilter(f)}
              >
                {f}
              </div>
            ))}
          </div>
          <div className="search-results">
            {results.length > 0 ? results.map(r => (
              <div key={r.id} className="search-result-card" onClick={() => { onOpenItem(r.type, r.original); onClose(); }}>
                <div className="sr-type">{r.type}</div>
                <div className="sr-title">{renderTextWithTags(r.title)}</div>
                {r.subtitle && <div className="sr-sub">{renderTextWithTags(r.subtitle)}</div>}
                {r.date && <div className="sr-date">{r.date}</div>}
              </div>
            )) : (
              query && <div className="empty-state">No results found</div>
            )}
          </div>
        </div >
      </DraggableSheet>
  );
};


// ============ ITEM EDIT SHEET ============
const ItemEditSheet = ({ isOpen, onClose, target, onSave, onDelete, allTags }) => {
  const [val, setVal] = useState('');
  const [titleVal, setTitleVal] = useState('');

  useEffect(() => {
    if (target?.item) {
       setTitleVal(target.item.title || target.item.name || '');
       setVal(target.item.text || target.item.content || target.item.title || target.item.name || '');
    }
  }, [target]);

  if (!isOpen || !target) return null;

  const hasDualFields = target.type === 'journal' || target.type === 'dream' || target.type === 'note' || target.type === 'win';

  const handleSave = () => {
     const updated = { ...target.item };
     
     if (hasDualFields) {
       if ('title' in updated || target.type === 'journal' || target.type === 'dream' || target.type === 'win') updated.title = titleVal;
       if ('text' in updated || target.type === 'journal' || target.type === 'dream' || target.type === 'win') updated.text = val;
       if ('content' in updated) updated.content = val;
     } else {
       if ('name' in updated) updated.name = val;
       else if ('title' in updated) updated.title = val;
       else if ('text' in updated) updated.text = val;
     }
     
     onSave(target.type, updated);
     onClose();
  };

  const handleDelete = () => {
    onDelete(target.type, target.item.id);
    onClose();
  };

  // The wrapper is already injected as DraggableSheet
  return (
    <DraggableSheet isOpen={isOpen} onClose={onClose} className="add-sheet">
        <div className="sheet-content">
          <div className="sheet-header-row">
            <div className="sheet-title">{target.type === 'journal' ? 'Journal Entry' : target.type === 'dream' ? 'Dream Log' : target.type === 'win' ? 'Log Win' : `Edit ${target.type}`}</div>
          </div>

          {hasDualFields && (
            <input 
              type="text" 
              className="sheet-input" 
              placeholder="Title (optional)" 
              value={titleVal} 
              onChange={(e) => setTitleVal(e.target.value)} 
            />
          )}

          <TagSuggestInput 
            className="sheet-textarea" 
            placeholder="Edit text..." 
            value={val} 
            onChange={(e) => setVal(e.target.value)} 
            allTags={allTags}
            isTextarea
            rows={4}
            autoFocus 
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="save-btn" onClick={handleSave} style={{ flex: 1 }}>Save</button>
            <button className="save-btn" onClick={handleDelete} style={{ background: '#ca4a4a', flex: 1 }}>Delete</button>
          </div>
        </div>
      </DraggableSheet>
  );
};

// ============ MAIN APP ============

function Venlea() {
  const [appState, setAppState] = useState('login'); // 'login', 'tutorial', 'main'
  const [mode, setMode] = useState('work');
  const [activeTab, setActiveTab] = useState('home');
  const [fabOpen, setFabOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [progressionOpen, setProgressionOpen] = useState(false);
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);
  const [xpToast, setXpToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [theme, setTheme] = useState('default');
  const [themeTransition, setThemeTransition] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [todayOpen, setTodayOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState(null);

  // User Profile & Progression State
  const defaultProfile = {
    name: 'Alex',
    avatar: '🌿',
    xp: 120,
    allUnlocked: false,
    paypalUrl: 'https://paypal.me',
  };
  const [userProfile, setUserProfile] = useState(defaultProfile);
  const progressionInfo = useMemo(() => calculateLevel(userProfile?.xp || 0), [userProfile?.xp]);

  const awardXp = (amount, reason) => {
    setUserProfile(prev => {
      const nextXp = (prev?.xp || 0) + amount;
      return { ...prev, xp: nextXp };
    });
    setXpToast({ amount, reason, id: Date.now() });
    setTimeout(() => {
      setXpToast(null);
    }, 2400);
  };

  // Data state
  const [events, setEvents] = useState(demoEvents);
  const [todos, setTodos] = useState(demoTodos);
  const [projects, setProjects] = useState(demoProjects);
  const [notes, setNotes] = useState([]);
  const [notesFilter, setNotesFilter] = useState('all');
  const [inboxView, setInboxView] = useState('list');
  const [habits, setHabits] = useState([]);
  const [countdowns, setCountdowns] = useState(initialCountdowns);
  const [journalEntries, setJournalEntries] = useState([]);
  const [dreams, setDreams] = useState([]);
  const [wins, setWins] = useState([]);

  // Tag Extraction
  const allTags = useMemo(() => {
    let t = new Set();
    todos.forEach(x => (x.tags||[]).forEach(v => t.add(v)));
    events.forEach(x => (x.tags||[]).forEach(v => t.add(v)));
    notes.forEach(x => (x.tags||[]).forEach(v => t.add(v)));
    journalEntries.forEach(x => (x.tags||[]).forEach(v => t.add(v)));
    dreams.forEach(x => (x.tags||[]).forEach(v => t.add(v)));
    wins.forEach(x => (x.tags||[]).forEach(v => t.add(v)));
    return Array.from(t);
  }, [todos, events, notes, journalEntries, dreams, wins]);

  // Sheet states
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const hasHydrated = useRef(false);
  const [serverUrl, setServerUrl] = useState('');
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [syncStatus, setSyncStatus] = useState('No sync yet');
  const syncingRef = useRef(false);

  // Initialize notifications
  useEffect(() => {
    notificationService.init();
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        hasHydrated.current = true;
        return;
      }

      const data = JSON.parse(stored);
      if (data && typeof data === 'object') {
        if (Array.isArray(data.events)) setEvents(data.events);
        if (Array.isArray(data.todos)) setTodos(data.todos);
        if (Array.isArray(data.projects)) setProjects(data.projects);
        if (Array.isArray(data.notes)) setNotes(data.notes);
        if (Array.isArray(data.habits)) setHabits(data.habits);
        if (Array.isArray(data.countdowns)) setCountdowns(data.countdowns);
        if (Array.isArray(data.journalEntries)) setJournalEntries(data.journalEntries);
        if (Array.isArray(data.dreams)) setDreams(data.dreams);
        if (Array.isArray(data.wins)) setWins(data.wins);
        if (data.userProfile && typeof data.userProfile === 'object') {
          setUserProfile(prev => ({ ...prev, ...data.userProfile }));
        }

        if (typeof data.appState === 'string') setAppState(data.appState);
        if (typeof data.mode === 'string') setMode(data.mode);
        if (typeof data.activeTab === 'string') setActiveTab(data.activeTab);
        if (typeof data.notesFilter === 'string') setNotesFilter(data.notesFilter);
        if (typeof data.inboxView === 'string') setInboxView(data.inboxView);
        if (typeof data.serverUrl === 'string') setServerUrl(data.serverUrl);
        if (typeof data.lastSync === 'string') setSyncStatus(data.lastSync);
        if (typeof data.theme === 'string') setTheme(data.theme);
      }
    } catch (err) {
      console.error('Failed to load Venlea data from localStorage', err);
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydrated.current) return;

    const payload = {
      events,
      todos,
      projects,
      notes,
      habits,
      journalEntries,
      dreams,
      wins,
      userProfile,
      appState,
      mode,
      activeTab,
      notesFilter,
      inboxView,
      serverUrl,
      lastSync: syncStatus,
      countdowns,
      theme,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save Venlea data to localStorage', err);
    }
  }, [events, todos, projects, notes, habits, journalEntries, dreams, wins, userProfile, appState, mode, activeTab, notesFilter, inboxView, serverUrl, syncStatus, countdowns, theme]);

  // Track online / offline
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync with server when online and data changes
  useEffect(() => {
    if (!serverUrl || !isOnline || !hasHydrated.current) return;
    if (syncingRef.current) return;

    const payload = {
      events,
      todos,
      projects,
      notes,
      habits,
      journalEntries,
      dreams,
      wins,
      countdowns,
    };

    const sync = async () => {
      syncingRef.current = true;
      try {
        await fetch(`${serverUrl.replace(/\/+$/, '')}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSyncStatus(`Last sync · ${new Date().toLocaleTimeString()}`);
      } catch (err) {
        console.error('Failed to sync with server', err);
        setSyncStatus('Last sync failed');
      } finally {
        syncingRef.current = false;
      }
    };

    sync();
  }, [serverUrl, isOnline, events, todos, projects, notes, habits, journalEntries, dreams, wins, countdowns]);

  const handleExport = async () => {
    if (typeof window === 'undefined') return;
    const payload = {
      events, todos, projects, notes, habits, countdowns,
      journalEntries, dreams, wins,
      mode, activeTab, notesFilter, inboxView, serverUrl, lastSync: syncStatus, theme
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const fileName = `venlea-backup-${new Date().toISOString().slice(0, 10)}.json`;

    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: jsonStr,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        await Share.share({
          title: 'Venlea Backup',
          text: 'Here is your Venlea backup file.',
          url: result.uri,
          dialogTitle: 'Save or Share Backup'
        });
      } catch (e) {
        console.error("Export failed", e);
        alert("Export failed: " + e.message);
      }
    } else {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    setThemeTransition(true);
    window.setTimeout(() => setThemeTransition(false), 600);
  };

  // Mode switch with animation
  const handleModeSwitch = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'work' ? 'myself' : 'work';
      setActiveTab(newMode === 'work' ? 'home' : 'journal');
      setFabOpen(false);
      return newMode;
    });
  }, []);

  // FAB select
  const handleFabSelect = (type) => {
    setFabOpen(false);
    setSelectedItemType(type);
  };

  // Toggle handlers
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const toggled = { ...t, done: !t.done };
        if (toggled.done) {
          notificationService.cancel(id);
          awardXp(15, 'Task Completed');
        } else {
          notificationService.scheduleTodo(toggled);
        }
        return toggled;
      }
      return t;
    }));
  };
  const toggleHabit = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const newDone = !h.done;
        const newDays = [...h.days];
        newDays[newDays.length - 1] = newDone ? 1 : 0;
        if (newDone) {
          awardXp(20, 'Habit Maintained');
        }
        return { ...h, done: newDone, days: newDays, streak: newDone ? h.streak + 1 : Math.max(0, h.streak - 1) };
      }
      return h;
    }));
  };

  // Add handler
  const handleAdd = (type, data) => {
    const id = Date.now();
    switch (type) {
      case 'todo': {
        const newTodo = { id, ...data };
        setTodos(prev => [newTodo, ...prev]);
        notificationService.scheduleTodo(newTodo);
        awardXp(10, 'Task Created');
        break;
      }
      case 'event': {
        const newEvt = { id, ...data };
        setEvents(prev => [newEvt, ...prev]);
        notificationService.scheduleEvent(newEvt);
        awardXp(10, 'Event Scheduled');
        break;
      }
      case 'note': setNotes(prev => [{ id, ...data }, ...prev]); awardXp(10, 'Note Created'); break;
      case 'journal': setJournalEntries(prev => [{ id, date: getTodayStr(), ...data }, ...prev]); awardXp(30, 'Journal Logged'); break;
      case 'dream': setDreams(prev => [{ id, date: getTodayStr(), ...data }, ...prev]); awardXp(25, 'Dream Logged'); break;
      case 'win': setWins(prev => [{ id, date: getTodayStr(), ...data }, ...prev]); awardXp(25, 'Win Logged'); break;
      case 'project': {
        const newProject = { id, name: data.name, icon: '📁', color: '#5b9fd4', folders: [] };
        setProjects(prev => [newProject, ...prev]);
        awardXp(20, 'Project Created');
        break;
      }
      case 'habit': setHabits(prev => [{ id, ...data }, ...prev]); awardXp(15, 'Habit Created'); break;
      case 'countdown': setCountdowns(prev => [{ id, ...data }, ...prev]); awardXp(10, 'Countdown Added'); break;
    }
  };

  // Edit / delete handlers for todos and events
  const handleEditTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const nextTitle = window.prompt('Edit task', todo.title || '');
    if (nextTitle == null || !nextTitle.trim()) return;
    const updatedTodo = { ...todo, title: nextTitle.trim() };
    setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
    notificationService.scheduleTodo(updatedTodo);
  };

  const handleDeleteTodo = (id) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;
    setTodos(prev => prev.filter(t => t.id !== id));
    notificationService.cancel(id);
  };

  const handleEditEvent = (id) => {
    const event = events.find(e => e.id === id);
    if (!event) return;
    const nextName = window.prompt('Edit event', event.name || '');
    if (nextName == null || !nextName.trim()) return;
    const updatedEvt = { ...event, name: nextName.trim() };
    setEvents(prev => prev.map(e => e.id === id ? updatedEvt : e));
    notificationService.scheduleEvent(updatedEvt);
  };

  const handleDeleteEvent = (id) => {
    const confirmed = window.confirm('Delete this event?');
    if (!confirmed) return;
    setEvents(prev => prev.filter(e => e.id !== id));
    notificationService.cancel(id);
  };

  const handleEditJournal = (id) => {
    const entry = journalEntries.find(e => e.id === id);
    if (!entry) return;
    const nextText = window.prompt('Edit journal entry', entry.text || '');
    if (nextText == null || !nextText.trim()) return;
    setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, text: nextText.trim() } : e));
  };
  const handleDeleteJournal = (id) => {
    if (!window.confirm('Delete this journal entry?')) return;
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleEditDream = (id) => {
    const dream = dreams.find(d => d.id === id);
    if (!dream) return;
    const nextText = window.prompt('Edit dream', dream.text || '');
    if (nextText == null || !nextText.trim()) return;
    setDreams(prev => prev.map(d => d.id === id ? { ...d, text: nextText.trim() } : d));
  };
  const handleDeleteDream = (id) => {
    if (!window.confirm('Delete this dream?')) return;
    setDreams(prev => prev.filter(d => d.id !== id));
  };

  const handleEditWin = (id) => {
    const win = wins.find(w => w.id === id);
    if (!win) return;
    const nextText = window.prompt('Edit win', win.text || '');
    if (nextText == null || !nextText.trim()) return;
    setWins(prev => prev.map(w => w.id === id ? { ...w, text: nextText.trim() } : w));
  };
  const handleDeleteWin = (id) => {
    if (!window.confirm('Delete this win?')) return;
    setWins(prev => prev.filter(w => w.id !== id));
  };

  const handleEditHabit = (id) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const nextName = window.prompt('Edit habit name', habit.name || '');
    if (nextName == null || !nextName.trim()) return;
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name: nextName.trim() } : h));
  };
  const handleDeleteHabit = (id) => {
    if (!window.confirm('Delete this habit?')) return;
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleEditCountdown = (id) => {
    const cd = countdowns.find(c => c.id === id);
    if (!cd) return;
    const nextName = window.prompt('Edit countdown name', cd.name || '');
    if (nextName == null || !nextName.trim()) return;
    setCountdowns(prev => prev.map(c => c.id === id ? { ...c, name: nextName.trim() } : c));
  };
  const handleDeleteCountdown = (id) => {
    if (!window.confirm('Delete this countdown?')) return;
    setCountdowns(prev => prev.filter(c => c.id !== id));
  };

  const handleEditProject = (id) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    const nextName = window.prompt('Edit project name', proj.name || '');
    if (nextName == null || !nextName.trim()) return;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: nextName.trim() } : p));
  };
  const handleDeleteProject = (id) => {
    if (!window.confirm('Delete this project?')) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  const handleEditNote = (id) => {
    const note = notes.find(n => n.id === id);
    if (note) setSelectedNote(note);
  };
  const handleDeleteNote = (id) => {
    if (!window.confirm('Delete this note?')) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const handleUpdateProject = (updated) => { setProjects(prev => prev.map(p => p.id === updated.id ? updated : p)); setSelectedProject(updated); };
  const handleSaveEdit = (type, updated) => {
    switch(type) {
      case 'todo': setTodos(prev => prev.map(t => t.id === updated.id ? updated : t)); notificationService.scheduleTodo(updated); break;
      case 'event': setEvents(prev => prev.map(e => e.id === updated.id ? updated : e)); notificationService.scheduleEvent(updated); break;
      case 'journal': setJournalEntries(prev => prev.map(e => e.id === updated.id ? updated : e)); break;
      case 'dream': setDreams(prev => prev.map(d => d.id === updated.id ? updated : d)); break;
      case 'win': setWins(prev => prev.map(w => w.id === updated.id ? updated : w)); break;
      case 'habit': setHabits(prev => prev.map(h => h.id === updated.id ? updated : h)); break;
      case 'countdown': setCountdowns(prev => prev.map(c => c.id === updated.id ? updated : c)); break;
    }
  };

  const handleDeleteEdit = (type, id) => {
    const confirmed = window.confirm('Are you sure you want to delete this?');
    if (!confirmed) return;
    switch(type) {
      case 'todo': setTodos(prev => prev.filter(t => t.id !== id)); notificationService.cancel(id); break;
      case 'event': setEvents(prev => prev.filter(e => e.id !== id)); notificationService.cancel(id); break;
      case 'journal': setJournalEntries(prev => prev.filter(e => e.id !== id)); break;
      case 'dream': setDreams(prev => prev.filter(d => d.id !== id)); break;
      case 'win': setWins(prev => prev.filter(w => w.id !== id)); break;
      case 'habit': setHabits(prev => prev.filter(h => h.id !== id)); break;
      case 'countdown': setCountdowns(prev => prev.filter(c => c.id !== id)); break;
    }
  };

  const handleOpenEdit = (type, item) => setSelectedEditItem({ type, item });

  const handleSaveNote = (updated) => {
    if (updated.id) setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    else setNotes(prev => [{ ...updated, id: Date.now() }, ...prev]);
  };

  const handleOpenFromSearch = (type, item) => {
    // Eventually we can open the item edit/view modal here
    // For now, if it's a project/note, open their sheets
    if (type === 'Project') {
       setActiveTab('notes');
       setSelectedProject(item);
    }
    if (type === 'Note') {
       setActiveTab('notes');
       setSelectedNote(item);
    }
  };


  // Render screen
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            events={events}
            todos={todos}
            onToggleTodo={toggleTodo}
            editMode={editMode}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenToday={() => setTodayOpen(true)}
            onOpenEdit={handleOpenEdit}
          />
        );
      case 'calendar':
        return (
          <CalendarScreen
            events={events}
            todos={todos}
            journalEntries={journalEntries}
            dreams={dreams}
            wins={wins}
            editMode={editMode}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenEdit={handleOpenEdit}
          />
        );
      case 'notes': 
        return (
          <NotesScreen 
            projects={projects} notes={notes} notesFilter={notesFilter} setNotesFilter={setNotesFilter} 
            onOpenProject={setSelectedProject} onOpenNote={setSelectedNote}
            editMode={editMode}
            onEditProject={handleEditProject} onDeleteProject={handleDeleteProject}
            onEditNote={handleEditNote} onDeleteNote={handleDeleteNote}
          />
        );
      case 'inbox':
        return (
          <InboxScreen
            todos={todos}
            inboxView={inboxView}
            setInboxView={setInboxView}
            onToggleTodo={toggleTodo}
            editMode={editMode}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo} onOpenEdit={handleOpenEdit}
          />
        );
      case 'journal': 
        return (
          <JournalScreen 
            entries={journalEntries} 
            editMode={editMode}
            onEditJournal={handleEditJournal}
            onDeleteJournal={handleDeleteJournal} onOpenEdit={handleOpenEdit}
          />
        );
      case 'dreams': 
        return (
          <DreamsScreen 
            dreams={dreams} 
            editMode={editMode}
            onEditDream={handleEditDream}
            onDeleteDream={handleDeleteDream} onOpenEdit={handleOpenEdit}
          />
        );
      case 'wins': 
        return (
          <WinsScreen 
            wins={wins} 
            editMode={editMode}
            onEditWin={handleEditWin}
            onDeleteWin={handleDeleteWin} onOpenEdit={handleOpenEdit}
          />
        );
      case 'habits': 
        return (
          <HabitsScreen 
            habits={habits} countdowns={countdowns} onToggleHabit={toggleHabit} 
            editMode={editMode}
            onEditHabit={handleEditHabit} onDeleteHabit={handleDeleteHabit}
            onEditCountdown={handleEditCountdown} onDeleteCountdown={handleDeleteCountdown} onOpenEdit={handleOpenEdit}
          />
        );
      default:
        return (
          <HomeScreen
            events={events}
            todos={todos}
            onToggleTodo={toggleTodo}
            editMode={editMode}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenEdit={handleOpenEdit}
          />
        );
    }
  };

  const handleLogin = (profileData) => {
    if (profileData && profileData.name) {
      setUserProfile(prev => ({
        ...prev,
        name: profileData.name,
        avatar: profileData.avatar || prev.avatar
      }));
    }
    setAppState('tutorial');
  };

  const handleTutorialComplete = () => {
    setAppState('main');
  };

  if (appState === 'login') {
    return (
      <div className={`venlea-app mode-${mode} theme-${theme} ${themeTransition ? 'theme-transition' : ''}`} data-testid="venlea-app">
        <div className="outer">
          <div className="shell">
            <LoginScreen onLogin={handleLogin} />
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'tutorial') {
    return (
      <div className={`venlea-app mode-${mode} theme-${theme} ${themeTransition ? 'theme-transition' : ''}`} data-testid="venlea-app">
        <div className="outer">
          <div className="shell">
            <TutorialScreen onComplete={handleTutorialComplete} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`venlea-app mode-${mode} theme-${theme} ${themeTransition ? 'theme-transition' : ''}`} data-testid="venlea-app">
      <div className="outer">
        <div className="shell">
          <div className="bg-blob" />
          <SunEffect />
          <TopBar
            mode={mode}
            onModeSwitch={handleModeSwitch}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenStats={() => setStatsOpen(true)}
            userProfile={userProfile}
          />

          <div className="screen active">{renderScreen()}</div>

          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            mode={mode}
            fabOpen={fabOpen}
            onFabToggle={() => setFabOpen(!fabOpen)}
            onFabSelect={handleFabSelect}
          />

          <AddFormSheet isOpen={!!selectedItemType} onClose={() => setSelectedItemType(null)} itemType={selectedItemType} onAdd={handleAdd} allTags={allTags} />
          <ProjectSheet isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} project={selectedProject} onUpdate={handleUpdateProject} />
          <NoteSheet isOpen={!!selectedNote} onClose={() => setSelectedNote(null)} note={selectedNote} onSave={handleSaveNote} allTags={allTags} />
          <ProfileSheet
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            progressionInfo={progressionInfo}
            onOpenProgression={() => setProgressionOpen(true)}
            onOpenPayPal={() => setPaypalModalOpen(true)}
            serverUrl={serverUrl}
            onServerUrlChange={setServerUrl}
            isOnline={isOnline}
            syncStatus={syncStatus}
            onExport={handleExport}
            onOpenAppearance={() => setAppearanceOpen(true)}
          />
          <AppearanceSheet
            isOpen={appearanceOpen}
            onClose={() => setAppearanceOpen(false)}
            theme={theme}
            onThemeChange={handleThemeChange}
            userLevel={progressionInfo?.level || 1}
            allUnlocked={userProfile?.allUnlocked}
            onOpenProgression={() => setProgressionOpen(true)}
          />
          <ProgressionSheet
            isOpen={progressionOpen}
            onClose={() => setProgressionOpen(false)}
            userProfile={userProfile}
            progressionInfo={progressionInfo}
          />
          <PayPalModal
            isOpen={paypalModalOpen}
            onClose={() => setPaypalModalOpen(false)}
            paypalUrl={userProfile?.paypalUrl}
          />
          <TodayStory
            isOpen={todayOpen}
            onClose={() => setTodayOpen(false)}
            events={events}
            todos={todos}
          />
          <ItemEditSheet
            isOpen={!!selectedEditItem}
            onClose={() => setSelectedEditItem(null)}
            target={selectedEditItem}
            onSave={handleSaveEdit}
            onDelete={handleDeleteEdit}
            allTags={allTags}
          />
          <StatsSheet
            isOpen={statsOpen}
            onClose={() => setStatsOpen(false)}
            journalEntries={journalEntries}
            dreams={dreams}
            wins={wins}
            habits={habits}
          />
          <SearchSheet
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            events={events}
            todos={todos}
            projects={projects}
            notes={notes}
            habits={habits}
            countdowns={countdowns}
            journalEntries={journalEntries}
            dreams={dreams}
            wins={wins}
            onOpenItem={handleOpenFromSearch}
          />

          {xpToast && (
            <div className="xp-toast">
              <span>✨</span> +{xpToast.amount} XP · {xpToast.reason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Venlea;
