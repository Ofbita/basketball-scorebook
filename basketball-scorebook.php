<?php
/**
 * Plugin Name: Basketball Scorebook
 * Plugin URI: https://doc778.com/scorebook/
 * Description: 試合で使える無料のバスケットボールデジタルスコアシート。タイムスタンプ付き、LocalStorage保存、PDF印刷対応。
 * Version: 1.0.1
 * Author: ofbita
 * Author URI: https://doc778.com/
 * Copyright: 2025 ofbita / Basketball Manual
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: basketball-scorebook
 */

// 直接アクセス防止
if (!defined('ABSPATH')) {
    exit;
}

// 4文字以上のプレフィックスを使用
define('BASKSC_VERSION', '1.0.1');
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

    $iframe_url = BASKSC_PLUGIN_URL . 'assets/app/index.html?v=' . BASKSC_VERSION;
    $height     = esc_attr($atts['height']);

    ob_start();
    ?>
    <div class="basksc-container">
        <iframe
            id="basksc-scorebook-iframe"
            src="<?php echo esc_url($iframe_url); ?>"
            style="width: 100%; height: <?php echo esc_attr($height); ?>; border: 2px solid #e5e7eb; border-radius: 8px; display: block;"
            title="Basketball Scorebook"
            loading="eager"
            allowfullscreen
        ></iframe>

        <div class="basksc-guide">
            <strong>📱 推奨環境:</strong> iPad または PC の横向き、Safari / Chrome でのご利用を推奨します(LINE 内ブラウザは非推奨)。<br>
            <strong>💾 データ保存:</strong> 入力内容はブラウザの LocalStorage に自動保存されます。同じ端末・ブラウザであれば再訪時に復元されます。<br>
            <strong>🖨️ 印刷 / PDF:</strong> アプリ内の「Print PDF」ボタンから、スコアシートのみを A4 横で印刷 / PDF 保存できます。
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
        'Basketball Scorebook 設定',
        'Scorebook',
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
        <h2>Basketball Scorebook - 設定と使い方</h2>
        <p>以下のショートコードを投稿または固定ページに貼り付けてご利用ください。最も広いページテンプレート(全幅など)でご利用いただくことを推奨します。</p>

        <div class="basksc-code-box">
            <code id="basksc-shortcode">[basketball_scorebook]</code>
            <button type="button" class="button button-secondary" data-clipboard-target="basksc-shortcode">コピー</button>
        </div>

        <h3>高さのカスタマイズ</h3>
        <p>iframeの高さをカスタマイズしたい場合は、<code>height</code>属性を指定できます。デフォルトは<code>85vh</code>(ビューポートの高さの85%)です。</p>
        <div class="basksc-code-box">
            <code id="basksc-shortcode-height">[basketball_scorebook height="100vh"]</code>
            <button type="button" class="button button-secondary" data-clipboard-target="basksc-shortcode-height">コピー</button>
        </div>
        <p class="basksc-usage-note">
            <strong>使用例:</strong><br>
            • <code>[basketball_scorebook height="100vh"]</code> - 画面全体の高さ<br>
            • <code>[basketball_scorebook height="600px"]</code> - 固定の600ピクセル<br>
            • <code>[basketball_scorebook height="90vh"]</code> - 画面の90%の高さ
        </p>

        <h3>使い方・デモサイト</h3>
        <p>具体的な利用方法、応用例、最新の情報は、開発元サイトでご確認いただけます。本プラグインの全機能のデモも兼ねています。</p>
        <p>👉 <a href="https://doc778.com/scorebook/" target="_blank" class="basksc-demo-link">【公式】Basketball Scorebook 利用ガイド・デモサイトはこちら</a></p>

        <h3>サポートに関する注意点</h3>
        <p class="basksc-support-notice">本プラグインはGPLライセンスで提供されますが、<strong>コード内の開発元へのリンクや著作権表示を削除・改変した場合、そのバージョンは非公式なものとみなし、サポートおよびバグ修正の対象外</strong>とさせていただきます。ご理解をお願いいたします。</p>

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

