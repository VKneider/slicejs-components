// Fails if any component declares a teardown method the framework will never call.
//
// The framework invokes exactly one hook: `beforeDestroy()`. A method named
// `destroy()` looks like it works and silently never runs — so its listeners,
// timers and registry entries outlive the component forever. This repo shipped
// that mistake three times before it was caught by review, which means review
// is not enough.
//
// Two limits keep this check about components and not about every class:
//
//   - Only the files registered in `src/Components/components.js` are scanned.
//     Parts (`DataList/parts/Toolbar.js`) and shared helpers
//     (`shared/tooltip/tooltipCore.js`) legitimately own a `destroy()` that the
//     component that uses them calls; the controller never sees those objects.
//   - Inside a file, only the default-exported class is the component. A helper
//     class defined next to it (InfiniteScrollService's `Feed`) is not.
//
// Run via `pnpm run check:teardown`, and as part of `pnpm run test:gate`.

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const COMPONENTS_ROOT = path.join(ROOT, 'src', 'Components');
const REGISTRY_FILE = path.join(COMPONENTS_ROOT, 'components.js');

// Names a reader would reasonably mistake for the framework's teardown hook.
// Deliberately NARROW:
//   - `dispose` is the Three.js convention, not a Slice one (kit/targets.js).
//   - `cleanup` is almost always a private helper the hook calls into —
//     ToolTip.cleanup() is invoked from beforeDestroy and is correct.
// Only the names that genuinely read as "the framework calls this" are listed.
const DEAD_HOOKS = ['destroy', 'willDestroy', 'unmount'];

const DECLARATION = new RegExp(
   String.raw`(?:async\s+)?(?:${DEAD_HOOKS.join('|')})\s*\(\s*\)\s*\{`
);

// ── Finding the component class ─────────────────────────────────────────────

/**
 * Replace strings, comments, template literals and regex literals with spaces,
 * preserving every newline so line numbers still point at the real source.
 * Braces (and method signatures) inside a template can then never affect the
 * class-body scan.
 */
function maskNonCode(source) {
   const out = source.split('');
   const blank = (index) => {
      if (source[index] !== '\n') out[index] = ' ';
   };
   const blankRange = (start, end) => {
      for (let index = start; index < end; index += 1) blank(index);
   };

   let i = 0;
   while (i < source.length) {
      const ch = source[i];
      const next = source[i + 1];

      if (ch === '/' && next === '/') {
         const end = source.indexOf('\n', i + 2);
         const stop = end === -1 ? source.length : end;
         blankRange(i, stop);
         i = stop;
         continue;
      }

      if (ch === '/' && next === '*') {
         const end = source.indexOf('*/', i + 2);
         const stop = end === -1 ? source.length : end + 2;
         blankRange(i, stop);
         i = stop;
         continue;
      }

      if (ch === "'" || ch === '"') {
         const end = scanString(source, i, ch);
         blankRange(i, end);
         i = end;
         continue;
      }

      if (ch === '`') {
         const end = scanTemplate(source, i);
         blankRange(i, end);
         i = end;
         continue;
      }

      if (ch === '/' && isRegexStart(source, i)) {
         const end = scanRegex(source, i);
         blankRange(i, end);
         i = end;
         continue;
      }

      i += 1;
   }

   return out.join('');
}

/** Index just past the closing quote of the string that starts at `start`. */
function scanString(source, start, quote) {
   let i = start + 1;
   while (i < source.length) {
      if (source[i] === '\\') {
         i += 2;
         continue;
      }
      if (source[i] === quote) return i + 1;
      i += 1;
   }
   return i;
}

/** Index just past the closing `/` of the regex that starts at `start`. */
function scanRegex(source, start) {
   let inClass = false;
   let i = start + 1;
   while (i < source.length) {
      const ch = source[i];
      if (ch === '\\') {
         i += 2;
         continue;
      }
      if (ch === '[') inClass = true;
      else if (ch === ']') inClass = false;
      else if (ch === '/' && !inClass) return i + 1;
      else if (ch === '\n') return i; // unterminated: stop at the line end
      i += 1;
   }
   return i;
}

/** Index just past the closing backtick of the template at `start`. */
function scanTemplate(source, start) {
   let i = start + 1;
   while (i < source.length) {
      if (source[i] === '\\') {
         i += 2;
         continue;
      }
      if (source[i] === '`') return i + 1;
      if (source[i] === '$' && source[i + 1] === '{') {
         i = scanTemplateExpression(source, i + 2);
         continue;
      }
      i += 1;
   }
   return i;
}

/** Index just past the `}` that closes a `${ … }` expression. */
function scanTemplateExpression(source, start) {
   let depth = 1;
   let i = start;
   while (i < source.length) {
      const ch = source[i];
      const next = source[i + 1];

      if (ch === '/' && next === '/') {
         const end = source.indexOf('\n', i + 2);
         if (end === -1) return source.length;
         i = end;
         continue;
      }
      if (ch === '/' && next === '*') {
         const end = source.indexOf('*/', i + 2);
         if (end === -1) return source.length;
         i = end + 2;
         continue;
      }
      if (ch === "'" || ch === '"') {
         i = scanString(source, i, ch);
         continue;
      }
      if (ch === '`') {
         i = scanTemplate(source, i);
         continue;
      }
      if (ch === '/' && isRegexStart(source, i)) {
         i = scanRegex(source, i);
         continue;
      }

      if (ch === '{') depth += 1;
      else if (ch === '}') {
         depth -= 1;
         if (depth === 0) return i + 1;
      }
      i += 1;
   }
   return i;
}

/** Whether the `/` at `index` starts a regex literal rather than a division. */
function isRegexStart(source, index) {
   let i = index - 1;
   while (i >= 0 && /\s/.test(source[i])) i -= 1;
   if (i < 0) return true;
   if ('([{,;:=!&|?+-*%<>~^'.includes(source[i])) return true;
   return /\b(?:return|throw|case|typeof|instanceof|in|of|void|delete|yield|await)$/
      .test(source.slice(Math.max(0, i - 10), i + 1));
}

/** The body of the file's `export default class`, or null for a helper module. */
function componentClassBody(source) {
   const masked = maskNonCode(source);
   const declaration = /export\s+default\s+class\b/.exec(masked);
   if (!declaration) return null;

   const open = masked.indexOf('{', declaration.index + declaration[0].length);
   if (open === -1) return null;

   let depth = 0;
   let close = -1;
   for (let i = open; i < masked.length; i += 1) {
      if (masked[i] === '{') depth += 1;
      else if (masked[i] === '}') {
         depth -= 1;
         if (depth === 0) {
            close = i;
            break;
         }
      }
   }
   if (close === -1) return null;

   return {
      open,
      close,
      firstLine: source.slice(0, open).split('\n').length,
      body: source.slice(open + 1, close),
      maskedBody: masked.slice(open + 1, close),
   };
}

/** The indentation of the class's own members (2 or 3 spaces in this repo). */
function memberIndent(maskedBody) {
   for (const line of maskedBody.split('\n')) {
      if (line.trim() === '') continue;
      return line.match(/^[ \t]*/)[0];
   }
   return null;
}

// ── Scan registered components ──────────────────────────────────────────────

async function registeredComponentFiles() {
   const registrySource = await readFile(REGISTRY_FILE, 'utf8');
   const match = registrySource.match(/const components = ({[\s\S]*?});/);
   if (!match) {
      throw new Error('Invalid components.js format. Expected: const components = { ... };');
   }

   return Object.entries(JSON.parse(match[1]))
      .map(([name, category]) => path.join(COMPONENTS_ROOT, category, name, `${name}.js`))
      .filter((file) => existsSync(file));
}

const offenders = [];
const unreadable = [];

for (const file of await registeredComponentFiles()) {
   const source = await readFile(file, 'utf8');
   const klass = componentClassBody(source);
   if (!klass) {
      unreadable.push({ file, reason: 'no default-exported class' });
      continue;
   }

   const indent = memberIndent(klass.maskedBody);
   if (indent === null) {
      unreadable.push({ file, reason: 'empty class body' });
      continue;
   }

   const escapedIndent = indent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   const declaration = new RegExp(`^${escapedIndent}${DECLARATION.source}`);

   klass.maskedBody.split('\n').forEach((line, index) => {
      if (!declaration.test(line)) return;
      offenders.push({
         file: path.relative(ROOT, file),
         line: klass.firstLine + index,
         text: klass.body.split('\n')[index].trim(),
      });
   });
}

if (unreadable.length > 0) {
   console.error('\n  ✗ Could not read the component class, so its teardown hook was not checked.\n');
   for (const item of unreadable) {
      console.error(`    ${path.relative(ROOT, item.file)}  (${item.reason})`);
   }
   console.error('');
   process.exit(1);
}

if (offenders.length > 0) {
   console.error('\n  ✗ Found teardown methods the framework never calls.\n');
   for (const o of offenders) {
      console.error(`    ${o.file}:${o.line}  ${o.text}`);
   }
   console.error(
      '\n  The controller invokes only `beforeDestroy()`. Rename these, or the cleanup\n' +
      '  silently never runs and the component leaks its listeners and registry entry.\n'
   );
   process.exit(1);
}

console.log('OK - every teardown hook is named beforeDestroy().');
