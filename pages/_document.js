// pages/_document.js
// このファイルは、Next.jsアプリケーションのHTMLドキュメント構造をカスタマイズします。
// Tailwind CSSのCDNを読み込むために使用します。

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja"> {/* 言語設定を日本語に */}
      <Head>
        {/* Tailwind CSS Play CDNを読み込みます。 */}
        {/* これは開発やプロトタイピングには便利ですが、本番環境での使用は推奨されません。 */}
        {/* 本番環境では、npmでインストールする通常のセットアップの方がパフォーマンスが優れています。 */}
        <script src="https://cdn.tailwindcss.com"></script>

        {/* Interフォントを読み込みます。これはTailwindのデフォルトフォントと相性が良いです。 */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main /> {/* アプリケーションのメインコンテンツがここにレンダリングされます */}
        <NextScript /> {/* Next.jsのスクリプトがここに挿入されます */}
      </body>
    </Html>
  );
}
