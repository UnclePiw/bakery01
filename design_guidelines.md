# Bakery Management Dashboard - Design Guidelines

## Design Approach: Enterprise Dashboard System

**Selected System**: Material Design 3 with dashboard optimizations
**Rationale**: Data-dense operational tool requiring clear information hierarchy, excellent form controls, and real-time status indicators. Material Design provides robust components for inventory management, alerts, and data visualization while maintaining mobile responsiveness for on-the-go employees.

**Key Principles**:
- Clarity over decoration - every element serves a functional purpose
- Quick scanning - employees should find critical info in seconds
- Status-first - alerts and warnings must be immediately visible
- Touch-optimized - designed for tablet and mobile use in bakery environment

---

## Core Design Elements

### A. Color Palette

**Light Mode (Primary):**
- Primary: 211 100% 43% (Deep Blue - trust, reliability)
- Success: 142 71% 45% (Green - healthy stock)
- Warning: 38 92% 50% (Amber - approaching expiration)
- Critical: 0 84% 60% (Red - expired/out of stock)
- Surface: 0 0% 98% (Light gray backgrounds)
- Text Primary: 220 13% 18%
- Text Secondary: 220 9% 46%

**Dark Mode:**
- Primary: 211 100% 60%
- Success: 142 71% 55%
- Warning: 38 92% 60%
- Critical: 0 84% 70%
- Surface: 220 13% 12%
- Surface Elevated: 220 13% 18%
- Text Primary: 0 0% 95%
- Text Secondary: 220 9% 70%

### B. Typography

**Font Stack**: 
- Primary: 'Noto Sans Thai', 'Inter', system-ui, sans-serif (excellent Thai language support)
- Monospace: 'JetBrains Mono', monospace (for numerical data, timestamps)

**Scale**:
- H1 Dashboard Title: 2.5rem / font-bold
- H2 Section Headers: 1.875rem / font-semibold
- H3 Card Titles: 1.25rem / font-semibold
- Body: 1rem / font-normal
- Small/Caption: 0.875rem / font-normal
- Data/Numbers: 1.125rem / font-medium / monospace

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Card spacing: p-6
- Form field gaps: gap-4
- Grid gutters: gap-6

**Grid System**:
- Mobile: Single column stack
- Tablet: 2-column for cards, single for forms
- Desktop: 3-column dashboard grid with sidebar

---

## D. Component Library

### Navigation & Layout

**Top Bar** (sticky, h-16):
- Branch selector dropdown (left)
- Current date/time with edit icon (center)
- Alert bell icon with badge count (right)
- Profile menu (far right)
- Background: Surface elevated with subtle bottom border

**Bottom Navigation** (mobile only, fixed):
- 4 main sections: Dashboard, Stock Entry, Hourly Check, Alerts
- Icon + label format
- Active state with primary color fill

### Dashboard Cards

**Stat Cards**:
- Large number display (3rem, monospace)
- Label below (0.875rem, secondary text)
- Icon top-right corner
- Subtle shadow, rounded-lg
- Color-coded left border (4px) for status indication

**Forecast Card**:
- Bar chart visualization showing hourly demand
- Current hour highlighted
- Gridlines for easy reading
- Legend below chart

**Alert List Card**:
- Grouped by severity (Critical → Warning → Info)
- Each alert: icon + message + timestamp + action button
- Color-coded left accent bar
- Dismissible with swipe gesture (mobile)

### Forms & Input

**Date/Time Adjuster**:
- Large, touch-friendly datetime picker
- Current vs adjusted time comparison view
- Confirm/cancel buttons prominent

**Ingredient Entry Form**:
- Two-tab interface: "Yesterday's Remaining" | "Today's Received"
- Searchable ingredient dropdown with images
- Quantity input (large touch targets, +/- buttons)
- Expiry date picker for new stock
- Batch number input (optional field)
- Running total display at bottom
- Submit button (primary, full-width on mobile)

**Hourly Stock Check**:
- Product grid with images
- Quick increment/decrement buttons
- Current vs counted comparison
- Auto-calculated variance display
- Promotion suggestions appear inline for low-stock items

### Data Display

**Inventory Table**:
- Sortable columns: Name, Quantity, Expiry, Location
- Color-coded rows based on expiry proximity:
  - Green: >7 days
  - Amber: 3-7 days
  - Red: <3 days
- Quick action buttons: Use, Adjust, Move
- Sticky header on scroll

**Production Recommendation Panel**:
- Side-by-side comparison: Forecast vs Current Stock
- Suggested production quantity (calculated, editable)
- Ingredient availability check (green check/red X)
- "Start Production" CTA button

### Alerts & Notifications

**Toast Notifications**:
- Slide from top-right (desktop) or top (mobile)
- Auto-dismiss after 5s (info), 10s (warning), manual (critical)
- Icon + message + action link
- Sound alert for critical notifications

**Hourly Reminder**:
- Full-screen modal (cannot dismiss without action)
- Large clock icon
- "Time to check stock" message
- Direct link to stock check form
- Snooze option (15 min only, once)

**Expiration Alerts**:
- Dedicated alert page accessible from bell icon
- Grouped by time: "Expiring Today" | "This Week" | "Next Week"
- Each item shows: image, name, quantity, exact expiry, suggested action

---

## E. Responsive Breakpoints

- Mobile: < 768px (single column, bottom nav)
- Tablet: 768px - 1024px (2-column cards, side drawer)
- Desktop: > 1024px (3-column, persistent sidebar)

---

## Visual Enhancements

**Micro-interactions**:
- Button press: subtle scale down (0.98)
- Card hover: slight elevation increase
- Input focus: primary color border with glow
- Success action: green checkmark animation

**Loading States**:
- Skeleton screens for data tables
- Spinner for form submissions
- Progressive loading for charts

**Empty States**:
- Friendly illustration (bakery-themed)
- Clear message in Thai
- Primary action button to get started

---

## Thai Language Considerations

- Ensure adequate line-height (1.6) for Thai characters
- Test all form labels and buttons with actual Thai text
- Use Noto Sans Thai for optimal readability
- Right-align numbers even in Thai context
- Date format: DD/MM/YYYY (Thai convention)

---

## Accessibility

- High contrast ratios (WCAG AAA where possible)
- Touch targets minimum 44x44px
- Keyboard navigation for all actions
- Screen reader labels for icons
- Dark mode as default (reduces eye strain in early morning bakery environment)
- Haptic feedback on critical actions (mobile)