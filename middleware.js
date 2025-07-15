// middleware.js
// このファイルはNext.jsのミドルウェアを定義し、Basic認証を実装します。
// プロジェクトのルートディレクトリ（pagesフォルダと同じ階層）に配置してください。

import { NextResponse } from 'next/server';

// 環境変数からユーザー名とパスワードを取得します。
// Vercelのプロジェクト設定でこれらの環境変数を設定する必要があります。
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

// ミドルウェア関数
export function middleware(request) {
  // Basic認証のユーザー名とパスワードが設定されていない場合は、認証をスキップします。
  // これにより、開発環境やBasic認証が不要な場合に認証が適用されなくなります。
  if (!BASIC_AUTH_USERNAME || !BASIC_AUTH_PASSWORD) {
    console.warn("Basic認証の環境変数が設定されていません。認証がスキップされます。");
    return NextResponse.next();
  }

  // リクエストヘッダーからAuthorizationヘッダーを取得します。
  const authorizationHeader = request.headers.get('authorization');

  // Authorizationヘッダーが存在しない場合、またはBasic認証ではない場合
  if (!authorizationHeader || !authorizationHeader.startsWith('Basic ')) {
    // 認証を要求するレスポンスを返します。
    // 'WWW-Authenticate' ヘッダーを設定することで、ブラウザが認証ダイアログを表示します。
    return new NextResponse('Authentication Required', {
      status: 401, // Unauthorized
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }

  // Base64エンコードされた認証情報をデコードします。
  // "Basic " の部分を除去し、Base64デコードします。
  const base64Credentials = authorizationHeader.substring(6); // "Basic " の6文字をスキップ
  const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

  // ユーザー名とパスワードを ":" で分割します。
  const [username, password] = decodedCredentials.split(':');

  // 環境変数に設定されたユーザー名とパスワードと照合します。
  if (username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD) {
    // 認証成功: 次のリクエスト処理に進みます。
    return NextResponse.next();
  } else {
    // 認証失敗: 再度認証を要求するレスポンスを返します。
    return new NextResponse('Authentication Required', {
      status: 401, // Unauthorized
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }
}

// ミドルウェアを適用するパスを定義します。
// ここでは、全てのパス (/) に適用されるように設定しています。
// 特定のパスのみに適用したい場合は、正規表現などで調整してください。
// 例: '/admin/:path*' とすると、/admin以下の全てのパスに適用されます。
export const config = {
  matcher: '/', // 全てのパスに適用
};
