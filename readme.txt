=== Basketball Scorebook ===
Tags: basketball, scorebook, scoresheet, timer, table officials
Contributors: ofbita
Requires at least: 5.5
Tested up to: 6.9
Requires PHP: 7.2
Stable Tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A digital basketball scorebook with timestamps, running scores, and PDF export. Perfect for coaches and table officials.

== Description ==

**Basketball Scorebook** is a lightweight, single-page application that runs directly within your WordPress site via a shortcode. It allows you to record basketball games digitally with the precision of a professional table official.

Unlike traditional paper scorebooks, this "RecordedScorebook" automatically tracks the **timestamps** of every event (fouls, timeouts, substitutions), giving you a complete timeline of the game.

**Key Features:**

* **Real-time Scoring:** Input 2P, 3P, and FT. Total scores and player stats are auto-calculated.
* **Timestamped Events:** Every foul and timeout is recorded with the exact game time.
* **Running Score:** Visual running score (1-160 pts) tracking with time and player number.
* **Print Ready:** Designed to print perfectly on A4 landscape paper or save as PDF via the browser.
* **Data Persistence:** Auto-saves to browser LocalStorage. No data loss on page refresh.
* **JSON Import/Export:** Save match data as JSON files for backup, sharing, or templates.
* **No Database Bloat:** All data is handled client-side (Alpine.js). It does not clutter your WordPress database.

**Usage:**

Simply add the shortcode `[basketball_scorebook]` to any page or post.
For the best experience, we recommend using a "Full-Width" page template to maximize the workspace.

== Demo and Usage ==

You can try the full functionality of the Scorebook without installing the plugin at the official demo site:

**Demo URL:** [https://doc778.com/scorebook/](https://doc778.com/scorebook/)

**Usage Guide:** [https://doc778.com/help-scorebook](https://doc778.com/help-scorebook)

Simply add the shortcode `[basketball_scorebook]` to any page or post.
For the best experience, we recommend using a "Full-Width" page template to maximize the workspace.

== Installation ==

1. Upload the `basketball-scorebook` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Place the shortcode `[basketball_scorebook]` in any page content.

== Frequently Asked Questions ==

= Does this plugin work without an internet connection? =

Yes, once the page is loaded. All calculations are done in the browser using JavaScript (Alpine.js).

= Can I save the scorebook as PDF? =

Yes. Use your browser's Print function (Ctrl+P or Cmd+P) and select "Save as PDF". The layout is optimized for A4 landscape.

= Is my data saved automatically? =

Yes. The scorebook auto-saves to your browser's LocalStorage every time you make a change.

== Screenshots ==

1. Main scoreboard interface with real-time scoring
2. Player stats and foul tracking with timestamps
3. Running score visualization (1-160 points)
4. Print preview optimized for A4 landscape

== Changelog ==

= 1.0.1 =
* Fixed: Properly enqueue CSS and JavaScript files using wp_enqueue_style() and wp_enqueue_script()
* Fixed: Updated function prefixes to meet WordPress.org requirements (BSB_ to BASKSC_)
* Added: Documentation for third-party library (Alpine.js) in readme
* Improved: Code structure following WordPress coding standards

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.0.1 =
Minor fixes and improvements. Please update to ensure proper asset loading, naming consistency, and up-to-date documentation.

= 1.0.0 =
First stable release with timestamp recording and PDF export features.

== Third Party Resources ==

This plugin includes the following third-party libraries:

= Alpine.js =
* Version: 3.x (minified)
* Source Code: https://github.com/alpinejs/alpine
* License: MIT License
* License URL: https://github.com/alpinejs/alpine/blob/main/LICENSE.md
* Used in: assets/app/cdn.min.js
* Official CDN: https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js

The minified version (cdn.min.js) is distributed by the Alpine.js project.
The non-minified source code is available at the GitHub repository linked above.

