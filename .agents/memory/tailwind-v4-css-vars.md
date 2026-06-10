---
name: Tailwind v4 CSS variable dark mode
description: How to correctly handle dark mode CSS variables in Tailwind v4 so popover/dropdown backgrounds actually change in dark mode.
---

## The rule
In Tailwind v4, `@theme inline { --color-popover: var(--popover) }` may resolve `var(--popover)` at build time (light mode value) rather than lazily at runtime. This means `bg-popover` can render as always-white even in dark mode.

**Fix — two-part:**
1. In `globals.css`, explicitly define all `--color-*` aliases in both `:root` AND `.dark` so CSS cascade always wins:
   ```css
   :root { --color-popover: oklch(1 0 0); }
   .dark  { --color-popover: oklch(0.18 0 0); }
   ```
2. In popover/dropdown/select components, use the raw CSS variable: `bg-[var(--popover)]` instead of `bg-popover`. This generates `background-color: var(--popover)` which is always a runtime lookup.

**Why:** Tailwind v4 `@theme inline` optimises away the CSS custom property hop, potentially inlining the value at compile time. The dark mode `.dark` block sets `--popover` but Tailwind's generated `bg-popover` utility may already have the light value baked in.

**How to apply:** Any new component that uses a popover-style floating surface (DropdownMenu, Select, Dialog, Tooltip, Popover, Command, etc.) should use `bg-[var(--popover)]` directly, not the Tailwind utility alias. Similarly use `text-[var(--popover-foreground)]`, `border-[var(--border)]`, `bg-[var(--accent)]` for interactive states.
