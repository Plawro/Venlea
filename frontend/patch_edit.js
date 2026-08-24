const fs = require('fs');

const appJsPath = "c:\\Users\\alesh\\Desktop\\Venlea\\frontend\\src\\App.js";
let jsContent = fs.readFileSync(appJsPath, "utf-8");

const itemEditSheetCode = `
// ============ ITEM EDIT SHEET ============
const ItemEditSheet = ({ isOpen, onClose, target, onSave, onDelete, allTags }) => {
  const [val, setVal] = useState('');

  useEffect(() => {
    if (target?.item) {
       setVal(target.item.title || target.item.name || target.item.text || '');
    }
  }, [target]);

  if (!isOpen || !target) return null;

  const handleSave = () => {
     const updated = { ...target.item };
     if ('name' in updated) updated.name = val;
     else if ('title' in updated) updated.title = val;
     else if ('text' in updated) updated.text = val;
     onSave(target.type, updated);
     onClose();
  };

  const handleDelete = () => {
    onDelete(target.type, target.item.id);
    onClose();
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="add-sheet open">
        <div className="sheet-handle" />
        <div className="sheet-content">
          <div className="sheet-header-row">
            <div className="sheet-title">Edit {target.type}</div>
          </div>

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
      </div>
    </>
  );
};
`;

if (!jsContent.includes("ItemEditSheet =")) {
    jsContent = jsContent.replace("// ============ MAIN APP ============", itemEditSheetCode + "\n// ============ MAIN APP ============");
}

// Add state to Venlea
const stateTarget = "  const [searchOpen, setSearchOpen] = useState(false);";
const stateReplacement = `  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState(null);`;

if (!jsContent.includes("selectedEditItem")) {
    jsContent = jsContent.replace(stateTarget, stateReplacement);
}

// Add handleSaveEdit and handleDeleteEdit
const handlers = `  const handleSaveEdit = (type, updated) => {
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
`;

if (!jsContent.includes("handleSaveEdit")) {
    jsContent = jsContent.replace("  const handleSaveNote = (updated) => {", handlers + "\n  const handleSaveNote = (updated) => {");
}

// Mount ItemEditSheet
const mountTarget = `          <SearchSheet`;
const mountReplacement = `          <ItemEditSheet
            isOpen={!!selectedEditItem}
            onClose={() => setSelectedEditItem(null)}
            target={selectedEditItem}
            onSave={handleSaveEdit}
            onDelete={handleDeleteEdit}
            allTags={allTags}
          />
          <SearchSheet`;

if (!jsContent.includes("<ItemEditSheet")) {
    jsContent = jsContent.replace(mountTarget, mountReplacement);
}

// Update Screen Signatures and Clicks
// HomeScreen
jsContent = jsContent.replace(
  "const HomeScreen = ({ events, todos, onToggleTodo, editMode, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent, onOpenToday }) => {",
  "const HomeScreen = ({ events, todos, onToggleTodo, editMode, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent, onOpenToday, onOpenEdit }) => {"
);
jsContent = jsContent.replace(
  /className="event-info"/g,
  `className="event-info" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('event', typeof evt !== 'undefined' ? evt : undefined)} style={{cursor:'pointer'}}`
);
jsContent = jsContent.replace(
  /className="tc"><div className="ttitle">\{renderTextWithTags\(task\.title\)\}<\/div><\/div>/g,
  `className="tc" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('todo', typeof task !== 'undefined' ? task : undefined)} style={{cursor:'pointer'}}><div className="ttitle">{renderTextWithTags(task.title)}</div></div>`
);

// CalendarScreen
jsContent = jsContent.replace(
  "const CalendarScreen = ({ events, todos, editMode, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent }) => {",
  "const CalendarScreen = ({ events, todos, editMode, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent, onOpenEdit }) => {"
);

// InboxScreen
jsContent = jsContent.replace(
  "const InboxScreen = ({ todos, inboxView, setInboxView, onToggleTodo, editMode, onEditTodo, onDeleteTodo }) => {",
  "const InboxScreen = ({ todos, inboxView, setInboxView, onToggleTodo, editMode, onEditTodo, onDeleteTodo, onOpenEdit }) => {"
);

// JournalScreen
jsContent = jsContent.replace(
  "const JournalScreen = ({ entries, editMode, onEditJournal, onDeleteJournal }) => (",
  "const JournalScreen = ({ entries, editMode, onEditJournal, onDeleteJournal, onOpenEdit }) => ("
);
jsContent = jsContent.replace(
  /className="entry-content"/g,
  `className="entry-content" onClick={(e) => {\n    e.stopPropagation();\n    if (typeof onOpenEdit === 'function') {\n      if (typeof entry !== 'undefined') onOpenEdit('journal', entry);\n      else if (typeof dream !== 'undefined') onOpenEdit('dream', dream);\n      else if (typeof win !== 'undefined') onOpenEdit('win', win);\n    }\n  }} style={{cursor:'pointer'}}`
);

// DreamsScreen
jsContent = jsContent.replace(
  "const DreamsScreen = ({ dreams, editMode, onEditDream, onDeleteDream }) => {",
  "const DreamsScreen = ({ dreams, editMode, onEditDream, onDeleteDream, onOpenEdit }) => {"
);

// WinsScreen
jsContent = jsContent.replace(
  "const WinsScreen = ({ wins, editMode, onEditWin, onDeleteWin }) => (",
  "const WinsScreen = ({ wins, editMode, onEditWin, onDeleteWin, onOpenEdit }) => ("
);

// HabitsScreen
jsContent = jsContent.replace(
  "const HabitsScreen = ({ habits, countdowns, onToggleHabit, editMode, onEditHabit, onDeleteHabit, onEditCountdown, onDeleteCountdown }) => {",
  "const HabitsScreen = ({ habits, countdowns, onToggleHabit, editMode, onEditHabit, onDeleteHabit, onEditCountdown, onDeleteCountdown, onOpenEdit }) => {"
);
jsContent = jsContent.replace(
  / className="habit-name"/g,
  ` className="habit-name" onClick={(e) => { e.stopPropagation(); typeof onOpenEdit === 'function' && onOpenEdit('habit', habit); }} style={{cursor:'pointer'}}`
);
jsContent = jsContent.replace(
  /className="countdown-main"/g,
  `className="countdown-main" onClick={() => typeof onOpenEdit === 'function' && onOpenEdit('countdown', typeof cd !== 'undefined' ? cd : undefined)} style={{cursor:'pointer'}}`
);

// Modify Venlea Screen Rendering
jsContent = jsContent.replace(
  /onOpenToday=\{\(\) => setTodayOpen\(true\)\}/g,
  `onOpenToday={() => setTodayOpen(true)} onOpenEdit={handleOpenEdit}`
);
jsContent = jsContent.replace(
  /onDeleteEvent=\{handleDeleteEvent\}/g,
  `onDeleteEvent={handleDeleteEvent} onOpenEdit={handleOpenEdit}`
);
jsContent = jsContent.replace(
  /onDeleteTodo=\{handleDeleteTodo\}/g,
  `onDeleteTodo={handleDeleteTodo} onOpenEdit={handleOpenEdit}`
);
jsContent = jsContent.replace(
  /onDeleteJournal=\{handleDeleteJournal\}/g,
  `onDeleteJournal={handleDeleteJournal} onOpenEdit={handleOpenEdit}`
);
jsContent = jsContent.replace(
  /onDeleteDream=\{handleDeleteDream\}/g,
  `onDeleteDream={handleDeleteDream} onOpenEdit={handleOpenEdit}`
);
jsContent = jsContent.replace(
  /onDeleteWin=\{handleDeleteWin\}/g,
  `onDeleteWin={handleDeleteWin} onOpenEdit={handleOpenEdit}`
);
jsContent = jsContent.replace(
  /onDeleteCountdown=\{handleDeleteCountdown\}/g,
  `onDeleteCountdown={handleDeleteCountdown} onOpenEdit={handleOpenEdit}`
);

fs.writeFileSync(appJsPath, jsContent);
console.log("Patched ItemEditSheet");
