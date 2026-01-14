<?php
/**
 * Plugin Name: Basketball Scorebook
 * Plugin URI: https://doc778.com/scorebook/
 * Description: Free digital basketball scorebook for games. Features timestamps, LocalStorage saving, and PDF printing support.
 * Version: 1.0.3
 * Author: ofbita
 * Author URI: https://doc778.com/
 * Copyright: 2025 ofbita / Basketball Manual
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: basketball-scorebook
 * Domain Path: /languages
 */

// 直接アクセス防止
if (!defined('ABSPATH')) {
    exit;
}

// 4文字以上のプレフィックスを使用
define('BASKSC_VERSION', '1.0.3');
define('BASKSC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('BASKSC_PLUGIN_DIR', plugin_dir_path(__FILE__));

/**
 * フロントエンド用アセットを登録
 */
function basketball_scorebook_register_assets()
{
    wp_register_style(
        'basketball-scorebook-frontend',
        BASKSC_PLUGIN_URL . 'assets/css/frontend.css',
        array(),
        BASKSC_VERSION
    );
}
add_action('wp_enqueue_scripts', 'basketball_scorebook_register_assets');

/**
 * ショートコード [basketball_scorebook]
 */
function basketball_scorebook_shortcode($atts)
{
    wp_enqueue_style('basketball-scorebook-frontend');

    $atts = shortcode_atts(
        array(
            'height' => '85vh',
        ),
        $atts,
        'basketball_scorebook'
    );

    $locale = get_locale();
    $html_file = 'index-en.html';
    if ($locale === 'ja') {
        $html_file = 'index.html';
    }
    
    $iframe_url = BASKSC_PLUGIN_URL . 'assets/app/' . $html_file . '?v=' . BASKSC_VERSION;
    $height     = esc_attr($atts['height']);

    ob_start();
    ?>
    <div class="basksc-container">
        <iframe
            id="basksc-scorebook-iframe"
            src="<?php echo esc_url($iframe_url); ?>"
            style="width: 100%; height: <?php echo esc_attr($height); ?>; border: 2px solid #e5e7eb; border-radius: 8px; display: block;"
            title="<?php echo esc_attr__('Basketball Scorebook', 'basketball-scorebook'); ?>"
            loading="eager"
            allowfullscreen
        ></iframe>

        <div class="basksc-guide">
            <strong><?php echo esc_html__('📱 Recommended Environment:', 'basketball-scorebook'); ?></strong>
            <?php echo esc_html__('We recommend using landscape mode on iPad or PC with Safari / Chrome (LINE in-app browser is not recommended).', 'basketball-scorebook'); ?><br>

            <strong><?php echo esc_html__('💾 Data Storage:', 'basketball-scorebook'); ?></strong>
            <?php echo esc_html__('Your input is automatically saved to browser LocalStorage. Data will be restored when you revisit using the same device and browser.', 'basketball-scorebook'); ?><br>

            <strong><?php echo esc_html__('🖨️ Print / PDF:', 'basketball-scorebook'); ?></strong>
            <?php echo esc_html__('You can print or save as PDF in A4 landscape format from the "Print / PDF" button in the app.', 'basketball-scorebook'); ?>
        </div>
    </div>
    <?php

    return ob_get_clean();
}
add_shortcode('basketball_scorebook', 'basketball_scorebook_shortcode');

/**
 * 管理画面用のスタイルとスクリプトをエンキュー
 */
function basketball_scorebook_enqueue_admin_assets($hook)
{
    if ('settings_page_basketball-scorebook' !== $hook) {
        return;
    }

    wp_enqueue_style(
        'basketball-scorebook-admin',
        BASKSC_PLUGIN_URL . 'assets/css/admin.css',
        array(),
        BASKSC_VERSION
    );

    wp_enqueue_script(
        'basketball-scorebook-admin',
        BASKSC_PLUGIN_URL . 'assets/js/admin.js',
        array(),
        BASKSC_VERSION,
        true
    );
}
add_action('admin_enqueue_scripts', 'basketball_scorebook_enqueue_admin_assets');

/**
 * Adding a menu to the administration screen
 */
function basketball_scorebook_add_admin_menu()
{
    add_options_page(
        __('Basketball Scorebook Settings', 'basketball-scorebook'),
        __('Scorebook', 'basketball-scorebook'),
        'manage_options',
        'basketball-scorebook',
        'basketball_scorebook_settings_page'
    );
}
add_action('admin_menu', 'basketball_scorebook_add_admin_menu');

/**
 * Output setting page
 */
function basketball_scorebook_settings_page()
{
    ?>
    <div class="wrap">
        <h2><?php echo esc_html__('Basketball Scorebook - Settings and Usage', 'basketball-scorebook'); ?></h2>
        <p><?php echo esc_html__('Please add the following shortcode to any post or page. We recommend using the widest page template (full-width, etc.) for the best experience.', 'basketball-scorebook'); ?></p>

        <div class="basksc-code-box">
            <code id="basksc-shortcode">[basketball_scorebook]</code>
            <button type="button" class="button button-secondary" data-clipboard-target="basksc-shortcode">
                <?php echo esc_html__('Copy', 'basketball-scorebook'); ?>
            </button>
        </div>

        <h3><?php echo esc_html__('Height Customization', 'basketball-scorebook'); ?></h3>
        <p>
            <?php echo esc_html__('To customize the iframe height, specify the ', 'basketball-scorebook'); ?>
            <code>height</code>
            <?php echo esc_html__('attribute. The default is ', 'basketball-scorebook'); ?>
            <code>85vh</code>
            <?php echo esc_html__('(85% of viewport height).', 'basketball-scorebook'); ?>
        </p>
        <div class="basksc-code-box">
            <code id="basksc-shortcode-height">[basketball_scorebook height="100vh"]</code>
            <button type="button" class="button button-secondary" data-clipboard-target="basksc-shortcode-height">
                <?php echo esc_html__('Copy', 'basketball-scorebook'); ?>
            </button>
        </div>
        <p class="basksc-usage-note">
            <strong><?php echo esc_html__('Usage Examples:', 'basketball-scorebook'); ?></strong><br>
            • <code>[basketball_scorebook height="100vh"]</code> - <?php echo esc_html__('Full screen height', 'basketball-scorebook'); ?><br>
            • <code>[basketball_scorebook height="600px"]</code> - <?php echo esc_html__('Fixed 600 pixels', 'basketball-scorebook'); ?><br>
            • <code>[basketball_scorebook height="90vh"]</code> - <?php echo esc_html__('90% of screen height', 'basketball-scorebook'); ?>
        </p>

        <h3><?php echo esc_html__('Usage & Demo Site', 'basketball-scorebook'); ?></h3>
        <p><?php echo esc_html__('For detailed usage instructions, examples, and the latest information, please visit the developer\'s website. It also serves as a full-featured demo of this plugin.', 'basketball-scorebook'); ?></p>
        <p>
            👉
            <a href="https://doc778.com/scorebook/" target="_blank" class="basksc-demo-link">
                <?php echo esc_html__('【Official】Basketball Scorebook Usage Guide & Demo Site', 'basketball-scorebook'); ?>
            </a>
        </p>

        <h3><?php echo esc_html__('Support Notice', 'basketball-scorebook'); ?></h3>
        <p class="basksc-support-notice">
            <?php echo esc_html__('This plugin is provided under the GPL license, but ', 'basketball-scorebook'); ?>
            <strong><?php echo esc_html__('if you remove or modify the developer links or copyright notices in the code, that version will be considered unofficial and will not be eligible for support or bug fixes', 'basketball-scorebook'); ?></strong>
            <?php echo esc_html__('. Thank you for your understanding.', 'basketball-scorebook'); ?>
        </p>

    </div>
    <?php
}

function basketball_scorebook_activate() {}
register_activation_hook(__FILE__, 'basketball_scorebook_activate');

function basketball_scorebook_deactivate() {}
register_deactivation_hook(__FILE__, 'basketball_scorebook_deactivate');