// Caps the board's rendered width so it also fits the height available
// (CANGUPA-33) — Board.tsx's own width:'100%' only ever tracks the
// container's width via aspectRatio, with nothing capping it by height, so
// a wide/short (landscape) window could overflow vertically. `w`/`h` are the
// level's size in cells, `maxWidth`/`maxHeight` the space on screen the
// board may use, both in px; the aspect ratio stays w/h either way, so
// capping the width is enough to cap the height too.
export function fitBoardWidth(w: number, h: number, maxWidth: number, maxHeight: number): number {
  return Math.max(0, Math.min(maxWidth, maxHeight * (w / h)));
}
