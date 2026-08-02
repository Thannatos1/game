# Last Orbit Android

Android wrapper for `https://lastorbit-app.pages.dev` using a Trusted Web Activity.

The native `OnboardingActivity` is the launcher. It is shown once after the 2.0.1 update and then
opens the Bubblewrap `LauncherActivity` in the dedicated TWA task. Android backup is disabled so
uninstalling cannot restore the preference that skips this screen. Subsequent launches go directly
to the game.

## Release identity

- Package: `app.lastorbit.game`
- Version name: `2.0.3`
- Version code: `20260804`
- Target SDK: `36`
- Signing alias: `lastorbit`

Do not commit signing keys or password files. Run Bubblewrap builds with `--skipSigning`, then sign
the generated AAB locally with the existing Play upload key.

Running `bubblewrap update` regenerates the Android project and can overwrite the native onboarding
changes. Reapply or preserve those files before updating the Bubblewrap template.

The TWA and Android 12 splash screens use the transparent `twa_splash_brand` asset generated from
`twa-splash-brand.svg`. Keep the raster density variants in sync when changing the source artwork.
