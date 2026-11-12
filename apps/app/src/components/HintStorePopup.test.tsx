import { fireEvent, render, screen } from '@testing-library/react-native';

import HintStorePopup from './HintStorePopup';
import { HINT_PRODUCTS } from '../iap/hintProducts';
import { DARK } from '../theme/palette';

function noop() {
  /* not under test */
}

const mockUseHintStore = jest.fn();
jest.mock('../iap/useHintStore', () => ({
  useHintStore: (onPurchased: (hints: number) => void) => mockUseHintStore(onPurchased),
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

test('shows a connecting message instead of products while not yet connected', async () => {
  mockUseHintStore.mockReturnValue({ connected: false, products: [], status: { kind: 'idle' }, buy: jest.fn() });
  await render(<HintStorePopup palette={DARK} onClose={noop} onPurchased={jest.fn()} />);

  expect(screen.getByText('Connecting to the store…')).toBeTruthy();
});

test('lists each product with its hint count and store price once connected', async () => {
  mockUseHintStore.mockReturnValue(connectedState());
  await render(<HintStorePopup palette={DARK} onClose={noop} onPurchased={jest.fn()} />);

  expect(screen.getByText('10 hints')).toBeTruthy();
  expect(screen.getByText('25 hints')).toBeTruthy();
  expect(screen.getByText('100 hints')).toBeTruthy();
  expect(screen.getByText('$1')).toBeTruthy();
});

test('pressing a product row buys its own sku', async () => {
  const buy = jest.fn();
  mockUseHintStore.mockReturnValue(connectedState({ buy }));
  await render(<HintStorePopup palette={DARK} onClose={noop} onPurchased={jest.fn()} />);

  await fireEvent.press(screen.getByLabelText(`Buy ${HINT_PRODUCTS[0].hints} hints`));
  expect(buy).toHaveBeenCalledWith(HINT_PRODUCTS[0].sku);
});

test('shows an error message when a purchase fails', async () => {
  mockUseHintStore.mockReturnValue(connectedState({ status: { kind: 'error', message: 'nope' } }));
  await render(<HintStorePopup palette={DARK} onClose={noop} onPurchased={jest.fn()} />);

  expect(screen.getByText("Couldn't complete the purchase. Try again.")).toBeTruthy();
});

test('pressing close calls onClose', async () => {
  mockUseHintStore.mockReturnValue(connectedState());
  const onClose = jest.fn();
  await render(<HintStorePopup palette={DARK} onClose={onClose} onPurchased={jest.fn()} />);

  await fireEvent.press(screen.getByText('✕'));
  expect(onClose).toHaveBeenCalledTimes(1);
});
