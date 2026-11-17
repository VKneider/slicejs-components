# Changelog

## Unreleased

### Added

- DockLayout: dockable workspaces composed of Tabs and SplitPane, preserving live panel instances,
  with pointer/keyboard moves, four-edge splits, close veto, empty-group pruning and JSON restore.
- Tabs.moveTab and SplitPane.releasePanels transfer content ownership without destroying it.
- SplitPane: resizable horizontal/vertical workspaces, multiple live panels, percentage bounds,
  collapse/restore, pointer capture, keyboard resizing, RTL and en/es accessible labels.
- Grid `layout: 'masonry'`: natural-height cards, shortest-column packing, responsive/automatic
  columns, column spans and automatic relayout when content changes.
- Live documentation examples and allocation/packing tests. Browser validation and the new
  SplitPane OG card remain pending in the current environment.

### Fixed

- Grid now destroys nested Slice components inside removed plain DOM wrappers.

## [2.0.0] - 2026-10-26

### Changed

- Renamed the repository and npm package to **`slicejs-components`** (Slice.js Components).
- Canonical GitHub repository: `https://github.com/VKneider/slicejs-components`.
- Canonical documentation site: `https://components.slicejs.com`.
- Registry URLs, the generated agent catalog and all raw Markdown URLs now use the new
  repository name. Old GitHub URLs redirect while compatibility lasts.
- This is a breaking rename for package and repository consumers.

## [1.5.0] - 2026-10-23

### Added

- Added the Slice.js Components agent catalog manifest at `agent/docs-manifest.json`.
- Added machine-readable metadata for Visual and Service component documentation.
- Added CLI and MCP integration points for retrieving authored Markdown and examples.

### Changed

- Adopted **Slice.js Components** as the public product name while retaining
  `slice.js_visual_library` as the legacy repository identifier.
