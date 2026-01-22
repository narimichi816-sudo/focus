# 共通UIコンポーネント

アプリケーション全体で使用する共通UIコンポーネントのライブラリです。

## コンポーネント一覧

### レイアウトコンポーネント

#### Layout
アプリケーション全体のレイアウトを提供します。

```jsx
import { Layout } from './components'

<Layout title="ページタイトル" headerChildren={<Navigation />}>
  <p>コンテンツ</p>
</Layout>
```

#### Header
ヘッダーコンポーネント。

```jsx
import { Header } from './components'

<Header title="タイトル">
  <Navigation />
</Header>
```

#### Footer
フッターコンポーネント。

```jsx
import { Footer } from './components'

<Footer />
```

### ナビゲーション

#### Navigation
ナビゲーションメニューコンポーネント。

```jsx
import { Navigation } from './components'

const navItems = [
  { id: '1', label: 'ホーム', path: '/' },
  { id: '2', label: 'Todo', path: '/todo' },
]

<Navigation
  items={navItems}
  currentPath="/"
  onNavigate={(path) => console.log(path)}
/>
```

### 基本UIコンポーネント

#### Button
ボタンコンポーネント。

```jsx
import { Button } from './components'

<Button variant="primary" size="medium" onClick={() => alert('クリック')}>
  ボタン
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'outline'` (デフォルト: `'primary'`)
- `size`: `'small' | 'medium' | 'large'` (デフォルト: `'medium'`)
- `disabled`: `boolean` (デフォルト: `false`)
- `onClick`: `Function`
- `type`: `'button' | 'submit' | 'reset'` (デフォルト: `'button'`)

#### Input
入力フィールドコンポーネント。

```jsx
import { Input } from './components'

<Input
  type="text"
  label="名前"
  placeholder="名前を入力"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  required
  error={error}
/>
```

**Props:**
- `type`: `string` (デフォルト: `'text'`)
- `label`: `string`
- `placeholder`: `string`
- `value`: `string`
- `onChange`: `Function`
- `error`: `string`
- `required`: `boolean`
- `disabled`: `boolean`

#### Textarea
テキストエリアコンポーネント。

```jsx
import { Textarea } from './components'

<Textarea
  label="内容"
  placeholder="内容を入力"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  rows={4}
/>
```

**Props:**
- `label`: `string`
- `placeholder`: `string`
- `value`: `string`
- `onChange`: `Function`
- `rows`: `number` (デフォルト: `4`)
- `error`: `string`
- `required`: `boolean`
- `disabled`: `boolean`

#### Card
カードコンポーネント。

```jsx
import { Card } from './components'

<Card title="カードタイトル">
  <p>カードの内容</p>
</Card>
```

**Props:**
- `title`: `string`
- `children`: `React.ReactNode`

### 共通機能コンポーネント

#### Modal
モーダルコンポーネント。

```jsx
import { Modal } from './components'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="モーダルタイトル"
>
  <p>モーダルの内容</p>
</Modal>
```

**Props:**
- `isOpen`: `boolean`
- `onClose`: `Function`
- `title`: `string`
- `showCloseButton`: `boolean` (デフォルト: `true`)

#### Notification
通知コンポーネント。

```jsx
import { Notification } from './components'

<Notification
  isVisible={isVisible}
  message="通知メッセージ"
  type="success"
  onClose={() => setIsVisible(false)}
  duration={3000}
/>
```

**Props:**
- `isVisible`: `boolean`
- `message`: `string`
- `type`: `'success' | 'error' | 'info' | 'warning'` (デフォルト: `'info'`)
- `onClose`: `Function`
- `duration`: `number` (ミリ秒、デフォルト: `3000`、`0`で無効)

## レスポンシブデザイン

すべてのコンポーネントはレスポンシブデザインに対応しています：

- **デスクトップ**: 1024px以上
- **タブレット**: 768px - 1023px
- **モバイル**: 480px - 767px
- **小型モバイル**: 480px以下

## スタイル

共通スタイルは `src/styles/common.css` で定義されています。
