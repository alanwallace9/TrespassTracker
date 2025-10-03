# Clerk Theme Customization Guide

## Location
All Clerk styling is configured in: **`app/layout.tsx`**

## How to Change Colors

### Step 1: Edit `app/layout.tsx`

Find the `<ClerkProvider>` component and modify the `appearance` prop:

```typescript
<ClerkProvider
  appearance={{
    baseTheme: dark,  // Use 'dark' or remove for light theme
    variables: {
      colorPrimary: '#22c45d',           // Primary green (buttons, links)
      colorBackground: '#1a1f2e',        // Main background
      colorInputBackground: '#161b26',   // Input fields background
      colorInputText: '#ffffff',         // Input text color
      colorText: '#ffffff',              // General text color
      colorTextSecondary: '#999999',     // Secondary/muted text
      colorDanger: '#E74C3C',            // Error/danger color
      borderRadius: '0.5rem',            // Border radius for all elements
    },
    elements: {
      // Custom styles for specific Clerk components
      card: 'bg-[#232c3f] border border-[#363f4d]',
      headerTitle: 'text-white',
      formButtonPrimary: 'bg-[#22c45d] hover:bg-[#1fa34e] text-black',
      formFieldInput: 'bg-[#161b26] border-[#363f4d] text-white placeholder:text-[#999999]',
      // ... more elements
    },
  }}
>
```

### Step 2: Color Reference

Match these colors to your design system in `app/globals.css`:

| Variable | Color | Purpose |
|----------|-------|---------|
| `colorPrimary` | `#22c45d` | Primary brand color (buttons, links) |
| `colorBackground` | `#1a1f2e` | Main background |
| `colorInputBackground` | `#161b26` | Input fields |
| `colorText` | `#ffffff` | Primary text |
| `colorTextSecondary` | `#999999` | Muted/secondary text |
| `colorDanger` | `#E74C3C` | Errors, destructive actions |

### Step 3: Save and Test

1. Save `app/layout.tsx`
2. Dev server will auto-reload
3. Log out and visit `/sign-in` to see changes
4. Do a hard refresh if needed: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

## Creating a Light Theme

To create a light theme version:

1. Remove or change `baseTheme: dark` to a light theme
2. Update color values:
   ```typescript
   variables: {
     colorBackground: '#ffffff',        // White background
     colorInputBackground: '#f3f4f6',   // Light gray inputs
     colorText: '#000000',              // Black text
     colorTextSecondary: '#6b7280',     // Gray secondary text
     // Keep colorPrimary the same for brand consistency
   }
   ```

## Available Element Classes

Clerk supports styling these elements (add to `elements` object):

- `card` - The main card container
- `headerTitle` - Sign in/Sign up title
- `headerSubtitle` - Subtitle text
- `formButtonPrimary` - Primary action button (Continue, Sign in)
- `formFieldInput` - All input fields
- `formFieldLabel` - Input labels
- `footerActionLink` - Footer links (Sign up, Forgot password)
- `socialButtonsBlockButton` - Social login buttons (Google, etc.)
- `dividerLine` - Divider lines
- `dividerText` - "OR" text in dividers

## Documentation

Full Clerk theming docs: https://clerk.com/docs/customization/overview

## Notes

- Colors use hex format: `#RRGGBB`
- Classes use Tailwind CSS syntax
- Changes apply to all Clerk components (Sign In, Sign Up, User Profile, etc.)
- Always test in incognito to see changes without cached styles
