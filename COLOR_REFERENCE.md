# TrespassTracker Color Reference Guide

> **Last Updated:** October 4, 2025
> **Color System:** OKLCH (simplified from HSL)

---

## Color System Overview

### Three-Level Background System
| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--bg-dark` | `oklch(0.92 0 264)` (92% light) | `oklch(0.1 0 264)` (10% light) | Page background, main container |
| `--bg` | `oklch(0.96 0 264)` (96% light) | `oklch(0.15 0 264)` (15% light) | Cards, dialogs, modals |
| `--bg-light` | `oklch(1 0 264)` (100% white) | `oklch(0.2 0 264)` (20% light) | Input fields, nested sections |

### Text Colors
| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--text` | `oklch(0.15 0 264)` (dark) | `oklch(0.96 0 264)` (light) | Primary text |
| `--text-muted` | `oklch(0.4 0 264)` (medium) | `oklch(0.76 0 264)` (light gray) | Secondary text, labels |

### Border Colors
| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--border` | `oklch(0.6 0 264)` | `oklch(0.4 0 264)` | Strong borders |
| `--border-muted` | `oklch(0.7 0 264)` | `oklch(0.3 0 264)` | Subtle borders, card edges |

### Primary/Accent Color
| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--primary` | `oklch(0.65 0.15 264)` (blue) | `oklch(0.9 0.17 100)` (yellow) | Buttons, links, logo |

### Status Colors (Same for both themes)
| Variable | Color | Usage |
|----------|-------|-------|
| `--status-active` | `oklch(0.5 0.15 145)` (green) | Active records badge |
| `--status-error` | `oklch(0.6 0.2 25)` (red) | Error states, delete actions |
| `--status-warning` | `oklch(0.7 0.15 65)` (orange) | Inactive records, warnings |
| `--status-success` | `oklch(0.5 0.15 145)` (green) | Success messages |

---

## Component-by-Component Breakdown

### DashboardLayout.tsx

| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Page wrapper | `bg-background` | `--bg-dark` | Main page background |
| Header | `bg-background border-b border-border` | `--bg-dark`, `--border` | Sticky header |
| Logo background | `bg-primary` | `--primary` | Shield icon container |
| Logo icon | `text-white` | White | Always white on primary |
| Title text | `text-foreground` | `--text` | "BISD Trespass Management" |
| Subtitle text | `text-muted-foreground` | `--text-muted` | "powered by..." |
| Power button (dark) | Inline style | Yellow `oklch(0.9 0.17 100)` | Glow effect |
| Power button (light) | Inline style | Blue `oklch(0.65 0.15 264)` | Drop shadow |
| User dropdown button | `variant="outline"` | Inherits border colors | |
| Dropdown stats - Total | `text-foreground` | `--text` | Total records count |
| Dropdown stats - Active | `text-status-active` | `--status-active` | Active count (green) |
| Dropdown stats - Inactive | `text-status-warning` | `--status-warning` | Inactive count (orange) |

### RecordCard.tsx

| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Card wrapper | `bg-card border-border` | `--bg` | Card background |
| Card shadow | Inline `boxShadow` | `rgba(0,0,0,0.19)` & `rgba(0,0,0,0.08)` | Layered shadow effect |
| Photo placeholder | `bg-card` | `--bg` | When no photo |
| Initials text | `text-muted-foreground` | `--text-muted` | Large initials (AA) |
| Status badge (active) | `bg-status-active` | `--status-active` | Green badge |
| Status badge (inactive) | `bg-status-inactive` | `--text-muted` | Gray badge |
| Card content area | `bg-card` | `--bg` | Bottom section |
| Name text | `text-foreground` | `--text` | Person's name |
| Metadata text | `text-muted-foreground` | `--text-muted` | Age, location, etc. |

### RecordDetailDialog.tsx

| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Dialog background | `bg-card` (from ui/dialog) | `--bg` | Modal background |
| Title text | `text-foreground` | `--text` | Dialog title |
| Avatar placeholder | `bg-card` | `--bg` | Circle background |
| Avatar initials | `text-muted-foreground` | `--text-muted` | Large initials |
| Field labels | `text-muted-foreground` | `--text-muted` | "Status", "DOB", etc. |
| Field values | `text-foreground` | `--text` | Actual data values |
| Status badge (active) | `bg-status-active text-white` | `--status-active` | Green with white text |

### AddRecordDialog.tsx

| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Dialog background | `bg-card` | `--bg` | Modal background |
| Title | `text-foreground` | `--text` | "Add New Trespass Record" |
| Input fields | `bg-input` | `--bg-light` | Form inputs |
| Input text | `text-foreground` | `--text` | User-entered text |
| Submit button | `bg-status-success text-white` | `--status-success` | Green button |

### SettingsDialog.tsx

| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Dialog background | `bg-card` | `--bg` | Modal background |
| Title | `text-foreground` | `--text` | "Settings" |
| Description | `text-muted-foreground` | `--text-muted` | Subtitle |
| Input field | `bg-input` | `--bg-light` | Display name input |
| Cancel button hover | `hover:bg-red-600 hover:text-white` | Hardcoded red | Destructive style |
| Save button | `bg-primary` (via Button default) | `--primary` | Primary action |

### RecordsTable.tsx

| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Table background | Inherits from page | `--bg-dark` | |
| Row background | Default | Transparent | |
| Active status badge | `bg-status-success text-white` | `--status-success` | Green |
| Expired status badge | `bg-status-error/10 text-status-error` | `--status-error` | Red tint |
| Inactive status badge | `bg-status-error/10 text-status-error` | `--status-error` | Red tint |

### UI Components (shadcn)

#### ui/dialog.tsx
| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Overlay | `bg-black/80` | Hardcoded black 80% | Darkens background |
| Content | `bg-card border-border` | `--bg` | Dialog box |
| Title | `text-foreground` | `--text` | Dialog heading |
| Description | `text-muted-foreground` | `--text-muted` | Subtitle |

#### ui/input.tsx
| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Input field | `bg-input border-border text-foreground` | `--bg-light`, `--border`, `--text` | All inputs |
| Placeholder | `placeholder:text-muted-foreground` | `--text-muted` | Placeholder text |

#### ui/button.tsx
| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Default (primary) | `bg-primary text-primary-foreground` | `--primary` | Primary actions |
| Outline | `border-border text-foreground` | `--border`, `--text` | Secondary actions |
| Destructive | `bg-destructive text-destructive-foreground` | `--status-error` | Delete, cancel |

#### ui/dropdown-menu.tsx
| Element | Class/Style | Variable Used | Notes |
|---------|-------------|---------------|-------|
| Menu background | `bg-popover border-border` | `--bg` | Dropdown panel |
| Menu item hover | `focus:bg-accent` | `--primary` | Hover/focus state |
| Menu text | `text-popover-foreground` | `--text` | Menu item text |

---

## Tailwind Class Reference

### Background Classes
- `bg-background` → `--bg-dark` (page background)
- `bg-card` → `--bg` (cards, dialogs)
- `bg-input` → `--bg-light` (input fields)
- `bg-primary` → `--primary` (buttons, accents)
- `bg-bg-dark` → `--bg-dark` (direct usage)
- `bg-bg` → `--bg` (direct usage)
- `bg-bg-light` → `--bg-light` (direct usage)

### Text Classes
- `text-foreground` → `--text` (primary text)
- `text-muted-foreground` → `--text-muted` (secondary text)
- `text-primary-foreground` → `--bg-dark` (text on primary button)
- `text-text` → `--text` (direct usage)
- `text-text-muted` → `--text-muted` (direct usage)

### Border Classes
- `border-border` → `--border` (strong borders)
- `border-border-muted` → `--border-muted` (subtle borders)

### Status Classes
- `bg-status-active` / `text-status-active` → Green
- `bg-status-error` / `text-status-error` → Red
- `bg-status-warning` / `text-status-warning` → Orange
- `bg-status-success` / `text-status-success` → Green

---

## Common Color Combinations

### Card with Good Contrast
```tsx
<div className="bg-card border border-border-muted">
  <h3 className="text-foreground">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Input Field
```tsx
<input className="bg-input border border-border text-foreground placeholder:text-muted-foreground" />
```

### Status Badge
```tsx
<Badge className="bg-status-active text-white">Active</Badge>
<Badge className="bg-status-warning text-white">Inactive</Badge>
```

### Primary Button
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Save
</Button>
```

---

## Issues to Review

### Potential Improvements
1. **RecordCard shadow** - Currently hardcoded RGBA, could use CSS variable
2. **Power button colors** - Inline styles, could be moved to CSS classes
3. **Cancel button hover** - Hardcoded red, should use destructive color
4. **Dialog overlay** - Hardcoded `bg-black/80`, could use theme variable
5. **Table row hover states** - May need better contrast in dark mode

### Consistency Checks Needed
- [ ] All badges use consistent text color (white vs inherit)
- [ ] All buttons use theme colors (no hardcoded hex)
- [ ] All borders use border-border or border-border-muted
- [ ] All text uses text-foreground or text-muted-foreground
- [ ] Input placeholders all use text-muted-foreground

---

## How to Update Colors

### To change the main background color:
Edit `globals.css` → `:root` → `--bg-dark` (light mode) or `[data-theme="dark"]` → `--bg-dark`

### To change card/dialog backgrounds:
Edit `globals.css` → `:root` → `--bg` (light mode) or `[data-theme="dark"]` → `--bg`

### To change input backgrounds:
Edit `globals.css` → `:root` → `--bg-light` (light mode) or `[data-theme="dark"]` → `--bg-light`

### To change primary accent color:
Edit `globals.css` → `:root` → `--primary` (light mode) or `[data-theme="dark"]` → `--primary`

---

## Testing Checklist

- [ ] View all components in Light mode
- [ ] View all components in Dark mode
- [ ] Check text contrast ratios (≥4.5:1 for WCAG AA)
- [ ] Verify all status colors are visible
- [ ] Check input field visibility
- [ ] Test hover states on all interactive elements
- [ ] Verify border visibility on cards and dialogs
- [ ] Check dropdown menu readability

---

**Maintained by:** Development Team
**For questions:** Review `app/globals.css` for source of truth
