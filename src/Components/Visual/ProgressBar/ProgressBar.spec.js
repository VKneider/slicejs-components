import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

test('determinate value, label, max and value text update in place', async ({ mount }) => {
   const c = await mount('ProgressBar', { value: 2, max: 8, label: 'Importing files', showValue: true });
   const bar = c.component.getByRole('progressbar', { name: 'Importing files' });
   await expect(bar).toHaveAttribute('aria-valuenow', '2');
   await expect(bar).toHaveAttribute('aria-valuemax', '8');
   await expect(c.locator('.slice-progress-bar__value')).toHaveText('25%');
   await c.component.evaluate(el => { el.value = 12; });
   await expect(bar).toHaveAttribute('aria-valuenow', '8');
   await c.component.evaluate(el => { el.max = 0; el.value = -2; });
   await expect(bar).toHaveAttribute('aria-valuemax', '100');
   await expect(bar).toHaveAttribute('aria-valuenow', '0');
   expect(c.pageErrors()).toEqual([]);
});

test('custom formatting and aria value text, with a visually hidden label', async ({ mount }) => {
   const c = await mount('ProgressBar', { value: 3, max: 8, label: 'Import', showLabel: false, showValue: true });
   await c.component.evaluate(el => { el.format = (v, max) => `${v} / ${max} files`; });
   await expect(c.locator('.slice-progress-bar__value')).toHaveText('3 / 8 files');
   await expect(c.component.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 / 8 files');
   await expect(c.locator('.slice-progress-bar__label')).toHaveClass(/is-visually-hidden/);
   await c.component.evaluate(el => { el.ariaValueText = 'Three files imported'; el.showValue = false; });
   await expect(c.component.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Three files imported');
   await expect(c.locator('.slice-progress-bar__value')).toBeHidden();
});

test('indeterminate removes the claimed value; switching back restores it; reduced motion', async ({ mount, page }) => {
   await page.emulateMedia({ reducedMotion: 'reduce' });
   const c = await mount('ProgressBar', { value: 42, label: 'Uploading', indeterminate: true, showValue: true });
   const bar = c.component.getByRole('progressbar');
   await expect(bar).not.toHaveAttribute('aria-valuenow', /.*/);
   await expect(bar).not.toHaveAttribute('aria-valuetext', /.*/);
   await expect(c.locator('.slice-progress-bar__value')).toHaveText('Working…');
   expect(await c.locator('.slice-progress-bar__fill').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
   await c.component.evaluate(el => { el.indeterminate = false; });
   await expect(bar).toHaveAttribute('aria-valuenow', '42');
});

test('tones, sizes, invalid input fallbacks and narrow layout', async ({ mount, page }) => {
   await page.setViewportSize({ width: 320, height: 480 });
   const c = await mount('ProgressBar', { label: 'A meaningful label', showValue: true });
   for (const tone of ['neutral', 'accent', 'info', 'success', 'warning', 'danger']) {
      await c.component.evaluate((el, v) => { el.tone = v; }, tone);
      await expect(c.component).toHaveAttribute('data-tone', tone);
   }
   for (const size of ['sm', 'md', 'lg']) {
      await c.component.evaluate((el, v) => { el.size = v; }, size);
      await expect(c.component).toHaveAttribute('data-size', size);
   }
   await c.component.evaluate(el => { el.size = 'huge'; el.tone = 'unknown'; });
   await expect(c.component).toHaveAttribute('data-size', 'md');
   await expect(c.component).toHaveAttribute('data-tone', 'accent');
   expect(await c.component.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
});
