# Android phone repair — 20 October 2026

Base: `fd76ed386f83f6630ee849e5fc4ccdaf02121c43`, the latest source the user deployed to Production on 19 October. This change does not deploy the website or modify the database.

## Behavior

- Native bottom navigation has Home, Grounds, Players, Games and More instead of squeezing nine tabs into a phone. More retains Career, Ultimate Team, Champions, SBC, Community Board, profile and settings. Native headers no longer duplicate the tab links; Grounds uses the shared phone header.
- Champions formation selection, community squad builder, tactic composer and player filters use real React Native modals rather than browser-only fixed/vw/vh overlays. Android Back closes the current modal. Insets, bounded panels, scrolling and keyboard handling keep actions reachable.
- Champions hides its desktop sidebar on small screens and gives stacked panels their available width. Squad cards fit the measured pitch and formation rows; selecting a slot scrolls to player search. A local squad remains attached to its post.
- Registration and language selection accommodate system bars, small screens and the keyboard. Email/password fields do not auto-capitalize. English layouts no longer force system-wide Hebrew RTL; Hebrew remains selectable and explicitly directed.
- Failed or very slow initialization displays a retry action rather than an indefinite spinner. Background reload failures keep the current snapshot.
- Market list virtualization no longer uses incorrect row offsets that omit its variable-height header. Filters and notice dialogs are real modals; consent header text wraps. Grounds' All platforms label now follows the selected language.

## Standalone APK

`eas build --platform android --profile apk` inherits internal APK distribution, explicitly disables the development client and uses the existing EAS project and Android package `il.fc27.community`. It builds an installed app with its own launcher icon. Expo Go and a Metro server are not required to run it.

App version/runtime is 1.0.1 and its channel is `android-mobile-20261020`, isolated from old 1.0.0/Preview OTA updates. The APK profile selects the production EAS environment and uses the same configured Supabase backend. The existing remote signing credentials must be retained. Build version codes continue to auto-increment.

The EAS post-install hook verifies types, the exact catalogue, preservation, translations and mobile geometry before building. No signed APK has been produced in this workspace: `eas whoami` reports `Not logged in`, and the Expo build dashboard also requires login. The old APK download URL has not been relabeled as a new artifact.

## Verification

- TypeScript passes.
- Exact catalogue: 20,118 unique cards (19,887 base; 92 TOTW; 30 DFG; 6 Star Performers; 87 Heroes; 1 OTW; 15 Future Stars).
- Preservation and localization guards pass, including 38 restored cards, 36 Grounds PlayStyles, all player identities, Career/SBC copy and 896 mini-game prompts.
- Mobile geometry: 3,069 card placements across 31 formations and nine widths, with no pairwise overlap or edge clipping; APK configuration checks pass.
- Android CNG prebuild succeeds and generates adjustResize, version 1.0.1, the existing package and auth scheme. Expo reports the pre-existing optional expo-system-ui recommendation; no generated native files are committed.
- Final Android Hermes export succeeds (12 MB bundle); web export succeeds (14 MB bundle).
- Production web bundle tested in Chromium with touch/mobile viewport and intercepted fixture backend responses. Players, Champions, Grounds, Career and Games render without JavaScript errors at 360 px. Player filters open/navigate/close; a Champions formation can be selected, a squad slot filled by search and the squad saved back to the local composer. Champions has no document-wide horizontal overflow at 320, 390, 430 and 1440 px. Language persistence is checked on reload.
- Browser checks use local fixtures, not a real account, live database writes or a physical Android keyboard. Remote images and native Android behavior still require testing on the installed APK. No native-device or signed-artifact verification is claimed.
- Full lint retains 85 existing errors and 48 warnings, matching the starting counts. New components/helpers/test and edited startup/language/registration files introduce no lint errors. `git diff --check` passes.

## Build from the user's isolated Windows worktree

Fetch and check out this repair commit in `C:\Users\aviel\Desktop\fc27-preview-20118-20261019`, then run `npx eas-cli@latest build --platform android --profile apk`. A successful EAS build supplies the real install page and APK artifact URL. Do not distribute the previous APK URL as this release. Test login, navigation, both languages, typing, Back, squad selection, image upload and reopening from the launcher before updating the website's download button.
