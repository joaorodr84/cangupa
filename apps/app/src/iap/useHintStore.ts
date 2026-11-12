// Wraps react-native-iap's own useIAP hook down to exactly what
// HintStorePopup needs — the three known hint packs with their live store
// price, a buy(sku) call, and a status the popup can render inline — so the
// popup doesn't have to know react-native-iap's own purchase-request shape
// (separate apple/google sku fields, finishTransaction, listener wiring).
// react-native-iap needs a native build (EAS dev client or a store build,
// per eas.json's developmentClient profile) — it has no Expo Go support, so
// `connected` simply never turns true there and the popup shows its
// "connecting" state indefinitely, same as it would on a real device with no
// network yet.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isUserCancelledError, useIAP, type Product, type Purchase, type PurchaseError } from 'react-native-iap';

import { HINT_PRODUCT_SKUS, HINT_PRODUCTS, hintsForSku } from './hintProducts';

export interface HintStoreProduct {
  readonly sku: string;
  readonly hints: number;
  // The store's own localized price string once fetchProducts resolves —
  // undefined until then, so the popup can show a per-row loading state
  // instead of a placeholder price that might be wrong.
  readonly displayPrice: string | undefined;
}

export type HintPurchaseStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'pending'; readonly sku: string }
  | { readonly kind: 'error'; readonly message: string };

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useHintStore(onPurchased: (hints: number) => void) {
  const [status, setStatus] = useState<HintPurchaseStatus>({ kind: 'idle' });

  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: (purchase: Purchase) => {
      const hints = hintsForSku(purchase.productId);
      // Finished first regardless of whether the sku is one of ours: an
      // unfinished consumable replays on iOS's next launch and auto-refunds
      // on Android after three days (finishTransaction's own warning), so a
      // purchase outside this store's own product list still has to be
      // cleared from the queue, just without crediting anything.
      void finishTransaction({ purchase, isConsumable: true }).finally(() => {
        if (hints > 0) onPurchased(hints);
        setStatus({ kind: 'idle' });
      });
    },
    onPurchaseError: (error: PurchaseError) => {
      setStatus(isUserCancelledError(error) ? { kind: 'idle' } : { kind: 'error', message: error.message });
    },
  });

  useEffect(() => {
    if (!connected) return;
    void fetchProducts({ skus: [...HINT_PRODUCT_SKUS], type: 'in-app' }).catch((error: unknown) => {
      setStatus({ kind: 'error', message: messageOf(error) });
    });
  }, [connected, fetchProducts]);

  const storeProducts: readonly HintStoreProduct[] = useMemo(() => {
    const bySku = new Map<string, Product>(products.map((product) => [product.id, product]));
    return HINT_PRODUCTS.map((product) => ({
      sku: product.sku,
      hints: product.hints,
      displayPrice: bySku.get(product.sku)?.displayPrice,
    }));
  }, [products]);

  const buy = useCallback(
    (sku: string) => {
      setStatus({ kind: 'pending', sku });
      void requestPurchase({
        request: { apple: { sku }, google: { skus: [sku] } },
        type: 'in-app',
      }).catch((error: unknown) => {
        setStatus({ kind: 'error', message: messageOf(error) });
      });
    },
    [requestPurchase],
  );

  return { connected, products: storeProducts, status, buy };
}
