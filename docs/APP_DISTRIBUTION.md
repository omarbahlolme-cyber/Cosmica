# Cosmica App Distribution

Cosmica now ships with two distribution paths:

1. `PWA`: install directly from `https://www.cosmicalearn.com` on desktop, Android, and iPad/iPhone home screens.
2. `Native store shells`: package the hosted site into Android/iOS apps with Capacitor for Google Play and the Apple App Store.

## What is in the repo

- `frontend/app.webmanifest`: install metadata for browsers and desktop PWAs.
- `frontend/service-worker.js`: offline shell caching and fallback page support.
- `frontend/offline.html`: offline recovery screen.
- `frontend/pwa/*`: PWA and store icon assets, including `store-icon-1024.png`.
- `capacitor.config.json`: native wrapper config pointed at `https://www.cosmicalearn.com`.

## Browser install flow

- Desktop Chromium browsers: install from the address bar or the in-app install prompt.
- Android Chrome: install from the in-app prompt.
- iPhone/iPad Safari: use `Share -> Add to Home Screen`.

## Native app commands

Install dependencies first:

```bash
npm install
```

Add and sync native projects:

```bash
npm run native:add:android
npm run native:add:ios
npm run native:sync
```

Open platform IDEs:

```bash
npm run native:open:android
npm run native:open:ios
```

## Platform notes

- `Android`: can be added and built from Windows with Android Studio.
- `iOS`: requires Xcode on macOS for signing, simulator runs, TestFlight, and App Store submission.
- The current native shell loads the live production app from `https://www.cosmicalearn.com`. That keeps the mobile wrappers aligned with the deployed PWA and backend without duplicating API routing logic.

## Release checklist

1. Confirm the live site is healthy over HTTPS and the PWA install flow works from `https://www.cosmicalearn.com`.
2. Update package name, signing, splash screens, permissions, and store metadata inside Android Studio and Xcode.
3. Use `frontend/pwa/store-icon-1024.png` as the base source for store artwork.
4. Run `npm run native:sync` before every store build after web changes.
5. Submit Android via Play Console and iOS/iPadOS via App Store Connect.
