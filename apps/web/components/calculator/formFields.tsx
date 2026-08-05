"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";

export const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.xs,
  fontSize: theme.typography.size.sm,
  color: theme.colors.static.ink,
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
// Every consumer of these fields (EquipmentEditor) renders inside Calculator's static light-blue panel,
// so this needs the static (light-surface) error tone, not the themed one -- the plain `error` hex is too
// dark to read reliably and was one of the two pre-existing (non-dark-mode) contrast failures found while
// auditing this token.
export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: theme.typography.size.sm, color: theme.colors.static.errorInk, margin: 0 }}>{children}</p>
  );
}

function fieldInputStyle(error?: string): CSSProperties {
  return error ? { ...inputStyle, border: `1px solid ${theme.colors.static.errorInk}` } : inputStyle;
}

export function FieldNote({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: theme.typography.size.sm,
        color: theme.colors.static.ink,
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
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  error?: string;
  tooltip?: string;
}) {
  return (
    <label style={labelStyle}>
      <span>
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <input
        type="number"
        // valueAsNumber (not Number(e.target.value)) is what actually yields NaN for an emptied or
        // otherwise incomplete/invalid field -- Number("") is 0, which used to force the field back to "0"
        // the instant a user cleared it instead of letting it sit blank until Save.
        value={Number.isNaN(value) ? "" : value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        style={fieldInputStyle(error)}
      />
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}

// Presets + a native color input share one `value` -- no separate "is this custom" flag. A swatch button
// sets `value` to that exact preset string; the native input sets it to whatever the OS picker returns.
// Selection is shown two ways: a swatch gets a highlighted ring when its color case-insensitively matches
// `value`, and the native input's own square always renders the current `value` regardless of whether it
// matches a preset -- so a fully custom color still has a clear "this is selected" indicator even when no
// preset ring lights up. No `error` prop -- a color can never be invalid (see validation.ts).
//
// Deliberately a <div>, not a <label>, unlike every other field in this file -- a <label> can only validly
// associate with one control, but this field has six (five swatches + the native input). A <label> wrapping
// several labelable elements implicitly associates with the *first* one (the first swatch), so any click
// landing in the label's box that isn't itself swallowed by a more specific element -- e.g. a click just
// outside the native OS color-picker popup, meant to dismiss it, that lands back on this field's own
// container -- gets forwarded as a click on that first swatch, silently overwriting whatever color was just
// picked. Same class of bug InfoTooltip below guards against with stopPropagation(); here the fix is to not
// use a <label> at all. Each swatch/the native input already carries its own `aria-label`, so nothing is
// lost for accessibility.
export function ColorField({
  label,
  value,
  presets,
  onChange,
  tooltip,
}: {
  label: string;
  value: string;
  presets: readonly string[];
  onChange: (value: string) => void;
  tooltip?: string;
}) {
  return (
    <div style={labelStyle}>
      <span>
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs, flexWrap: "wrap" }}>
        {presets.map((preset) => {
          const selected = preset.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={preset}
              type="button"
              aria-label={`Use color ${preset}`}
              aria-pressed={selected}
              onClick={() => onChange(preset)}
              style={{
                width: 24,
                height: 24,
                borderRadius: theme.radii.pill,
                border: selected ? `2px solid ${theme.colors.static.ink}` : `1px solid ${theme.colors.border}`,
                background: preset,
                padding: 0,
                cursor: "pointer",
              }}
            />
          );
        })}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Choose a custom color"
          style={{ width: 32, height: 24, padding: 0, border: `1px solid ${theme.colors.border}`, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

// No `error` prop, unlike NumberField/SelectField/TextField -- a checkbox's boolean value can never be
// invalid (see validation.ts), so there's nothing for Save-time validation to reject.
export function CheckboxField({
  label,
  checked,
  onChange,
  tooltip,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
}) {
  return (
    <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
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

// Same rationale as InfoTooltip below (native `title` tooltips are unreliable across browsers), but the
// trigger and content are both caller-supplied instead of a fixed (i) icon + string, so any element (e.g.
// an error pill) can be the hover/focus target.
export function HoverTooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: theme.spacing.xs,
            minWidth: 220,
            padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
            background: theme.colors.static.ink,
            color: "#FFFFFF",
            fontSize: theme.typography.size.sm,
            fontWeight: theme.typography.weight.regular,
            borderRadius: theme.radii.sm,
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
            zIndex: 10,
          }}
        >
          {content}
        </span>
      )}
    </span>
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
            background: theme.colors.static.ink,
            color: "#FFFFFF",
            fontSize: theme.typography.size.sm,
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
// space. `disabled` greys the control out (e.g. a preset picker while its category's "custom" radio is
// selected) rather than hiding it — the field stays visible so its current value is still legible.
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  tooltip,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  tooltip?: string;
  disabled?: boolean;
}) {
  return (
    <label style={labelStyle}>
      <span>
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        style={
          disabled
            ? {
                ...inputStyle,
                opacity: 0.5,
                cursor: "not-allowed",
                backgroundColor: withAlpha(theme.colors.border, 0.08),
              }
            : inputStyle
        }
      >
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
        color: theme.colors.static.ink,
        cursor: "pointer",
      }}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
