const fs = require('fs');

const appJsPath = "c:\\Users\\alesh\\Desktop\\Venlea\\frontend\\src\\App.js";
const appCssPath = "c:\\Users\\alesh\\Desktop\\Venlea\\frontend\\src\\App.css";

let jsContent = fs.readFileSync(appJsPath, "utf-8");

// 1. Add Search Icon
const iconTarget = `  Home: ({ size = 15 }) => (`;
const searchIcon = `  Search: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Home: ({ size = 15 }) => (`;
if (!jsContent.includes("Search: ({")) {
    jsContent = jsContent.replace(iconTarget, searchIcon);
}

// 2. Modify TopBar
const topbarTarget = `const TopBar = ({ mode, onModeSwitch, onOpenProfile, editMode, onToggleEditMode }) => (
  <div className="topbar" onClick={onModeSwitch} data-testid="topbar-mode-switch">
    <div className="topbar-row">
      <button
        className={\`topbar-edit \${editMode ? 'on' : ''}\`}
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleEditMode) onToggleEditMode();
        }}
        type="button"
      >
        ✏️
      </button>`;
const topbarReplacement = `const TopBar = ({ mode, onModeSwitch, onOpenProfile, onOpenSearch }) => (
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
      </button>`;
jsContent = jsContent.replace(topbarTarget, topbarReplacement);

// 3. Add SearchSheet Component
const searchSheetCode = `
// Search Sheet
const SearchSheet = ({ isOpen, onClose, events, todos, projects, notes, habits, countdowns, journalEntries, dreams, wins, onOpenItem }) => {
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
    if (filters.journal) journalEntries.forEach(j => pushResult('Journal', j.text, '', j.date, j));
    if (filters.dreams) dreams.forEach(d => pushResult('Dream', d.text, d.quality, d.date, d));
    if (filters.wins) wins.forEach(w => pushResult('Win', w.text, w.size, w.date, w));
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="search-sheet open">
        <div className="sheet-handle" />
        <div className="sheet-content">
          <div className="sheet-title">Search</div>
          <input 
            type="text" 
            className="sheet-input search-input" 
            placeholder="Search... e.g. text or #tag" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            autoFocus 
          />
          <div className="search-filters">
            {Object.keys(filters).map(f => (
              <div 
                key={f} 
                className={\`filter-chip \${filters[f] ? 'sel' : ''}\`} 
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
        </div>
      </div>
    </>
  );
};

// ============ MAIN APP ============
`;
if (!jsContent.includes("SearchSheet =")) {
    jsContent = jsContent.replace("// ============ MAIN APP ============", searchSheetCode);
}

// 4. Integrate Search in App
const venleaStateTarget = `  const [todayOpen, setTodayOpen] = useState(false);`;
const venleaStateReplacement = `  const [todayOpen, setTodayOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);`;
if (!jsContent.includes("setSearchOpen(false)")) {
    jsContent = jsContent.replace(venleaStateTarget, venleaStateReplacement);
}

// Update TopBar caller in Venlea
const topbarCallerTarget = `          <TopBar
            mode={mode}
            onModeSwitch={handleModeSwitch}
            onOpenProfile={() => setProfileOpen(true)}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(prev => !prev)}
          />`;
const topbarCallerReplacement = `          <TopBar
            mode={mode}
            onModeSwitch={handleModeSwitch}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
          />`;
jsContent = jsContent.replace(topbarCallerTarget, topbarCallerReplacement);

// Helper function to open items from search
const searchHandler = `  const handleSaveNote = (updated) => {
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
`;
if (!jsContent.includes("handleOpenFromSearch")) {
    jsContent = jsContent.replace(`  const handleSaveNote = (updated) => {
    if (updated.id) setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    else setNotes(prev => [{ ...updated, id: Date.now() }, ...prev]);
  };`, searchHandler);
}

// Mount SearchSheet
const searchMount = `          <TodayStory
            isOpen={todayOpen}
            onClose={() => setTodayOpen(false)}
            events={events}
            todos={todos}
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
          />`;
if (!jsContent.includes("<SearchSheet")) {
    jsContent = jsContent.replace(`          <TodayStory
            isOpen={todayOpen}
            onClose={() => setTodayOpen(false)}
            events={events}
            todos={todos}
          />`, searchMount);
}

fs.writeFileSync(appJsPath, jsContent);

// Add CSS for SearchSheet
let cssContent = fs.readFileSync(appCssPath, "utf-8");

const searchCss = `
/* Search Sheet */
.search-sheet {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 90%;
  background: var(--bg); border-radius: 24px 24px 0 0; z-index: 2000;
  transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex; flex-direction: column;
}
.search-sheet.open { transform: translateY(0); }

.search-input {
  width: 100%; margin-bottom: 16px; font-size: 16px; font-weight: 500;
}

.search-filters {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
}
.filter-chip {
  padding: 6px 12px; border-radius: 12px; background: rgba(255,255,255,0.05);
  font-size: 13px; color: var(--txt2); cursor: pointer; text-transform: capitalize;
  border: 1px solid rgba(255,255,255,0.05);
}
.filter-chip.sel {
  background: var(--sun-color); color: #fff; font-weight: 600; border-color: transparent;
}

.search-results {
  flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
  padding-bottom: 40px;
}
.search-result-card {
  background: var(--card-bg); padding: 12px 16px; border-radius: 16px;
  cursor: pointer; border: 1px solid rgba(255,255,255,0.03);
}
.search-result-card:active { transform: scale(0.98); }
.sr-type { font-size: 10px; color: var(--txt3); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
.sr-title { font-size: 15px; font-weight: 600; color: var(--txt); }
.sr-sub { font-size: 13px; color: var(--txt2); margin-top: 4px; }
.sr-date { font-size: 12px; color: var(--txt3); margin-top: 6px; }
`;
if (!cssContent.includes(".search-sheet")) {
    fs.writeFileSync(appCssPath, cssContent + searchCss);
}

console.log("Done");
