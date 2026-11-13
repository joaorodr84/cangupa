// The hint-pack store (CANGUPA-79), opened from BoardHud's hint button once
// the balance hits 0 and from SettingsScreen's own "Hints" section — one
// popup either way, matching HelpPopup/WinPopup's own screen-covering card
// (Popup.tsx) rather than a separate full-screen panel. Also hosts the
// reward-video row (CANGUPA-78) above the purchase rows, the free
// counterpart to buying hints outright — same popup, since both end in the
// same "add N hints" callback below.
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useRewardedHint } from '../ads/useRewardedHint';
import { useHintStore } from '../iap/useHintStore';
import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';
import Popup from './Popup';

interface HintStorePopupProps {
  readonly palette: Palette;
  readonly onClose: () => void;
  // Credits the earned/purchased amount to the player's saved hint balance
  // (progress.ts's addHints, via App.tsx's recordHintsPurchased) — this
  // popup itself holds no progress state of its own. Shared by both the
  // reward-video row below and the purchase rows, always with amount 1 for
  // the former.
  readonly onPurchased: (hints: number) => void;
}

export default function HintStorePopup({ palette, onClose, onPurchased }: HintStorePopupProps) {
  const t = useStrings();
  const { connected, products, status, buy } = useHintStore(onPurchased);
  const { loaded: adLoaded, status: adStatus, watch: watchAd } = useRewardedHint(onPurchased);
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };
  const adDisabled = !adLoaded || adStatus.kind === 'pending';

  return (
    <Popup palette={palette} heading={t.hintStore.heading} onClose={onClose}>
      <View style={styles.rows}>
        <View style={[styles.row, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
          <Text style={[styles.rowLabel, ink]}>{t.hintStore.hintsLabel(1)}</Text>
          <Pressable
            disabled={adDisabled}
            onPress={watchAd}
            accessibilityRole="button"
            accessibilityLabel={`${t.hintStore.watchAd} ${t.hintStore.hintsLabel(1)}`}
            style={[styles.buyButton, { backgroundColor: palette.control }, adDisabled && styles.buyButtonDisabled]}
          >
            {adStatus.kind === 'pending' ? (
              <ActivityIndicator color={palette.ink} />
            ) : (
              <Text style={[styles.buyLabel, ink]}>{adLoaded ? t.hintStore.watchAd : t.hintStore.watchAdLoading}</Text>
            )}
          </Pressable>
        </View>
      </View>
      {adStatus.kind === 'error' && <Text style={[styles.error, { color: palette.ink }]}>{t.hintStore.adError}</Text>}
      {!connected ? (
        <View style={styles.connecting}>
          <ActivityIndicator color={palette.muted} />
          <Text style={muted}>{t.hintStore.connecting}</Text>
        </View>
      ) : (
        <View style={styles.rows}>
          {products.map((product) => {
            const pending = status.kind === 'pending' && status.sku === product.sku;
            const disabled = status.kind === 'pending';
            return (
              <View key={product.sku} style={[styles.row, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
                <Text style={[styles.rowLabel, ink]}>{t.hintStore.hintsLabel(product.hints)}</Text>
                <Pressable
                  disabled={disabled}
                  onPress={() => buy(product.sku)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t.hintStore.buy} ${t.hintStore.hintsLabel(product.hints)}`}
                  style={[styles.buyButton, { backgroundColor: palette.control }, disabled && styles.buyButtonDisabled]}
                >
                  {pending ? (
                    <ActivityIndicator color={palette.ink} />
                  ) : (
                    <Text style={[styles.buyLabel, ink]}>{product.displayPrice ?? t.hintStore.buy}</Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
      {status.kind === 'error' && <Text style={[styles.error, { color: palette.ink }]}>{t.hintStore.error}</Text>}
    </Popup>
  );
}

const styles = StyleSheet.create({
  connecting: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rows: {
    alignSelf: 'stretch',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  buyButton: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyLabel: {
    fontWeight: '600',
  },
  error: {
    textAlign: 'center',
    fontSize: 13,
  },
});
