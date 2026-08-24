const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'src', 'App.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// Replace ItemEditSheet to handle BOTH title and text if present
const editSheetRegex = /const ItemEditSheet = \(\{ isOpen, onClose, target, onSave, onDelete, allTags \}\) => \{[\s\S]*?\};\s*\/\/\s*============ MAIN APP/m;

const newItemEditSheet = `const ItemEditSheet = ({ isOpen, onClose, target, onSave, onDelete, allTags }) => {
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
            <div className="sheet-title">{target.type === 'journal' ? 'Journal Entry' : target.type === 'dream' ? 'Dream Log' : target.type === 'win' ? 'Log Win' : \`Edit \${target.type}\`}</div>
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

// ============ MAIN APP`;

appJs = appJs.replace(editSheetRegex, newItemEditSheet);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('ItemEditSheet patched.');
