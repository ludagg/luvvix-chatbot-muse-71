
/**
 * Format markdown tables to ensure proper alignment and structure
 */
export function formatMarkdownTables(text: string): string {
  if (!text.includes('|')) return text;

  // Split the text into lines
  const lines = text.split('\n');
  const formattedLines = [];
  
  let inTable = false;
  let tableRows: string[] = [];
  let columnWidths: number[] = [];
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableHeaderOrRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    
    // Check if this is a table header or separator
    if (isTableHeaderOrRow) {
      if (!inTable) {
        // Start of a table
        inTable = true;
        tableRows = [line];
        
        // Calculate initial column widths
        const cells = line.split('|').slice(1, -1);
        columnWidths = cells.map(cell => cell.trim().length);
        
        // Look ahead to see if next line is a separator
        if (i + 1 < lines.length && lines[i + 1].includes('|-')) {
          tableRows.push(lines[i + 1]);
          i++; // Skip the separator line in the next iteration
        } else {
          // Add a proper separator if missing
          const separator = '|' + columnWidths.map(width => '-'.repeat(Math.max(3, width + 2))).join('|') + '|';
          tableRows.push(separator);
        }
      } else {
        // Continue the current table
        tableRows.push(line);
        
        // Update column widths
        const cells = line.split('|').slice(1, -1);
        cells.forEach((cell, idx) => {
          if (idx < columnWidths.length) {
            columnWidths[idx] = Math.max(columnWidths[idx], cell.trim().length);
          }
        });
      }
    } else if (inTable && line.trim() === '') {
      // End of a table
      const formattedTable = formatTable(tableRows, columnWidths);
      formattedLines.push(...formattedTable);
      formattedLines.push(''); // Add an empty line
      inTable = false;
      tableRows = [];
      columnWidths = [];
    } else if (inTable) {
      // Non-empty line but not a table row - end the table
      const formattedTable = formatTable(tableRows, columnWidths);
      formattedLines.push(...formattedTable);
      formattedLines.push(line); // Add the current line
      inTable = false;
      tableRows = [];
      columnWidths = [];
    } else {
      // Regular line, not in a table
      formattedLines.push(line);
    }
  }
  
  // Handle case where table is at the end of the text
  if (inTable && tableRows.length > 0) {
    const formattedTable = formatTable(tableRows, columnWidths);
    formattedLines.push(...formattedTable);
  }
  
  return formattedLines.join('\n');
}

/**
 * Format a table with consistent column widths
 */
function formatTable(rows: string[], columnWidths: number[]): string[] {
  return rows.map((row, rowIndex) => {
    if (row.includes('|-')) {
      // This is a separator row
      return '|' + columnWidths.map(width => '-'.repeat(width + 2)).join('|') + '|';
    }
    
    // This is a content row
    const cells = row.split('|').slice(1, -1);
    return '|' + cells.map((cell, idx) => {
      if (idx < columnWidths.length) {
        const padding = columnWidths[idx] - cell.trim().length;
        return ' ' + cell.trim() + ' '.repeat(padding) + ' ';
      }
      return ' ' + cell.trim() + ' ';
    }).join('|') + '|';
  });
}
