import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

test('CodeEditorDemo renders a structured workspace with live panels', async ({ mount }) => {
   const c = await mount('CodeEditorDemo', { height: '600px' });
   await expect(c.locator('.slice-code-editor')).toHaveAttribute('aria-label', 'Slice Notes code editor demo');
   await expect(c.locator('.slice-code-editor__crumb')).toHaveText('src/app.js');
   await expect(c.locator('slice-treeview')).toHaveCount(1);
   await expect(c.locator('slice-dock-layout')).toHaveCount(1);
   await expect(c.locator('slice-tabs')).toHaveCount(3);
   await expect(c.locator('slice-split-pane')).toHaveCount(2);
   await expect(c.locator('.slice-code-editor__status-left')).toContainText('main');
   await expect(c.locator('.slice-code-editor__notes li')).toHaveCount(2);
   expect(await c.component.evaluate((el) => [...el.querySelectorAll('[data-dock-group] .slice_tabs_panels')]
      .every((panel) => getComputedStyle(panel).overflowY === 'hidden'))).toBe(true);
   expect(c.pageErrors()).toEqual([]);
});

test('CodeEditorDemo opens files, tracks edits and saves them', async ({ mount }) => {
   const c = await mount('CodeEditorDemo', { height: '600px' });
   await c.component.evaluate((el) => el.openFile('styles'));
   await expect(c.locator('.slice-code-editor__crumb')).toHaveText('src/styles.css');
   await expect(c.locator('.slice-code-editor__status-right')).toContainText('CSS');

   const area = c.locator('.slice_tab_panel.active textarea');
   await area.fill('.notes-app { gap: 24px; }');
   await expect(c.locator('.slice-code-editor__dirty')).toBeVisible();
   await expect(c.locator('[data-view="source"] .slice-code-editor__helper')).toContainText('1 changed file');

   expect(await c.component.evaluate((el) => el.save())).toBe(true);
   await expect(c.locator('.slice-code-editor__dirty')).toBeHidden();
   await expect(c.locator('[data-view="source"] .slice-code-editor__helper')).toHaveText('No changes.');
   expect(c.pageErrors()).toEqual([]);
});

test('CodeEditorDemo search and outline move the caret to a file line', async ({ mount }) => {
   const c = await mount('CodeEditorDemo', { height: '600px' });
   await c.component.evaluate((el) => el._setView('search'));
   await c.locator('[data-view="search"] input').fill('notes-app');
   await expect(c.locator('.slice-code-editor__results li')).toHaveCount(1);
   await c.locator('.slice-code-editor__results li button').click();
   await expect(c.locator('.slice-code-editor__crumb')).toHaveText('src/styles.css');
   expect(await c.component.evaluate((el) => el._editors.get('styles').$textarea.value.includes('notes-app'))).toBe(true);

   await c.component.evaluate((el) => el._setView('explorer'));
   await c.locator('.slice-code-editor__outline-list button').first().click();
   await expect(c.locator('.slice-code-editor__status-right')).toContainText('Ln 1');
});

test('CodeEditorDemo run writes terminal, output and preview state', async ({ mount }) => {
   const c = await mount('CodeEditorDemo', { height: '600px' });
   expect(await c.component.evaluate((el) => el.run())).toBe(true);
   await expect(c.locator('[data-view="explorer"]')).toBeVisible();
   await expect(c.locator('.slice-code-editor__console pre')).toContainText('Build completed - 0 errors, 2 warnings');
   await c.locator('[role="tab"][data-tab-id="output"]').click();
   await expect(c.locator('.slice-code-editor__output')).toContainText('result  ready in 42ms');
   await expect(c.locator('.slice-code-editor__preview-footer')).toContainText('Build #1');
   await expect(c.locator('.slice-code-editor__status-message')).toHaveText('Build succeeded.');
   expect(c.pageErrors()).toEqual([]);
});

test('CodeEditorDemo docking moves a live tab without losing editor state', async ({ mount }) => {
   const c = await mount('CodeEditorDemo', { height: '600px' });
   const result = await c.component.evaluate(async (el) => {
      await el.openFile('app');
      const area = el._editors.get('app').$textarea;
      const before = area.value;
      area.value = `${before}\n// keep me`;
      const moved = await el._dock.moveTab('preview', 'editors');
      return {
         moved,
         value: area.value,
         tabs: el._dock.getTabs('editors').items.map((item) => item.id),
         groups: el.querySelectorAll('[data-dock-group]').length,
      };
   });
   expect(result.moved).toBe(true);
   expect(result.value).toContain('// keep me');
   expect(result.tabs).toContain('preview');
   expect(result.groups).toBe(2);
   expect(c.pageErrors()).toEqual([]);
});

test('CodeEditorDemo destroys every owned component', async ({ mount }) => {
   const c = await mount('CodeEditorDemo', { height: '600px' });
   expect(await c.component.evaluate(async (el) => {
      const ids = [el, ...el.querySelectorAll('[slice-id]')]
         .map((node) => node.sliceId)
         .filter(Boolean);
      slice.controller.destroyComponent(el);
      return ids.every((id) => !slice.controller.activeComponents.has(id));
   })).toBe(true);
});
