# Changelog

All notable changes to this project will be documented in this file.

## [0.1.7] - 2026-07-16

### Added

- Add a Google Ads Console switch that toggles the `google_console=1` URL parameter.

## [0.1.6] - 2026-01-20

### Fixed

- Preserve manually changed `d`, `outputType`, `token`, and `mxId` URL parameters by syncing them to extension storage instead of overwriting them with previously stored values.

## [0.1.5] - 2026-01-09

### Fixed

- Implement clipboard polyfill using `execCommand` for DevTools panel to avoid Permissions Policy violations.

## [0.1.4] - 2026-01-09

### Added

- Force expansion of first level for JSON tree objects on initial render.

## [0.1.3] - 2026-01-09

### Added

- Add `outputType` and `template` to Fusion info header.
- Reorder header fields alphabetically.

## [0.1.2] - 2026-01-09

### Added

- Add Environment tab to inspect Fusion environment variables.

## [0.1.1] - 2026-01-09

### Added

- Auto-load global content.
- Add navigation listener to refresh data on page change.
- Implement Fusion info header with ArcSite, Deployment, Layout, and MxID.

## [0.1.0] - 2026-01-09

### Changed

- Replace `react-json-view` with `@uiw/react-json-view`.
- Refine UI using Pico CSS.

### Added

- Explicit dark mode support for JSON viewer.

## [0.0.7] - 2026-01-09

### Added

- Add microexperience id (mxId) support.

## [0.0.6] - 2026-01-09

### Added

- Implement DevTools page and background script structure.

## [0.0.5] - 2026-01-09

### Added

- Add random token feature.

## [0.0.4] - 2026-01-09

### Changed

- Refactor: Extract components and hooks.

## [0.0.3] - 2026-01-09

### Fixed

- Add webextensions globals to ESLint config.

## [0.0.2] - 2026-01-09

### Changed

- Refactor: Simplify UI using Pico CSS native components.

## [0.0.1] - 2026-01-09

### Added

- Implement deployment parameter injection with persistent storage.
