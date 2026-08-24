import os

app_js_path = r"c:\Users\alesh\Desktop\Venlea\frontend\src\App.js"
app_css_path = r"c:\Users\alesh\Desktop\Venlea\frontend\src\App.css"

with open(app_js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# 1. Add Search Icon
icon_target = """  Home: ({ size = 15 }) => ("""
search_icon = """  Search: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Home: ({ size = 15 }) => ("""
if "Search: ({" not in js_content:
    js_content = js_content.replace(icon_target, search_icon)

# 2. Modify TopBar
topbar_target = """const TopBar = ({ mode, onModeSwitch, onOpenProfile, editMode, onToggleEditMode }) => (
  <div className="topbar" onClick={onModeSwitch} data-testid="topbar-mode-switch">
    <div className="topbar-row">
      <button
        className={`topbar-edit ${editMode ? 'on' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleEditMode) onToggleEditMode();
        }}
        type="button"
      >
        ✏️
      </button>"""
topbar_replacement = """const TopBar = ({ mode, onModeSwitch, onOpenProfile, onOpenSearch }) => (
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
      </button>"""
js_content = js_content.replace(topbar_target, topbar_replacement)

# 3. Add SearchSheet Component
search_sheet_code = """
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
      const matchText = (title + ' ' + subtitle).toLowerCase();
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
        </div>
      </div>
    </>
  );
};

// ============ MAIN APP ============
"""
if "SearchSheet =" not in js_content:
    js_content = js_content.replace("// ============ MAIN APP ============", search_sheet_code)

# 4. Integrate Search in App
venlea_state_target = """  const [todayOpen, setTodayOpen] = useState(false);"""
venlea_state_replacement = """  const [todayOpen, setTodayOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);"""
js_content = js_content.replace(venlea_state_target, venlea_state_replacement)

# Update TopBar caller in Venlea
topbar_caller_target = """          <TopBar
            mode={mode}
            onModeSwitch={handleModeSwitch}
            onOpenProfile={() => setProfileOpen(true)}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(prev => !prev)}
          />"""
topbar_caller_replacement = """          <TopBar
            mode={mode}
            onModeSwitch={handleModeSwitch}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
          />"""
js_content = js_content.replace(topbar_caller_target, topbar_caller_replacement)

# Helper function to open items from search
search_handler = """  const handleSaveNote = (updated) => {
    if (updated.id) setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    else setNotes(prev => [{ ...updated, id: Date.now() }, ...prev]);
  };

  const handleOpenFromSearch = (type, item) => {
    // Eventually we can open the item edit/view modal here
    // For now, if it's a project/note, open their sheets
    if (type === 'Project') setSelectedProject(item);
    if (type === 'Note') setSelectedNote(item);
  };
"""
js_content = js_content.replace("""  const handleSaveNote = (updated) => {
    if (updated.id) setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    else setNotes(prev => [{ ...updated, id: Date.now() }, ...prev]);
  };""", search_handler)

# Mount SearchSheet
search_mount = """          <TodayStory
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
          />"""
js_content = js_content.replace("""          <TodayStory
            isOpen={todayOpen}
            onClose={() => setTodayOpen(false)}
            events={events}
            todos={todos}
          />""", search_mount)


with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

# Add CSS for SearchSheet
with open(app_css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

search_css = """
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
"""
if ".search-sheet" not in css_content:
    with open(app_css_path, "a", encoding="utf-8") as f:
        f.write(search_css)

print("Done")
