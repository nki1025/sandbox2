// pages/_app.js
// このファイルはNext.jsアプリケーションのすべてのページを初期化するために使用されます。
// グローバルなCSSやレイアウト、状態管理などを設定できます。

// グローバルCSSファイルをインポートする場合、ここに記述します。
// 今回はCDNを使用しているため、ここではCSSのインポートは不要です。
// import '../styles/globals.css'; // この行はコメントアウトまたは削除したままにしてください

// MyAppコンポーネントは、すべてのページコンポーネントをラップします。
// Componentプロップは現在のページコンポーネントを表し、
// pagePropsはそのページに渡されるプロップです。
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
