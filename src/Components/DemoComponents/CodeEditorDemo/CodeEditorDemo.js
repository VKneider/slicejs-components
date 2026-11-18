// CodeEditorDemo: a structured, self-contained editor workspace built only from
// public Slice components. DockLayout owns the editable tabs, preview and console;
// TreeView drives navigation; every panel keeps its live state when docked.
//
// The point is to show how the pieces compose: Tabs + SplitPane inside DockLayout,
// with real content (Textarea, Input, Button, Icon, Badge) in each panel.
import { texts } from '../../shared/text/texts.js';

const t = texts('slice.codeEditorDemo', {
   en: {
      project: 'Project files', terminal: 'Terminal command', workspace: 'Code editor workspace',
      editor: 'Editors', console: 'Console', preview: 'Preview', search: 'Search files',
      note: 'New note', add: 'Add', saved: '{name} saved.', savedAll: 'All changes saved.',
      nothing: 'Nothing to save.', discarded: '{name} restored.', noteAdded: 'Note added.',
      noteEmpty: 'Write a note first.', running: 'Build running...', built: 'Build succeeded.',
      noResults: 'No results.', results: '{count} result(s) for "{query}".', noChanges: 'No changes.',
      changed: '{count} changed file(s).', build: 'Build', save: 'Save', files: 'Toggle explorer',
   },
   es: {
      project: 'Archivos del proyecto', terminal: 'Comando de terminal', workspace: 'Espacio de trabajo del editor',
      editor: 'Editores', console: 'Consola', preview: 'Vista previa', search: 'Buscar archivos',
      note: 'Nueva nota', add: 'Añadir', saved: '{name} guardado.', savedAll: 'Todos los cambios guardados.',
      nothing: 'No hay nada que guardar.', discarded: '{name} restaurado.', noteAdded: 'Nota añadida.',
      noteEmpty: 'Escribe una nota primero.', running: 'Compilando...', built: 'Compilación correcta.',
      noResults: 'Sin resultados.', results: '{count} resultado(s) para "{query}".', noChanges: 'Sin cambios.',
      changed: '{count} archivo(s) modificado(s).', build: 'Compilar', save: 'Guardar', files: 'Alternar explorador',
   },
});

const FILES = [
   {
      id: 'app',
      name: 'app.js',
      path: 'src/app.js',
      icon: 'file-lines',
      language: 'JavaScript',
      code: `import { createStore } from './store.js';
import { renderNotes } from './ui.js';

const store = createStore({
  notes: [],
  filter: 'all',
});

export function addNote(text) {
  const note = { id: crypto.randomUUID(), text, done: false };
  store.update((state) => ({ ...state, notes: [note, ...state.notes] }));
  renderNotes(store.getState());
}

export function toggleNote(id) {
  store.update((state) => ({
    ...state,
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, done: !note.done } : note),
  }));
}

store.subscribe(renderNotes);
`,
      outline: [
         { kind: 'var', label: 'store', line: 4 },
         { kind: 'fn', label: 'addNote(text)', line: 9 },
         { kind: 'fn', label: 'toggleNote(id)', line: 16 },
      ],
   },
   {
      id: 'styles',
      name: 'styles.css',
      path: 'src/styles.css',
      icon: 'file',
      language: 'CSS',
      code: `:root {
  --notes-surface: #ffffff;
  --notes-accent: #6c5ce7;
  --notes-radius: 12px;
}

.notes-app {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: var(--notes-radius);
}

.note-card {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--notes-accent) 20%, transparent);
}

.note-card[data-done='true'] {
  opacity: .55;
  text-decoration: line-through;
}
`,
      outline: [
         { kind: 'css', label: ':root', line: 1 },
         { kind: 'css', label: '.notes-app', line: 7 },
         { kind: 'css', label: '.note-card', line: 14 },
      ],
   },
   {
      id: 'readme',
      name: 'README.md',
      path: 'README.md',
      icon: 'file-lines',
      language: 'Markdown',
      code: `# Slice Notes

A tiny notes workspace that lives inside the CodeEditorDemo.

## Files

- src/app.js      application state
- src/styles.css  visual tokens

## Run it

Press Run in the title bar, or type \`build\` in the terminal.
The preview pane stays live while you edit.
`,
      outline: [
         { kind: 'h1', label: 'Slice Notes', line: 1 },
         { kind: 'h2', label: 'Files', line: 5 },
         { kind: 'h2', label: 'Run it', line: 10 },
      ],
   },
   {
      id: 'pkg',
      name: 'package.json',
      path: 'package.json',
      icon: 'file',
      language: 'JSON',
      code: `{
  "name": "slice-notes",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "slice dev",
    "build": "slice build"
  }
}
`,
      outline: [
         { kind: 'key', label: 'name', line: 2 },
         { kind: 'key', label: 'version', line: 4 },
         { kind: 'key', label: 'scripts', line: 6 },
      ],
   },
];

const PROBLEMS = [
   { file: 'styles', line: 7, message: 'Consider a spacing token instead of a fixed gap.', severity: 'warning' },
   { file: 'app', line: 11, message: 'crypto.randomUUID() needs a secure context.', severity: 'warning' },
];

const TREE = [
   {
      id: 'project',
      label: 'slice-notes',
      icon: 'folder-open',
      expanded: true,
      items: [
         {
            id: 'src',
            label: 'src',
            icon: 'folder',
            expanded: true,
            items: [
               { id: 'app', label: 'app.js', icon: 'file-lines', description: 'JavaScript' },
               { id: 'styles', label: 'styles.css', icon: 'file', description: 'CSS' },
            ],
         },
         { id: 'readme', label: 'README.md', icon: 'file-lines', description: 'Markdown' },
         { id: 'pkg', label: 'package.json', icon: 'file', description: 'JSON' },
      ],
   },
];

const INITIAL_TERMINAL = [
   'Slice Notes terminal - type "help" for commands.',
   '',
];

export default class CodeEditorDemo extends HTMLElement {
   static props = {
      height: { type: 'string', default: '620px' },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.$window = this.querySelector('[data-window]');
      this.$actions = this.querySelector('[data-actions]');
      this.$activity = this.querySelector('[data-activity]');
      this.$tree = this.querySelector('[data-tree]');
      this.$outline = this.querySelector('[data-outline]');
      this.$search = this.querySelector('[data-search]');
      this.$searchStatus = this.querySelector('[data-search-status]');
      this.$searchResults = this.querySelector('[data-search-results]');
      this.$sourceStatus = this.querySelector('[data-source-status]');
      this.$sourceResults = this.querySelector('[data-source-results]');
      this.$sourceActions = this.querySelector('[data-source-actions]');
      this.$workspace = this.querySelector('[data-workspace]');
      this.$statusLeft = this.querySelector('[data-status-left]');
      this.$statusRight = this.querySelector('[data-status-right]');
      this.$crumb = this.querySelector('[data-crumb]');
      this.$dirty = this.querySelector('[data-dirty]');
      this.$live = this.querySelector('[data-live]');
      this._views = {};
      this._editors = new Map();
      this._saved = new Map(FILES.map((file) => [file.id, file.code]));
      this._owned = [];
      this._activeFile = 'app';
      this._buildNumber = 0;
      this._running = false;
      this._dead = false;
      this._adapted = false;
      this._userMoved = false;
      this._boundShortcuts = null;
      slice.controller.setComponentProps(this, props);
   }

   get height() { return this._height; }
   set height(value) {
      this._height = typeof value === 'string' && value.trim() ? value.trim() : '620px';
      this.style.setProperty('--slice-editor-height', this._height);
   }

   async init() {
      this.$window.dataset.explorer = window.matchMedia?.('(max-width: 900px)').matches ? 'closed' : 'open';
      await this._buildTitlebar();
      if (this._dead) return;
      this._buildActivity();
      await this._buildExplorer();
      if (this._dead) return;
      await this._buildSearch();
      await this._buildSource();
      if (this._dead) return;
      await this._buildStatus();
      if (this._dead) return;
      await this._buildWorkspace();
      if (this._dead) return;
      this._bindShortcuts();
      this._setView('explorer');
      this._activateFile('app');
      this._renderSource();
      this._writeTerminal(INITIAL_TERMINAL);
      this._broadcast('Workspace ready. Edit a file, dock a tab, or run the build.');
      this._ready = true;
      this._adaptLayout();
   }

   // ------------------------------------------------------------- public API

   /** Open a file tab, wherever it currently lives in the dock tree. */
   async openFile(id) {
      const file = this._file(id);
      const group = this._groupForTab(id);
      if (!file || !group || this._dead) return false;
      this._dock?.getTabs(group)?.select(id, { focus: true });
      this._activateFile(id);
      const editor = this._editors.get(id);
      if (editor?.$textarea) {
         editor.$textarea.focus();
         this._updateCursor(id);
      }
      return true;
   }

   /** Save one file (default: the active editor). */
   save(id = this._activeFile) {
      const file = this._file(id);
      const editor = this._editors.get(id);
      if (!file || !editor) return false;
      this._saved.set(id, editor.value);
      this._refreshDirty();
      this._setMessage(t('saved', { name: file.name }), 'ok');
      this._broadcast(t('saved', { name: file.name }));
      return true;
   }

   saveAll() {
      let count = 0;
      for (const [id, editor] of this._editors) {
         if (editor.value === this._saved.get(id)) continue;
         this._saved.set(id, editor.value);
         count++;
      }
      this._refreshDirty();
      this._setMessage(count ? t('savedAll') : t('nothing'), count ? 'ok' : '');
      this._broadcast(count ? t('savedAll') : t('nothing'));
      return count > 0;
   }

   /** Simulate the project build and update terminal, output and the preview. */
   async run() {
      if (this._running || this._dead) return false;
      this._running = true;
      this._runButton.disabled = true;
      this._setMessage(t('running'));
      this._terminal('$ npm run build');
      await this._delay(360);
      if (this._dead) return false;
      this._terminal('> slice-notes@0.1.0 build');
      this._terminal('> slice build');
      await this._delay(300);
      if (this._dead) return false;
      this._terminal('ok  Project files verified', 'ok');
      this._terminal('ok  Optimized 8 files', 'ok');
      this._terminal('ok  Bundles generated in 42ms', 'ok');
      this._terminal('Build completed - 0 errors, 2 warnings', 'warn');
      this._buildNumber += 1;
      if (this.$previewBuild) this.$previewBuild.textContent = `Build #${this._buildNumber} - updated just now`;
      if (this.$output) {
         this.$output.textContent = [
            `build v0.1.${this._buildNumber}`,
            'entry   src/app.js',
            'assets  notes.css   1.8 kB',
            '        notes.js   3.4 kB',
            'result  ready in 42ms',
         ].join('\n');
      }
      this._setMessage(t('built'), 'ok');
      this._broadcast(t('built'));
      this._running = false;
      this._runButton.disabled = false;
      return true;
   }

   // ------------------------------------------------------------ title bar

   async _buildTitlebar() {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'slice-code-editor__files-toggle';
      toggle.setAttribute('aria-label', t('files'));
      toggle.title = t('files');
      const icon = await this._build('Icon', { name: 'folder-open', size: '16px' });
      if (icon) toggle.append(icon);
      toggle.addEventListener('click', () => this._toggleExplorer());
      this.$actions.append(toggle);

      this._saveButton = await this._build('Button', {
         value: t('save'), size: 'sm', variant: 'ghost', icon: { name: 'check-circle' },
         onClick: () => this.save(),
      });
      this._runButton = await this._build('Button', {
         value: t('build'), size: 'sm', icon: { name: 'play' },
         onClick: () => this.run(),
      });
      if (this._saveButton) this.$actions.append(this._saveButton);
      if (this._runButton) this.$actions.append(this._runButton);
   }

   _toggleExplorer() {
      this.$window.dataset.explorer = this.$window.dataset.explorer === 'open' ? 'closed' : 'open';
   }

   // ------------------------------------------------------------ activity

   _buildActivity() {
      const views = [
         ['explorer', 'folder-open', 'Explorer'],
         ['search', 'search', 'Search'],
         ['source', 'code-branch', 'Source control'],
      ];
      for (const [view, iconName, label] of views) {
         const button = document.createElement('button');
         button.type = 'button';
         button.dataset.activity = view;
         button.setAttribute('aria-label', label);
         button.title = label;
         button.setAttribute('aria-pressed', 'false');
         button.addEventListener('click', () => this._setView(view));
         this.$activity.append(button);
         this._build('Icon', { name: iconName, size: '18px' }).then((icon) => {
            if (icon && !this._dead) button.append(icon);
         });
      }
   }

   _setView(view) {
      if (!this._views[view]) return;
      for (const [name, node] of Object.entries(this._views)) node.hidden = name !== view;
      for (const button of this.$activity.querySelectorAll('[data-activity]')) {
         button.setAttribute('aria-pressed', String(button.dataset.activity === view));
      }
      if (view !== 'explorer' && window.matchMedia?.('(max-width: 900px)').matches) {
         this.$window.dataset.explorer = 'open';
      }
      if (view === 'search') this._searchInput?.$input?.focus();
      if (view === 'source') this._renderSource();
   }

   // ------------------------------------------------------------ explorer

   async _buildExplorer() {
      this._views.explorer = this.querySelector('[data-view="explorer"]');
      this._treeView = await this._build('TreeView', {
         items: TREE,
         expanded: 'all',
         selection: 'single',
         size: 'sm',
         ariaLabel: t('project'),
         onClick: (row) => {
            const id = row?.item?.id;
            if (this._file(id)) this.openFile(id);
         },
      });
      if (this._treeView) this.$tree.append(this._treeView);
   }

   _renderOutline(id) {
      const symbols = this._file(id)?.outline || [];
      this.$outline.replaceChildren();
      if (!symbols.length) {
         const empty = document.createElement('li');
         empty.className = 'slice-code-editor__helper';
         empty.textContent = 'No symbols in this file.';
         this.$outline.append(empty);
         return;
      }
      for (const symbol of symbols) {
         const item = document.createElement('li');
         const button = document.createElement('button');
         button.type = 'button';
         const kind = document.createElement('span');
         kind.className = 'symbol';
         kind.textContent = symbol.kind;
         const label = document.createElement('span');
         label.textContent = symbol.label;
         const line = document.createElement('span');
         line.className = 'line';
         line.textContent = String(symbol.line);
         button.append(kind, label, line);
         button.addEventListener('click', () => this._goto(id, symbol.line));
         item.append(button);
         this.$outline.append(item);
      }
   }

   async _goto(id, line) {
      await this.openFile(id);
      const area = this._editors.get(id)?.$textarea;
      if (!area) return;
      const lines = area.value.split('\n');
      let start = 0;
      for (let i = 0; i < Math.min(line - 1, lines.length); i++) start += lines[i].length + 1;
      area.focus();
      area.setSelectionRange(start, start + (lines[line - 1]?.length || 0));
      const lineHeight = parseFloat(getComputedStyle(area).lineHeight) || 22;
      area.scrollTop = Math.max(0, (line - 1) * lineHeight - lineHeight * 2);
      this._updateCursor(id);
   }

   // -------------------------------------------------------------- search

   async _buildSearch() {
      this._views.search = this.querySelector('[data-view="search"]');
      this._searchInput = await this._build('Input', {
         placeholder: 'Search files and content',
         ariaLabel: t('search'),
         size: 'sm',
         onChange: (value) => this._search(String(value || '')),
      });
      if (this._searchInput) this.$search.append(this._searchInput);
   }

   _search(query) {
      const needle = query.trim().toLowerCase();
      this.$searchResults.replaceChildren();
      if (!needle) {
         this.$searchStatus.textContent = 'Type to search every file in the workspace.';
         return;
      }
      let count = 0;
      for (const file of FILES) {
         const lines = file.code.split('\n');
         let offset = 0;
         for (let i = 0; i < lines.length; i++) {
            const text = lines[i];
            const hit = text.toLowerCase().indexOf(needle);
            if (hit >= 0 && count < 14) {
               count++;
               this.$searchResults.append(this._searchResult(file, i + 1, text.trim(), offset + hit, needle.length));
            }
            offset += text.length + 1;
         }
      }
      this.$searchStatus.textContent = count
         ? t('results', { count, query: query.trim() })
         : t('noResults');
   }

   _searchResult(file, line, text, start, length) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      const name = document.createElement('span');
      name.className = 'file';
      name.textContent = `${file.name}:${line}`;
      const detail = document.createElement('span');
      detail.className = 'detail';
      detail.textContent = text || '(empty line)';
      button.append(name, detail);
      button.addEventListener('click', async () => {
         await this.openFile(file.id);
         const area = this._editors.get(file.id)?.$textarea;
         if (!area) return;
         area.focus();
         area.setSelectionRange(start, start + length);
         this._updateCursor(file.id);
      });
      item.append(button);
      return item;
   }

   // --------------------------------------------------------------- source

   async _buildSource() {
      this._views.source = this.querySelector('[data-view="source"]');
      this._saveAllButton = await this._build('Button', {
         value: 'Save all', size: 'sm', variant: 'outlined', icon: { name: 'check-circle' },
         onClick: () => this.saveAll(),
      });
      if (this._saveAllButton) this.$sourceActions.append(this._saveAllButton);
   }

   _renderSource() {
      if (!this.$sourceResults) return;
      const changed = FILES.filter((file) => {
         const editor = this._editors.get(file.id);
         return editor && editor.value !== this._saved.get(file.id);
      });
      this.$sourceResults.replaceChildren();
      this.$sourceActions.hidden = changed.length === 0;
      this.$sourceStatus.textContent = changed.length ? t('changed', { count: changed.length }) : t('noChanges');
      for (const file of changed) {
         const item = document.createElement('li');
         const row = document.createElement('div');
         row.className = 'slice-code-editor__source-row';
         const open = document.createElement('button');
         open.type = 'button';
         const name = document.createElement('span');
         name.className = 'file';
         name.textContent = file.name;
         const marker = document.createElement('span');
         marker.className = 'severity';
         marker.textContent = 'M';
         open.append(name, marker);
         open.addEventListener('click', () => this.openFile(file.id));
         const actions = document.createElement('div');
         actions.className = 'slice-code-editor__source-mini';
         for (const [label, run] of [
            ['Save', () => this.save(file.id)],
            ['Discard', () => this._discard(file.id)],
         ]) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = label;
            button.addEventListener('click', run);
            actions.append(button);
         }
         row.append(open, actions);
         item.append(row);
         this.$sourceResults.append(item);
      }
   }

   _discard(id) {
      const file = this._file(id);
      const editor = this._editors.get(id);
      if (!file || !editor) return false;
      editor.value = this._saved.get(id);
      this._refreshDirty();
      this._setMessage(t('discarded', { name: file.name }));
      return true;
   }

   // --------------------------------------------------------------- status

   async _buildStatus() {
      const branch = await this._build('Icon', { name: 'code-branch', size: '12px' });
      const branchText = document.createElement('span');
      branchText.textContent = 'main';
      const branchItem = document.createElement('span');
      branchItem.className = 'slice-code-editor__status-item';
      if (branch) branchItem.append(branch);
      branchItem.append(branchText);

      const warningIcon = await this._build('Icon', { name: 'bug', size: '12px' });
      this.$problemCount = document.createElement('span');
      this.$problemCount.textContent = `${PROBLEMS.length} warnings`;
      const problems = document.createElement('span');
      problems.className = 'slice-code-editor__status-item';
      problems.dataset.tone = 'warn';
      if (warningIcon) problems.append(warningIcon);
      problems.append(this.$problemCount);

      this.$statusMessage = document.createElement('span');
      this.$statusMessage.className = 'slice-code-editor__status-message';
      this.$statusMessage.textContent = 'Ready';
      this.$statusLeft.append(branchItem, problems, this.$statusMessage);

      this.$language = document.createElement('span');
      this.$language.className = 'slice-code-editor__status-item';
      this.$language.textContent = 'JavaScript';
      this.$position = document.createElement('span');
      this.$position.className = 'slice-code-editor__status-item';
      this.$position.textContent = 'Ln 1, Col 1';
      const encoding = document.createElement('span');
      encoding.className = 'slice-code-editor__status-item optional';
      encoding.textContent = 'UTF-8';
      const endings = document.createElement('span');
      endings.className = 'slice-code-editor__status-item optional';
      endings.textContent = 'LF';
      const runtime = document.createElement('span');
      runtime.className = 'slice-code-editor__status-item optional';
      runtime.textContent = 'Slice 4.3';
      this.$statusRight.append(this.$language, this.$position, encoding, endings, runtime);
   }

   _setMessage(text, tone = '') {
      if (!this.$statusMessage) return;
      this.$statusMessage.textContent = text;
      this.$statusMessage.dataset.tone = tone;
   }

   _updateCursor(id) {
      if (id !== this._activeFile || !this.$position) return;
      const area = this._editors.get(id)?.$textarea;
      if (!area) return;
      const before = area.value.slice(0, area.selectionStart || 0);
      const line = before.split('\n').length;
      const column = (area.selectionStart || 0) - before.lastIndexOf('\n');
      this.$position.textContent = `Ln ${line}, Col ${column}`;
   }

   _broadcast(text) {
      if (!this.$live) return;
      this.$live.textContent = '';
      requestAnimationFrame(() => { if (!this._dead) this.$live.textContent = text; });
   }

   // ------------------------------------------------------------ workspace

   async _buildWorkspace() {
      const editors = [];
      for (const file of FILES) {
         const editor = await slice.build('Textarea', {
            value: file.code,
            ariaLabel: file.name,
            rows: 18,
            resize: 'none',
            variant: 'ghost',
            onChange: (value) => this._onEdit(file.id, String(value || '')),
         });
         if (!editor || this._dead) return;
         editor.classList.add('slice-code-editor__textarea');
         this._editors.set(file.id, editor);
         for (const event of ['keyup', 'click', 'select']) {
            editor.$textarea?.addEventListener(event, () => this._updateCursor(file.id));
         }
         const wrapper = document.createElement('div');
         wrapper.className = 'slice-code-editor__editor';
         wrapper.dataset.file = file.id;
         wrapper.append(editor);
         editors.push({ id: file.id, label: file.name, icon: file.icon, panel: wrapper });
      }

      const preview = await this._buildPreview();
      const consolePanels = await this._buildConsole();
      const items = [
         ...editors,
         { id: 'preview', label: t('preview'), icon: 'play', panel: preview, closable: false },
         ...consolePanels,
      ];

      this._dock = await slice.build('DockLayout', {
         items,
         closable: false,
         minPanelSize: 12,
         ariaLabel: t('workspace'),
         layout: this._initialLayout(),
         onChange: (layout, detail) => this._onDockChange(layout, detail),
      });
      if (!this._dock || this._dead) return;
      this._owned.push(this._dock);
      this.$workspace.append(this._dock);
   }

   async _buildPreview() {
      const preview = document.createElement('div');
      preview.className = 'slice-code-editor__preview';

      const eyebrow = document.createElement('span');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'LIVE PREVIEW';
      const title = document.createElement('h3');
      title.textContent = 'Slice Notes';
      const copy = document.createElement('p');
      copy.textContent = 'A tiny notes app running in the preview pane. Add a note, then dock this panel somewhere else.';

      const form = document.createElement('div');
      form.className = 'slice-code-editor__preview-form';
      this._noteInput = await slice.build('Input', {
         placeholder: t('note'), ariaLabel: t('note'), size: 'sm',
      });
      const add = await slice.build('Button', {
         value: t('add'), size: 'sm', icon: { name: 'plus' }, onClick: () => this._addNote(),
      });
      if (this._noteInput) form.append(this._noteInput);
      if (add) form.append(add);

      const list = document.createElement('ul');
      list.className = 'slice-code-editor__notes';
      this.$noteList = list;
      for (const [text, meta] of [
         ['Sketch the editor layout', 'today'],
         ['Review the docking behaviour', 'yesterday'],
      ]) this._appendNote(text, meta);

      const footer = document.createElement('div');
      footer.className = 'slice-code-editor__preview-footer';
      const live = document.createElement('span');
      live.textContent = 'Edits stay live while you rearrange.';
      this.$previewBuild = document.createElement('span');
      this.$previewBuild.textContent = 'Build #0 - not run yet';
      footer.append(live, this.$previewBuild);

      preview.append(eyebrow, title, copy, form, list, footer);
      return preview;
   }

   _appendNote(text, meta = 'now') {
      if (!this.$noteList) return;
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = text;
      const time = document.createElement('span');
      time.className = 'meta';
      time.textContent = meta;
      item.append(label, time);
      this.$noteList.append(item);
   }

   _addNote() {
      const value = this._noteInput?.value?.trim();
      if (!value) {
         this._broadcast(t('noteEmpty'));
         return;
      }
      this._appendNote(value);
      this._noteInput.value = '';
      this._noteInput.$input?.focus();
      this._broadcast(t('noteAdded'));
   }

   async _buildConsole() {
      const terminal = document.createElement('div');
      terminal.className = 'slice-code-editor__console';
      this.$terminal = document.createElement('pre');
      this.$terminal.setAttribute('aria-live', 'polite');
      this.$terminal.setAttribute('aria-label', 'Terminal output');
      const form = document.createElement('div');
      form.className = 'slice-code-editor__console-form';
      const prompt = document.createElement('span');
      prompt.textContent = '>';
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('aria-label', t('terminal'));
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('spellcheck', 'false');
      input.addEventListener('keydown', (event) => {
         if (event.key !== 'Enter') return;
         event.preventDefault();
         this._command(input.value);
         input.value = '';
      });
      form.append(prompt, input);
      terminal.append(this.$terminal, form);

      const problems = document.createElement('ul');
      problems.className = 'slice-code-editor__problems';
      for (const problem of PROBLEMS) {
         const item = document.createElement('li');
         const button = document.createElement('button');
         button.type = 'button';
         const severity = document.createElement('span');
         severity.className = 'severity';
         severity.textContent = '!';
         const message = document.createElement('span');
         message.textContent = problem.message;
         const where = document.createElement('span');
         where.className = 'where';
         where.textContent = `${this._file(problem.file)?.name}:${problem.line}`;
         button.append(severity, message, where);
         button.addEventListener('click', () => this._goto(problem.file, problem.line));
         item.append(button);
         problems.append(item);
      }

      this.$output = document.createElement('pre');
      this.$output.className = 'slice-code-editor__output';
      this.$output.textContent = 'Waiting for the first build...';

      return [
         { id: 'terminal', label: 'Terminal', icon: 'terminal', panel: terminal, closable: false },
         { id: 'problems', label: 'Problems', icon: 'bug', panel: problems, closable: false },
         { id: 'output', label: 'Output', icon: 'check-circle', panel: this.$output, closable: false },
      ];
   }

   _initialLayout() {
      const files = FILES.map((file) => file.id);
      const consoleTabs = ['terminal', 'problems', 'output'];
      const width = this.getBoundingClientRect().width || window.innerWidth;
      if (width < 1100) {
         // Narrow hosts (docs column, phone): one editor stack with Preview as a
         // tab, console underneath. The wide 3-group arrangement would leave a
         // 140px preview nobody can use.
         return {
            type: 'split', id: 'workspace', orientation: 'vertical', sizes: [74, 26],
            children: [
               { type: 'group', id: 'editors', label: t('editor'), tabs: [...files, 'preview'], activeTab: 'app' },
               { type: 'group', id: 'console', label: t('console'), tabs: consoleTabs, activeTab: 'terminal' },
            ],
         };
      }
      return {
         type: 'split', id: 'workspace', orientation: 'horizontal', sizes: [70, 30],
         children: [
            {
               type: 'split', id: 'stack', orientation: 'vertical', sizes: [72, 28],
               children: [
                  { type: 'group', id: 'editors', label: t('editor'), tabs: files, activeTab: 'app' },
                  { type: 'group', id: 'console', label: t('console'), tabs: consoleTabs, activeTab: 'terminal' },
               ],
            },
            { type: 'group', id: 'preview-group', label: t('preview'), tabs: ['preview'], activeTab: 'preview' },
         ],
      };
   }

   // The docs build the demo before inserting it, so the first measurement is 0.
   // Once connected, adapt once to a narrow host without touching a user's moves.
   connectedCallback() {
      if (this._ready) this._adaptLayout();
   }

   _adaptLayout() {
      let tries = 0;
      const check = () => {
         if (this._dead || this._adapted) return;
         if (!this._adaptNow() && tries++ < 40) setTimeout(check, 50);
      };
      check();
   }

   _adaptNow() {
      const width = this.getBoundingClientRect().width;
      if (!width) return false;
      this._adapted = true;
      if (width < 1100 && !this._userMoved) this._applyNarrowLayout();
      return true;
   }

   async _applyNarrowLayout() {
      if (!this._dock || this._dead) return;
      try { await this._dock.restoreLayout(this._initialLayout()); } catch { /* keep the current tree */ }
   }

   // ------------------------------------------------------------- behaviour

   _onDockChange(layout, detail) {
      if (detail?.reason === 'select' && this._file(detail.tabId)) this._activateFile(detail.tabId);
      if (detail?.reason === 'resize') { this._userMoved = true; this._setMessage('Panel resized'); }
      if (detail?.reason === 'move') { this._userMoved = true; this._broadcast(`${this._file(detail.tabId)?.name || 'Tab'} moved.`); }
   }

   _activateFile(id) {
      const file = this._file(id);
      if (!file || this._dead) return;
      this._activeFile = id;
      if (this.$crumb) this.$crumb.textContent = file.path;
      if (this.$language) this.$language.textContent = file.language;
      this._renderOutline(id);
      this._refreshDirty();
      this._updateCursor(id);
   }

   _onEdit(id, value) {
      const file = this._file(id);
      if (!file) return;
      this._refreshDirty();
      this._setMessage(`${file.name} - unsaved changes`);
   }

   _refreshDirty() {
      let any = false;
      for (const file of FILES) {
         const editor = this._editors.get(file.id);
         if (!editor) continue;
         const dirty = editor.value !== this._saved.get(file.id);
         any ||= dirty;
         const group = this._groupForTab(file.id);
         if (group) this._dock?.getTabs(group)?.setBadge(file.id, dirty ? true : null);
      }
      if (this.$dirty) this.$dirty.hidden = !(this._editors.get(this._activeFile)?.value !== this._saved.get(this._activeFile));
      if (this._saveAllButton) this._saveAllButton.disabled = !any;
      this._renderSource();
   }

   _file(id) {
      return FILES.find((file) => file.id === id) || null;
   }

   _groupForTab(id, node = this._dock?.getLayout()) {
      if (!node) return null;
      if (node.type === 'group') return node.tabs.includes(id) ? node.id : null;
      for (const child of node.children || []) {
         const hit = this._groupForTab(id, child);
         if (hit) return hit;
      }
      return null;
   }

   _terminal(text, tone = '') {
      if (!this.$terminal) return;
      const line = document.createElement('span');
      if (tone) line.className = tone;
      line.textContent = `${text}\n`;
      this.$terminal.append(line);
      this.$terminal.scrollTop = this.$terminal.scrollHeight;
   }

   _writeTerminal(lines) {
      if (!this.$terminal) return;
      this.$terminal.textContent = '';
      for (const line of lines) this._terminal(line);
   }

   _command(raw) {
      const command = String(raw || '').trim();
      if (!command) return;
      this._terminal(`$ ${command}`);
      const [name] = command.split(/\s+/);
      if (name === 'help') {
         this._terminal('Commands: ls, save, build, clear, help');
      } else if (name === 'ls') {
         this._terminal(FILES.map((file) => file.path).join('  '));
      } else if (name === 'save') {
         this.save();
         this._terminal('Saved the active file.');
      } else if (name === 'build' || command === 'npm run build' || command === 'run') {
         this.run();
      } else if (name === 'clear') {
         this._writeTerminal([]);
      } else {
         this._terminal(`command not found: ${name}`, 'warn');
      }
   }

   _delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
   }

   _bindShortcuts() {
      if (this._boundShortcuts) return;
      this._boundShortcuts = (event) => {
         const key = String(event.key || '').toLowerCase();
         if ((event.ctrlKey || event.metaKey) && key === 's') {
            event.preventDefault();
            this.save();
         } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.run();
         } else if ((event.ctrlKey || event.metaKey) && key === 'b') {
            event.preventDefault();
            this._toggleExplorer();
         }
      };
      this.addEventListener('keydown', this._boundShortcuts);
   }

   // ----------------------------------------------------------- lifecycle

   async _build(name, props) {
      const child = await slice.build(name, props);
      if (!child) return null;
      if (this._dead) {
         slice.controller.destroyComponent(child);
         return null;
      }
      this._owned.push(child);
      return child;
   }

   beforeDestroy() {
      this._dead = true;
      if (this._boundShortcuts) this.removeEventListener('keydown', this._boundShortcuts);
      this._boundShortcuts = null;
      for (const child of this._owned.reverse()) {
         if (child?.sliceId && slice.controller.activeComponents.has(child.sliceId)) {
            slice.controller.destroyComponent(child);
         }
      }
      this._owned = [];
      this._editors.clear();
   }
}

customElements.define('slice-code-editor-demo', CodeEditorDemo);
