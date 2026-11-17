// Grid's pure shortest-column packing. Input heights include item margins.
export function packMasonry(items, columns, columnWidth, gap = 0, rowGap = gap) {
   const count = Math.max(1, Math.floor(columns) || 1);
   const bottoms = Array(count).fill(0);
   const positions = items.map(item => {
      const span = item.span === 'full' ? count : Math.max(1, Math.min(count, Math.round(Number(item.span)) || 1));
      let column = 0;
      let y = Infinity;
      for (let start = 0; start <= count - span; start++) {
         const top = Math.max(...bottoms.slice(start, start + span));
         if (top < y) { y = top; column = start; }
      }
      const height = Math.max(0, Number(item.height) || 0);
      const bottom = y + height + rowGap;
      for (let i = column; i < column + span; i++) bottoms[i] = bottom;
      return { x: column * (columnWidth + gap), y, width: span * columnWidth + (span - 1) * gap, span };
   });
   return { positions, height: positions.length ? Math.max(...bottoms) - rowGap : 0 };
}
