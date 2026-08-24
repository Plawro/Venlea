const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'src', 'App.js');
const appCssPath = path.join(__dirname, 'src', 'App.css');

let appJs = fs.readFileSync(appJsPath, 'utf8');
let appCss = fs.readFileSync(appCssPath, 'utf8');

// --- 1. CSS UPDATES ---
const newCss = `
/* ============ CALENDAR DOTS ============ */
.cal-day-dots {
  display: flex;
  gap: 2px;
  justify-content: center;
  margin-top: 2px;
  height: 4px;
}
.cal-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

/* ============ STATS SHEET ============ */
.stats-kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}
.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}
.stat-label {
  font-size: 13px;
  color: var(--text-dim);
}

.matrix-container {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;
}
.matrix-scroll {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: max-content;
}
.matrix-row {
  display: flex;
  gap: 4px;
}
.matrix-cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
}
.matrix-cell.has-data {
  box-shadow: 0 0 6px var(--dot-color, rgba(255,255,255,0.2));
}

.calendar-extra-items {
  margin-top: 16px;
}
`;

if (!appCss.includes('.cal-day-dots')) {
  appCss += newCss;
}

// --- 2. MOOD COLORS OBJECT ---
const moodColorsCode = `
const moodColors = {
  '😊': '#7ab896', 'Lucid': '#7ab896', 'Clear': '#7ab896', // Happy/Good
  '😐': '#e8b051', // Neutral
  '😢': '#5b9fd4', // Sad
  '😰': '#e07a5f', '😱': '#e07a5f', 'Nightmare': '#e07a5f', // Anxious
  '😠': '#c97a8a', '🤯': '#c97a8a', // Angry
  'Vivid': '#5b9fd4', 'Hazy': '#e8b051' // Dream specific
};
`;
if (!appJs.includes('const moodColors = {')) {
  appJs = appJs.replace('// ============ COMPONENTS ============', moodColorsCode + '\n// ============ COMPONENTS ============');
}

// --- 3. STATS COMPONENT ---
const statsSheetCode = `
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
                    className={\`matrix-cell \${cell.color ? 'has-data' : ''}\`} 
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
`;

if (!appJs.includes('const StatsSheet =')) {
  appJs = appJs.replace('// Search Sheet', statsSheetCode + '\n// Search Sheet');
}

// --- 4. TOPBAR MODIFICATION ---
if (!appJs.includes('onClick={() => setStatsOpen(true)}')) {
  appJs = appJs.replace(
    '<div className="topbar-av" onClick={() => setProfileOpen(true)}>M</div>',
    '<button className="icon-btn" onClick={() => setStatsOpen(true)} style={{ marginRight: 8, fontSize: 18 }}>📊</button>\n        <div className="topbar-av" onClick={() => setProfileOpen(true)}>M</div>'
  );
}

// --- 5. MAIN APP STATE ---
if (!appJs.includes('const [statsOpen, setStatsOpen] = useState(false);')) {
  appJs = appJs.replace(
    'const [searchOpen, setSearchOpen] = useState(false);',
    'const [searchOpen, setSearchOpen] = useState(false);\n  const [statsOpen, setStatsOpen] = useState(false);'
  );
}

// --- 6. RENDER STATS SHEET ---
if (!appJs.includes('<StatsSheet isOpen={statsOpen}')) {
  appJs = appJs.replace(
    '<SearchSheet allTags={allTags} isOpen={searchOpen}',
    `<StatsSheet isOpen={statsOpen} onClose={() => setStatsOpen(false)} journalEntries={journalEntries} dreams={dreams} wins={wins} habits={habits} />\n      <SearchSheet allTags={allTags} isOpen={searchOpen}`
  );
}

// --- 7. CALENDAR SCREEN MODIFICATION ---
// Add props
appJs = appJs.replace(
  `const CalendarScreen = ({ events, todos, editMode, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent, onOpenEdit }) => {`,
  `const CalendarScreen = ({ events, todos, editMode, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent, onOpenEdit, journalEntries = [], dreams = [], wins = [] }) => {`
);

// Add logic to attach dots inside Calendar days loop
const calendarLoopTarget = `const hasEvent = events.some(e => e.date === dateStr) || todos.some(t => t.date === dateStr);
    days.push({ num: j, hasEvent, dateStr });`;
const calendarLoopReplacement = `const hasEvent = events.some(e => e.date === dateStr) || todos.some(t => t.date === dateStr);
    
    // Find dots
    const dayDots = [];
    const dayJ = journalEntries.find(j => j.date === dateStr);
    if (dayJ) dayDots.push(moodColors[dayJ.mood] || '#7ab896');
    const dayD = dreams.find(dr => dr.date === dateStr);
    if (dayD) dayDots.push(moodColors[dayD.quality] || '#5b9fd4');
    if (wins.some(w => w.date === dateStr)) dayDots.push('#e8b051');

    days.push({ num: j, hasEvent, dateStr, dayDots });`;
if (appJs.includes(calendarLoopTarget)) {
  appJs = appJs.replace(calendarLoopTarget, calendarLoopReplacement);
}

// Add dots render to cal-day cell
const calDayTarget = `const hasEvent = events.some(e => e.date === dateStr) || todos.some(t => t.date === dateStr);
    
    // Find dots
    const dayDots = [];`; // Already modified
const calDayRenderTarget = `<div key={i} className={\`cal-day \${d.other ? 'other' : ''} \${d.num === today.getDate() && isCurrentMonth && !d.other ? 'today' : ''} \${d.num === selectedDay && !d.other ? 'sel' : ''} \${d.hasEvent ? 'has-event' : ''}\`} onClick={() => !d.other && setSelectedDay(d.num)}>{d.num}</div>`;
const calDayRenderReplacement = `<div key={i} className={\`cal-day \${d.other ? 'other' : ''} \${d.num === today.getDate() && isCurrentMonth && !d.other ? 'today' : ''} \${d.num === selectedDay && !d.other ? 'sel' : ''} \${d.hasEvent ? 'has-event' : ''}\`} onClick={() => !d.other && setSelectedDay(d.num)}>
            {d.num}
            {!d.other && d.dayDots && d.dayDots.length > 0 && (
              <div className="cal-day-dots">
                {d.dayDots.map((color, idx) => <div key={idx} className="cal-dot" style={{ backgroundColor: color }} />)}
              </div>
            )}
          </div>`;
if (appJs.includes(calDayRenderTarget)) {
  appJs = appJs.replace(calDayRenderTarget, calDayRenderReplacement);
}

// Add logic to get selected day data
const selectedDayDataTarget = `const upcomingTodos = todos.filter(t => t.date && isUpcoming(t.date, 14) && !isToday(t.date)).slice(0, 5);`;
const selectedDayDataReplacement = `const upcomingTodos = todos.filter(t => t.date && isUpcoming(t.date, 14) && !isToday(t.date)).slice(0, 5);
  const dayJournals = journalEntries.filter(j => j.date === selectedDateStr);
  const dayDreams = dreams.filter(d => d.date === selectedDateStr);
  const dayWins = wins.filter(w => w.date === selectedDateStr);`;
if (appJs.includes(selectedDayDataTarget) && !appJs.includes('dayJournals = journalEntries')) {
  appJs = appJs.replace(selectedDayDataTarget, selectedDayDataReplacement);
}

// Render the selected day journals/dreams/wins under "calendar-extra-items" (append to calendar screen)
const calAppendTarget = `        <div className="stitle">Upcoming Events</div>`;
const calAppendReplacement = `      <div className="calendar-extra-items">
        {dayJournals.map((j, i) => (
          <div key={\`j\${i}\`} className="event-card aup small" style={{ animationDelay: \`\${i * 0.03}s\` }}>
            <div className="event-bar" style={{ background: moodColors[j.mood] || '#7ab896' }} />
            <div className="event-info" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('journal', j)} style={{cursor:'pointer'}}>
              <div className="event-name">Journal: {j.title || j.text}</div>
            </div>
          </div>
        ))}
        {dayDreams.map((d, i) => (
          <div key={\`d\${i}\`} className="event-card aup small" style={{ animationDelay: \`\${i * 0.03}s\` }}>
            <div className="event-bar" style={{ background: moodColors[d.quality] || '#5b9fd4' }} />
            <div className="event-info" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('dream', d)} style={{cursor:'pointer'}}>
              <div className="event-name">Dream: {d.title || d.text}</div>
            </div>
          </div>
        ))}
        {dayWins.map((w, i) => (
          <div key={\`w\${i}\`} className="event-card aup small" style={{ animationDelay: \`\${i * 0.03}s\` }}>
            <div className="event-bar" style={{ background: '#e8b051' }} />
            <div className="event-info" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('win', w)} style={{cursor:'pointer'}}>
              <div className="event-name">Win: {w.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stitle">Upcoming Events</div>`;
if (appJs.includes(calAppendTarget) && !appJs.includes('calendar-extra-items')) {
  appJs = appJs.replace(calAppendTarget, calAppendReplacement);
}

// Update App.js rendering of CalendarScreen
const calRenderTarget = `<CalendarScreen
            events={events}
            todos={todos}
            editMode={editMode}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenEdit={handleOpenEdit}
          />`;
const calRenderReplacement = `<CalendarScreen
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
          />`;
appJs = appJs.replace(calRenderTarget, calRenderReplacement);

// Fix potential issue where TopBar 'setStatsOpen' might need to be passed in from Venlea to TopBar
if (appJs.includes('<TopBar')) {
  // If TopBar doesn't accept setStatsOpen as prop, update its definition
  if (!appJs.includes('const TopBar = ({ setSearchOpen, setStatsOpen, setProfileOpen')) {
    appJs = appJs.replace('const TopBar = ({ setSearchOpen, setProfileOpen', 'const TopBar = ({ setSearchOpen, setStatsOpen, setProfileOpen');
    appJs = appJs.replace('<TopBar setSearchOpen={setSearchOpen} setProfileOpen={setProfileOpen}', '<TopBar setSearchOpen={setSearchOpen} setStatsOpen={setStatsOpen} setProfileOpen={setProfileOpen}');
  }
}

fs.writeFileSync(appJsPath, appJs, 'utf8');
fs.writeFileSync(appCssPath, appCss, 'utf8');

console.log('Stats patching complete.');
