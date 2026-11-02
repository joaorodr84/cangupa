import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from './HomeScreen';
import { paletteFor } from '../theme/palette';

test('pressing Jogar fires onPlay', async () => {
  const onPlay = jest.fn();
  await render(<HomeScreen palette={paletteFor('cosmos')} onPlay={onPlay} />);

  await fireEvent.press(screen.getByText('Jogar'));

  expect(onPlay).toHaveBeenCalledTimes(1);
});
