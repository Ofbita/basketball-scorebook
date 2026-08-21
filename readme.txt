=== Basketball Scorebook ===
Tags: basketball, scorebook, sports, timer, pdf
Contributors: ofbita
Requires at least: 5.5
Tested up to: 7.1
Requires PHP: 7.2
Stable Tag: 1.0.9
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A digital basketball scorebook with timestamps, running scores, and PDF export. Perfect for coaches and table officials.

== Description ==

**Basketball Scorebook** is a lightweight, single-page application that runs directly within your WordPress site via a shortcode. It allows you to record basketball games digitally with the precision of a professional table official.

Unlike traditional paper scorebooks, this "RecordedScorebook" automatically tracks the **timestamps** of major events (scores, fouls, timeouts), giving you a complete timeline of the game.

**Key Features:**

* **Real‑time Scoring:** Input 2P, 3P, and FT. Player stats are auto-calculated.
* **Timestamped Events:** Every foul and timeout is recorded with the exact game time.
* **Running Score:** Visual running score (1–160 pts) tracking with time and player number.
* **Print Ready:** Designed to print perfectly on A4 landscape paper or save as PDF via the browser.
* **Data Persistence and Backup:** Auto-saves to browser LocalStorage, so your data won't be lost even if the page is accidentally refreshed. However, to protect against browser cache clearing or device failure, we strongly recommend exporting to JSON for important games.
* **JSON Import/Export:** Save match data as JSON files for backup, sharing, or templates.
* **No Database Bloat:** All data is handled client-side (Alpine.js). It does not clutter your WordPress database.

**Usage:**

Simply add the shortcode `[basketball_scorebook]` to any page or post.
For the best experience, we recommend using a "Full-Width" page template to maximize the workspace.

== Demo and Usage ==

You can try the full functionality of the Scorebook without installing the plugin at the official demo site:

**Demo URL:** [https://doc778.com/scorebook-en](https://doc778.com/scorebook-en)

**Usage Guide:** [https://doc778.com/help-scorebook-en](https://doc778.com/help-scorebook-en)

Simply add the shortcode `[basketball_scorebook]` to any page or post.
For the best experience, we recommend using a "Full-Width" page template to maximize the workspace.

== Installation ==

1. Upload the `basketball-scorebook` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the "Plugins" menu in WordPress.
3. Place the `[basketball_scorebook]` shortcode in any page content.

== Frequently Asked Questions ==

= How is data saved? =

Data is automatically saved to your browser's LocalStorage every 3 seconds. It does not save to your WordPress database.

= Can I backup my scorebook data? =

Yes, you can export your game data as a JSON file and import it anytime. We recommend doing this for important games.

= Can I print or export to PDF? =

Yes! Click the "Print" button or press Ctrl+P (Cmd+P on Mac) to print or save as PDF. The layout is optimized for A4 Landscape.

= Does this plugin collect telemetry or analytics? =

By default, **No**. The plugin does not send any analytics/telemetry unless you explicitly opt in from the settings page.
If you opt in, the plugin sends **anonymous event counts only** (plugin version, WordPress/PHP version, locale, and event name). It does not send your site URL, email address, or any scorebook contents.

== Screenshots ==

1. Main scoreboard interface with real-time scoring
2. Player stats and foul tracking with timestamps
3. Running score visualization (1–160 points)
4. Print preview optimized for A4 landscape

== Changelog ==

= 1.0.9 =

* Updated: Tested up to WordPress 7.1.
* Improved: Synchronized schema and adapter layers to support game parameter sharing (roster/coach cancellation states: `rosterCancelled`, `coachCancelled`, `assistantCoachCancelled`) for seamless data compatibility with Mini Basketball edition.

= 1.0.8 =

* Fixed: Resolved a critical data reversion bug where newly updated event logs or annotations could be overwritten by older localStorage data.
* Improved: Extended the saved data schema (adds game parameters `meta.quarterLength`/`overtimeLength` and D&D court positions `liveState.homeCourtPositions`/`awayCourtPositions` behind the scenes) to prepare for future Mini Basketball edition synchronization.
* Improved: Enhanced mapping logic for event logs and liveState to ensure better data integrity when loading and importing game files.

= 1.0.7 =

* Updated: Tested up to WordPress 7.0.

= 1.0.6 =

* Added: Suggested privacy policy text via `wp_add_privacy_policy_content()` so site owners can clearly describe LocalStorage usage and optional anonymous telemetry.
* Improved: Clarified privacy / data storage wording (admin screen, FAQ, and privacy‑policy text) to better explain what data is stored locally and what may be sent when telemetry is opted in.

= 1.0.5.3 =

* Fixed: Resolved "Update failed" error when saving posts while using this plugin together with pubsubhubbub or similar plugins.

= 1.0.5.2 =

* Fixed: Settings page now reliably saves when turning anonymous usage statistics (telemetry) back OFF, by always posting an explicit `0` value for the opt-in checkbox.
* Improved: When telemetry is opted in, anonymous events sent to Matomo now use a browser-like User-Agent string so they are less likely to be discarded by bot/robot filters (still opt-in only).

= 1.0.5.1 =

* Fixed: Added missing Japanese (and en_US) translations for the settings page (Privacy / Data Storage, Anonymous Usage Statistics, Save Changes, and review prompt strings: Thanks for using…, Leave a Review, View Help, Not Now)

= 1.0.5 =

* Added: Opt-in anonymous usage statistics (events only, default OFF)
* Added: Review prompt shown on the settings page after 7 days (one-time per user)
* Updated: Documentation and settings page privacy notes (data is stored in the browser)

= 1.0.4 =

* Fixed: English app Help button now opens the English usage guide URL (`?lang=en`)
* Improved: Disabled browser auto-translation inside the scorebook iframe to prevent UI breakage (DOM rewrites)

= 1.0.3 =

* Updated: Prepare Mini Basketball edition migration by extending saved data schema (adds `meta` and `foulEvents` to save/export/import while keeping LocalStorage key)
* Updated: Add schema versioning (`meta.schemaVersion = 103`) and default-fill logic for backward compatibility

= 1.0.2 =

* Added: Full internationalization (i18n) support
* Added: Japanese translation files (ja.po / ja.mo)
* Added: Japanese readme (readme-ja.txt)
* Fixed: Japanese IME input focus issue
* Improved: Enhanced plugin feature descriptions and documentation

= 1.0.1 =

* Fixed: Properly enqueue CSS and JavaScript files using `wp_enqueue_style()` and `wp_enqueue_script()`
* Fixed: Updated function prefixes to meet WordPress.org requirements (`BSB_` to `BASKSC_`)
* Added: Documentation for third-party library (Alpine.js) in readme
* Improved: Code structure following WordPress coding standards

= 1.0.0 =

* Initial release.

== Upgrade Notice ==

= 1.0.9 =

Adds support for WordPress 7.1 and improves data compatibility with upcoming Mini Basketball edition by synchronizing parameter schemas.

= 1.0.8 =

Fixes a potential data reversion issue during save operations and ensures robust data integrity. Highly recommended for users planning to migrate or sync data with future Mini Basketball edition.

= 1.0.7 =

Compatibility update: tested with WordPress 7.0. No functional changes.

= 1.0.6 =

Adds suggested privacy policy text and clarifies how data is stored in the browser and what anonymous telemetry may be sent when opted in. Recommended if you want clearer privacy documentation for your site.

= 1.0.5.3 =

Fixes "Update failed" error when saving posts with pubsubhubbub or similar plugins. Recommended if you use these plugins together.

= 1.0.5.2 =

Recommended for sites that have opted into anonymous usage statistics.  
This update ensures the opt-in setting can safely be turned OFF again from the settings page and makes Matomo-based anonymous event tracking more robust (still opt-in only).

= 1.0.5.1 =

Translation update: settings page and review prompt are now fully translated in Japanese (and en_US). Recommended if you use the plugin in Japanese.

= 1.0.5 =

Adds optional (opt-in) anonymous usage statistics and a gentle review prompt in the settings page.

= 1.0.4 =

English Help link improvement (opens the English guide page).

= 1.0.3 =

Data schema update for future compatibility. Existing data remains compatible, and the LocalStorage key is unchanged.

= 1.0.2 =

Important update including internationalization support, Japanese translations, and a fix for the Japanese IME input focus issue. Recommended for all users, especially on Japanese or multilingual sites.

= 1.0.1 =

Minor fixes and improvements. Please update to ensure proper asset loading, naming consistency, and up-to-date documentation.

= 1.0.0 =

First stable release with timestamp recording and PDF export features.

== Third Party Resources ==

This plugin includes the following third-party libraries:

= Alpine.js =

* Version: 3.13.3 (minified)
* Source Code: https://github.com/alpinejs/alpine
* License: MIT License
* License URL: https://github.com/alpinejs/alpine/blob/main/LICENSE.md
* Used in: assets/app/cdn.min.js
* Official CDN: https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js

The minified version (cdn.min.js) is distributed by the Alpine.js project.
The non-minified source code is available at the GitHub repository linked above.