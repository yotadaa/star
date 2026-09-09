import assert from "node:assert/strict";
import test from "node:test";

import {
  appendTableColumn,
  appendTableRow,
  normalizeTableRows,
  removeTableColumn,
  removeTableRow,
  updateTableCell,
} from "../lib/blog/tableEditor.mjs";

test("normalizes legacy and ragged table rows without losing cell content", () => {
  assert.deepEqual(normalizeTableRows([]), [
    ["Column 1", "Column 2"],
    ["Value", "Value"],
  ]);
  assert.deepEqual(normalizeTableRows([["Header A", "Header B"], ["A | B"]]), [
    ["Header A", "Header B"],
    ["A | B", ""],
  ]);
});

test("updates one cell immutably and preserves literal pipe characters", () => {
  const original = [["Name", "Notes"], ["Nala", ""]];
  const result = updateTableCell(original, 1, 1, "Fast | grounded");

  assert.deepEqual(result, [["Name", "Notes"], ["Nala", "Fast | grounded"]]);
  assert.deepEqual(original, [["Name", "Notes"], ["Nala", ""]]);
});

test("appends rectangular rows and columns", () => {
  const original = [["Name", "Role"], ["Nala", "Guide"]];

  assert.deepEqual(appendTableRow(original), [
    ["Name", "Role"],
    ["Nala", "Guide"],
    ["", ""],
  ]);
  assert.deepEqual(appendTableColumn(original), [
    ["Name", "Role", "Column 3"],
    ["Nala", "Guide", ""],
  ]);
});

test("removes data rows but never the header row", () => {
  const original = [["Name"], ["Nala"], ["Mukti"]];

  assert.deepEqual(removeTableRow(original, 1), [["Name"], ["Mukti"]]);
  assert.deepEqual(removeTableRow(original, 0), original);
});

test("removes columns while retaining the required final column", () => {
  assert.deepEqual(removeTableColumn([["Name", "Role"], ["Nala", "Guide"]], 0), [
    ["Role"],
    ["Guide"],
  ]);
  assert.deepEqual(removeTableColumn([["Name"], ["Nala"]], 0), [["Name"], ["Nala"]]);
});
