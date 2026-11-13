import { test, expect } from '../playwright/harness/sliceFixtures.js';

// The Markdown examples are executable code, not prose: a typo in a step target
// or in the onLaunch wiring must fail here instead of only in the live preview.
test('tour docs examples launch against the workspace targets @server', async ({ page }) => {
   await page.goto('/docs/services/tour-service');
   await expect(page.locator('.documentation-content')).toBeAttached();
   await page.waitForFunction(
      () => document.querySelectorAll('.demobox-preview .slice-tour-demo').length === 2,
      null,
      { timeout: 30_000 },
   );
   await page.waitForTimeout(1500);
   const errors = await page.evaluate(() =>
      [...document.querySelectorAll('.doc-script-error')]
         .filter(el => !el.hidden)
         .map(el => el.textContent.trim()),
   );
   expect(errors).toEqual([]);

   const previews = page.locator('.demobox-preview').filter({ has: page.locator('.slice-tour-demo') });
   await previews.first().getByRole('button', { name: 'Take the tour', exact: true }).click();
   await expect(page.locator('.slice-tour-overlay__title')).toHaveText('A home for your team');
   await page.keyboard.press('Escape');
   await expect(page.locator('slice-tour-overlay')).toHaveCount(0);

   await previews.nth(1).getByRole('button', { name: 'Try the interactive tour', exact: true }).click();
   await expect(page.locator('.slice-tour-overlay__title')).toHaveText('Make room for what matters');
   await page.keyboard.press('Escape');
   await expect(page.locator('slice-tour-overlay')).toHaveCount(0);
});
