<?php
/**
 * Plugin Name: Basketball Scorebook
 * Plugin URI: https://doc778.com/scorebook/
 * Description: Free digital basketball scorebook for games. Features timestamps, LocalStorage saving, and PDF printing support.
 * Version: 1.0.5.2
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

/**
 * Allow external redirect hosts used by this plugin (for wp_safe_redirect).
 */
function basksc_allowed_redirect_hosts($hosts)
{
    if (!is_array($hosts)) {
        $hosts = array();
    }
    $hosts[] = 'wordpress.org';
    $hosts[] = 'doc778.com';
    return array_values(array_unique($hosts));
}
add_filter('allowed_redirect_hosts', 'basksc_allowed_redirect_hosts', 10, 1);

// 4文字以上のプレフィックスを使用
define('BASKSC_VERSION', '1.0.5.2');
define('BASKSC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('BASKSC_PLUGIN_DIR', plugin_dir_path(__FILE__));

// v1.0.5: telemetry (Matomo) - opt-in only
define('BASKSC_OPTION_TELEMETRY_OPT_IN', 'basksc_telemetry_opt_in'); // 0/1
define('BASKSC_OPTION_ACTIVATED_AT', 'basksc_activated_at'); // unix timestamp

// Matomo endpoint defaults (can be overridden by filters)
define('BASKSC_MATOMO_ENDPOINT_DEFAULT', 'https://test.doc778.com/matomo.php');
define('BASKSC_MATOMO_SITE_ID_DEFAULT', '4');

/**
 * v1.0.5: Matomo tracking endpoint
 */
function basksc_get_matomo_endpoint()
{
    $endpoint = apply_filters('basksc_matomo_endpoint', BASKSC_MATOMO_ENDPOINT_DEFAULT);
    return is_string($endpoint) ? trim($endpoint) : '';
}

/**
 * v1.0.5: Matomo site id
 */
function basksc_get_matomo_site_id()
{
    $site_id = apply_filters('basksc_matomo_site_id', BASKSC_MATOMO_SITE_ID_DEFAULT);
    $site_id = is_string($site_id) ? trim($site_id) : (string)$site_id;
    return $site_id;
}

/**
 * v1.0.5: opt-in flag
 */
function basksc_is_telemetry_opted_in()
{
    return (int) get_option(BASKSC_OPTION_TELEMETRY_OPT_IN, 0) === 1;
}

/**
 * v1.0.5: send anonymous telemetry event to Matomo (server-side, opt-in only)
 */
function basksc_send_telemetry_event($action, $name = '')
{
    if (!basksc_is_telemetry_opted_in()) {
        return;
    }

    $endpoint = basksc_get_matomo_endpoint();
    $site_id  = basksc_get_matomo_site_id();
    if ($endpoint === '' || $site_id === '') {
        return;
    }

    $action = is_string($action) ? trim($action) : '';
    if ($action === '') {
        return;
    }

    $locale = get_locale();
    $wp_ver = get_bloginfo('version');
    $php_ver = defined('PHP_VERSION') ? PHP_VERSION : '';

    // IMPORTANT: do not send site URL / page path.
    $fixed_url = 'https://basketball-scorebook.invalid/';

    $event_name = $name;
    if (!is_string($event_name)) {
        $event_name = '';
    }
    $event_name = trim($event_name);
    if ($event_name === '') {
        $event_name = 'pv=' . BASKSC_VERSION . '|wp=' . $wp_ver . '|php=' . $php_ver . '|loc=' . $locale;
    }

    $params = array(
        'idsite' => $site_id,
        'rec'    => 1,
        'apiv'   => 1,
        'rand'   => wp_rand(100000, 999999),
        'url'    => $fixed_url,
        'e_c'    => 'basketball_scorebook',
        'e_a'    => $action,
        'e_n'    => $event_name,
        'send_image' => 1,
        'cookie' => 0,
    );

    $request_url = add_query_arg($params, $endpoint);

    // Fire-and-forget (short timeout). Never block admin UX.
    wp_remote_get($request_url, array(
        'timeout'  => 1,
        'blocking' => false,
        'sslverify' => true,
    ));
}

/**
 * Matomo送信時にUser-Agentをブラウザに偽装（Bot除外を回避）
 *
 * basksc_get_matomo_endpoint() で取得したエンドポイント宛のリクエストのみに限定
 * （他プラグインが利用する Matomo には影響を与えない）
 *
 * @since 1.0.5.2
 */
add_filter('http_headers_useragent', function ($user_agent, $url) {
    $endpoint = basksc_get_matomo_endpoint();
    if (empty($endpoint)) {
        return $user_agent;
    }

    $endpoint_host = parse_url($endpoint, PHP_URL_HOST);
    $request_host  = parse_url($url, PHP_URL_HOST);
    $request_path  = (string) parse_url($url, PHP_URL_PATH);

    if (
        !empty($endpoint_host) &&
        !empty($request_host) &&
        $endpoint_host === $request_host &&
        strpos($request_path, 'matomo.php') !== false
    ) {
        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    return $user_agent;
}, 10, 2);

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

    if (basksc_is_telemetry_opted_in()) {
        basksc_send_telemetry_event('shortcode_rendered');
    }

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
    
    $telemetry = basksc_is_telemetry_opted_in() ? '1' : '0';
    $iframe_url = add_query_arg(
        array(
            'v'         => BASKSC_VERSION,
            'telemetry' => $telemetry,
            'pv'        => BASKSC_VERSION,
            'wpv'       => get_bloginfo('version'),
            'phpv'      => defined('PHP_VERSION') ? PHP_VERSION : '',
            'loc'       => $locale,
        ),
        BASKSC_PLUGIN_URL . 'assets/app/' . $html_file
    );
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
        __('Basketball Scorebook', 'basketball-scorebook'),
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
    if (!current_user_can('manage_options')) {
        return;
    }

    // 設定ページ表示時のみ実行（admin_init のたびに get_option しない）
    $activated_at = (int) get_option(BASKSC_OPTION_ACTIVATED_AT, 0);
    if ($activated_at === 0) {
        add_option(BASKSC_OPTION_ACTIVATED_AT, time());
        $activated_at = time();
    }

    $user_id = get_current_user_id();
    // $activated_at = (int) get_option(BASKSC_OPTION_ACTIVATED_AT, 0);
    $show_review_prompt = false;

    if ($activated_at > 0) {
        $threshold = $activated_at + (7 * DAY_IN_SECONDS);
        $shown_at = (int) get_user_meta($user_id, 'basksc_review_prompt_shown_at', true);
        if ($shown_at <= 0 && time() >= $threshold) {
            $show_review_prompt = true;
            update_user_meta($user_id, 'basksc_review_prompt_shown_at', time());
            basksc_send_telemetry_event('review_prompt_shown');
        }
    }

    $telemetry_opt_in = basksc_is_telemetry_opted_in();
    ?>
    <div class="wrap">
        <h2><?php echo esc_html__('Basketball Scorebook - Settings and Usage', 'basketball-scorebook'); ?></h2>
        <div class="notice notice-info" style="margin-top: 16px; padding: 12px 12px;">
            <p style="margin: 0 0 8px;">
                <strong><?php echo esc_html__('Privacy / Data Storage', 'basketball-scorebook'); ?></strong><br>
                <?php echo esc_html__('Your scorebook data is saved in your browser (LocalStorage). It is not saved to the WordPress database.', 'basketball-scorebook'); ?><br>
                <?php echo esc_html__('For important games, we recommend exporting JSON as a backup.', 'basketball-scorebook'); ?>
            </p>
            <form method="post" action="options.php" style="margin: 0;">
                <?php
                settings_fields('basksc_settings');
                ?>
                <p style="margin: 0 0 8px;">
                    <strong><?php echo esc_html__('Anonymous Usage Statistics (Opt-in)', 'basketball-scorebook'); ?></strong>
                </p>
                <label style="display: inline-flex; align-items: center; gap: 8px;">
                    <input type="hidden" name="<?php echo esc_attr(BASKSC_OPTION_TELEMETRY_OPT_IN); ?>" value="0">
                    <input type="checkbox" name="<?php echo esc_attr(BASKSC_OPTION_TELEMETRY_OPT_IN); ?>" value="1" <?php checked($telemetry_opt_in); ?>>
                    <span><?php echo esc_html__('Send anonymous usage events to help improve this plugin (default: OFF).', 'basketball-scorebook'); ?></span>
                </label>
                <p class="description" style="margin-top: 8px; margin-bottom: 8px;">
                    <?php echo esc_html__('We only send minimal event data (plugin version, WP/PHP version, locale, and event name). We do not send your site URL, email address, or any scorebook contents.', 'basketball-scorebook'); ?>
                </p>
                <?php submit_button(__('Save Changes', 'basketball-scorebook'), 'secondary', 'submit', false); ?>
            </form>
        </div>

        <p><?php echo esc_html__('Please add the following shortcode to any post or page. We recommend using the widest page template (full-width, etc.) for the best experience.', 'basketball-scorebook'); ?></p>
        <div class="basksc-code-box">
            <code id="basksc-shortcode">[basketball_scorebook]</code>
            <button type="button" class="button button-secondary" data-clipboard-target="basksc-shortcode">
                <?php echo esc_html__('Copy', 'basketball-scorebook'); ?>
            </button>
        </div>

        <?php if ($show_review_prompt) : ?>
            <div class="notice notice-info" style="padding: 12px 12px;">
                <p style="margin: 0 0 8px;">
                    <strong><?php echo esc_html__('Thanks for using Basketball Scorebook!', 'basketball-scorebook'); ?></strong>
                    <?php echo esc_html__('If you find it helpful, a review would really support ongoing development.', 'basketball-scorebook'); ?>
                </p>
                <p style="margin: 0; display: flex; gap: 8px; flex-wrap: wrap;">
                    <?php
                    $nonce = wp_create_nonce('basksc_review_prompt');
                    $base = admin_url('admin-post.php');
                    $review_url = add_query_arg(
                        array(
                            'action' => 'basksc_review_prompt',
                            'target' => 'review',
                            '_wpnonce' => $nonce,
                        ),
                        $base
                    );
                    $help_url = add_query_arg(
                        array(
                            'action' => 'basksc_review_prompt',
                            'target' => 'help',
                            '_wpnonce' => $nonce,
                        ),
                        $base
                    );
                    $dismiss_url = add_query_arg(
                        array(
                            'action' => 'basksc_review_prompt',
                            'target' => 'dismiss',
                            '_wpnonce' => $nonce,
                        ),
                        $base
                    );
                    ?>
                    <a class="button button-primary" href="<?php echo esc_url($review_url); ?>">
                        <?php echo esc_html__('Leave a Review', 'basketball-scorebook'); ?>
                    </a>
                    <a class="button button-secondary" href="<?php echo esc_url($help_url); ?>">
                        <?php echo esc_html__('View Help', 'basketball-scorebook'); ?>
                    </a>
                    <a class="button" href="<?php echo esc_url($dismiss_url); ?>">
                        <?php echo esc_html__('Not Now', 'basketball-scorebook'); ?>
                    </a>
                </p>
            </div>
        <?php endif; ?>

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

/**
 * Activation hook
 */
function basketball_scorebook_activate()
{
    if (get_option(BASKSC_OPTION_ACTIVATED_AT, 0) === 0) {
        add_option(BASKSC_OPTION_ACTIVATED_AT, time());
    }
    if (get_option(BASKSC_OPTION_TELEMETRY_OPT_IN, null) === null) {
        add_option(BASKSC_OPTION_TELEMETRY_OPT_IN, 0);
    }
}
register_activation_hook(__FILE__, 'basketball_scorebook_activate');

function basketball_scorebook_deactivate() {}
register_deactivation_hook(__FILE__, 'basketball_scorebook_deactivate');

/**
 * Register settings
 */
function basksc_register_settings()
{
    register_setting(
        'basksc_settings',
        BASKSC_OPTION_TELEMETRY_OPT_IN,
        array(
            'type'              => 'integer',
            'sanitize_callback' => function ($value) {
                return ((int) $value === 1) ? 1 : 0;
            },
            'default'           => 0,
        )
    );
}
add_action('admin_init', 'basksc_register_settings');

/**
 * When telemetry is enabled, record the opt-in event (server-side)
 */
function basksc_on_telemetry_opt_in_update($old_value, $new_value)
{
    $old = (int) $old_value;
    $new = (int) $new_value;
    if ($old !== 1 && $new === 1) {
        basksc_send_telemetry_event('opt_in_enabled');
    }
}
add_action('update_option_' . BASKSC_OPTION_TELEMETRY_OPT_IN, 'basksc_on_telemetry_opt_in_update', 10, 2);

/**
 * Handle review prompt actions (admin-post)
 */
function basksc_handle_review_prompt()
{
    if (!current_user_can('manage_options')) {
        wp_die('Forbidden', 403);
    }
    check_admin_referer('basksc_review_prompt');

    $target = isset($_GET['target']) ? sanitize_key($_GET['target']) : '';
    $user_id = get_current_user_id();

    // Mark as handled (do not show again).
    update_user_meta($user_id, 'basksc_review_prompt_handled_at', time());

    if ($target === 'dismiss') {
        basksc_send_telemetry_event('review_prompt_dismissed');
        wp_safe_redirect(admin_url('options-general.php?page=basketball-scorebook'));
        exit;
    }

    if ($target === 'review') {
        basksc_send_telemetry_event('review_prompt_clicked', 'target=review');
        $url = 'https://wordpress.org/support/plugin/basketball-scorebook/reviews/?rate=5#new-post';
        wp_safe_redirect($url);
        exit;
    }

    if ($target === 'help') {
        basksc_send_telemetry_event('review_prompt_clicked', 'target=help');
        $locale = get_locale();
        $url = ($locale === 'ja')
            ? 'https://doc778.com/help-scorebook'
            : 'https://doc778.com/help-scorebook?lang=en';
        wp_safe_redirect($url);
        exit;
    }

    wp_safe_redirect(admin_url('options-general.php?page=basketball-scorebook'));
    exit;
}
add_action('admin_post_basksc_review_prompt', 'basksc_handle_review_prompt');