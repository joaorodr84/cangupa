# Down Under: the second collection

A plan for a second, paid collection of 500 levels. **Nothing here is built.**
The work is tracked as `CANGUPA-157` in [TODO.md](../TODO.md); this file holds
the details that task points at. Written 2026-11-14.

Everything below is a proposal until the owner confirms it. The open decisions
are collected in [Open decisions](#open-decisions) at the end.

## The idea

"Lay of the Land" (`O Relevo`) is the surface of the outback: ten landforms,
3×3 up to 8×7, five tile kinds. "Down Under" goes beneath it: caves, burrows
and opal mines. Deeper means harder.

- **Name:** "Down Under" in English. The pun does not carry into Portuguese,
  so `pt` needs its own name: "Debaixo da Terra" (first choice) or "Subsolo".
- **Second choice of theme:** "After Dark", the same outback at night. Kept
  here only in case "Down Under" is rejected.
- **Size:** 10 packs of 50 levels, the same shape as Lay of the Land.
  25 per pack is too short for a pack to introduce an idea and still ramp;
  100 halves the number of "pack cleared" moments. `LEVELS_PER_PACK` in
  [pack-plan.js](../tools/pack-plan.js) is already 50.
- **Sold as:** one purchase for the whole collection, not one per pack,
  matching what `CANGUPA-106` already recommends. Lay of the Land stays free.
  Pack 1 (Sinkhole) is free as a taster.
- **Harder than Lay of the Land because of new tiles**, not bigger boards.
  Outback already puts every current tile on the biggest board, so the only
  other ways up are size and density, and size is blocked (see
  [Board sizes](#board-sizes)).

## Packs

| # | Pack (en) | Pack (pt) | Board | What it teaches |
| --- | --- | --- | --- | --- |
| 1 | Sinkhole | Algar | 5×5 | Current tiles only, dense. Free taster |
| 2 | Grotto | Gruta | 6×5 | Introduces Pillar |
| 3 | Cavern | Caverna | 6×5 | Pillar with Gold and Steel |
| 4 | Seep | Lamaçal | 6×6 | Introduces Mud |
| 5 | Sump | Sifão | 6×6 | Mud with Departure and Arrival |
| 6 | Burrow | Toca | 7×6 | Introduces Tunnel (the teleporter pair) |
| 7 | Warren | Galerias | 7×6 | Tunnel with Gold and Steel |
| 8 | Seam | Veio | 7×7 | Pillar, Mud and Tunnel together |
| 9 | Lode | Filão | 7×7 | The three new tiles with Departure and Arrival |
| 10 | Bedrock | Rocha-Mãe | 8×7 | Every tile kind in the game |

Notes on the Portuguese names: "Algar" is the Portuguese word for a vertical
cave shaft and reads better than the textbook "Dolina". "Lamaçal" (a muddy
patch) is not a translation of "Seep" but says what the pack is about.
"Sifão" is the caving term for a sump. "Rocha-Mãe" could also be "Leito de
Rocha" if it reads too geological.

## Board sizes

- **Start at 5×5.** Anyone buying this has finished 500 levels.
- **Never above 8×7.** Two open tasks say why: `CANGUPA-153` (tiles on a
  turned 8×7 can already fall under a 44pt touch target) and `CANGUPA-72`
  (Hint's capped search fails on about 15 of 50 levels in each of the 7×6 and
  8×7 packs when turned to portrait).
- **A tile is introduced on a board size, then mixed on the same size.**
  Packs 2 and 3 share 6×5, 4 and 5 share 6×6, 6 and 7 share 7×6, so the
  second pack of each pair is harder through its tile mix alone.
- **Where pack 1 starts is measured, not guessed.** `OVERLAP` in
  [pack-plan.js](../tools/pack-plan.js) starts each pack at 0.65 of the
  previous pack's hardest `pathBits`. Sinkhole should start from Outback's
  hardest the same way, so the two collections join into one curve.

## New tiles

Three new tiles, chosen from [tile-ideas.md](tile-ideas.md) (#16, #17, #5)
because none of them adds state to the solver's memo key. Keys, switches and
timed tiles were rejected for that reason: they would make `CANGUPA-72` worse.

The level characters already in use are `. 1 2 3 S s T > < v ^ R L D U`. The
characters proposed below are free.

### Pillar (`#`)

- **Rule:** a solid block, not a tile. It is never landed on and never needs
  a visit. A jump whose middle square is a pillar is not allowed. Steps are
  unaffected.
- **Why it is hard:** it turns a jump the player was counting on into two
  steps, which costs a visit on the square in between.
- **Generator:** place pillars only on empty squares that no jump of the walk
  crosses, and prefer squares that block a jump the walk did *not* take, so
  the pillar removes wrong answers and leaves the solution intact.

**Chosen (`CANGUPA-158`): eight-sided, in pale limestone** (`#b9ad98` body,
`#e6dcc9` top, as drawn on
[tile-down-under.html](../tools/visualizers/tile-down-under.html)). The dark
basalt first proposed below nearly disappears on the dark pit, and the cut
corners keep a pillar apart from a round Tunnel mouth at small sizes.

Design ideas:

- It must read as "obstacle", not "ground". Give it a smaller footprint than
  a tile (about 70% of the cell), round or eight-sided, sitting in the pit.
- Colour: a warm dark basalt (brown-grey), clearly apart from Steel's
  blue-grey `#587790`. No tile lip. Instead a lighter top ring and a drop
  shadow to one side, so it looks taller than the tiles around it.
- No mark on it. Tally strokes and brackets mean "you can stand here".
- When the player tries a jump over it, flash the pillar in the palette's
  existing `blocked` colour, the same feedback a refused move already gives.
- Theme: a stalagmite or rock column.

### Mud (`m`)

- **Rule:** one visit. You can step off it but not jump off it. Jumping
  *onto* it is fine.
- **Why it is hard:** it removes half the exits from a square, and the
  player only notices once they are standing on it.
- **Generator:** when the walk stands on a mud tile, it only picks steps.

**Chosen (`CANGUPA-158`): two wavy lines**, in cream `#f6e6cc` on a brown
`#8a5a2b` face with a lighter `#bb8a55` lip, drawn sunk (half a lip). It was
the one mark still readable at 28 px. It says "wet ground" and not "no
jumping", so the how-to-play text has to carry the rule.

Design ideas:

- Colour: an earthy brown (near `#8a5a2b`), dark enough to stay apart from
  Gold `#ffc857`, with a lighter lip.
- Make it look sunk: a thinner lip than other tiles, or the face drawn
  slightly inset, so it sits lower than its neighbours.
- Mark, in order of preference: (a) two short wavy lines across the face;
  (b) a small jump arc with a bar through it, the most literal; (c) two
  drips hanging from the lip. Whichever is chosen must work without colour,
  like the Departure and Arrival brackets do.
- Animation: the kangaroo lands with a small squash and no bounce.
- First version: Mud is always a single visit. A Mud tile that also needs
  two or three visits is possible later but doubles the marks on one face.

### Tunnel (`a`/`a`, `b`/`b`)

The teleporter pair, renamed to fit the theme: a burrow with two mouths.

- **Rule:** landing on one mouth moves you to its twin. Both mouths are used
  up by that one move, and the next move starts from the twin.
- **Why it is hard:** the board stops being flat. Two far corners become
  neighbours, once.
- **Generator:** the walk places both mouths as a pair. The second mouth
  must be unvisited when the first is entered, and neither may be landed on
  at any other point of the walk.
- **Limits for a first version:** one pair per level in Burrow, up to two
  pairs from Warren on.
- **Decided (`CANGUPA-161`):** the start tile is never a mouth. A jump may
  pass over a mouth without entering it, the same as any other live tile —
  Pillar stays the only tile a jump cannot pass over.

**Chosen (`CANGUPA-158`): pair `a` is a round hole, pair `b` a diamond
hole**, each with one light ring, on a violet `#7a4fd0` face with a `#4b2c8f`
lip. Ring count (one ring against two) kept both mouths round but the second
ring was lost at 28 px.

Design ideas:

- Colour: violet, the one hue no current tile uses (cyan, gold, steel blue,
  green and raspberry are taken).
- Face: a dark round hole in the middle of the tile with one lighter ring
  round it, so it reads as an opening.
- Telling two pairs apart must not rely on colour. Use the ring: pair `a`
  has one ring, pair `b` has two. A second option is the hole's shape, round
  for `a` and diamond for `b`.
- Animation: the kangaroo shrinks into the hole, both tiles sink together,
  and it pops out of the twin. Both mouths vanishing at once is what teaches
  the rule.
- When the player is one move from a mouth, a faint pulse on its twin shows
  where they would come out. Worth trying before deciding; it may make the
  levels too easy.

## Pack icons

[PackIcon.tsx](../apps/app/src/components/PackIcon.tsx) draws each icon in a
48 by 48 box, stroke only, one or two shapes, so it still reads at 20 px. The
ideas below keep to that and avoid shapes Lay of the Land already uses.

| # | Pack | Icon idea |
| --- | --- | --- |
| 1 | Sinkhole | A ground line broken in the middle by a deep U-shaped drop |
| 2 | Grotto | A cave mouth: one arch standing on a ground line |
| 3 | Cavern | A stalactite and a stalagmite, two narrow triangles tip to tip with a gap between them. One pointing down is what keeps it apart from Outcrop's two rocks |
| 4 | Seep | A short ceiling line with a single drop falling from it |
| 5 | Sump | A U-bend, like a siphon, with a short water line across it |
| 6 | Burrow | One round hole under a low mound arc |
| 7 | Warren | Two small round holes joined by a curved tunnel line |
| 8 | Seam | Two parallel slanted lines crossing the box corner to corner, a band of ore in rock |
| 9 | Lode | A cut gem: a diamond outline with one facet line across it |
| 10 | Bedrock | Three straight horizontal layers, the lowest the longest. Straight where Creek's two lines are wavy |

Burrow against Billabong (two ellipses) and Bedrock against Creek are the two
pairs most likely to be confused at 20 px, so check those first.

Pack colours: Lay of the Land's ten in
[packColors.ts](../apps/app/src/theme/packColors.ts) are daylight earth tones.
Down Under could run from a dusty ochre at Sinkhole down through slate and
violet to near-black blue at Bedrock, so the Levels tab itself shows the
descent. Each still has to pass `packLabelColorFor`'s contrast check.

## Pack sentences

The existing blurbs hint at the pack's mechanic through the landscape, in one
or two sentences, without naming the rule. These follow that. Portuguese is
European Portuguese with the informal "tu", like the existing ones.

| # | Pack | English | Português |
| --- | --- | --- | --- |
| 1 | Sinkhole / Algar | The ground gives way and the daylight stays behind. Everything you learned up top comes down with you. | O chão cede e a luz do dia fica para trás. Tudo o que aprendeste lá em cima desce contigo. |
| 2 | Grotto / Gruta | Stone columns stand where the roof meets the floor. You can walk around one, never leap over it. | Colunas de pedra erguem-se onde o teto toca o chão. Podes contorná-las, nunca saltar por cima. |
| 3 | Cavern / Caverna | A wide chamber veined with gold and steel grey, its columns standing right where a leap would help most. | Uma câmara ampla com veios de ouro e de cor de aço, e colunas mesmo onde um salto daria mais jeito. |
| 4 | Seep / Lamaçal | Water weeps through the rock and the floor turns to mud. It lets you step away, but never spring. | A água escorre pela rocha e o chão vira lama. Deixa-te dar um passo, mas nunca saltar. |
| 5 | Sump / Sifão | The low point where everything drains: mud underfoot and passages that only run one way. | O ponto mais baixo, para onde tudo escorre: lama debaixo dos pés e passagens de sentido único. |
| 6 | Burrow / Toca | Something dug here before you. Drop into one hole and come out of its twin. | Alguém escavou aqui antes de ti. Entra por um buraco e sai pelo seu gémeo. |
| 7 | Warren / Galerias | Tunnel upon tunnel through gold and steel grey rock. The short way is rarely the right one. | Túnel atrás de túnel por rocha de ouro e cor de aço. O caminho curto raramente é o certo. |
| 8 | Seam / Veio | A band of opal in the dark, guarded by columns, mud and burrows all at once. | Um veio de opala no escuro, guardado por colunas, lama e tocas, tudo ao mesmo tempo. |
| 9 | Lode / Filão | The rich heart of the rock, where every passage has its own rule for coming and going. | O coração rico da rocha, onde cada passagem tem a sua regra para entrar e para sair. |
| 10 | Bedrock / Rocha-Mãe | As deep as the land goes. Everything from the surface and everything from below, on the last solid floor. | O mais fundo que a terra vai. Tudo o que veio da superfície e tudo o que há cá em baixo, no último chão firme. |

## What has to exist before the levels can be generated

`CANGUPA-157` is the generation itself. It depends on these tasks:

1. **`CANGUPA-158`**, a review page to choose how the three tiles look.
   Done: the picks are recorded under each tile above.
2. **`CANGUPA-159` Pillar, `CANGUPA-160` Mud, `CANGUPA-161` Tunnel.** Done,
   in that order, smallest first. Each covers the rule in both engines, the
   generator's walk, the plan column, the drawing and the strings. Both
   engines, because the generator and solver in `tools/` load
   `apps/web-classic/js/game.js` while the app plays with
   [board.ts](../apps/app/src/game/board.ts): a rule that lands in only one
   gives levels the app cannot play. This touches `apps/web-classic` even
   though its own UI work is paused. No pack entry uses any of the three
   yet — `pillars`/`mud`/`tunnels` ranges per pack is `CANGUPA-157`'s own
   open decision, not part of adding the tiles themselves.
3. **`CANGUPA-162`**, more than one collection, in the tools and the app.
   Today `collection` is a single string in the locale files, `PACKS` is one
   flat list of ten, and `PackIcon` and `PACK_COLORS` index by pack number
   0 to 9.
4. **`CANGUPA-163`**, one stored solution per level in a separate file. Not
   a blocker, but best in place before 500 new levels are generated so they
   get solutions in the same run.
5. **`CANGUPA-72`**, the Hint solver on big turned boards. Paid levels where
   Hint hangs are not shippable. Only rectangular boards are turned, so the
   packs at risk are Burrow and Warren (7×6) and Bedrock (8×7); the new
   tiles may shift that, so re-measure once they exist.
6. **`CANGUPA-106`**, the purchase flow, before the collection can be sold.
   It can be generated and tested before that.

## Open decisions

- The collection's name in both languages, and whether the theme is "Down
  Under" at all.
- Whether Sinkhole is the free taster, or the first few levels of every pack.
- Price.
- Whether Pillar may also appear in Lay of the Land's packs later, or stays
  exclusive to the paid collection.
