// TourDemo exercises two realistic tours on the same reusable workspace view.
import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

test('workspace renders multiple Slice components; filters and summary work', async ({ mount }) => {
   const c = await mount('TourDemo');
   await expect(c.component.getByRole('heading', { name: 'Good morning, Alex' })).toBeVisible();
   await expect(c.locator('.slice-tour-demo__project-grid slice-card')).toHaveCount(3);
   await c.component.getByRole('button', { name: 'Filters', exact: true }).click();
   await expect(c.component.getByRole('button', { name: 'Filters', exact: true })).toHaveAttribute('aria-expanded', 'true');
   await c.locator('.slice-tour-demo__search input').fill('Website');
   await expect(c.locator('.slice-tour-demo__results')).toContainText('1 sample projects');
   await c.component.getByRole('button', { name: 'Export summary', exact: true }).click();
   await expect(c.locator('.slice-tour-demo__feedback')).toContainText('Website redesign');
   await c.component.getByRole('button', { name: 'Clear', exact: true }).click();
   await expect(c.locator('.slice-tour-demo__results')).toContainText('3 sample projects');
   expect(c.pageErrors()).toEqual([]);
});

test('overview tour and destruction clean up the active overlay', async ({ mount, page }) => {
   const c = await mount('TourDemo', { tour: 'overview' });
   await c.component.getByRole('button', { name: 'Take the tour', exact: true }).click();
   await expect(page.locator('.slice-tour-overlay__title')).toHaveText('A home for your team');
   await expect(page.locator('.slice-tour-overlay__card')).toHaveAttribute('aria-busy', 'false');
   await page.getByRole('button', { name: 'Next', exact: true }).click();
   await expect(page.locator('.slice-tour-overlay__title')).toHaveText('See the big picture');
   await c.component.evaluate(el => slice.controller.destroyComponent(el));
   await expect(page.locator('slice-tour-overlay')).toHaveCount(0);
   expect(c.pageErrors()).toEqual([]);
});

test('docs-style onLaunch builds a tour against the workspace targets', async ({ mount, page }) => {
   const c = await mount('TourDemo');
   expect(await c.component.evaluate(el => Object.keys(el.targets).sort())).toEqual([
      'create', 'export', 'filters', 'filtersButton', 'metrics', 'nav', 'projects', 'status',
   ]);
   await c.component.evaluate(async el => {
      const tour = await slice.build('TourService', { singleton: true, sliceId: 'docsTour' });
      el.onLaunch = () => tour.start([{ target: el.targets.metrics, title: 'Metrics from the docs' }], { scrollIntoView: false });
   });
   await c.component.getByRole('button', { name: 'Take the tour', exact: true }).click();
   await expect(page.locator('.slice-tour-overlay__title')).toHaveText('Metrics from the docs');
   await expect(page.locator('.slice-tour-overlay__spotlight')).toBeVisible();
   expect(c.pageErrors()).toEqual([]);
});

test('interactive tour waits at Filters, follows the revealed control, and keeps the page usable', async ({ mount, page }) => {
   const c = await mount('TourDemo', { tour: 'interactive' });
   await c.component.getByRole('button', { name: 'Try the interactive tour', exact: true }).click();
   await expect(page.locator('.slice-tour-overlay__title')).toHaveText('Make room for what matters');
   await expect(page.locator('.slice-tour-overlay__card')).toHaveAttribute('aria-modal', 'false');
   await c.component.getByRole('button', { name: 'Filters', exact: true }).click();
   await expect(page.locator('.slice-tour-overlay__card')).toHaveAttribute('aria-busy', 'false');
   await page.getByRole('button', { name: 'Next', exact: true }).click();
   await expect(page.locator('.slice-tour-overlay__title')).toHaveText('Narrow your view');
   await c.locator('.slice-tour-demo__search input').fill('Brand');
   await expect(c.locator('.slice-tour-demo__results')).toContainText('1 sample projects');
   await page.keyboard.press('Escape');
   await expect(page.locator('slice-tour-overlay')).toHaveCount(0);
   expect(c.pageErrors()).toEqual([]);
});
