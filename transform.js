export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  root.find(j.JSXElement).forEach(path => {
    const openingElement = path.node.openingElement;
    const name = openingElement.name.name;

    if (name === 'input') {
      const typeAttr = openingElement.attributes.find(attr => attr.name && attr.name.name === 'type');
      let typeValue = 'text'; // default
      if (typeAttr && typeAttr.value && typeAttr.value.value) {
        typeValue = typeAttr.value.value;
      }

      if (['text', 'number', 'email', 'tel', 'password', 'search'].includes(typeValue) || !typeAttr) {
        openingElement.name.name = 'TextField';
        if (path.node.closingElement) path.node.closingElement.name.name = 'TextField';
        
        openingElement.attributes = openingElement.attributes.filter(attr => 
          !['style', 'className'].includes(attr.name?.name)
        );
        changed = true;
      } else if (typeValue === 'checkbox') {
        openingElement.name.name = 'Checkbox';
        if (path.node.closingElement) path.node.closingElement.name.name = 'Checkbox';
        openingElement.attributes = openingElement.attributes.filter(attr => 
          !['style', 'className'].includes(attr.name?.name)
        );
        changed = true;
      }
    }
  });

  return changed ? root.toSource() : null;
}
