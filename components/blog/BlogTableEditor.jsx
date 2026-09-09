"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { SpriteIcon } from "@/components/claude";
import {
  appendTableColumn,
  appendTableRow,
  normalizeTableRows,
  removeTableColumn,
  removeTableRow,
  updateTableCell,
} from "@/lib/blog/tableEditor.mjs";
import styles from "./BlogTableEditor.module.css";

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function AutoHeightCell({ onChange, value, ...props }) {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const computedStyle = window.getComputedStyle(textarea);
    const borderHeight = Number.parseFloat(computedStyle.borderTopWidth)
      + Number.parseFloat(computedStyle.borderBottomWidth);
    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight + borderHeight}px`;
  }, [value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={onChange}
    />
  );
}

export default function BlogTableEditor({ block, onChange }) {
  const shellRef = useRef(null);
  const [announcement, setAnnouncement] = useState("");
  const [pendingFocus, setPendingFocus] = useState(null);
  const headerHintId = useId();
  const rows = normalizeTableRows(block.rows);
  const columnCount = rows[0].length;
  const dataRowCount = Math.max(0, rows.length - 1);

  useLayoutEffect(() => {
    if (!pendingFocus) return;
    const control = shellRef.current?.querySelector(pendingFocus);
    if (!control) return;
    control.focus();
    setPendingFocus(null);
  }, [columnCount, pendingFocus, rows.length]);

  function focusControl(selector) {
    setPendingFocus(selector);
  }

  function changeRows(nextRows, message) {
    onChange({ rows: nextRows });
    if (message) setAnnouncement(message);
  }

  function addRow() {
    const nextRows = appendTableRow(rows);
    changeRows(nextRows, `Added row ${nextRows.length - 1}.`);
    focusControl(`[data-table-cell="${nextRows.length - 1}-0"]`);
  }

  function addColumn() {
    const nextRows = appendTableColumn(rows);
    const newColumnIndex = nextRows[0].length - 1;
    changeRows(nextRows, `Added column ${newColumnIndex + 1}.`);
    focusControl(`[data-table-cell="0-${newColumnIndex}"]`);
  }

  function deleteRow(rowIndex) {
    const nextRows = removeTableRow(rows, rowIndex);
    changeRows(nextRows, `Removed row ${rowIndex}.`);
    const nextRowIndex = Math.min(rowIndex, nextRows.length - 1);
    if (nextRowIndex > 0) {
      focusControl(`[data-table-cell="${nextRowIndex}-0"]`);
    } else {
      focusControl("[data-add-row]");
    }
  }

  function deleteColumn(columnIndex) {
    const nextRows = removeTableColumn(rows, columnIndex);
    changeRows(nextRows, `Removed column ${columnIndex + 1}.`);
    const nextColumnIndex = Math.min(columnIndex, nextRows[0].length - 1);
    focusControl(`[data-table-cell="0-${nextColumnIndex}"]`);
  }

  return (
    <section className={styles.shell} ref={shellRef} aria-label="Table block editor">
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Table block</p>
          <p className={styles.summary}>
            {pluralize(columnCount, "column")} · {pluralize(dataRowCount, "data row")}
          </p>
        </div>
        <div className={styles.actions} role="group" aria-label="Table actions">
          <button type="button" data-add-row onClick={addRow}>
            <SpriteIcon id="icon-plus" size={14} aria-hidden="true" />
            Add row
          </button>
          <button type="button" onClick={addColumn}>
            <SpriteIcon id="icon-plus" size={14} aria-hidden="true" />
            Add column
          </button>
        </div>
      </div>

      <label className={styles.captionField}>
        <span>Table caption</span>
        <input
          className={styles.captionInput}
          value={block.text || ""}
          onChange={(event) => onChange({ text: event.target.value })}
          placeholder="What does this table show?"
        />
        <small>Used to identify the table for readers and assistive technology.</small>
      </label>

      <p className={styles.headerHint} id={headerHintId}>
        The first row is the column header. Edit each label below.
      </p>

      <div
        className={styles.scrollRegion}
        role="region"
        aria-label={`Edit ${block.text || "table"}`}
        aria-describedby={headerHintId}
        tabIndex={0}
      >
        <table className={styles.table}>
          <caption className={styles.visuallyHidden}>Editable table cells</caption>
          <thead>
            <tr>
              <th className={styles.rowLabel} scope="col">Header</th>
              {rows[0].map((cell, columnIndex) => (
                <th scope="col" key={`header-${columnIndex}`}>
                  <div className={styles.cellControl}>
                    <AutoHeightCell
                      data-table-cell={`0-${columnIndex}`}
                      value={cell}
                      onChange={(event) => changeRows(
                        updateTableCell(rows, 0, columnIndex, event.target.value),
                      )}
                      aria-label={`Header, column ${columnIndex + 1}`}
                      placeholder={`Column ${columnIndex + 1}`}
                    />
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => deleteColumn(columnIndex)}
                      disabled={columnCount === 1}
                      aria-label={`Remove column ${columnIndex + 1}`}
                      title={columnCount === 1 ? "A table needs at least one column" : `Remove column ${columnIndex + 1}`}
                    >
                      <SpriteIcon id="icon-trash" size={13} aria-hidden="true" />
                    </button>
                  </div>
                </th>
              ))}
              <th className={styles.rowActionCell} scope="col">
                <span className={styles.visuallyHidden}>Row actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {dataRowCount === 0 ? (
              <tr>
                <th className={styles.rowLabel} scope="row">Row</th>
                <td className={styles.emptyCell} colSpan={columnCount}>
                  No data rows yet. Add a row to continue.
                </td>
                <td className={styles.rowActionCell} />
              </tr>
            ) : rows.slice(1).map((row, dataIndex) => {
              const rowIndex = dataIndex + 1;
              return (
                <tr key={`row-${rowIndex}`}>
                  <th className={styles.rowLabel} scope="row">Row {rowIndex}</th>
                  {row.map((cell, columnIndex) => (
                    <td key={`cell-${rowIndex}-${columnIndex}`}>
                      <AutoHeightCell
                        data-table-cell={`${rowIndex}-${columnIndex}`}
                        value={cell}
                        onChange={(event) => changeRows(
                          updateTableCell(rows, rowIndex, columnIndex, event.target.value),
                        )}
                        aria-label={`Row ${rowIndex}, column ${columnIndex + 1}`}
                        placeholder="Empty cell"
                      />
                    </td>
                  ))}
                  <td className={styles.rowActionCell}>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => deleteRow(rowIndex)}
                      aria-label={`Remove row ${rowIndex}`}
                      title={`Remove row ${rowIndex}`}
                    >
                      <SpriteIcon id="icon-trash" size={13} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={styles.announcement} aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
