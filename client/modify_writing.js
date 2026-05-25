// Script to modify writing.tsx
const fs = require('fs');
const path = 'writing.tsx';

// Read the file
const content = fs.readFileSync(path, 'utf8');

// Split into lines
const lines = content.split('\n');

// Find line 133 (0-indexed) and add editorType after it
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const { showAlert, AlertUI } = useAlert()')) {
    lines.splice(i + 1, 0, '  const [editorType, setEditorType] = useState<\'markdown\' | \'visual\'>(\'markdown\');');
    break;
  }
}

// Write back
fs.writeFileSync(path, lines.join('\n'));

console.log('Added editorType state to writing.tsx');