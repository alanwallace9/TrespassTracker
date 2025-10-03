# TrespassTracker Theming Guide

## Overview
All colors, spacing, and design tokens are centralized in `app/globals.css`. To change the app's appearance, modify values in that file only.

## How It Works

### CSS Variables → Tailwind Classes
All design tokens are defined as CSS variables in `app/globals.css`:

```css
:root {
  --primary: 142 71% 45%;    /* #22c45d - Green */
  --background: 217 33% 17%; /* #1a1f2e - Dark blue-gray */
}
```

These are automatically converted to Tailwind utility classes via `tailwind.config.ts`:

```typescript
colors: {
  primary: 'hsl(var(--primary))',
  background: 'hsl(var(--background))',
}
```

### Usage in Components
Components use Tailwind classes that reference the variables:

```tsx
// ✅ CORRECT - Uses CSS variable via Tailwind class
<button className="bg-primary text-primary-foreground">
  Active
</button>

// ❌ WRONG - Hardcoded color
<button className="bg-[#22c45d]">
  Active
</button>

// ❌ WRONG - Inline style
<button style={{ backgroundColor: '#22c45d' }}>
  Active
</button>
```

## Changing the App Theme

### Example: Change Primary Color from Green to Blue

**Before:**
```css
/* app/globals.css */
--primary: 142 71% 45%;  /* Green #22c45d */
```

**After:**
```css
/* app/globals.css */
--primary: 217 91% 60%;  /* Blue #3B82F6 */
```

That's it! All buttons, badges, and active states automatically update.

## Available Design Tokens

### Brand Colors
| Variable | Default | Usage |
|----------|---------|-------|
| `--primary` | Green (#22c45d) | Primary buttons, active badges, brand elements |
| `--primary-foreground` | Black | Text on primary background |

### Backgrounds
| Variable | Default | Usage |
|----------|---------|-------|
| `--background` | Dark blue-gray (#1a1f2e) | Main app background |
| `--foreground` | White | Main text color |
| `--card` | Lighter blue-gray (#232c3f) | Card/panel backgrounds |
| `--card-foreground` | White | Text on cards |

### Interactive Elements
| Variable | Default | Usage |
|----------|---------|-------|
| `--secondary` | Medium blue-gray (#2a3647) | Secondary buttons |
| `--muted` | Desaturated gray (#3f4854) | Disabled states, subtle backgrounds |
| `--accent` | Green (same as primary) | Hover states, highlights |

### Status Colors
| Variable | Default | Usage |
|----------|---------|-------|
| `--success` | Green (#22c45d) | Active trespass records |
| `--inactive` | Gray (#6b7280) | Expired/inactive records |
| `--destructive` | Red (#E74C3C) | Errors, delete actions |

### Borders & Inputs
| Variable | Default | Usage |
|----------|---------|-------|
| `--border` | Subtle gray (#363f4d) | All borders and separators |
| `--input` | Very dark (#161b26) | Input field backgrounds |
| `--ring` | Green (same as primary) | Focus rings |

### Layout
| Variable | Default | Usage |
|----------|---------|-------|
| `--radius` | 0.5rem (8px) | Border radius for all rounded elements |

## Common Customization Examples

### 1. Change All Rounded Corners
```css
/* Make everything more rounded */
--radius: 1rem;  /* 16px instead of 8px */

/* Make everything square */
--radius: 0;
```

### 2. Change Border Color
```css
/* Lighter borders */
--border: 217 20% 35%;  /* Lighter */

/* Darker borders */
--border: 217 20% 15%;  /* Darker */
```

### 3. Adjust Background Darkness
```css
/* Darker app background */
--background: 217 33% 10%;  /* Much darker */

/* Lighter app background */
--background: 217 33% 25%;  /* Lighter */
```

### 4. Change Status Colors
```css
/* Use orange for active instead of green */
--success: 25 95% 53%;  /* #FF6B35 - Orange */

/* Use yellow for warnings */
--inactive: 45 93% 47%;  /* #F7B801 - Yellow */
```

## HSL Color Format

CSS variables use HSL (Hue, Saturation, Lightness) format without the `hsl()` wrapper:

```css
--primary: 142 71% 45%;
           ↑   ↑   ↑
           H   S   L
```

- **Hue (0-360)**: Color position on color wheel
  - 0° = Red
  - 120° = Green
  - 240° = Blue
  - 142° = Green-cyan

- **Saturation (0-100%)**: Color intensity
  - 0% = Gray
  - 100% = Full color

- **Lightness (0-100%)**: Brightness
  - 0% = Black
  - 50% = Pure color
  - 100% = White

### Converting Hex to HSL
Use an online converter or browser DevTools:
1. Hex: `#22c45d`
2. HSL: `hsl(142, 71%, 45%)`
3. CSS variable format: `142 71% 45%` (remove `hsl()` wrapper)

## Testing Theme Changes

After modifying `globals.css`:

1. **Hot reload** - Changes appear instantly in dev mode (`npm run dev`)
2. **Check all pages** - Test dashboard, login, dialogs
3. **Check all states** - Hover, focus, disabled, active
4. **Dark mode** - If enabled, test both light and dark themes

## Best Practices

### DO ✅
- Use Tailwind classes (`bg-primary`, `text-foreground`)
- Define new colors in `globals.css` first
- Use semantic naming (`--success`, `--destructive`)
- Keep colors consistent across the app

### DON'T ❌
- Hardcode hex colors (`#22c45d`)
- Use inline styles for colors
- Create one-off color variations in components
- Mix hardcoded colors with CSS variables

## Adding New Colors

To add a new brand color:

1. **Define in `globals.css`:**
```css
:root {
  --brand-blue: 217 91% 60%;  /* #3B82F6 */
  --brand-blue-foreground: 0 0% 100%;  /* White */
}
```

2. **Add to `tailwind.config.ts`:**
```typescript
colors: {
  'brand-blue': {
    DEFAULT: 'hsl(var(--brand-blue))',
    foreground: 'hsl(var(--brand-blue-foreground))',
  },
}
```

3. **Use in components:**
```tsx
<div className="bg-brand-blue text-brand-blue-foreground">
  Custom color!
</div>
```

## Current Color Palette

**Brand:**
- Primary Green: `#22c45d` (Active states, primary actions)

**Backgrounds:**
- Main: `#1a1f2e` (Dark blue-gray)
- Card: `#232c3f` (Slightly lighter)
- Input: `#161b26` (Darker)

**Status:**
- Success/Active: `#22c45d` (Green)
- Inactive/Expired: `#6b7280` (Gray)
- Destructive/Error: `#E74C3C` (Red)

**Text:**
- Primary: `#ffffff` (White)
- Muted: `#999999` (Gray)

**Borders:**
- Default: `#363f4d` (Subtle gray)

## Questions?

All colors are in `app/globals.css` - modify there and all components update automatically!
