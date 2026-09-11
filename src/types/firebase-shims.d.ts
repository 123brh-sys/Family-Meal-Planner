import type { Persistence } from '@firebase/auth';

// `@firebase/auth`'s package.json "exports" map lists a top-level "types" condition
// ahead of the "react-native" condition for its "." entry, so TypeScript's
// exports-map type resolution always picks the platform-agnostic public types
// file and never reaches the React Native build's types — even though Metro's
// bundler resolution (and our `customConditions: ["react-native"]` tsconfig
// setting) correctly picks the RN implementation at runtime. This augments the
// resolved types with the one RN-only export that's missing as a result.
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
