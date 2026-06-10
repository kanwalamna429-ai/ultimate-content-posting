---
name: Tailwind v4 CSS variable dark mode
description: How to correctly handle dark mode CSS variables in Tailwind v4 so popover/dropdown backgrounds always render with the right color, permanently.
---

## The rule
In Tailwind v4 + Turbopack, `bg-[var(--popover)]` utility classes for portal-rendered components (DropdownMenu, Select, Combobox, Tooltip, etc.) are **not reliably scanned and emitted**. The class simply never appears in the output CSS, leaving the background transparent.

**Permanent fix — three layers:**

### 1. `globals.css` — plain CSS rules targeting Radix ARIA roles (highest priority)
Add these directly in `globals.css` **outside any @layer**. They use `!important` and target Radix UI's own ARIA attributes, so they apply regardless of Tailwind class generation:
```css
[role="menu"] {
  background-color: var(--popover) !important;
  color: var(--popover-foreground) !important;
  border-color: var(--border) !important;
}
[role="listbox"] {
  background-color: var(--popover) !important;
  color: var(--popover-foreground) !important;
  border-color: var(--border) !important;
}
[data-radix-popper-content-wrapper] > * {
  background-color: var(--popover) !important;
  color: var(--popover-foreground) !important;
  border-color: var(--border) !important;
}
[role="dialog"] {
  background-color: var(--popover) !important;
  color: var(--popover-foreground) !important;
  border-color: var(--border) !important;
}
```

### 2. `globals.css` — explicit `--color-*` aliases in both `:root` and `.dark`
```css
:root  { --color-popover: oklch(1 0 0);    --color-popover-foreground: oklch(0.145 0 0); }
.dark  { --color-popover: oklch(0.18 0 0); --color-popover-foreground: oklch(0.985 0 0); }
```

### 3. Component inline `style` prop as a second fallback
On `DropdownMenuContent`, `SelectContent`, `DropdownMenuSubContent`:
```tsx
style={{ backgroundColor: "var(--popover)", color: "var(--popover-foreground)", ...style }}
```

**Why layer 1 is the real fix:** Tailwind v4 Turbopack does not walk portal-rendered component trees the same way it scans static files. The `bg-[var(--popover)]` class may be generated for the component definition file but then tree-shaken or never matched. Plain CSS `[role="menu"] { ... }` is never subject to Tailwind's scanning.

**Why:** CSS custom properties (`--popover`) cascade normally through the DOM. `<html class="dark">` → `<body>` → portal div — the cascade reaches portals fine. The problem is purely that the Tailwind *utility class* is missing, not that the CSS variable is unresolvable.

**How to apply:** For any new floating/portal component, add its ARIA role to the globals.css block above instead of relying on Tailwind class generation.
