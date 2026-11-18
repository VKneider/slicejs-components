import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';
const items = [
   {
      value: 'read',
      label: 'Read projects',
      description: 'Read reports',
      group: 'Projects',
   },
   {
      value: 'edit',
      label: 'Edit projects',
      description: 'Change project details',
      group: 'Projects',
   },
   { value: 'policy', label: 'Audit access', locked: true, group: 'Security' },
   { value: 'off', label: 'Unavailable access', disabled: true },
];
test('TransferList composes labelled controls, preserves unknown assignments and emits the new value', async ({
   mount,
}) => {
   const c = await mount(
      'TransferList',
      { items, value: ['future', 'policy'], ariaLabel: 'Role permissions' },
      { spies: ['onChange'] },
   );
   await expect(c.component).toHaveAttribute('aria-label', 'Role permissions');
   await expect(c.locator('.slice-transfer-list__unknown')).toContainText(
      '1 assigned',
   );
   expect(await c.events('onChange')).toBe(0);
   await c.component
      .getByRole('button', { name: 'Assign: Read projects', exact: true })
      .click();
   await expect
      .poll(() => c.component.evaluate((el) => el.value))
      .toEqual(['future', 'policy', 'read']);
   expect((await c.eventArgs('onChange')).at(-1)[1]).toMatchObject({
      direction: 'assign',
      values: ['read'],
   });
   await expect(
      c.component.getByRole('button', {
         name: 'Remove: Audit access',
         exact: true,
      }),
   ).toBeDisabled();
   await expect(
      c.component.getByRole('button', {
         name: 'Assign: Unavailable access',
         exact: true,
      }),
   ).toBeDisabled();
   expect(c.pageErrors()).toEqual([]);
});
test('TransferList keyboard and filtered bulk actions include only visible movable rows', async ({
   mount,
}) => {
   const c = await mount('TransferList', { items, value: ['policy'] });
   const available = c.locator('[data-side=available]');
   await available
      .getByRole('checkbox', { name: 'Read projects', exact: true })
      .press('Space');
   await expect
      .poll(() => c.component.evaluate((el) => el.getSelection('available')))
      .toEqual(['read']);
   await available.locator('slice-input input').fill('Edit');
   await expect
      .poll(() => c.component.evaluate((el) => el.getSelection('available')))
      .toEqual([]);
   await available
      .getByRole('checkbox', {
         name: 'Select visible items: Available',
         exact: true,
      })
      .press('Space');
   await available
      .getByRole('button', { name: 'Assign selected', exact: true })
      .press('Enter');
   await expect
      .poll(() => c.component.evaluate((el) => el.value))
      .toEqual(['policy', 'edit']);
   await expect(
      c
         .locator('[data-side=assigned]')
         .getByRole('button', { name: 'Remove: Edit projects', exact: true }),
   ).toBeVisible();
});
test('TransferList keeps rich content and control identity while moving, then destroys removed content', async ({
   mount,
}) => {
   const c = await mount('TransferList');
   const result = await c.component.evaluate(async (el) => {
      const child = await slice.build('Button', { value: 'Inspect' });
      const field = document.createElement('textarea');
      field.value = 'Draft';
      const box = document.createElement('div');
      box.append(field, child);
      el.items = [{ value: 'a', label: 'A', content: box }];
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await el.update();
      const row = el._rows.get('a');
      field.focus();
      field.setSelectionRange(1, 3);
      el.assign(['a']);
      await el.update();
      const kept =
         el._rows.get('a') === row &&
         document.activeElement === field &&
         field.selectionStart === 1;
      el.remove(['a']);
      await el.update();
      el.items = [];
      await el.update();
      return {
         kept,
         value: field.value,
         clean: !slice.controller.activeComponents.has(child.sliceId),
      };
   });
   expect(result).toEqual({ kept: true, value: 'Draft', clean: true });
});
test('TransferList shows loading/error/retry, disabled state and reactive text overrides', async ({
   mount,
}) => {
   const c = await mount(
      'TransferList',
      { loading: true },
      { spies: ['onRetry'] },
   );
   await expect(c.component).toHaveAttribute('aria-busy', 'true');
   await expect(
      c.locator('.slice-transfer-list__skeleton').first(),
   ).toBeVisible();
   await c.component.evaluate((el) => {
      el.loading = false;
      el.error = 'Catalog unavailable';
   });
   await expect(c.locator('[role=alert]')).toContainText('Catalog unavailable');
   await c.component
      .getByRole('button', { name: 'Try again', exact: true })
      .click();
   expect(await c.events('onRetry')).toBe(1);
   await c.component.evaluate((el) => {
      el.error = '';
      el.items = [{ value: 'a', label: 'A' }];
      el.disabled = true;
      el.texts = { available: 'Disponibles', assigned: 'Asignados' };
   });
   await expect(c.locator('.slice-transfer-list__title').first()).toHaveText(
      'Disponibles',
   );
   await expect(
      c.component.getByRole('button', { name: 'Assign: A', exact: true }),
   ).toBeDisabled();
   expect(await c.component.evaluate((el) => el.assign(['a']))).toBe(false);
});
test('TransferList stacked layout follows its container and destroys all composed controls', async ({
   mount,
}) => {
   const c = await mount('TransferList', { items });
   await c.component.evaluate((el) => {
      el.style.width = '360px';
   });
   await expect(c.locator('.slice-transfer-list__panels')).toHaveCSS(
      'grid-template-columns',
      /^[\d.]+px$/,
   );
   expect(
      await c.component.evaluate((el) => {
         const ids = [...el.querySelectorAll('[slice-id]')].map(
            (node) => node.sliceId,
         );
         slice.controller.destroyComponent(el);
         return ids.every((id) => !slice.controller.activeComponents.has(id));
      }),
   ).toBe(true);
});
