import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';
const panels = [{ id: 'files', label: 'Files', content: 'Explorer', minSize: 15, maxSize: 60, collapsible: true }, { id: 'editor', label: 'Editor', content: 'Draft', minSize: 20 }];
const handle = '.slice-split-pane__handle';

test('SplitPane: smoke, sizes, orientation, labels and setter defaults', async ({ mount }) => {
   const c = await mount('SplitPane', { panels, sizes: [30, 70] });
   await c.component.evaluate(el => { el.style.height = '300px'; });
   await expect(c.locator(handle)).toHaveAttribute('role', 'separator');
   await expect(c.locator(handle)).toHaveAttribute('aria-orientation', 'vertical');
   await expect(c.locator(handle)).toHaveAttribute('aria-label', 'Resize Files');
   await expect(c.locator(handle)).toHaveAttribute('aria-valuenow', '30');
   await c.component.evaluate(el => { el.orientation = 'vertical'; el.sizes = [40, 60]; el.texts = { resize: 'Ajustar {label}' }; });
   await expect(c.locator(handle)).toHaveAttribute('aria-orientation', 'horizontal');
   await expect(c.locator(handle)).toHaveAttribute('aria-label', 'Ajustar Files');
   await expect(c.locator(handle)).toHaveAttribute('aria-valuenow', '40');
   expect(c.pageErrors()).toEqual([]);
});

test('SplitPane: keyboard limits, collapse/restore, disabled and change payload', async ({ mount }) => {
   const c = await mount('SplitPane', { panels, sizes: [30, 70] }, { spies: ['onChange'] });
   const h = c.locator(handle);
   await h.press('ArrowRight');
   await expect(h).toHaveAttribute('aria-valuenow', '32');
   await h.press('Home');
   await expect(h).toHaveAttribute('aria-valuenow', '15');
   await h.press('End');
   await expect(h).toHaveAttribute('aria-valuenow', '60');
   await h.press('Enter');
   await expect(c.locator('.slice-split-pane__panel').first()).toBeHidden();
   await h.press('Enter');
   await expect(h).toHaveAttribute('aria-valuenow', '60');
   const args = await c.eventArgs('onChange');
   expect(args.at(-2)[1]).toMatchObject({ reason: 'collapse', collapsed: ['files'] });
   await c.component.evaluate(el => { el.disabled = true; });
   await expect(h).toHaveAttribute('aria-disabled', 'true');
   expect(await c.component.evaluate(el => el.collapse('files'))).toBe(false);
});

test('SplitPane: pointer dragging works and touch cancellation restores the distribution', async ({ mount, page }) => {
   const c = await mount('SplitPane', { panels, sizes: [30, 70] });
   await c.component.evaluate(el => { el.style.cssText = 'width:700px;height:240px'; });
   const h = c.locator(handle);
   const rect = await h.boundingBox();
   await page.mouse.move(rect.x + rect.width / 2, rect.y + 30);
   await page.mouse.down();
   await page.mouse.move(rect.x + 80, rect.y + 30);
   await page.mouse.up();
   expect((await c.component.evaluate(el => el.sizes))[0]).toBeGreaterThan(35);
   await expect(c.component).not.toHaveClass(/is-dragging/);
   // Native pointer capture is tested above; synthetic touch events exercise cancel semantics.
   const out = await c.component.evaluate(el => {
      const h = el.querySelector('[role=separator]');
      const original = el.sizes;
      h.setPointerCapture = () => {};
      h.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', pointerId: 8, button: 0, isPrimary: true, clientX: 100, bubbles: true }));
      h.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', pointerId: 8, clientX: 180, bubbles: true }));
      const changed = el.sizes;
      h.dispatchEvent(new PointerEvent('pointercancel', { pointerType: 'touch', pointerId: 8, bubbles: true }));
      return { original, changed, restored: el.sizes };
   });
   expect(out.changed).not.toEqual(out.original);
   expect(out.restored).toEqual(out.original);
});

test('SplitPane: multiple/nested panes, RTL, stable content and teardown', async ({ mount }) => {
   const c = await mount('SplitPane');
   const result = await c.component.evaluate(async el => {
      const input = document.createElement('input'); input.value = 'Unsaved draft';
      const child = await slice.build('Button', { value: 'Save' });
      const box = document.createElement('div'); box.append(child);
      const nested = await slice.build('SplitPane', { orientation: 'vertical', panels: [{ id: 'top', content: 'Preview' }, { id: 'bottom', content: 'Logs' }] });
      el.panels = [{ id: 'a', content: input }, { id: 'b', content: box }, { id: 'c', content: nested }];
      el.sizes = [20, 40, 40];
      el.dir = 'rtl';
      const h = el.querySelector('[role=separator]');
      h.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      const size = el.sizes[0];
      el.panels = el.panels.map(p => ({ ...p, label: p.id }));
      const stable = input.isConnected && input.value === 'Unsaved draft';
      const controls = el.querySelector('[role=separator]').getAttribute('aria-controls');
      const ids = [el.sliceId, child.sliceId, nested.sliceId];
      slice.controller.destroyComponent(el);
      return { stable, size, controls, gone: ids.every(id => !slice.controller.activeComponents.has(id)), dragging: el.classList.contains('is-dragging') };
   });
   expect(result.stable).toBe(true);
   expect(result.size).toBe(22);
   expect(result.controls).toBeTruthy();
   expect(result.gone).toBe(true);
   expect(result.dragging).toBe(false);
});

test('SplitPane: empty/one panel and last expanded panel cannot collapse', async ({ mount }) => {
   const c = await mount('SplitPane');
   await expect(c.locator(handle)).toHaveCount(0);
   expect(await c.component.evaluate(el => { el.panels = [{ id: 'only', content: 'Only panel', collapsible: true }]; return { sizes: el.sizes, collapsed: el.collapse('only') }; })).toEqual({ sizes: [100], collapsed: false });
});

test('SplitPane releases ownership before adopting panels in another pane',async({mount})=>{
 const c=await mount('SplitPane');
 expect(await c.component.evaluate(async source=>{
   const child=await slice.build('Button',{value:'Keep instance'});source.panels=[{id:'editor',content:child}];
   const panels=source.releasePanels();const target=await slice.build('SplitPane',{panels});source.parentElement.append(target);
   slice.controller.destroyComponent(source);
   const live=slice.controller.activeComponents.has(child.sliceId)&&child.parentComponent===target;
   slice.controller.destroyComponent(target);return {live,clean:!slice.controller.activeComponents.has(child.sliceId)};
 })).toEqual({live:true,clean:true});
});
