const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'src', 'App.js');
const appCssPath = path.join(__dirname, 'src', 'App.css');

let appJs = fs.readFileSync(appJsPath, 'utf8');
let appCss = fs.readFileSync(appCssPath, 'utf8');

// 1. Fix CSS for .tag-suggest-popover
appCss = appCss.replace(
  `.tag-suggest-popover {
  position: absolute; top: calc(100% + 4px); left: 0; width: auto; min-width: 150px;
  background: var(--card-bg); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; z-index: 3000; padding: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}`,
  `.tag-suggest-popover {
  position: absolute; bottom: calc(100% + 4px); left: 0; width: auto; min-width: 150px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 12px; z-index: 3000; padding: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}`
);

// 2. Fix FAB (Add menu) animation glitch
appCss = appCss.replace(
  `.fab-opt {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg); border: 1px solid var(--border2);
  border-radius: 14px; padding: 10px 16px 10px 12px;
  cursor: pointer; backdrop-filter: blur(25px);
  transform: translateY(20px) scale(0.9); opacity: 0;
  animation: fabOptIn .25s ease forwards;
  animation-delay: var(--delay);
  transition: background .15s, transform .1s;
}`,
  `.fab-opt {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg); border: 1px solid var(--border2);
  border-radius: 14px; padding: 10px 16px 10px 12px;
  cursor: pointer; backdrop-filter: blur(25px);
  transform: translateY(20px) scale(0.9); opacity: 0;
  transition: background .15s, transform .25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity .2s;
  transition-delay: var(--delay);
}`
);
appCss = appCss.replace(/@keyframes fabOptIn\s*\{\s*to\s*\{\s*transform:\s*translateY\(0\)\s*scale\(1\);\s*opacity:\s*1;\s*\}\s*\}/, '');
appCss = appCss.replace(/\.fab-menu\.open\s*\.fab-opt\s*\{\s*transform:\s*translateY\(0\)\s*scale\(1\);\s*opacity:\s*1;\s*\}/, '.fab-menu.open .fab-opt { transform: translateY(0) scale(1); opacity: 1; }');


// 3. Inject DraggableSheet abstraction in App.js 
const draggableSheetCode = `
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
    transform: ty ? \`translateY(\${ty}px)\` : 'translateY(0)',
    transition: isDragging.current ? 'none' : 'transform 0.3s ease, max-height 0.3s ease',
    maxHeight: isFull ? '95vh' : '85vh',
  };

  return (
    <>
      {isOpen && <div className="sheet-overlay" onClick={onClose} />}
      <div className={\`\${className} \${isOpen ? 'open' : ''}\`} style={style}>
        <div className="sheet-handle" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} />
        {children}
      </div>
    </>
  );
};
`;

if (!appJs.includes('DRAGGABLE SHEET')) {
  appJs = appJs.replace('// ============ COMPONENTS ============', draggableSheetCode + '\n// ============ COMPONENTS ============');
}

// Modify every sheet to use <DraggableSheet>
// AddFormSheet
appJs = appJs.split('<div className="sheet-overlay" onClick={onClose} />\n      <div className="add-sheet open">\n        <div className="sheet-handle" />').join('<DraggableSheet isOpen={isOpen} onClose={onClose} className="add-sheet">');
appJs = appJs.split('      <div className="sheet-overlay" onClick={onClose} />\n      <div className="add-sheet open">\n        <div className="sheet-handle" />').join('<DraggableSheet isOpen={isOpen} onClose={onClose} className="add-sheet">');

// ProjectSheet
appJs = appJs.split('<div className="sheet-overlay" onClick={() => { setSelectedFolder(null); onClose(); }} />\n      <div className="project-sheet open">\n        <div className="sheet-handle" />').join('<DraggableSheet isOpen={isOpen} onClose={() => { setSelectedFolder(null); onClose(); }} className="project-sheet">');
appJs = appJs.split('        </div>\n      </div>\n    </>\n  );\n};\n\n// Note Sheet').join('        </div >\n      </DraggableSheet>\n  );\n};\n\n// Note Sheet');

// NoteSheet
appJs = appJs.split('<div className="sheet-overlay" onClick={onClose} />\n      <div className="note-sheet open">\n        <div className="sheet-handle" />').join('<DraggableSheet isOpen={isOpen} onClose={onClose} className="note-sheet">');
appJs = appJs.split('        </div>\n      </div>\n    </>\n  );\n};\n\n// ============ SCREENS').join('        </div >\n      </DraggableSheet>\n  );\n};\n\n// ============ SCREENS');

// ProfileSheet
appJs = appJs.split('{isOpen && <div className="sheet-overlay" onClick={onClose} />}\n    <div className={`profile-sheet ${isOpen ? \'open\' : \'\'}`}>\n      <div className="sheet-handle" />').join('<DraggableSheet isOpen={isOpen} onClose={onClose} className="profile-sheet">');
appJs = appJs.split('        </div>\n      </div>\n    </div>\n  </>\n);\n\n// Appearance Sheet').join('        </div>\n      </div>\n    </DraggableSheet>\n  );\n};\n\n// Appearance Sheet');
// Note: ProfileSheet was previously returning <>...</div></> directly so modifying its end might vary, let's use replace instead
appJs = appJs.replace(
  '        </div>\n      </div>\n    </div>\n  </>\n);\n\n// Appearance Sheet',
  '        </div>\n      </div>\n    </DraggableSheet>\n  );\n};\n\n// Appearance Sheet'
);
appJs = appJs.replace(
  '        </div>\n      </div>\n    </div>\n  </>\n);',
  '        </div>\n      </div>\n    </DraggableSheet>\n  );\n};\n' // Fallback
);


// AppearanceSheet
appJs = appJs.split('<div className="sheet-overlay" onClick={onClose} />\n      <div className="appearance-sheet open">\n        <div className="sheet-handle" />').join('<DraggableSheet isOpen={isOpen} onClose={onClose} className="appearance-sheet">');
appJs = appJs.split('          </div>\n        </div>\n      </div>\n    </>\n  );\n};\n\n// ============ AUTH').join('          </div>\n        </div >\n      </DraggableSheet>\n  );\n};\n\n// ============ AUTH');

// SearchSheet
appJs = appJs.split('<div className="sheet-overlay" onClick={onClose} />\n      <div className="search-sheet open">\n        <div className="sheet-handle" />').join('<DraggableSheet isOpen={isOpen} onClose={onClose} className="search-sheet">');
appJs = appJs.split('          </div>\n        </div>\n      </div>\n    </>\n  );\n};\n\n\n// ============ ITEM EDIT SHEET').join('          </div>\n        </div >\n      </DraggableSheet>\n  );\n};\n\n\n// ============ ITEM EDIT SHEET');


// 4. Add Title to Journal and Dream (If not already present)
if (!appJs.includes('placeholder="Title (optional)..."')) {
  appJs = appJs.replace(
    `<TagSuggestInput isTextarea className="sheet-textarea" placeholder="What's on your mind? Use #tags" value={content}`,
    `<TagSuggestInput className="sheet-input" placeholder="Title (optional)..." value={title} onChange={(e) => setTitle(e.target.value)} allTags={allTags} />\n              <TagSuggestInput isTextarea className="sheet-textarea" placeholder="What's on your mind? Use #tags" value={content}`
  );
  appJs = appJs.replace(
    `onAdd('journal', { text: content, mood: mood !== null ? moods[mood] : '', tags });`,
    `onAdd('journal', { title, text: content, mood: mood !== null ? moods[mood] : '', tags });`
  );

  appJs = appJs.replace(
    `<TagSuggestInput isTextarea className="sheet-textarea" placeholder="Describe your dream... Use #tags like #crush" value={content}`,
    `<TagSuggestInput className="sheet-input" placeholder="Title (optional)..." value={title} onChange={(e) => setTitle(e.target.value)} allTags={allTags} />\n              <TagSuggestInput isTextarea className="sheet-textarea" placeholder="Describe your dream... Use #tags like #crush" value={content}`
  );
  appJs = appJs.replace(
    `onAdd('dream', { text: content, mood: mood ?? 0, quality: dreamQuality, tags });`,
    `onAdd('dream', { title, text: content, mood: mood ?? 0, quality: dreamQuality, tags });`
  );
}

// In JournalScreen
if (!appJs.includes('{entry.title && <div className="item-title" style={{marginBottom: 2}}>{entry.title}</div>}')) {
  appJs = appJs.replace(
    `<div className="entry-date">{entry.date}</div>`,
    `<div className="entry-date">{entry.date}</div>\n          {entry.title && <div className="item-title" style={{marginBottom: 4}}>{entry.title}</div>}`
  );
}
// In DreamsScreen
if (!appJs.includes('{dream.title && <div className="item-title" style={{marginBottom: 4}}>{dream.title}</div>}')) {
  appJs = appJs.replace(
    `<div className="entry-date">{dream.date} · {dream.quality}</div>`,
    `<div className="entry-date">{dream.date} · {dream.quality}</div>\n            {dream.title && <div className="item-title" style={{marginBottom: 4}}>{dream.title}</div>}`
  );
}

// In SearchSheet for Journal/Dream
appJs = appJs.replace(
  `journalEntries.forEach(j => pushResult('Journal', j.text, '', j.date, j));`,
  `journalEntries.forEach(j => pushResult('Journal', j.title || j.text, j.title ? j.text : '', j.date, j));`
);
appJs = appJs.replace(
  `dreams.forEach(d => pushResult('Dream', d.text, d.quality, d.date, d));`,
  `dreams.forEach(d => pushResult('Dream', d.title || d.text, d.title ? d.text : d.quality, d.date, d));`
);

// Replace input in SearchSheet to TagSuggestInput
appJs = appJs.replace(
  `const SearchSheet = ({ isOpen, onClose, events, todos, projects, notes, habits, countdowns, journalEntries, dreams, wins, onOpenItem }) => {`,
  `const SearchSheet = ({ isOpen, onClose, events, todos, projects, notes, habits, countdowns, journalEntries, dreams, wins, onOpenItem, allTags }) => {`
);
appJs = appJs.replace(
  `<input \n            type="text" \n            className="sheet-input search-input" \n            placeholder="Search... e.g. text or #tag" \n            value={query} \n            onChange={(e) => setQuery(e.target.value)} \n            autoFocus \n          />`,
  `<TagSuggestInput className="sheet-input search-input" placeholder="Search... e.g. text or #tag" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus allTags={allTags} />`
);
// Pass allTags to SearchSheet inside App.js main render
appJs = appJs.replace(
  `<SearchSheet isOpen={searchOpen}`,
  `<SearchSheet allTags={allTags} isOpen={searchOpen}`
);

// 5. Capacitor Mobile Export
if (!appJs.includes('@capacitor/filesystem')) {
  appJs = appJs.replace(
    `import { notificationService } from "./lib/NotificationService";`,
    `import { notificationService } from "./lib/NotificationService";\nimport { Filesystem, Directory, Encoding } from "@capacitor/filesystem";\nimport { Share } from "@capacitor/share";\nimport { Capacitor } from "@capacitor/core";`
  );
}

const oldExport = `  const handleExport = () => {
    if (typeof window === 'undefined') return;
    const payload = {
      events,
      todos,
      projects,
      notes,
      habits,
      journalEntries,
      dreams,
      wins,
      mode,
      activeTab,
      notesFilter,
      inboxView,
      serverUrl,
      lastSync: syncStatus,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`venlea-backup-\${new Date().toISOString().slice(0, 10)}.json\`;
    a.click();
    URL.revokeObjectURL(url);
  };`;

const handleExportReplacement = `  const handleExport = async () => {
    if (typeof window === 'undefined') return;
    const payload = {
      events, todos, projects, notes, habits, countdowns,
      journalEntries, dreams, wins,
      mode, activeTab, notesFilter, inboxView, serverUrl, lastSync: syncStatus, theme
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const fileName = \`venlea-backup-\${new Date().toISOString().slice(0, 10)}.json\`;

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
  };`;

appJs = appJs.replace(oldExport, handleExportReplacement);

fs.writeFileSync(appJsPath, appJs, 'utf8');
fs.writeFileSync(appCssPath, appCss, 'utf8');

console.log('Patch complete.');
