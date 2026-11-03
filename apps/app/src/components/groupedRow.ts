// Corner radii for one row in a vertically stacked group (CANGUPA-51): the
// group should read as a single rounded block, not a stack of separate
// pills, so only the first row's top corners and the last row's bottom
// corners are rounded. A lone row (length 1) keeps all four, since there is
// no neighbour for it to merge with. Ported from DigiSpin's
// src/screens/groupedRow.ts.
export interface RowCorners {
  readonly borderTopLeftRadius: number;
  readonly borderTopRightRadius: number;
  readonly borderBottomLeftRadius: number;
  readonly borderBottomRightRadius: number;
}

export function groupedRowCorners(index: number, length: number, radius: number): RowCorners {
  const isFirst = index === 0;
  const isLast = index === length - 1;
  return {
    borderTopLeftRadius: isFirst ? radius : 0,
    borderTopRightRadius: isFirst ? radius : 0,
    borderBottomLeftRadius: isLast ? radius : 0,
    borderBottomRightRadius: isLast ? radius : 0,
  };
}
