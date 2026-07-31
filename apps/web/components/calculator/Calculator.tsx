"use client";

import { useMemo, useRef, useState } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { EquipmentEditor } from "./EquipmentEditor";
import { EquipmentRoster } from "./EquipmentRoster";
import { CalculatorResultsTable } from "./CalculatorResultsTable";
import { CashFlowChart } from "./CashFlowChart";
import { DEFAULT_CALCULATOR_INPUTS, computeCostPerWorkout, validateEquipmentDraft } from "../../lib/calculator";
import type { CalculatorColumn, EquipmentDraftFieldErrors } from "../../lib/calculator";

// Starts empty (not pre-filled) — the Name field shows genuine placeholder text instead, and Save is
// rejected with "Name is required." until the user types a real name (see validation.ts).
// `usageRate` defaults to DEFAULT_CALCULATOR_INPUTS' own, but callers pass the just-saved draft's usage
// rate through after a Save — someone adding several pieces of equipment is likely comparing them at the
// same usage rate, so it shouldn't silently reset with every new draft.
function makeBlankDraft(usageRate = DEFAULT_CALCULATOR_INPUTS.usageRate): CalculatorColumn {
  return { id: "", name: "", inputs: { ...DEFAULT_CALCULATOR_INPUTS, usageRate } };
}

export function Calculator() {
  const [equipmentList, setEquipmentList] = useState<CalculatorColumn[]>([]);
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const [draft, setDraft] = useState<CalculatorColumn>(makeBlankDraft);
  const [draftSnapshot, setDraftSnapshot] = useState<CalculatorColumn>(draft);
  const [errors, setErrors] = useState<EquipmentDraftFieldErrors>({});
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

    if (selectedId === "new") {
      const id = `eq-${nextId.current++}`;
      const saved = { ...draft, id };
      setEquipmentList((prev) => [...prev, saved]);
      // Also updates `draft` itself (not just the snapshot) and `selectedId` — otherwise draft.id stays
      // "" while draftSnapshot.id becomes the real id, which makes isDirty permanently true afterward.
      setDraft(saved);
      setDraftSnapshot(saved);
      setSelectedId(id);
    } else {
      setEquipmentList((prev) => prev.map((e) => (e.id === draft.id ? draft : e)));
      setDraftSnapshot(draft);
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

  // A successful manual Save immediately opens a fresh "+ New equipment" draft, ready for the next one —
  // unlike the auto-save-on-navigate path in requestSelect/requestNew, which continues on to whichever
  // item the user actually clicked.
  function saveDraft() {
    if (Object.keys(commitDraft()).length === 0) loadDraft(makeBlankDraft(draft.inputs.usageRate), "new");
  }

  function removeEquipment(id: string) {
    setEquipmentList((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) loadDraft(makeBlankDraft(), "new");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xl, width: "100%" }}>
      <div>
        <h2 style={{ textAlign: "center", marginTop: 0, textDecoration: "underline" }}>Instructions</h2>
        <ol
          style={{
            margin: 0,
            paddingLeft: theme.spacing.xl,
            color: theme.colors.navy,
            fontSize: theme.typography.size.sm,
          }}
        >
          <li>Create equipment for analysis using the Equipment Editor below.</li>
          <li>When you&rsquo;re finished specifying a piece of equipment, hit Save.</li>
          <li>
            Continue to add as many as you&rsquo;d like — you can always edit previously-saved equipment.
          </li>
          <li>Scroll down to see the results.</li>
        </ol>
      </div>

      <div>
        <h2 style={{ textAlign: "center", marginTop: 0, textDecoration: "underline" }}>Equipment Editor</h2>
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
          onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          onSave={saveDraft}
          errors={errors}
        />
      </div>

      <div
        style={{
          backgroundColor: "#D6E9FF",
          borderRadius: theme.radii.lg,
          padding: theme.spacing.xl,
          color: theme.colors.navy,
        }}
      >
        <h2 style={{ textAlign: "center", marginTop: 0, textDecoration: "underline" }}>Results</h2>
        <CalculatorResultsTable equipment={equipmentList} results={results} />
        {equipmentList.length > 0 && (
          <div style={{ marginTop: theme.spacing.xl }}>
            <CashFlowChart equipment={equipmentList} />
          </div>
        )}
      </div>
    </div>
  );
}
