<?php
/**
 * Plugin Name: Basketball Scorebook
 * Plugin URI: https://doc778.com/scorebook/
 * Description: 試合で使える無料のバスケットボールデジタルスコアシート。タイムスタンプ付き、LocalStorage保存、PDF印刷対応。
 * Version: 1.0.0
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

define('BSB_VERSION', '1.0.0');
define('BSB_PLUGIN_URL', plugin_dir_url(__FILE__));
define('BSB_PLUGIN_DIR', plugin_dir_path(__FILE__));

/**
 * ショートコード [basketball_scorebook]
 * ほぼ全画面に近い iframe と、簡単なガイドテキストを出力します。
 */
function basketball_scorebook_shortcode($atts)
{
    $atts = shortcode_atts(
        array(
            'height' => '85vh', // デフォルト高さ（必要に応じて 100vh などに変更可）
        ),
        $atts,
        'basketball_scorebook'
    );

    $iframe_url = BSB_PLUGIN_URL . 'assets/app/index.html?v=' . BSB_VERSION;
    $height     = esc_attr($atts['height']);

    ob_start();
    ?>
    <div class="bsb-container" style="width: 100%; margin: 2rem 0;">
        <iframe
            id="bsb-scorebook-iframe"
            src="<?php echo esc_url($iframe_url); ?>"
            style="width: 100%; height: <?php echo esc_attr($height); ?>; border: 2px solid #e5e7eb; border-radius: 8px; display: block;"
            title="Basketball Scorebook"
            loading="eager"
            allowfullscreen
        ></iframe>

        <div class="bsb-guide" style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 4px; font-size: 0.875rem; line-height: 1.6;">
            <strong>📱 推奨環境:</strong> iPad または PC の横向き、Safari / Chrome でのご利用を推奨します（LINE 内ブラウザは非推奨）。<br>
            <strong>💾 データ保存:</strong> 入力内容はブラウザの LocalStorage に自動保存されます。同じ端末・ブラウザであれば再訪時に復元されます。<br>
            <strong>🖨️ 印刷 / PDF:</strong> アプリ内の「Print PDF」ボタンから、スコアシートのみを A4 横で印刷 / PDF 保存できます。
        </div>
    </div>
    <style>
        @media print {
            .bsb-container,
            .bsb-guide {
                display: none !important;
            }
        }
    </style>
    <?php

    return ob_get_clean();
}
add_shortcode('basketball_scorebook', 'basketball_scorebook_shortcode');

/**
 * 管理画面に簡単な説明ページを追加（任意）
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

function basketball_scorebook_settings_page()
{
    ?>
    <div class="wrap">
        <h2>Basketball Scorebook - 設定と使い方</h2>
        <p>以下のショートコードを投稿または固定ページに貼り付けてご利用ください。最も広いページテンプレート（全幅など）でご利用いただくことを推奨します。</p>

        <!-- ショートコードのコードボックスの表示 -->
        <div class="bsb-code-box">
            <code id="bsb-shortcode">[basketball_scorebook]</code>
            <button type="button" class="button button-secondary" onclick="bsbCopyToClipboard('bsb-shortcode')">コピー</button>
        </div>

        <!-- 高さのカスタマイズ説明 -->
        <h3>高さのカスタマイズ</h3>
        <p>iframeの高さをカスタマイズしたい場合は、<code>height</code>属性を指定できます。デフォルトは<code>85vh</code>（ビューポートの高さの85%）です。</p>
        <div class="bsb-code-box">
            <code id="bsb-shortcode-height">[basketball_scorebook height="100vh"]</code>
            <button type="button" class="button button-secondary" onclick="bsbCopyToClipboard('bsb-shortcode-height')">コピー</button>
        </div>
        <p style="margin-top: 0.5rem; font-size: 0.9em; color: #666;">
            <strong>使用例:</strong><br>
            • <code>[basketball_scorebook height="100vh"]</code> - 画面全体の高さ<br>
            • <code>[basketball_scorebook height="600px"]</code> - 固定の600ピクセル<br>
            • <code>[basketball_scorebook height="90vh"]</code> - 画面の90%の高さ
        </p>

        <!-- 使い方・デモサイトの強調表示 -->
        <h3>使い方・デモサイト</h3>
        <p>具体的な利用方法、応用例、最新の情報は、開発元サイトでご確認いただけます。本プラグインの全機能のデモも兼ねています。</p>
        <p>👉 <a href="https://doc778.com/scorebook/" target="_blank" style="font-weight: bold; font-size: 1.1em; color: #d63638;">【公式】Basketball Scorebook 利用ガイド・デモサイトはこちら</a></p>

        <!-- サポートポリシーの明記（抑止力） -->
        <h3>サポートに関する注意点</h3>
        <p style="color: #a00; border: 1px solid #fcc; padding: 10px; background: #fff8f8;">本プラグインはGPLライセンスで提供されますが、<strong>コード内の開発元へのリンクや著作権表示を削除・改変した場合、そのバージョンは非公式なものとみなし、サポートおよびバグ修正の対象外</strong>とさせていただきます。ご理解をお願いいたします。</p>

    </div>

    <style>
        .bsb-code-box {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f5f5f5;
            padding: 10px 15px;
            border-radius: 4px;
            margin: 8px 0;
        }
        .bsb-code-box code {
            flex: 1;
            background: none;
            font-size: 14px;
        }
    </style>

    <script>
        function bsbCopyToClipboard(elementId) {
            const el = document.getElementById(elementId);
            const text = el.textContent;
            navigator.clipboard.writeText(text).then(function() {
                alert('コピーしました！');
            }).catch(function() {
                // フォールバック
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('コピーしました！');
            });
        }
    </script>
    <?php
}

/**
 * 有効化 / 無効化フック（将来の拡張用に定義のみ）
 */
function basketball_scorebook_activate()
{
    // 必要ならここでオプション初期化などを行う
}
register_activation_hook(__FILE__, 'basketball_scorebook_activate');

function basketball_scorebook_deactivate()
{
    // LocalStorage はクライアント側なので特に削除処理なし
}
register_deactivation_hook(__FILE__, 'basketball_scorebook_deactivate');


