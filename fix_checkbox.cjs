const fs = require('fs');
let file = 'src/components/ui/Checkbox.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export default function Checkbox\(\{/,
  `const Checkbox = React.forwardRef(({`
);

content = content.replace(
  /\.\.\.props \n\}\) \{/,
  `...props\n}, ref) {`
);

content = content.replace(
  /const inputRef = useRef\(null\);/,
  `const innerRef = useRef(null);\n  const inputRef = ref || innerRef;`
);

// Wait, I need to make sure the replacement works. Let's just rewrite the whole file.
