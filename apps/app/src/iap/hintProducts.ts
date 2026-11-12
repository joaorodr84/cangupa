// The three hint packs CANGUPA-79 sells, decided with the owner alongside
// CANGUPA-106's pack-unlock purchase (same react-native-iap SDK, same
// consumable shape): 10/25/100 hints at $0.99/$1.99/$4.99 — pricing and
// quantities set directly in App Store Connect/Play Console under these
// SKUs, not read from here at runtime (fetchHintProducts asks the store for
// the live, localized price).
export interface HintProduct {
  readonly sku: string;
  readonly hints: number;
}

// One plain id per platform, matching what's registered in App Store Connect
// and Play Console — react-native-iap takes the same sku on both.
export const HINT_PRODUCTS: readonly HintProduct[] = [
  { sku: 'com.joaorodr84.cangupa.hints10', hints: 10 },
  { sku: 'com.joaorodr84.cangupa.hints25', hints: 25 },
  { sku: 'com.joaorodr84.cangupa.hints100', hints: 100 },
];

export const HINT_PRODUCT_SKUS: readonly string[] = HINT_PRODUCTS.map((product) => product.sku);

// How many hints a purchased sku is worth, or 0 for a sku this store doesn't
// recognise — e.g. a stale purchase from a product since removed from the
// listing, which still has to be finished (cleared from the queue) without
// crediting anything.
export function hintsForSku(sku: string): number {
  return HINT_PRODUCTS.find((product) => product.sku === sku)?.hints ?? 0;
}
