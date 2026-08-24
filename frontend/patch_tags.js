const fs = require('fs');

const appJsPath = "c:\\Users\\alesh\\Desktop\\Venlea\\frontend\\src\\App.js";

let jsContent = fs.readFileSync(appJsPath, "utf-8");

const tagSuggestComp = `
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
    const newVal = value.replace(/(#[a-zA-Z0-9_]*)$/, \`#\${tag} \`);
    onChange({ target: { value: newVal }});
    setShowSuggest(false);
  };

  const suggestions = allTags.filter(t => t.includes(filter)).slice(0, 5);

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
`;

if (!jsContent.includes("TagSuggestInput =")) {
    jsContent = jsContent.replace("// ============ COMPONENTS ============", "// ============ COMPONENTS ============" + tagSuggestComp);
}

// Ensure useMemo is imported
if (!jsContent.includes("useMemo")) {
    jsContent = jsContent.replace("useRef", "useRef, useMemo");
}

// Add allTags to Venlea
const allTagsCode = `  const [wins, setWins] = useState([]);

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
`;

if (!jsContent.includes("const allTags = useMemo")) {
    jsContent = jsContent.replace("  const [wins, setWins] = useState([]);", allTagsCode);
}

fs.writeFileSync(appJsPath, jsContent);
console.log("TagSuggest base patched.");
