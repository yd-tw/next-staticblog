# next-posts

> 載入文章並將 YAML 解析到 Next.js 中！

一個輕量、零依賴的 TypeScript 函式庫，用於在 Next.js 中建立靜態部落格等文章頁面。它會解析包含 YAML frontmatter 的 Markdown 檔案，並提供簡潔的工具函式，方便搭配 SSG（Static Site Generation）使用。

---

## 功能特色

- 零執行期依賴 —— 僅使用 Node.js 內建模組
- 完整 TypeScript 支援（支援泛型 metadata）
- 支援任意目錄結構
- 同時支援 `slug` 與 `slug.md` 輸入格式
- 相容 Next.js App Router 與 Pages Router

---

## 安裝

使用 npm 或你喜歡的套件管理工具。

```bash
npm install next-posts
```

---

## 快速開始

在專案根目錄建立 `posts/` 資料夾，並放入 Markdown 檔案：

```
my-next-app/
└── posts/
    ├── hello-world.md
    └── getting-started.md
```

每個檔案應包含 YAML frontmatter 區塊與文章內容：

```markdown
---
title: Hello World
date: 2024-01-01
tags:
  - blog
  - intro
---

Welcome to my blog!
```

接著在 Next.js 中使用：

```ts
import { getAllPosts, getPostBySlug, getAllPostParams } from "next-posts";

interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
}

// 取得所有文章
const posts = getAllPosts<PostMeta>();

// 取得單篇文章
const post = getPostBySlug<PostMeta>("hello-world");

// 產生靜態路徑（Next.js）
const paths = getAllPostParams();
```

### 模板

你也可以從模板開始：

- [next-profile-template](https://github.com/yd-tw/next-profile-template)
- [kuang-ti-web](https://github.com/yd-tw/kuang-ti-web)

---

## API

### `getAllPosts<T>(directory?)`

回傳指定目錄中的所有文章，包含解析後的 frontmatter 與內容。

```ts
const posts = getAllPosts<PostMeta>();
// [
//   { slug: 'hello-world', metadata: { title: '...' }, content: '...' },
//   ...
// ]
```

| 參數        | 型別     | 預設值     | 說明                          |
| ----------- | -------- | ---------- | ----------------------------- |
| `directory` | `string` | `"posts/"` | 相對於 `process.cwd()` 的路徑 |

**回傳型別：**
`Array<{ slug: string; metadata: T; content: string }>`

---

### `getPostBySlug<T>(slug, directory?)`

依據 slug 取得單篇文章。支援帶或不帶 `.md` 副檔名。

```ts
const post = getPostBySlug<PostMeta>("hello-world");
// {
//   slug: 'hello-world',
//   metadata: { title: 'Hello World', ... },
//   content: '...'
// }
```

| 參數        | 型別     | 預設值     | 說明                          |
| ----------- | -------- | ---------- | ----------------------------- |
| `slug`      | `string` | —          | 檔名（可含或不含 `.md`）      |
| `directory` | `string` | `"posts/"` | 相對於 `process.cwd()` 的路徑 |

**回傳型別：**
`{ slug: string; metadata: T; content: string }`

---

### `getAllPostSlugs(directory?)`

回傳指定目錄中的原始檔名（包含 `.md` 副檔名）。

```ts
const slugs = getAllPostSlugs();
// ['hello-world.md', 'getting-started.md']
```

| 參數        | 型別     | 預設值     | 說明                          |
| ----------- | -------- | ---------- | ----------------------------- |
| `directory` | `string` | `"posts/"` | 相對於 `process.cwd()` 的路徑 |

**回傳型別：**
`string[]`

---

### `getAllPostParams(directory?)`

回傳適用於 Next.js `generateStaticParams` 或 `getStaticPaths` 的 slug 參數物件，會自動移除 `.md` 副檔名。

```ts
const params = getAllPostParams();
// [{ slug: 'hello-world' }, { slug: 'getting-started' }]
```

| 參數        | 型別     | 預設值     | 說明                          |
| ----------- | -------- | ---------- | ----------------------------- |
| `directory` | `string` | `"posts/"` | 相對於 `process.cwd()` 的路徑 |

**回傳型別：**
`Array<{ slug: string }>`

---

### `parseFrontmatter(input)`

解析原始 Markdown 字串並提取 YAML frontmatter。適用於非從檔案系統讀取的 Markdown，或需要較底層控制時使用。

```ts
import { parseFrontmatter } from "next-posts";

const raw = `---
title: Hello World
date: 2024-01-01
tags:
  - blog
---

Welcome to my blog!`;

const { data, content } = parseFrontmatter(raw);
```

- `data`：解析後的 YAML frontmatter 物件，若無有效 frontmatter 則為 `{}`。
- `content`：移除 frontmatter 後的 Markdown 內容。

| 參數    | 型別     | 說明                             |
| ------- | -------- | -------------------------------- |
| `input` | `string` | 含有 frontmatter 的原始 Markdown |

**回傳型別：**
`{ data: Record<string, unknown>; content: string }`

---

## 搭配 Next.js 使用

### App Router

```tsx
// app/blog/[slug]/page.tsx
import { getAllPostParams, getPostBySlug } from "next-posts";

interface PostMeta {
  title: string;
  date: string;
}

export function generateStaticParams() {
  return getAllPostParams();
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { metadata, content } = getPostBySlug<PostMeta>(slug);

  return (
    <article>
      <h1>{metadata.title}</h1>
      <p>{metadata.date}</p>
      {/* 推薦使用 ReactMarkdown，但你可以使用任何喜愛的 */}
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </article>
  );
}
```

---

### Pages Router

```ts
// pages/blog/[slug].tsx
import { GetStaticPaths, GetStaticProps } from "next";
import { getAllPostParams, getPostBySlug } from "next-posts";

interface PostMeta {
  title: string;
  date: string;
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllPostParams().map(({ slug }) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = ({ params }) => {
  const post = getPostBySlug<PostMeta>(params!.slug as string);
  return { props: { post } };
};
```

---

## 自訂文章目錄

所有函式皆支援傳入自訂目錄：

```ts
const posts = getAllPosts("content/articles/");
const post = getPostBySlug("my-article", "content/articles/");
```

---

## 從 v0.x 版本遷移

遷移過程很容易，因為大部分的 API 都保持兼容。

1. 變更套件名稱：

`next-posts` 過去稱為 `next-staticblog` ，你可以直接替換套件名稱並指向最新版本。舊的套件將棄用並不再進行維護。

2. 明確的型別：

在 `v0.x` 版本中使用 `any` 來定義 `metadata`，
在 `v1.x` 版本中改為使用 `unknown` 來提升安全性。
請閱讀文檔瞭解如何傳入泛型，擁有安全的型別。

除此之外套件移除了 `gray-matter` 並改用 `@std/yaml` 進行解析。雖然變更通過了所有的測試，但仍然可能在部分非標準用法上有細微差異。

---

## 常見問題

### no such file or directory

我們推薦你使用 SSG 建置，因為這樣才能確保最高效率。因此若你在動態路由中使用 `next-posts` 將有可能導致錯誤。
幸運的是通常你只需要使用 `getAllPostParams()` 並結合 `generateStaticParams()` 就能使用 `SSG`。

```ts
Error: ENOENT: no such file or directory, scandir '/var/task/posts/news/zh'
```

但若你堅持使用動態路由，則需要在 next.config.ts 添加設置以確保文章能夠被包含。

```ts
// next.config.ts
outputFileTracingIncludes: {
  "/**": ["./posts/**/*.{md,mdx}"],
},
```

---

## 貢獻

你可以透過回報問題或提交新功能完善這個套件！

```bash
# 安裝依賴
npm install

# 建置
npm run build

# 執行測試
npm test

# 格式化程式碼
npm run format
```

---

## 授權

MIT © yd-tw
[https://github.com/yd-tw/next-posts](https://github.com/yd-tw/next-posts)
