# FinBox

FinBox is a frontend dashboard project for financial analytics, focused on clean UI architecture, data visualization patterns, and performance-aware implementation.

🔗 Live demo: https://den-dev-web.github.io/finbox/

---

## 📌 About the Project

FinBox represents a financial analytics dashboard with structured layouts, reusable UI components, and interactive data presentation.  
The project demonstrates how a **data-driven interface** can be built with a strong emphasis on layout systems, accessibility, and maintainable frontend architecture.

---

## ⚙️ Tech Stack

### Core
- **HTML5** — semantic markup
- **CSS3** — modern layout techniques and component styling
- **JavaScript (ES6+)** — application logic and interactivity

### Tooling
- **Vite** — development server and build tool
- **npm** — dependency management
- **PostCSS / Autoprefixer** — cross-browser CSS support
- **ESLint / Prettier** — code quality and formatting

### Styling Architecture
- **ITCSS** — layered CSS architecture
- **BEM** — component naming and isolation
- **CSS Custom Properties** — design tokens and theming

### Assets & Resources
- Custom fonts and icon assets
- Static mock data for charts and metrics

### Testing
- Manual UI and interaction testing

---

## 🧩 Architecture & Development Decisions

- Semantic HTML structure with accessibility in mind:
  - ARIA attributes
  - visible focus styles
  - keyboard-accessible interactions
- Responsive layout:
  - mobile-first approach
  - flexible grid systems
  - limited and meaningful breakpoints
- Performance considerations:
  - optimized and lazy-loaded images
  - minimized CSS and JavaScript output
- Code organization:
  - clear folder structure separating layout objects, components, and utilities
  - predictable naming and responsibility boundaries
- Reusability:
  - shared CSS variables for spacing, colors, and typography
  - reusable UI components
- Cross-browser support:
  - tested in modern versions of Chrome, Firefox, and Safari

---

## ✨ Key Features

- Dashboard-style layout for analytics data
- Responsive grid system for widgets and charts
- Reusable UI components (cards, tables, controls)
- Clean visual hierarchy for data presentation
- Accessible and keyboard-friendly interface

---

## 🎯 What This Project Demonstrates

- Ability to design and implement dashboard-style UIs
- Strong CSS architecture using ITCSS and BEM
- Attention to accessibility and usability
- Performance-aware frontend decisions
- Clean, scalable code organization suitable for real-world products

---

## 🧪 Local Development

The project can be run locally using the development server:

```bash
npm install
npm run dev
