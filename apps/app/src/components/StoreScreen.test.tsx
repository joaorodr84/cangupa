import { fireEvent, render, screen } from '@testing-library/react-native';

import StoreScreen from './StoreScreen';
import { HINT_PRODUCTS } from '../iap/hintProducts';
import { DARK } from '../theme/palette';

const mockUseHintStore = jest.fn();
jest.mock('../iap/useHintStore', () => ({
  useHintStore: (onPurchased: (hints: number) => void) => mockUseHintStore(onPurchased),
}));

const mockUseRewardedHint = jest.fn();
jest.mock('../ads/useRewardedHint', () => ({
  useRewardedHint: (onEarned: (hints: number) => void) => mockUseRewardedHint(onEarned),
}));

interface HintStoreState {
  readonly connected: boolean;
  readonly products: readonly { readonly sku: string; readonly hints: number; readonly displayPrice: string | undefined }[];
  readonly status: { readonly kind: 'idle' } | { readonly kind: 'pending'; readonly sku: string } | { readonly kind: 'error'; readonly message: string };
  readonly buy: (sku: string) => void;
}

function connectedState(overrides: Partial<HintStoreState> = {}): HintStoreState {
  return {
    connected: true,
    products: HINT_PRODUCTS.map((product) => ({ ...product, displayPrice: `$${product.hints / 10}` })),
    status: { kind: 'idle' },
    buy: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockUseRewardedHint.mockReturnValue({ loaded: true, status: { kind: 'idle' }, watch: jest.fn() });
});

test('shows the Hints section label', async () => {
  mockUseHintStore.mockReturnValue({ connected: false, products: [], status: { kind: 'idle' }, buy: jest.fn() });
  await render(<StoreScreen palette={DARK} onPurchased={jest.fn()} />);

  expect(screen.getByText('Hints')).toBeTruthy();
});

test('lists each hint product once connected, the same rows HintStorePopup shows', async () => {
  mockUseHintStore.mockReturnValue(connectedState());
  await render(<StoreScreen palette={DARK} onPurchased={jest.fn()} />);

  expect(screen.getByText('10 hints')).toBeTruthy();
  expect(screen.getByText('25 hints')).toBeTruthy();
  expect(screen.getByText('100 hints')).toBeTruthy();
});

test('pressing a product row buys its own sku', async () => {
  const buy = jest.fn();
  mockUseHintStore.mockReturnValue(connectedState({ buy }));
  await render(<StoreScreen palette={DARK} onPurchased={jest.fn()} />);

  await fireEvent.press(screen.getByLabelText(`Buy ${HINT_PRODUCTS[0].hints} hints`));
  expect(buy).toHaveBeenCalledWith(HINT_PRODUCTS[0].sku);
});

test('credits a purchase through the onPurchased prop, same as HintStorePopup', async () => {
  const onPurchased = jest.fn();
  mockUseHintStore.mockReturnValue(connectedState());
  await render(<StoreScreen palette={DARK} onPurchased={onPurchased} />);

  expect(mockUseHintStore).toHaveBeenCalledWith(onPurchased);
});

test('has no close button — it is a tab destination, not a popup', async () => {
  mockUseHintStore.mockReturnValue(connectedState());
  await render(<StoreScreen palette={DARK} onPurchased={jest.fn()} />);

  expect(screen.queryByText('✕')).toBeNull();
});
