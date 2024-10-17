export function removeAttributesExceptId(htmlString: string) {
  // Regular expression to match HTML tags with attributes
  const tagRegex = /<(\w+)\s+([^>]*)>/g;

  return htmlString.replace(tagRegex, (match, tag, attributes) => {
    // Regular expression to find the id attribute
    const idRegex = /\s*id\s*=\s*(['"])(.*?)\1/;
    const idMatch = attributes.match(idRegex);

    if (idMatch) {
      // If there's an id, keep only that
      return `<${tag} ${idMatch[0]}>`;
    } else {
      // If there's no id, remove all attributes
      return `<${tag}>`;
    }
  });
}
