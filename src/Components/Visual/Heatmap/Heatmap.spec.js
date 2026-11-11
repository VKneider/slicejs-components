import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

const cells = (c) => c.locator('[role="gridcell"]');

test.describe('Heatmap', () => {
   test('calendar smoke: 7 rows, one cell per day in range, the last day is the Tab stop', async ({ mount }) => {
      const c = await mount('Heatmap', {
         start: '2026-01-01', end: '2026-01-31', weekStart: 1, locale: 'en',
         data: [{ date: '2026-01-05', value: 2 }, { date: '2026-01-05', value: 1 }, { date: '2026-01-20', value: 9 }],
      });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.locator('[role="grid"]')).toHaveCount(1);
      await expect(c.locator('[role="row"]')).toHaveCount(7);
      await expect(cells(c)).toHaveCount(31);
      await expect(c.locator('[role="gridcell"][tabindex="0"]')).toHaveCount(1);
      await expect(c.locator('[role="gridcell"][tabindex="0"]')).toHaveAttribute('aria-label', /Jan 31, 2026/);
      // Same day twice is summed.
      await expect(c.locator('[role="gridcell"][aria-label*="Jan 5, 2026"]')).toHaveAttribute('aria-label', /: 3$/);
      // Monday first: Jan 1 2026 is a Thursday, so the first column starts on Dec 29 (out of range).
      await expect(c.locator('.slice-heatmap__cell.is-out')).not.toHaveCount(0);
   });

   test('levels: empty is 0, the max is the top level; thresholds set them by value', async ({ mount }) => {
      const c = await mount('Heatmap', {
         start: '2026-01-01', end: '2026-01-07',
         data: { '2026-01-02': 1, '2026-01-03': 5, '2026-01-04': 10 },
      });
      const levelOf = (date) => c.locator(`[role="gridcell"][aria-label*="${date}"]`).getAttribute('data-level');
      expect(await levelOf('Jan 1')).toBe('0');
      expect(await levelOf('Jan 4')).toBe('4');
      expect(await levelOf('Jan 3')).toBe('2');
      await c.component.evaluate((el) => { el.thresholds = [1, 2, 3, 20]; });
      expect(await levelOf('Jan 4')).toBe('3');
      await c.component.evaluate((el) => { el.levels = 3; el.thresholds = null; });
      expect(await levelOf('Jan 4')).toBe('2');
      await expect(c.locator('.slice-heatmap__swatch')).toHaveCount(3);
   });

   test('keyboard: arrows move across days and weeks, skipping out-of-range cells; Enter reports', async ({ mount, page }) => {
      const c = await mount('Heatmap', { start: '2026-01-01', end: '2026-01-31', weekStart: 0, locale: 'en' }, { spies: ['onCellClick'] });
      await c.locator('[role="gridcell"][tabindex="0"]').focus();
      await expect(page.locator(':focus')).toHaveAttribute('aria-label', /Jan 31/);
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator(':focus')).toHaveAttribute('aria-label', /Jan 24/);
      await page.keyboard.press('ArrowUp');
      await expect(page.locator(':focus')).toHaveAttribute('aria-label', /Jan 23/);
      await page.keyboard.press('Home');
      await expect(page.locator(':focus')).toHaveAttribute('aria-label', /Jan 2,/);
      await page.keyboard.press('Enter');
      await expect.poll(() => c.events('onCellClick')).toBe(1);
      const [[cell]] = await c.eventArgs('onCellClick');
      expect(cell.value).toBe(0);
      await expect(c.locator('[role="gridcell"][tabindex="0"]')).toHaveCount(1);
   });

   test('tip shows the cell text on hover and focus', async ({ mount, page }) => {
      const c = await mount('Heatmap', { start: '2026-01-01', end: '2026-01-14', locale: 'en', data: { '2026-01-03': 4 } });
      const cell = c.locator('[role="gridcell"][aria-label*="Jan 3"]');
      await cell.hover();
      await expect(c.locator('.slice-heatmap__tip')).toBeVisible();
      await expect(c.locator('.slice-heatmap__tip')).toHaveText(/Jan 3, 2026: 4/);
      await page.mouse.move(0, 0);
      await expect(c.locator('.slice-heatmap__tip')).toBeHidden();
   });

   test('grid type: rows × columns from labels, values by label or index; custom label', async ({ mount, page }) => {
      const c = await mount('Heatmap', {
         type: 'grid', rows: ['Mon', 'Tue'], columns: ['9', '10', '11'],
         data: [{ row: 'Mon', column: '9', value: 3 }, { row: 1, column: 2, value: 6 }],
      });
      await expect(c.locator('[role="row"]')).toHaveCount(2);
      await expect(cells(c)).toHaveCount(6);
      await expect(c.locator('.slice-heatmap__columns span')).toHaveText(['9', '10', '11']);
      await expect(cells(c).first()).toHaveAttribute('aria-label', 'Mon, 9: 3');
      await page.evaluate(() => {
         document.querySelector('slice-heatmap').label = (cell) => `${cell.value} visits on ${cell.row} at ${cell.column}:00`;
      });
      await expect(cells(c).last()).toHaveAttribute('aria-label', '6 visits on Tue at 11:00');
   });

   test('legend, summary and texts', async ({ mount }) => {
      const c = await mount('Heatmap', { start: '2026-01-01', end: '2026-01-10', data: { '2026-01-02': 1200, '2026-01-03': 84 }, summary: true, locale: 'en', texts: { less: 'Menos', more: 'Más' } });
      await expect(c.locator('.slice-heatmap__summary')).toHaveText('1,284 in total');
      await expect(c.locator('.slice-heatmap__legend')).toContainText('Menos');
      await expect(c.locator('.slice-heatmap__legend')).toContainText('Más');
      await c.component.evaluate((el) => { el.legend = false; el.labels = false; });
      await expect(c.locator('.slice-heatmap__legend')).toBeHidden();
      await expect(c.locator('.slice-heatmap__columns')).toBeHidden();
   });

   test('a year of data: 53 columns at most, and it opens scrolled to the latest weeks when narrow', async ({ mount, page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      const c = await mount('Heatmap', { end: '2026-06-30' });
      const columns = await c.locator('[role="grid"]').getAttribute('aria-colcount');
      expect(Number(columns)).toBeGreaterThanOrEqual(52);
      expect(Number(columns)).toBeLessThanOrEqual(54);
      await expect.poll(() => c.locator('.slice-heatmap__scroller').evaluate((s) => s.scrollLeft > 0)).toBe(true);
   });
});
