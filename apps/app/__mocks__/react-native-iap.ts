// react-native-iap needs a native build (no Expo Go support — see
// useHintStore.ts's own comment), so Jest can never load its real native
// module. This manual mock (Jest's own convention: a file here, adjacent to
// node_modules, is used automatically for every test, no jest.mock() call
// needed) stands in with an always-disconnected, inert store so every test
// that merely imports something importing react-native-iap (most of
// App.test.tsx's tree) doesn't crash. Tests that exercise the hint store
// itself override this per-file with their own jest.mock('react-native-iap').
export function useIAP() {
  return {
    connected: false,
    products: [],
    subscriptions: [],
    availablePurchases: [],
    activeSubscriptions: [],
    finishTransaction: async () => undefined,
    getAvailablePurchases: async () => undefined,
    fetchProducts: async () => undefined,
    requestPurchase: async () => undefined,
    verifyPurchase: async () => ({ isValid: false }),
    verifyPurchaseWithProvider: async () => ({ isValid: false }),
    restorePurchases: async () => undefined,
    getPromotedProductIOS: async () => null,
    getActiveSubscriptions: async () => [],
    hasActiveSubscriptions: async () => false,
    reconnect: async () => false,
    openRedeemOfferCode: async () => null,
  };
}

export function isUserCancelledError(): boolean {
  return false;
}
