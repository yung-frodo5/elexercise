"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { theme } from "@exercise-tracker/design-tokens";

export const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.xs,
  fontSize: theme.typography.size.sm,
  color: theme.colors.navy,
};

export const inputStyle: CSSProperties = {
  padding: theme.spacing.xs,
  border: `1px solid ${theme.colors.border}`,
  fontSize: theme.typography.size.md,
  width: "100%",
  boxSizing: "border-box",
};

// Inline validation message, rendered directly under the offending field (see validation.ts) rather than
// in one generic list — the field itself also gets an error-colored border via `errorInputStyle`.
export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: theme.typography.size.xs, color: theme.colors.error, margin: 0 }}>{children}</p>
  );
}

function fieldInputStyle(error?: string): CSSProperties {
  return error ? { ...inputStyle, border: `1px solid ${theme.colors.error}` } : inputStyle;
}

export function FieldNote({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: theme.typography.size.xs,
        color: theme.colors.navy,
        margin: 0,
        // Grows faster than the field next to it, so extra horizontal space
        // goes to the descriptive text rather than the (fixed-content) input.
        flex: "3 1 200px",
        minWidth: 0,
      }}
    >
      {children}
    </p>
  );
}

export function FieldWithNote({ field, note }: { field: ReactNode; note: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.lg, alignItems: "center" }}>
      <div style={{ flex: "1 1 160px", minWidth: 0 }}>{field}</div>
      <FieldNote>{note}</FieldNote>
    </div>
  );
}

// No longer clamps to `min` on change — an out-of-range or emptied (NaN) value just passes through as
// typed. Validation happens once, at Save time (see lib/calculator/validation.ts), instead of silently
// clamping mid-keystroke.
export function NumberField({
  label,
  value,
  onChange,
  min,
  step,
  error,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  error?: string;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={fieldInputStyle(error)}
      />
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={fieldInputStyle(error)}
      />
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}

// Native `title` tooltips turned out to be unreliable (inconsistent/no-show across browsers), so this
// renders its own hover/focus-driven tooltip bubble instead — fully within our control, not dependent on
// the browser's own tooltip UI.
function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-block", marginLeft: theme.spacing.xs }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      // This sits inside a <label> for a <select> — without stopping the click, the browser's
      // label-forwards-click-to-control behavior would open the dropdown when the icon is clicked.
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <span tabIndex={0} role="img" aria-label={text} style={{ cursor: "help", opacity: 0.6 }}>
        {theme.icons.info}
      </span>
      {visible && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: theme.spacing.xs,
            width: 220,
            padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
            background: theme.colors.navy,
            color: "#FFFFFF",
            fontSize: theme.typography.size.xs,
            fontWeight: theme.typography.weight.regular,
            borderRadius: theme.radii.sm,
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
            zIndex: 10,
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

// `tooltip`, when given, renders a small (i) glyph next to the label with a hover/focus-triggered tooltip
// bubble — a genuine hover-only explanation, rather than always-visible caption text taking up permanent
// space.
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  tooltip,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  tooltip?: string;
}) {
  return (
    <label style={labelStyle}>
      <span>
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} style={inputStyle}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// A single radio button. `name` must be shared by every option in the same mutually-exclusive group, and
// distinct from any other group's `name` on the page (native radio grouping is name-scoped).
export function RadioOption({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        fontSize: theme.typography.size.sm,
        color: theme.colors.navy,
        cursor: "pointer",
      }}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
