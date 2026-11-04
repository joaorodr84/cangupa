// expo-audio's AudioPlayer is backed by a native SharedObject with no
// implementation under Jest's node environment (createAudioPlayer() throws
// trying to construct one) — jest-expo does not ship a mock for this module
// itself, so src/audio/sound.ts (CANGUPA-57) needs this one to be importable
// at all in tests. Only the calls sound.ts actually makes are stubbed.
export function createAudioPlayer() {
  return {
    seekTo: jest.fn(),
    play: jest.fn(),
  };
}
