# Detectdiv

Detectdiv is a Chrome extension that helps you inspect content on a web page

### **Core Features**

### **1. URL Manipulation Tools**

The DevTools panel must include controls that allow forcing and modifying navigation parameters.
This includes:

- **Deploy version override**

  - Input field that injects a forced deploy ID into the URL

    - Example: `?d=123`

  - The tool must automatically override existing `d=` parameters.

- **Forced `outputType` selection**

  - Dropdown with dynamic options (add, edit, delete)
  - Example: `?outputType=amp-type`

- **Custom forced parameters**

  - Ability to toggle or inject parameters such as:

    - `?token=latest`
    - Additional parameters may be added later.

- **"Clear all" button**

  - Removes all extension-controlled parameters
  - Restores the page to its normal navigation state.

## **Getting Started**

These instructions will help you set up, develop, and run the Detectdiv extension locally.

### **Prerequisites**

- [Node.js](https://nodejs.org/) (version 14 or above recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/JonatanGarbuyo/detectdiv.git
   cd detectdiv
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### **Usage — Local Development**

1. **Start the development server**

   ```bash
   npm run dev
   ```

   This serves the extension with hot reload enabled for faster development.

2. **Build for production (optional)**

   ```bash
   npm run build
   ```

   This outputs a production-ready build to the `dist/` directory.

### **Load the Extension in Chrome**

1. Open **Google Chrome** and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle switch in the top-right)
3. Click **Load unpacked** and select the project's `dist` directory (after running `npm run build`)
4. The Detectdiv extension will now be available in your browser.

## **Project Structure**

```
detectdiv/
├── public/           # Static assets (manifest, icons)
├── src/              # Extension source code (React components, styles)
├── dist/             # Production build output (generated)
├── index.html        # Extension entry HTML
├── vite.config.js    # Vite build configuration
├── package.json      # Project metadata and scripts
└── README.md         # This file
```

## **Scripts**

- `npm run dev` — Start development server
- `npm run build` — Build extension for production
- `npm run preview` — Preview production build

## **Contributing**

Pull requests, issues, and feature suggestions are welcome! Please open an issue or submit a PR via [GitHub](https://github.com/JonatanGarbuyo/detectdiv).

## **Developer Information**

**Author:** Jonatan Garbuyo  
**Email:** [jonatangarbuyo@gmail.com](mailto:jonatangarbuyo@gmail.com)  
**GitHub:** [https://github.com/JonatanGarbuyo](https://github.com/JonatanGarbuyo)

## **License**

This project is licensed under the **GNU General Public License (GPL v3)**.
You are free to copy, modify, and distribute this work under the terms of the GPL, provided that derivative works remain open-source under the same license.

For the full license text, see:
[https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html)
