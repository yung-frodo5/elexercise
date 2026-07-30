"use client";

import { useEffect, useRef } from "react";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { SearchIcon } from "./SearchIcon";

const STYLES_ID = "elex-expandable-search-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLES_ID)) return;
  const style = document.createElement("style");
  style.id = STYLES_ID;
  style.textContent = `
    @keyframes elexExpandableSearchIn {
      from { opacity: 0; transform: translateX(6px); width: 0; }
      to { opacity: 1; transform: translateX(0); width: 168px; }
    }
    .elex-expandable-search {
      width: 168px;
      box-sizing: border-box;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
      animation: elexExpandableSearchIn 160ms ease;
      background: transparent;
      border: none;
      border-radius: 0;
      border-bottom: 1px solid ${withAlpha(theme.colors.border, 0.35)};
      padding: 4px 0;
      color: ${theme.colors.navy};
      font-size: ${theme.typography.size.sm}px;
      font-family: ${theme.typography.fontFamily.web};
    }
    .elex-expandable-search::-webkit-search-decoration,
    .elex-expandable-search::-webkit-search-cancel-button,
    .elex-expandable-search::-webkit-search-results-button,
    .elex-expandable-search::-webkit-search-results-decoration {
      display: none;
    }
    .elex-expandable-search:focus {
      border-bottom-color: ${theme.colors.primaryGreen} !important;
      box-shadow: none !important;
    }
    .elex-expandable-search:-webkit-autofill,
    .elex-expandable-search:-webkit-autofill:hover,
    .elex-expandable-search:-webkit-autofill:focus,
    .elex-expandable-search:-webkit-autofill:active {
      -webkit-text-fill-color: ${theme.colors.navy} !important;
      caret-color: ${theme.colors.navy};
      box-shadow: 0 0 0 1000px ${theme.colors.background} inset !important;
      -webkit-box-shadow: 0 0 0 1000px ${theme.colors.background} inset !important;
      transition: background-color 99999s ease-out;
      border-bottom-color: ${withAlpha(theme.colors.border, 0.35)} !important;
    }
  `;
  document.head.appendChild(style);
}

const iconButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
} as const;

/** Icon that expands into an underline search field. */
export function ExpandableSearch({
  value,
  open,
  onOpenChange,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ensureStyles();
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function clearAndClose() {
    onChange("");
    onOpenChange(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
      {open ? (
        <>
          <input
            ref={inputRef}
            className="elex-expandable-search"
            type="search"
            value={value}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              if (!value.trim()) onOpenChange(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") clearAndClose();
            }}
            placeholder={placeholder}
            aria-label="Search"
          />
          <button type="button" aria-label="Close search" onClick={clearAndClose} style={iconButtonStyle}>
            <SearchIcon size={15} color={theme.colors.secondaryGreen} />
          </button>
        </>
      ) : (
        <button type="button" aria-label="Search" onClick={() => onOpenChange(true)} style={iconButtonStyle}>
          <SearchIcon size={15} color={theme.colors.navy} />
        </button>
      )}
    </div>
  );
}
