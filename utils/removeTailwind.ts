export function removeTailwindClasses(htmlString: string): string {
  const classRegex = /\s+class=(["'])(.*?)\1/g;

  return htmlString.replace(classRegex, (match, quote, classString) => {
    const cleanedClasses = classString
      .split(/\s+/)
      .filter((cls: any) => !isTailwindClass(cls))
      .join(" ");

    return cleanedClasses.length > 0
      ? ` class=${quote}${cleanedClasses}${quote}`
      : "";
  });
}

function isTailwindClass(className: string): boolean {
  const tailwindPrefixes = [
    // Prefixes for responsive, state, or utility variants
    "sm:",
    "md:",
    "lg:",
    "xl:",
    "2xl:",
    "hover:",
    "focus:",
    "active:",
    "group-hover:",
    "focus-within:",
    "dark:",
    "disabled:",
    "visited:",
    "checked:",
    "first:",
    "last:",
    "even:",
    "odd:",
    // Container classes (e.g., flex, grid)
    "flex",
    "grid",
    "block",
    "inline",
    "inline-block",
    "hidden",
    "relative",
    "absolute",
    "fixed",
    "sticky",
    "static",
    // Multi-word classes a likely to be Tailwind, such as certain color, size, typography, etc.
    "overflow-auto",
    "overflow-hidden",
    "overflow-visible",
    "overflow-scroll",
    "clear-left",
    "clear-right",
    "clear-both",
    "clear-none",
    // Others
    "float-right",
    "float-left",
    "float-none",
  ];

  // Pattern builders - likely to match Tailwind patterns
  const tailwindPatterns = [
    /^[mp][trblxyz]?-/, // Margin & padding
    /^(w|h)-(auto|full|screen|\d+|px)$/, // Width & height
    /^(min|max)-(w|h)-(full|screen|[0-9]+|px)$/, // Min/max dimensions
    /^(bg|text|border|placeholder|font|rounded|shadow|align|justify|items|item|content|z|cursor|resize|order|object|overflow|opacity|transform|scale|rotate|translate|skew|origin|transition|duration|ease|delay|whitespace|break|list|appearance|grid|col|row|gap|place|auto)-/, // Effects and positioning
  ];

  // Check for prefix matches
  if (tailwindPrefixes.some((prefix) => className.startsWith(prefix))) {
    return true;
  }

  // Check for pattern matches
  if (tailwindPatterns.some((pattern) => pattern.test(className))) {
    return true;
  }

  // Default assume not a Tailwind class
  return false;
}
