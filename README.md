<p align="center">
  <img
    src="public/images/favicon/favicon-128x128-rounded.png"
    alt="Detectdiv logo"
    width="128"
    height="128"
  />
</p>

# Detectdiv

Detectdiv is a Chrome extension for inspecting Arc XP Fusion data and managing development URL parameters.

## Features

- Inspect `globalContent` from the Chrome DevTools panel.
- Inspect Fusion environment variables.
- Display Arc Site, deployment, layout, MxID, output type, and template information.
- Modify development query parameters from the extension popup.
- Save custom output types and microexperience IDs.
- Expand, collapse, refresh, and copy JSON data.

## URL Parameters

| Control | Query parameter | Example |
| --- | --- | --- |
| Deployment | `d` | `?d=123` |
| Output type | `outputType` | `?outputType=amp-type` |
| Microexperience | `mxId` | `?mxId=375a1979` |
| Token | `token` | `?token=abc123` |
| Google Ads Console | `google_console` | `?google_console=1` |

Parameters are stored per browser tab and synchronized with the current URL. Enabling the Google Ads Console switch adds `google_console=1`; disabling it removes the parameter. The **Clear all** button removes every extension-controlled parameter.

## Usage

1. Open an Arc XP page.
2. Open the Detectdiv popup to configure URL parameters.
3. Open Chrome DevTools.
4. Select the **Detectdiv** panel.
5. Inspect the Global Content or Environment tabs.

## Getting Started

These instructions will help you set up, develop, and run the Detectdiv extension locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.19 or above, or version 22.12 or above)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/JonatanGarbuyo/detectdiv.git
   cd detectdiv
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### Local Development

1. **Start the development server**

   ```bash
   npm run dev
   ```

   This serves the extension with hot reload enabled for faster development.

2. **Build the extension**

   ```bash
   npm run build
   ```

   This outputs a production-ready build to the `dist/` directory.

### Load the Extension in Chrome

1. Open **Google Chrome** and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle switch in the top-right)
3. Click **Load unpacked** and select the project's `dist` directory (after running `npm run build`)
4. The Detectdiv extension will now be available in your browser.

## Validation

Run the project checks before submitting changes:

```bash
npm test
npm run lint
npm run build
```

## Chrome Permissions

- `tabs` — Reads and updates the active tab URL.
- `storage` — Stores configuration and parameter values.
- `scripting` — Reads Fusion data from the inspected page.
- `webNavigation` — Supports navigation-related extension behavior.
- Host access for HTTP and HTTPS pages — Allows Detectdiv to work on inspected sites.

## Known Limitations

- Fusion data is only available on pages that expose `window.Fusion` as an object or function.
- Chrome internal pages such as `chrome://extensions` cannot be inspected or modified.
- Changing URL parameters reloads the current page.

## Project Structure

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

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build extension for production
- `npm run lint` — Run ESLint
- `npm test` — Run unit tests
- `npm run preview` — Preview production build

## Release Notes

See [changelog.md](changelog.md) for the version history.

## Contributing

Pull requests, issues, and feature suggestions are welcome! Please open an issue or submit a PR via [GitHub](https://github.com/JonatanGarbuyo/detectdiv).

## Developer Information

**Author:** Jonatan Garbuyo  
**Email:** [jonatangarbuyo@gmail.com](mailto:jonatangarbuyo@gmail.com)  
**GitHub:** [https://github.com/JonatanGarbuyo](https://github.com/JonatanGarbuyo)

## License

This project is licensed under the **GNU General Public License (GPL v3)**.
You are free to copy, modify, and distribute this work under the terms of the GPL, provided that derivative works remain open-source under the same license.

For the full license text, see:
[https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html)
