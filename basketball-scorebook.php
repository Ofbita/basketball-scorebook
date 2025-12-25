<?php
/**
 * Plugin Name: Basketball Scorebook
 * Plugin URI: https://doc778.com/scorebook/
 * Description: 試合で使える無料のバスケットボールデジタルスコアシート。タイムスタンプ付き、LocalStorage保存、PDF印刷対応。
 * Version: 1.0.2
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
define('BASKSC_VERSION', '1.0.2');
define('BASKSC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('BASKSC_PLUGIN_DIR', plugin_dir_path(__FILE__));


/**
 * フロントエンド用アセットを登録
 */
function basketball_scorebook_register_assets()
{
    // フロントエンド用CSSを登録（まだ読み込まない）
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
 * ほぼ全画面に近い iframe と、簡単なガイドテキストを出力します。
 */
function basketball_scorebook_shortcode($atts)
{
    // 登録済みCSSをエンキュー（ショートコードが使われたページでのみ読み込まれる）
    wp_enqueue_style('basketball-scorebook-frontend');

    $atts = shortcode_atts(
        array(
            'height' => '85vh',
        ),
        $atts,
        'basketball_scorebook'
    );

    // 言語判定: 英語環境では index-en.html を使用
    $locale = get_locale();
    $html_file = 'index.html'; // デフォルト（日本語）
    if (strpos($locale, 'en') === 0) {
        $html_file = 'index-en.html';
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
            <strong><?php echo esc_html__('📱 推奨環境:', 'basketball-scorebook'); ?></strong>
            <?php echo esc_html__('iPad または PC の横向き、Safari / Chrome でのご利用を推奨します(LINE 内ブラウザは非推奨)。', 'basketball-scorebook'); ?><br>

            <strong><?php echo esc_html__('💾 データ保存:', 'basketball-scorebook'); ?></strong>
            <?php echo esc_html__('入力内容はブラウザの LocalStorage に自動保存されます。同じ端末・ブラウザであれば再訪時に復元されます。', 'basketball-scorebook'); ?><br>

            <strong><?php echo esc_html__('🖨️ 印刷 / PDF:', 'basketball-scorebook'); ?></strong>
            <?php echo esc_html__('アプリ内の「印刷 / PDF」ボタンから、スコアシートのみを A4 横で印刷 / PDF 保存できます。', 'basketball-scorebook'); ?>
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
    // このプラグインの設定ページのみで読み込む
    if ('settings_page_basketball-scorebook' !== $hook) {
        return;
    }

    // 管理画面用CSS
    wp_enqueue_style(
        'basketball-scorebook-admin',
        BASKSC_PLUGIN_URL . 'assets/css/admin.css',
        array(),
        BASKSC_VERSION
    );

    // 管理画面用JavaScript
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
 * 管理画面に簡単な説明ページを追加
 */
function basketball_scorebook_add_admin_menu()
{
    add_options_page(
        __('Basketball Scorebook 設定', 'basketball-scorebook'),
        __('Scorebook', 'basketball-scorebook'),
        'manage_options',
        'basketball-scorebook',
        'basketball_scorebook_settings_page'
    );
}
add_action('admin_menu', 'basketball_scorebook_add_admin_menu');

/**
 * 設定ページの出力
 */
function basketball_scorebook_settings_page()
{
    ?>
    <div class="wrap">
        <h2><?php echo esc_html__('Basketball Scorebook - 設定と使い方', 'basketball-scorebook'); ?></h2>
        <p><?php echo esc_html__('以下のショートコードを投稿または固定ページに貼り付けてご利用ください。最も広いページテンプレート(全幅など)でご利用いただくことを推奨します。', 'basketball-scorebook'); ?></p>

        <div class="basksc-code-box">
            <code id="basksc-shortcode">[basketball_scorebook]</code>
            <button type="button" class="button button-secondary" data-clipboard-target="basksc-shortcode">
                <?php echo esc_html__('コピー', 'basketball-scorebook'); ?>
            </button>
        </div>

        <h3><?php echo esc_html__('高さのカスタマイズ', 'basketball-scorebook'); ?></h3>
        <p>
            <?php echo esc_html__('iframeの高さをカスタマイズしたい場合は、', 'basketball-scorebook'); ?>
            <code>height</code>
            <?php echo esc_html__('属性を指定できます。デフォルトは', 'basketball-scorebook'); ?>
            <code>85vh</code>
            <?php echo esc_html__('(ビューポートの高さの85%)です。', 'basketball-scorebook'); ?>
        </p>
        <div class="basksc-code-box">
            <code id="basksc-shortcode-height">[basketball_scorebook height="100vh"]</code>
            <button type="button" class="button button-secondary" data-clipboard-target="basksc-shortcode-height">
                <?php echo esc_html__('コピー', 'basketball-scorebook'); ?>
            </button>
        </div>
        <p class="basksc-usage-note">
            <strong><?php echo esc_html__('使用例:', 'basketball-scorebook'); ?></strong><br>
            • <code>[basketball_scorebook height="100vh"]</code> - <?php echo esc_html__('画面全体の高さ', 'basketball-scorebook'); ?><br>
            • <code>[basketball_scorebook height="600px"]</code> - <?php echo esc_html__('固定の600ピクセル', 'basketball-scorebook'); ?><br>
            • <code>[basketball_scorebook height="90vh"]</code> - <?php echo esc_html__('画面の90%の高さ', 'basketball-scorebook'); ?>
        </p>

        <h3><?php echo esc_html__('使い方・デモサイト', 'basketball-scorebook'); ?></h3>
        <p><?php echo esc_html__('具体的な利用方法、応用例、最新の情報は、開発元サイトでご確認いただけます。本プラグインの全機能のデモも兼ねています。', 'basketball-scorebook'); ?></p>
        <p>
            👉
            <a href="https://doc778.com/scorebook/" target="_blank" class="basksc-demo-link">
                <?php echo esc_html__('【公式】Basketball Scorebook 利用ガイド・デモサイトはこちら', 'basketball-scorebook'); ?>
            </a>
        </p>

        <h3><?php echo esc_html__('サポートに関する注意点', 'basketball-scorebook'); ?></h3>
        <p class="basksc-support-notice">
            <?php echo esc_html__('本プラグインはGPLライセンスで提供されますが、', 'basketball-scorebook'); ?>
            <strong><?php echo esc_html__('コード内の開発元へのリンクや著作権表示を削除・改変した場合、そのバージョンは非公式なものとみなし、サポートおよびバグ修正の対象外', 'basketball-scorebook'); ?></strong>
            <?php echo esc_html__('とさせていただきます。ご理解をお願いいたします。', 'basketball-scorebook'); ?>
        </p>

    </div>
    <?php
}

/**
 * 有効化フック
 */
function basketball_scorebook_activate()
{
    // 必要ならここでオプション初期化などを行う
}
register_activation_hook(__FILE__, 'basketball_scorebook_activate');

/**
 * 無効化フック
 */
function basketball_scorebook_deactivate()
{
    // LocalStorage はクライアント側なので特に削除処理なし
}
register_deactivation_hook(__FILE__, 'basketball_scorebook_deactivate');

