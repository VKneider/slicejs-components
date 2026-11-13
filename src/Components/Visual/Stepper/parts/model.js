// Stepper's item identity and navigation rules; shared by its DOM view and unit tests.
export function normalizeItems(items) {
   const seen = new Set();
   return (Array.isArray(items) ? items : []).filter(item => item && typeof item === 'object').map((item, index) => {
      const id = item.id == null ? String(index) : String(item.id);
      if (seen.has(id)) throw new TypeError(`Stepper item ids must be unique: ${id}`);
      seen.add(id);
      return { ...item, id, title: String(item.title ?? ''), status: ['upcoming', 'current', 'done', 'error'].includes(item.status) ? item.status : 'upcoming', disabled: item.disabled === true };
   });
}

export function activeId(items, requested, mode) {
   if (mode !== 'interactive') return null;
   const explicit = requested == null ? null : items.find(item => item.id === String(requested) && !item.disabled);
   return (explicit || items.find(item => item.status === 'current' && !item.disabled) || items.find(item => !item.disabled))?.id ?? null;
}

export function canSelect(items, index, { mode, linear, clickable, disabled }) {
   const item = items[index];
   if (mode !== 'interactive' || !clickable || disabled || !item || item.disabled) return false;
   if (!linear || item.status === 'done') return true;
   const firstIncomplete = items.findIndex(step => !step.disabled && step.status !== 'done');
   return firstIncomplete < 0 || index <= firstIncomplete;
}
