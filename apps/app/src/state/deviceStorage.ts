import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Storage } from './storage';

// The device's key-value store. AsyncStorage is the only storage the app
// uses, so settings and progress stay on the device and the game works
// offline, the same as localStorage did on the web.
export const deviceStorage: Storage = AsyncStorage;
