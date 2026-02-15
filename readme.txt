=== Basketball Scorebook ===
Tags: basketball, scorebook, sports, timer, pdf
Contributors: ofbita
Requires at least: 5.5
Tested up to: 6.9
Requires PHP: 7.2
Stable Tag: 1.0.5
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

**Demo URL:** [https://doc778.com/scorebook?lang=en](https://doc778.com/scorebook?lang=en)

**Usage Guide:** [https://doc778.com/help-scorebook?lang=en](https://doc778.com/help-scorebook?lang=en)

Simply add the shortcode `[basketball_scorebook]` to any page or post.
For the best experience, we recommend using a "Full-Width" page template to maximize the workspace.

== Installation ==

1. Upload the `basketball-scorebook` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the "Plugins" menu in WordPress.
3. Place the `[basketball_scorebook]` shortcode in any page content.

== Frequently Asked Questions ==

= Does this plugin work without an internet connection? =

Yes, once the page is loaded. All calculations are done in the browser using JavaScript (Alpine.js).

= Can my data be lost? =

Your data won't be lost during normal use. However, if you clear your browser's browsing history (cache), LocalStorage data will also be deleted. As the safest approach, we recommend exporting to JSON at halftime or after the game ends.

= Can I save the scorebook as PDF? =

Yes. Select "Print/PDF". The layout is optimized for A4 landscape.

= Is my data saved automatically? =

Yes. The scorebook auto-saves to your browser's LocalStorage every time you make a change.

= Does this plugin send any data outside my site? =

By default, **No**. The plugin does not send any analytics/telemetry unless you explicitly opt in from the settings page.
If you opt in, the plugin sends **anonymous event counts only** (plugin version, WordPress/PHP version, locale, and event name). It does not send your site URL, email address, or any scorebook contents.

== Screenshots ==

1. Main scoreboard interface with real-time scoring
2. Player stats and foul tracking with timestamps
3. Running score visualization (1–160 points)
4. Print preview optimized for A4 landscape

== Changelog ==

= 1.0.5 =

* Added: Opt-in anonymous usage statistics (events only, default OFF)
* Added: Review prompt shown on the settings page after 7 days (one-time per user)
* Updated: Documentation and settings page privacy notes (data is stored in the browser)

= 1.0.4 =

* Fixed: English app Help button now opens the English usage guide URL (`?lang=en`)
* Improved: Disabled browser auto-translation inside the scorebook iframe to prevent UI breakage (DOM rewrites)

= 1.0.3 =

* Updated: Prepare v1.1.0 migration by extending saved data schema (adds `meta` and `foulEvents` to save/export/import while keeping LocalStorage key)
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