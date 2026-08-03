"use client";

import { useMemo, useRef, useState } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { EquipmentEditor } from "./EquipmentEditor";
import { EquipmentRoster } from "./EquipmentRoster";
import { CalculatorResultsTable } from "./CalculatorResultsTable";
import { CashFlowChart } from "./CashFlowChart";
import { DEFAULT_CALCULATOR_INPUTS, buildResultsCsv, computeCostPerWorkout, validateEquipmentDraft } from "../../lib/calculator";
import type { CalculatorColumn, EquipmentDraftFieldErrors } from "../../lib/calculator";

// Starts empty (not pre-filled) — the Name field shows genuine placeholder text instead, and Save is
// rejected with "Name is required." until the user types a real name (see validation.ts).
function makeBlankDraft(): CalculatorColumn {
  return { id: "", name: "", inputs: { ...DEFAULT_CALCULATOR_INPUTS } };
}

export function Calculator() {
  const [equipmentList, setEquipmentList] = useState<CalculatorColumn[]>([]);
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const [draft, setDraft] = useState<CalculatorColumn>(makeBlankDraft);
  const [draftSnapshot, setDraftSnapshot] = useState<CalculatorColumn>(draft);
  const [errors, setErrors] = useState<EquipmentDraftFieldErrors>({});
  const [saveErrorMessages, setSaveErrorMessages] = useState<string[]>([]);
  const nextId = useRef(0);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(draftSnapshot);
  const results = useMemo(() => equipmentList.map((e) => computeCostPerWorkout(e.inputs)), [equipmentList]);

  function loadDraft(next: CalculatorColumn, nextSelectedId: string | "new") {
    setDraft(next);
    setDraftSnapshot(next);
    setSelectedId(nextSelectedId);
    setErrors({});
  }

  // Validates and commits the current draft into equipmentList. Returns the validation errors (empty on
  // success) so callers can decide what to do next — e.g. proceed to a different selection on success, or
  // stay put and let the errors show (inline, under each offending field) on failure.
  function commitDraft(): EquipmentDraftFieldErrors {
    const draftErrors = validateEquipmentDraft(draft);
    setErrors(draftErrors);
    if (Object.keys(draftErrors).length > 0) return draftErrors;

    // Trimmed here (not in validateEquipmentDraft, which only checks emptiness) so a name like "  Bike  "
    // is what actually gets persisted to the roster/results, not the untrimmed keystrokes.
    const trimmed = { ...draft, name: draft.name.trim() };

    if (selectedId === "new") {
      const id = `eq-${nextId.current++}`;
      const saved = { ...trimmed, id };
      setEquipmentList((prev) => [...prev, saved]);
      // Also updates `draft` itself (not just the snapshot) and `selectedId` — otherwise draft.id stays
      // "" while draftSnapshot.id becomes the real id, which makes isDirty permanently true afterward.
      setDraft(saved);
      setDraftSnapshot(saved);
      setSelectedId(id);
    } else {
      setEquipmentList((prev) => prev.map((e) => (e.id === trimmed.id ? trimmed : e)));
      setDraft(trimmed);
      setDraftSnapshot(trimmed);
    }
    return {};
  }

  // Clicking off the equipment being edited (selecting another one, or starting a new one) auto-saves the
  // current draft first — no discard prompt. If the draft fails validation, the errors show and the
  // requested switch doesn't happen, same as an unsuccessful manual Save.
  function requestSelect(id: string) {
    if (isDirty && Object.keys(commitDraft()).length > 0) return;
    const item = equipmentList.find((e) => e.id === id);
    if (item) loadDraft(item, id);
  }

  function requestNew() {
    if (isDirty && Object.keys(commitDraft()).length > 0) return;
    loadDraft(makeBlankDraft(), "new");
  }

  // A successful manual Save immediately opens a fresh "+ New equipment" draft pre-filled with the
  // just-used settings (only Name clears) — ready to tweak for the next similar piece of equipment,
  // unlike the auto-save-on-navigate path in requestSelect/requestNew (via loadDraft + makeBlankDraft),
  // which continues on to whichever item the user actually clicked and starts that fully blank.
  //
  // The try/catch and message collection cover two distinct failure modes with one "Error" pill next to
  // Save (see EquipmentEditor): commitDraft() returning validation errors, and an actual thrown exception
  // (nothing throws today, but nothing guards against it either).
  function saveDraft() {
    try {
      const draftErrors = commitDraft();
      if (Object.keys(draftErrors).length > 0) {
        setSaveErrorMessages(Object.values(draftErrors));
        return;
      }
      setSaveErrorMessages([]);
      setDraft((prev) => ({ id: "", name: "", inputs: prev.inputs }));
      setDraftSnapshot((prev) => ({ id: "", name: "", inputs: prev.inputs }));
      setSelectedId("new");
    } catch {
      setSaveErrorMessages(["An unexpected error occurred while saving."]);
    }
  }

  function removeEquipment(id: string) {
    setEquipmentList((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) loadDraft(makeBlankDraft(), "new");
  }

  function downloadResultsCsv() {
    const csv = buildResultsCsv(equipmentList, results);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `elexercise-equipment-analyzer-results-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xl, width: "100%" }}>
      <div>
        <h2 style={{ textAlign: "center", marginTop: 0, textDecoration: "underline", fontSize: theme.typography.size.md }}>Instructions</h2>
        <ol
          style={{
            margin: 0,
            paddingLeft: theme.spacing.xl,
            color: theme.colors.navy,
            fontSize: theme.typography.size.sm,
            lineHeight: 1.4,
          }}
        >
          <li>Create equipment for analysis using the Equipment Analyzer below.</li>
          <li>When you&rsquo;re finished specifying a piece of equipment, hit Save.</li>
          <li>
            Continue to add as many as you&rsquo;d like — you can always edit previously-saved equipment.
          </li>
          <li>Scroll down to see the results.</li>
        </ol>
      </div>

      <div
        style={{
          backgroundColor: "#D6E9FF",
          borderRadius: theme.radii.lg,
          padding: theme.spacing.xl,
          // Static -- this panel's own light-blue background doesn't
          // invert in dark mode.
          color: theme.colors.navyStatic,
        }}
      >
        <div style={{ marginBottom: theme.spacing.lg }}>
          <EquipmentRoster
            equipment={equipmentList}
            selectedId={selectedId}
            onRequestSelect={requestSelect}
            onRequestNew={requestNew}
            onRemove={removeEquipment}
          />
        </div>
        <EquipmentEditor
          draft={draft}
          onChange={(patch) => {
            setDraft((prev) => ({ ...prev, ...patch }));
            setSaveErrorMessages([]);
          }}
          onSave={saveDraft}
          errors={errors}
          saveErrorMessages={saveErrorMessages}
        />
      </div>

      <div
        style={{
          backgroundColor: "#D6E9FF",
          borderRadius: theme.radii.lg,
          padding: theme.spacing.xl,
          // Static -- this panel's own light-blue background doesn't
          // invert in dark mode.
          color: theme.colors.navyStatic,
        }}
      >
        <div style={{ position: "relative" }}>
          <h2 style={{ textAlign: "center", marginTop: 0, textDecoration: "underline", fontSize: theme.typography.size.md }}>Results</h2>
          {equipmentList.length > 0 && (
            <button
              type="button"
              onClick={downloadResultsCsv}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
                borderRadius: theme.radii.pill,
                border: "none",
                background: "#6B7280",
                color: "#FFFFFF",
                fontWeight: theme.typography.weight.semibold,
                fontFamily: "'Clash Display', sans-serif",
                fontSize: theme.typography.size.sm,
                cursor: "pointer",
              }}
            >
              Download CSV
            </button>
          )}
        </div>
        <CalculatorResultsTable equipment={equipmentList} results={results} />
        {equipmentList.length > 0 && (
          <div style={{ marginTop: theme.spacing.xl }}>
            <CashFlowChart equipment={equipmentList} results={results} />
          </div>
        )}
      </div>
    </div>
  );
}
