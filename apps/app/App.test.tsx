import { render } from '@testing-library/react-native';

import App from './App';

// render() resolves a promise in this library version, unlike the sync API
// older examples show — awaiting it is required, not optional.
test('renders without crashing', async () => {
  const { toJSON } = await render(<App />);
  expect(toJSON()).not.toBeNull();
});
