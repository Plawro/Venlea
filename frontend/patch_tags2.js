const fs = require('fs');

const appJsPath = "c:\\Users\\alesh\\Desktop\\Venlea\\frontend\\src\\App.js";
let jsContent = fs.readFileSync(appJsPath, "utf-8");

// 1. Update AddFormSheet signature
jsContent = jsContent.replace(
  "const AddFormSheet = ({ isOpen, onClose, itemType, onAdd }) => {",
  "const AddFormSheet = ({ isOpen, onClose, itemType, onAdd, allTags = [] }) => {"
);

// Todo Form inside AddFormSheet
jsContent = jsContent.replace(
  /<input\s*type="text"\s*className="sheet-input"\s*placeholder="What needs to be done\? Use #tags"\s*value=\{title\}\s*onChange=\{\(e\) => setTitle\(e\.target\.value\)\}\s*autoFocus\s*\/>/,
  `<TagSuggestInput
    className="sheet-input"
    placeholder="What needs to be done? Use #tags"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    autoFocus
    allTags={allTags}
  />`
);

// Event Form inside AddFormSheet
jsContent = jsContent.replace(
  /<input type="text" className="sheet-input" placeholder="Event name\.\.\. Use #tags" value=\{title\} onChange=\{\(e\) => setTitle\(e\.target\.value\)\} autoFocus \/>/,
  `<TagSuggestInput className="sheet-input" placeholder="Event name... Use #tags" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus allTags={allTags} />`
);

// Note Form (title)
jsContent = jsContent.replace(
  /<input type="text" className="sheet-input" placeholder="Note title\.\.\." value=\{title\} onChange=\{\(e\) => setTitle\(e\.target\.value\)\} autoFocus \/>/,
  `<TagSuggestInput className="sheet-input" placeholder="Note title..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus allTags={allTags} />`
);

// Note Form (textarea)
jsContent = jsContent.replace(
  /<textarea className="sheet-textarea" placeholder="Write your note\.\.\. Use #tags" value=\{content\} onChange=\{\(e\) => setContent\(e\.target\.value\)\} rows=\{4\} \/>/,
  `<TagSuggestInput isTextarea className="sheet-textarea" placeholder="Write your note... Use #tags" value={content} onChange={(e) => setContent(e.target.value)} rows={4} allTags={allTags} />`
);

// Journal Form
jsContent = jsContent.replace(
  /<textarea className="sheet-textarea" placeholder="What's on your mind\? Use #tags" value=\{content\} onChange=\{\(e\) => setContent\(e\.target\.value\)\} rows=\{5\} autoFocus \/>/,
  `<TagSuggestInput isTextarea className="sheet-textarea" placeholder="What's on your mind? Use #tags" value={content} onChange={(e) => setContent(e.target.value)} rows={5} autoFocus allTags={allTags} />`
);

// Dream Form
jsContent = jsContent.replace(
  /<textarea className="sheet-textarea" placeholder="Describe your dream\.\.\. Use #tags like #crush" value=\{content\} onChange=\{\(e\) => setContent\(e\.target\.value\)\} rows=\{4\} autoFocus \/>/,
  `<TagSuggestInput isTextarea className="sheet-textarea" placeholder="Describe your dream... Use #tags like #crush" value={content} onChange={(e) => setContent(e.target.value)} rows={4} autoFocus allTags={allTags} />`
);

// Win Form
jsContent = jsContent.replace(
  /<input type="text" className="sheet-input" placeholder="What did you accomplish\? Use #tags" value=\{title\} onChange=\{\(e\) => setTitle\(e\.target\.value\)\} autoFocus \/>/,
  `<TagSuggestInput className="sheet-input" placeholder="What did you accomplish? Use #tags" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus allTags={allTags} />`
);

// 2. Update NoteSheet signature and inputs
jsContent = jsContent.replace(
  "const NoteSheet = ({ isOpen, onClose, note, onSave }) => {",
  "const NoteSheet = ({ isOpen, onClose, note, onSave, allTags = [] }) => {"
);
jsContent = jsContent.replace(
  /<input type="text" className="note-title-input" placeholder="Note title" value=\{title\} onChange=\{\(e\) => setTitle\(e\.target\.value\)\} \/>/,
  `<TagSuggestInput className="note-title-input" placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} allTags={allTags} />`
);
jsContent = jsContent.replace(
  /<textarea className="note-textarea" placeholder="Write your note\.\.\. Use #tags anywhere" value=\{content\} onChange=\{\(e\) => setContent\(e\.target\.value\)\} rows=\{10\} \/>/,
  `<TagSuggestInput isTextarea className="note-textarea" placeholder="Write your note... Use #tags anywhere" value={content} onChange={(e) => setContent(e.target.value)} rows={10} allTags={allTags} />`
);

// 3. Mount in Venlea
jsContent = jsContent.replace(
  "<AddFormSheet isOpen={!!selectedItemType} onClose={() => setSelectedItemType(null)} itemType={selectedItemType} onAdd={handleAdd} />",
  "<AddFormSheet isOpen={!!selectedItemType} onClose={() => setSelectedItemType(null)} itemType={selectedItemType} onAdd={handleAdd} allTags={allTags} />"
);
jsContent = jsContent.replace(
  "<NoteSheet isOpen={!!selectedNote} onClose={() => setSelectedNote(null)} note={selectedNote} onSave={handleSaveNote} />",
  "<NoteSheet isOpen={!!selectedNote} onClose={() => setSelectedNote(null)} note={selectedNote} onSave={handleSaveNote} allTags={allTags} />"
);

fs.writeFileSync(appJsPath, jsContent);
console.log("Patched UI with TagSuggestInput");

// Append CSS
const appCssPath = "c:\\Users\\alesh\\Desktop\\Venlea\\frontend\\src\\App.css";
let cssContent = fs.readFileSync(appCssPath, "utf-8");

const popoverCss = `
.tag-suggest-popover {
  position: absolute; top: calc(100% + 4px); left: 0; width: auto; min-width: 150px;
  background: var(--card-bg); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; z-index: 3000; padding: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.tag-suggest-item {
  padding: 8px 12px; font-size: 13px; color: var(--txt); cursor: pointer; border-radius: 8px;
}
.tag-suggest-item:hover { background: rgba(255,255,255,0.05); color: var(--sun-color); }
`;
if (!cssContent.includes(".tag-suggest-popover")) {
    fs.writeFileSync(appCssPath, cssContent + popoverCss);
}
