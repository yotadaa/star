const DEFAULT_TABLE_ROWS = [
  ["Column 1", "Column 2"],
  ["Value", "Value"],
];

export function normalizeTableRows(rows) {
  const source = Array.isArray(rows) && rows.length > 0 ? rows : DEFAULT_TABLE_ROWS;
  const columnCount = Math.max(
    1,
    ...source.map((row) => (Array.isArray(row) ? row.length : 0)),
  );

  return source.map((row) => (
    Array.from({ length: columnCount }, (_, columnIndex) => String(row?.[columnIndex] ?? ""))
  ));
}

export function updateTableCell(rows, rowIndex, columnIndex, value) {
  return normalizeTableRows(rows).map((row, currentRowIndex) => (
    currentRowIndex === rowIndex
      ? row.map((cell, currentColumnIndex) => (
        currentColumnIndex === columnIndex ? String(value) : cell
      ))
      : row
  ));
}

export function appendTableRow(rows) {
  const normalized = normalizeTableRows(rows);
  return [...normalized, Array.from({ length: normalized[0].length }, () => "")];
}

export function appendTableColumn(rows) {
  const normalized = normalizeTableRows(rows);
  const nextColumnNumber = normalized[0].length + 1;

  return normalized.map((row, rowIndex) => [
    ...row,
    rowIndex === 0 ? `Column ${nextColumnNumber}` : "",
  ]);
}

export function removeTableRow(rows, rowIndex) {
  const normalized = normalizeTableRows(rows);
  if (rowIndex <= 0 || rowIndex >= normalized.length) return normalized;
  return normalized.filter((_, currentRowIndex) => currentRowIndex !== rowIndex);
}

export function removeTableColumn(rows, columnIndex) {
  const normalized = normalizeTableRows(rows);
  if (normalized[0].length <= 1 || columnIndex < 0 || columnIndex >= normalized[0].length) {
    return normalized;
  }

  return normalized.map((row) => row.filter((_, currentColumnIndex) => currentColumnIndex !== columnIndex));
}
