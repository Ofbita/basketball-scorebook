# Basketball Scorebook for WordPress

[![WordPress Plugin](https://img.shields.io/wordpress/v/basketball-scorebook.svg)](https://wordpress.org/plugins/basketball-scorebook/)
[![GPLv2 License](https://img.shields.io/badge/license-GPLv2-blue.svg)](https://www.gnu.org/licenses/gpl-2.0.html)

**タイムスタンプ記録、ランニングスコア表示、PDFエクスポート機能を備えた、プロフェッショナルかつ軽量なデジタル・バスケットボール・スコアブックです。**

単なる得点板以上の機能を求めるコーチ、テーブルオフィシャル（TO）、ファンの皆様に最適です。

---

## 🏀 デモ・使い方
インストール不要で、すべての機能をお試しいただけます：
- **日本語デモ:** [https://doc778.com/scorebook/](https://doc778.com/scorebook/)
- **英語デモ:** [https://doc778.com/scorebook?lang=en](https://doc778.com/scorebook?lang=en)
- **使い方ガイド (英語):** [https://doc778.com/help-scorebook?lang=en](https://doc778.com/help-scorebook?lang=en)

---
![Basketball Scorebook Dashboard](https://doc778.com/wp-content/uploads/2025/12/image-1.png)
---

## ✨ 主な機能

* **リアルタイムスコアリング:** 2P、3P、フリースローを素早く入力可能。選手のスタッツ（個人成績）は自動計算されます。
* **イベントのタイムスタンプ:** すべてのファウル、タイムアウト、得点の発生時刻を自動的かつ正確に記録します。
* **ランニングスコアの可視化:** 試合の流れをプロ仕様の形式で追跡可能（1〜160点まで対応）。
* **印刷・PDF対応:** A4横向き印刷やブラウザ経由でのPDF保存に最適化されています。
* **データ保護:** ブラウザの `LocalStorage` に自動保存されます。手動バックアップ用のJSONインポート/エクスポート機能も搭載しています。
* **データベースへの負荷なし:** すべてクライアントサイド（Alpine.js）で動作するため、WordPressのデータベースを肥大化させません。

## 🚀 インストール方法

1.  このリポジトリをダウンロードし、`basketball-scorebook` フォルダを `/wp-content/plugins/` ディレクトリにアップロードします。
2.  WordPressのダッシュボードでプラグインを有効化します。
3.  任意のページにショートコード `[basketball_scorebook]` を追加します。
    * *ヒント: 最良の表示結果を得るには、「全幅（Full-Width）」テンプレートを使用してください。*

## 🛠 使用技術
- **Alpine.js:** 高速でリアクティブなクライアントサイドのデータ処理に使用。
- **Tailwind CSS:** モダンでレスポンシブなUIデザインに使用。
- **WordPress API:** プラグインとしてのシームレスな統合に使用。

## 📄 ライセンス
[GPLv2 or later](https://www.gnu.org/licenses/gpl-2.0.html) の下でライセンスされています。
