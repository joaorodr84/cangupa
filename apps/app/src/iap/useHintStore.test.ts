import { act, renderHook } from '@testing-library/react-native';

import { HINT_PRODUCTS } from './hintProducts';
import { useHintStore } from './useHintStore';

type UseIapOptions = {
  onPurchaseSuccess?: (purchase: { productId: string }) => void;
  onPurchaseError?: (error: { code: string; message: string }) => void;
};

// A single object, rather than separate module-level lets, so jest.mock's
// factory — hoisted above every other statement in this file — can close
// over it: babel-plugin-jest-hoist only allows referencing identifiers
// prefixed `mock` from inside the factory.
const mockState = {
  latestOptions: undefined as UseIapOptions | undefined,
  connected: true,
  products: [] as readonly { readonly id: string; readonly displayPrice: string }[],
  cancelledNext: false,
  fetchProducts: jest.fn().mockResolvedValue(undefined),
  requestPurchase: jest.fn().mockResolvedValue(undefined),
  finishTransaction: jest.fn().mockResolvedValue(undefined),
};

jest.mock('react-native-iap', () => ({
  useIAP: (options: UseIapOptions) => {
    mockState.latestOptions = options;
    return {
      connected: mockState.connected,
      products: mockState.products,
      fetchProducts: mockState.fetchProducts,
      requestPurchase: mockState.requestPurchase,
      finishTransaction: mockState.finishTransaction,
    };
  },
  isUserCancelledError: () => mockState.cancelledNext,
}));

beforeEach(() => {
  mockState.connected = true;
  mockState.products = [];
  mockState.cancelledNext = false;
  mockState.fetchProducts.mockClear();
  mockState.requestPurchase.mockClear();
  mockState.finishTransaction.mockClear();
});

test('fetches the three known hint products once connected', async () => {
  await renderHook(() => useHintStore(jest.fn()));

  expect(mockState.fetchProducts).toHaveBeenCalledWith({
    skus: HINT_PRODUCTS.map((product) => product.sku),
    type: 'in-app',
  });
});

test('maps each fetched product to its own hint count and store price', async () => {
  mockState.products = [{ id: HINT_PRODUCTS[1].sku, displayPrice: '$1.99' }];
  const { result } = await renderHook(() => useHintStore(jest.fn()));

  expect(result.current.products).toEqual([
    { sku: HINT_PRODUCTS[0].sku, hints: HINT_PRODUCTS[0].hints, displayPrice: undefined },
    { sku: HINT_PRODUCTS[1].sku, hints: HINT_PRODUCTS[1].hints, displayPrice: '$1.99' },
    { sku: HINT_PRODUCTS[2].sku, hints: HINT_PRODUCTS[2].hints, displayPrice: undefined },
  ]);
});

test('buy requests a purchase for the given sku on both platforms and goes pending', async () => {
  const { result } = await renderHook(() => useHintStore(jest.fn()));

  await act(async () => {
    result.current.buy(HINT_PRODUCTS[1].sku);
    await Promise.resolve();
  });

  expect(mockState.requestPurchase).toHaveBeenCalledWith({
    request: { apple: { sku: HINT_PRODUCTS[1].sku }, google: { skus: [HINT_PRODUCTS[1].sku] } },
    type: 'in-app',
  });
  expect(result.current.status).toEqual({ kind: 'pending', sku: HINT_PRODUCTS[1].sku });
});

test('credits the purchased hints and finishes the transaction on success', async () => {
  const onPurchased = jest.fn();
  const { result } = await renderHook(() => useHintStore(onPurchased));
  const purchase = { productId: HINT_PRODUCTS[2].sku };

  await act(async () => {
    mockState.latestOptions?.onPurchaseSuccess?.(purchase);
    await Promise.resolve();
  });

  expect(mockState.finishTransaction).toHaveBeenCalledWith({ purchase, isConsumable: true });
  expect(onPurchased).toHaveBeenCalledWith(HINT_PRODUCTS[2].hints);
  expect(result.current.status).toEqual({ kind: 'idle' });
});

test('finishes but does not credit a purchase for a sku this store does not sell', async () => {
  const onPurchased = jest.fn();
  await renderHook(() => useHintStore(onPurchased));
  const purchase = { productId: 'not.a.hint.pack' };

  await act(async () => {
    mockState.latestOptions?.onPurchaseSuccess?.(purchase);
    await Promise.resolve();
  });

  expect(mockState.finishTransaction).toHaveBeenCalledWith({ purchase, isConsumable: true });
  expect(onPurchased).not.toHaveBeenCalled();
});

test('a cancelled purchase goes back to idle rather than showing an error', async () => {
  mockState.cancelledNext = true;
  const { result } = await renderHook(() => useHintStore(jest.fn()));

  await act(async () => {
    mockState.latestOptions?.onPurchaseError?.({ code: 'E_USER_CANCELLED', message: 'cancelled' });
    await Promise.resolve();
  });

  expect(result.current.status).toEqual({ kind: 'idle' });
});

test('a non-cancelled purchase error surfaces its message', async () => {
  const { result } = await renderHook(() => useHintStore(jest.fn()));

  await act(async () => {
    mockState.latestOptions?.onPurchaseError?.({ code: 'E_UNKNOWN', message: 'Store unavailable' });
    await Promise.resolve();
  });

  expect(result.current.status).toEqual({ kind: 'error', message: 'Store unavailable' });
});
