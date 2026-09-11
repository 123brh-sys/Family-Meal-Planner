# Family Dinner Picker

A mobile app that helps a family pick a dinner everyone present will actually eat, then
builds a shared, de-duplicated shopping list. Built with Expo (React Native + TypeScript)
and Firebase (Auth + Firestore). See the original spec in this repo's history/PR description
for the full feature list and data model.

This app is being built in stages so each piece is testable on a phone via Expo Go as it
lands — see the task list in the project for current progress.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a project.
2. Add a **Web app** to the project (Project settings → General → Your apps → Add app → Web).
   Copy the config values it gives you.
3. Enable **Authentication → Sign-in method → Google**.
4. Enable **Firestore Database** (start in production mode — this repo's `firestore.rules`
   enforces access control).
5. Copy `.env.example` to `.env` and fill in the `EXPO_PUBLIC_FIREBASE_*` values from step 2.

### 3. Set up Google Sign-In

Google Sign-In uses `expo-auth-session`.

1. In the [Google Cloud console](https://console.cloud.google.com/apis/credentials) for the
   same project Firebase created, create an OAuth 2.0 **Web application** client ID.
2. Put that client ID in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env`.
3. `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` are only needed
   once you build standalone apps with EAS — you can leave them blank until then.
4. Add the redirect URI `expo-auth-session`'s `promptAsync()` logs to the console (or that a
   failed sign-in attempt reports) to the web client's **Authorized redirect URIs** in Google
   Cloud console.

**Expo Go caveat:** Expo Go can't register your app's own URL scheme, so the OAuth redirect
URI it generates is tied to your current dev-server address and isn't stable enough to
pre-register with Google in every case. If Google Sign-In doesn't complete inside Expo Go,
build a development client instead (one-time, still tests like your own app):

```bash
npx expo run:android   # or: npx expo run:ios (needs a Mac), or `eas build --profile development`
```

Everything else in the app remains fully testable in plain Expo Go.

### 4. Deploy Firestore security rules

Install the Firebase CLI once (`npm install -g firebase-tools`), then:

```bash
firebase login
firebase use --add        # pick your Firebase project
firebase deploy --only firestore:rules
```

### 5. Set up AI recipe import (optional)

The "Fill with AI" button on the Add/Edit Meal screen calls a Cloud Function so the
Anthropic API key never ships in the app (§7). This step needs your Firebase project on
the **Blaze (pay-as-you-go)** plan — Cloud Functions aren't available on the free Spark
plan, though usage for a family-sized app is negligible.

```bash
cd functions
npm install
firebase functions:secrets:set ANTHROPIC_API_KEY   # paste your key from console.anthropic.com
cd ..
firebase deploy --only functions
```

Skip this step if you don't want AI import yet — the rest of the app works without it,
the "Fill with AI" button will just show an error if tapped.

### 6. Run the app

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (same Wi-Fi network as your computer).

## Project structure

```
app/                  expo-router screens (file-based routing)
  (auth)/             sign-in flow, shown when signed out
  (onboarding)/       create/join family flow, shown once signed in with no family yet
  (app)/              main tab navigator (Tonight, Meals, Shopping List, Family, Settings)
src/
  types/models.ts     data model (Family, Meal, Ingredient, ShoppingListItem, ...)
  lib/firebase.ts      Firebase app/auth/Firestore initialization
  context/             React context providers (auth state, family/settings state)
  components/          shared UI components
firestore.rules        Firestore security rules — family-scoped access control
functions/              Cloud Functions (AI recipe import) — separate npm project
```

## Build order

This app is being built in the stages recommended by the spec, each one testable on a
device before moving to the next:

1. ✅ Expo scaffold + Firebase project + data model
2. ✅ Google Sign-In + family create/join by code
3. ✅ Meals CRUD + the "Tonight" picker
4. ✅ Family members CRUD
5. ✅ Shopping list generation + ingredient merge logic (unit-tested)
6. ✅ Pantry item handling
7. ✅ US/UK unit conversion
8. ✅ AI recipe import (Cloud Function)
9. Recipe link + keep-awake cooking view
10. Polish (search, history, weekly planner, offline, etc.)
