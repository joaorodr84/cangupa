// The key-value interface settings and progress are saved through. The app
// passes AsyncStorage (see deviceStorage.ts); tests pass an in-memory map.
// Keeping it this narrow is what lets the storage round trip be tested
// without a device.
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
