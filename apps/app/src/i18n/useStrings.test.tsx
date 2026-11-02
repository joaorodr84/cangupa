import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { LanguageContext } from './LanguageContext';
import { useStrings } from './useStrings';

// A minimal consumer, so these tests exercise the real pipeline
// (LanguageContext -> useLocale's device-locale fallback -> the strings
// table) rather than just the pure resolveLocale function locale.test.ts
// already covers.
function Probe() {
  const t = useStrings();
  return <Text>{t.home.rules}</Text>;
}

describe('useStrings', () => {
  it('reads English by default, with no LanguageContext.Provider', async () => {
    await render(<Probe />);

    expect(screen.getByText('Rules')).toBeOnTheScreen();
  });

  it('reads Portuguese when the language is pinned to it', async () => {
    await render(
      <LanguageContext.Provider value="pt">
        <Probe />
      </LanguageContext.Provider>,
    );

    expect(screen.getByText('Regras')).toBeOnTheScreen();
  });

  it('falls back to English for "system" in this test environment (device locale not Portuguese)', async () => {
    await render(
      <LanguageContext.Provider value="system">
        <Probe />
      </LanguageContext.Provider>,
    );

    expect(screen.getByText('Rules')).toBeOnTheScreen();
  });
});
