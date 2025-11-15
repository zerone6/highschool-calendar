# 東京私立高校 入試日程 (React Native / Expo)

オフラインで東京私立高校入試日程を参照し、日付ごとに志願校を選択・最終確認できる iOS/Android 用アプリです。サーバ通信なしで `tokyo_2025.json` をバンドルしています。

## 機能概要

- 開始画面: 名前と偏差値入力 (偏差値は 40-90 を 1 刻みで選択)
- 日付ナビゲーション: 前/次へ移動、全日程選択後「最終確認」
- 学校一覧: 試験日ごとの学校を偏差値順表示。偏差差分で背景色 (±3 緑 / +4~+5 橙 / +6 以上 赤 / -4~-5 黄 / -6 以下 白)
- 志願確認モーダル: 「はい」で保存し次の日付へ遷移
- 最終選択結果: 選択した学校のみをカード表示。出願開始/締切/試験日/合格発表をタップして完了状態切替 (D-day 表示付き)
- 端末ローカル保存: AsyncStorage に選択と完了状態/ユーザー情報保持

## セットアップ

```bash
cd mobile
npm install   # 依存関係インストール
npm run start # Expo 開始 (QR で iOS / Android 実機, またはシミュレータ)
npm run ios   # iOS シミュレータ直接起動 (Xcode 必須)
```

## 技術スタック

- Expo SDK 51
- React Native 0.74
- AsyncStorage (@react-native-async-storage/async-storage)
- Picker (@react-native-picker/picker)

## データ差し替え

`src/data/tokyo_2025.json` を完全版 JSON に差し替えて再起動すれば反映されます。構造: SchoolRecord の配列。

```ts
interface SchoolRecord {
  schoolName: string;
  area: string;
  deviation: number | null;
  category: string;
  examName: string;
  applyStart: string;
  applyEnd: string;
  examDate: string;
  resultDate: string;
  annual: string;
  refund: string;
}
```

## D-day 計算ロジック

- 12 月は当年扱い
- 1~3 月は翌年扱い
- その他は当年

## 既知の留意点

- 重複する学校名+試験名称は key 衝突回避のため `schoolName_examName` を使用
- 非選択 ("志願しない") は現状 RN 版では一覧に特別項目としては未実装（必要なら拡張）

## 拡張案

- "志願しない" 選択フロー追加
- PDF / 画像資料添付
- 学校詳細画面
- ダークモード対応

## トラブルシュート

- iOS シミュレータが起動しない: Xcode Command Line Tools を再インストール
- Metro 再起動: `rm -rf .expo` して `npm run start`
