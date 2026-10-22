# Android 1.0.3 — Gallery and Season 2 APK

Build from the current `feat/season2-cards-20261022` checkout. It contains the deployed Gallery and all 29 Season 2 cards (20,147 total), original art and acquisition details.

The `apk-season2` EAS profile inherits the existing standalone APK/signing identity and production environment. It uses `android-season2-20261022` with appVersion runtime 1.0.3, so the previous 1.0.2/Preview updates cannot replace this release. The Android package/project remain unchanged and the remote build number increments automatically. Keep the existing EAS signing credentials to install over the existing app and retain its device data.

PowerShell:

```powershell
Set-Location "C:\Users\aviel\Documents\Codex\2026-10-21\preview\work\one-club"
npm.cmd run verify:apk
if ($LASTEXITCODE -eq 0) {
    npx.cmd eas-cli@latest build --platform android --profile apk-season2 --clear-cache
}
```

The preflight checks TypeScript, exact player data/art, all previous card objects, bilingual localization, 128 Gallery sets/411 plans, native startup and 3,069 pitch placements across nine widths. EAS post-install also checks the Season 2 and Gallery data before packaging. Whole-repository ESLint retains the existing 53 errors / 22 warnings; the new release guard passes focused lint.

Mobile browser screenshots already passed in HE/EN at 360/390 px, plus desktop and all 29 player detail pages. These are not physical Android screenshots. A signed APK and real-device rendering still require installation: inspect Gallery D–S, a full collection, cards/attributes/acquisition, both languages and the phone's text-size setting. No emulator/connected device is available in this workspace. The Gallery fetches its checked collection data from the live site on demand; Season 2 artwork is bundled.

No EAS build is started automatically by this preparation. The command above starts the user's signed cloud build and prints its build/download URL.
