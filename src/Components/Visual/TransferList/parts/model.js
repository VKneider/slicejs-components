// TransferList's pure catalog, filtering and assignment operations. Unknown keys are retained.
export function validKey(value) {
   return typeof value === 'string'
      ? value.length > 0
      : typeof value === 'number' && Number.isFinite(value);
}
export function normalizeItems(values) {
   const seen = new Set();
   return (Array.isArray(values) ? values : []).map((item) => {
      if (!item || !validKey(item.value) || seen.has(item.value))
         throw new TypeError(
            'TransferList: items need unique string/finite number values',
         );
      seen.add(item.value);
      return {
         ...item,
         label: String(item.label ?? item.value),
         description: String(item.description ?? ''),
         group: String(item.group ?? ''),
         disabled: item.disabled === true,
         locked: item.locked === true,
      };
   });
}
export function normalizeValue(values) {
   const result = [];
   const seen = new Set();
   for (const value of Array.isArray(values) ? values : []) {
      if (!validKey(value))
         throw new TypeError('TransferList: invalid assigned value');
      if (!seen.has(value)) {
         seen.add(value);
         result.push(value);
      }
   }
   return result;
}
export function fold(value) {
   return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
}
export function filterItems(items, assigned, side, search = '') {
   const membership = new Set(assigned);
   const query = fold(search).trim();
   return items.filter(
      (item) =>
         membership.has(item.value) === (side === 'assigned') &&
         (!query ||
            fold(`${item.label} ${item.description} ${item.group}`).includes(
               query,
            )),
   );
}
export function changeAssignment(items, assigned, values, direction) {
   if (!['assign', 'remove'].includes(direction))
      throw new TypeError('TransferList: invalid direction');
   const catalog = new Map(items.map((item) => [item.value, item]));
   const previous = normalizeValue(assigned);
   const membership = new Set(previous);
   const moved = normalizeValue(values).filter((value) => {
      const item = catalog.get(value);
      return (
         item &&
         !item.disabled &&
         !item.locked &&
         (direction === 'assign'
            ? !membership.has(value)
            : membership.has(value))
      );
   });
   const moving = new Set(moved);
   return {
      value:
         direction === 'assign'
            ? [...previous, ...moved]
            : previous.filter((value) => !moving.has(value)),
      moved,
   };
}
