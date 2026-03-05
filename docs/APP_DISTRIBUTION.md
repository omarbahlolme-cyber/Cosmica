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
npm run native:check
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

Run a local readiness check anytime:

```bash
npm run native:check
```

## Platform notes

- `Android`: can be added and built from Windows with Android Studio.
- `iOS`: requires Xcode on macOS for signing, simulator runs, TestFlight, and App Store submission.
- The current native shell loads the live production app from `https://www.cosmicalearn.com`. That keeps the mobile wrappers aligned with the deployed PWA and backend without duplicating API routing logic.

## Mobile store links in web UI

The install modal reads links from `frontend/index.html`:

```html
<script>
  window.COSMICA_STORE_LINKS = Object.freeze({
    appStoreUrl: "",
    playStoreUrl: "",
  });
</script>
```

Fill these after both store listings are live.

## Important store policy note

If you sell digital premium features inside iOS/Android apps, Apple/Google typically require in-app billing. External checkout links for digital unlocks can trigger rejection.

Current safe options:

1. Keep premium purchase on web only and do not allow in-app external purchase flow in native store builds.
2. Implement native in-app subscriptions (Apple IAP + Google Play Billing) before store submission.

Current repo behavior:

- In Capacitor native runtime, external premium checkout redirect is blocked and users see an in-app guidance message.
- On web/PWA, premium checkout continues to work as before.

## Practical release flow (recommended)

1. Finalize app identity:
   - Keep `appId` as `com.cosmicalearn.app` everywhere.
   - Set production versions (`versionCode/versionName` Android, `MARKETING_VERSION/CURRENT_PROJECT_VERSION` iOS).
2. Android first:
   - Open Android Studio.
   - Build signed `AAB`.
   - Upload to Play Console internal testing.
   - Validate auth, audio, map pages, and install flow on real devices.
3. iOS second (macOS):
   - Open Xcode project from `ios/App`.
   - Configure Team + Signing + Capabilities.
   - Archive and upload to TestFlight.
   - Validate same flows on real iPhone/iPad.
4. Store metadata:
   - App icon, screenshots, privacy policy URL, terms URL, support URL.
   - Content rating + age rating.
5. Publish gradually:
   - Android staged rollout first.
   - iOS phased release.

## Release checklist

1. Confirm the live site is healthy over HTTPS and the PWA install flow works from `https://www.cosmicalearn.com`.
2. Update package name, signing, splash screens, permissions, and store metadata inside Android Studio and Xcode.
3. Use `frontend/pwa/store-icon-1024.png` as the base source for store artwork.
4. Run `npm run native:sync` before every store build after web changes.
5. Run `npm run native:check` before every submission.
6. Submit Android via Play Console and iOS/iPadOS via App Store Connect.
