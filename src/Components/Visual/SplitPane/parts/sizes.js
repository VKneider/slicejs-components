// SplitPane's pure percentage allocator. Bounds are relaxed only if infeasible.
export function bounds(panels) {
   const min = panels.map(p => p.collapsed ? 0 : Math.max(0, Math.min(100, Number(p.minSize) || 0)));
   const max = panels.map((p, i) => p.collapsed ? 0 : Math.max(min[i], Math.min(100, Number.isFinite(Number(p.maxSize)) ? Number(p.maxSize) : 100)));
   const lower = min.reduce((a, b) => a + b, 0);
   if (lower > 100) min.forEach((v, i) => { min[i] = v * 100 / lower; });
   const upper = max.reduce((a, b) => a + b, 0);
   if (upper < 100) {
      const room = panels.map((p, i) => p.collapsed ? 0 : 100 - max[i]);
      const total = room.reduce((a, b) => a + b, 0);
      max.forEach((v, i) => { max[i] = v + (total ? (100 - upper) * room[i] / total : 0); });
   }
   return { min, max, constrained: lower > 100 || upper < 100 };
}

export function allocate(panels, requested = []) {
   if (!panels.length) return [];
   const { min, max } = bounds(panels);
   const weights = panels.map((p, i) => p.collapsed || !Number.isFinite(Number(requested[i])) ? 0 : Math.max(0, Number(requested[i])));
   if (!weights.some(Boolean)) panels.forEach((p, i) => { weights[i] = p.collapsed ? 0 : 1; });
   const total = weights.reduce((a, b) => a + b, 0) || 1;
   const sizes = weights.map((v, i) => Math.max(min[i], Math.min(max[i], v * 100 / total)));
   // Distribute residual within remaining capacity. Each pass saturates a bound.
   for (let pass = 0; pass <= panels.length; pass++) {
      const delta = 100 - sizes.reduce((a, b) => a + b, 0);
      if (Math.abs(delta) < 1e-8) break;
      const room = sizes.map((v, i) => delta > 0 ? max[i] - v : v - min[i]);
      const capacity = room.reduce((a, b) => a + b, 0);
      if (capacity <= 1e-8) break;
      sizes.forEach((v, i) => { sizes[i] = v + delta * room[i] / capacity; });
   }
   return sizes;
}

export function pairRange(panels, sizes, index) {
   const { min, max } = bounds(panels);
   const total = (sizes[index] || 0) + (sizes[index + 1] || 0);
   return { min: Math.max(min[index] || 0, total - (max[index + 1] || 0)), max: Math.min(max[index] || 0, total - (min[index + 1] || 0)), total };
}

export function resizePair(panels, sizes, index, value) {
   if (index < 0 || index >= panels.length - 1 || !Number.isFinite(value)) return [...sizes];
   const range = pairRange(panels, sizes, index);
   const next = [...sizes];
   next[index] = Math.max(range.min, Math.min(range.max, value));
   next[index + 1] = range.total - next[index];
   return next;
}
