# next-posts

> Load posts and parse YAML into Next.js!

A lightweight, zero-dependency TypeScript library for building static blog posts and content pages in Next.js. It parses Markdown files with YAML frontmatter and provides simple utility functions designed for use with SSG (Static Site Generation).

[中文](/README-zh.md)

---

## Features

- Zero runtime dependencies — only uses built-in Node.js modules
- Full TypeScript support (generic metadata support)
- Supports arbitrary directory structures
- Accepts both `slug` and `slug.md` formats
- Compatible with Next.js App Router and Pages Router

---

## Installation

Install using npm or your preferred package manager:

```bash
npm install next-posts
```

---

## Quick Start

Create a `posts/` directory in your project root and add Markdown files:

```
my-next-app/
└── posts/
    ├── hello-world.md
    └── getting-started.md
```

Each file should contain a YAML frontmatter block and content:

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

Then use it in your Next.js project:

```ts
import { getAllPosts, getPostBySlug, getAllPostParams } from "next-posts";

interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
}

// Get all posts
const posts = getAllPosts<PostMeta>();

// Get a single post
const post = getPostBySlug<PostMeta>("hello-world");

// Generate static paths (Next.js)
const paths = getAllPostParams();
```

### Template

You can also start with a template：

- [next-profile-template](https://github.com/yd-tw/next-profile-template)
- [kuang-ti-web](https://github.com/yd-tw/kuang-ti-web)

---

## API

### `getAllPosts<T>(directory?)`

Returns all posts from the specified directory, including parsed frontmatter and content.

```ts
const posts = getAllPosts<PostMeta>();
// [
//   { slug: 'hello-world', metadata: { title: '...' }, content: '...' },
//   ...
// ]
```

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `directory` | `string` | `"posts/"` | Path relative to `process.cwd()` |

**Return type:**
`Array<{ slug: string; metadata: T; content: string }>`

---

### `getPostBySlug<T>(slug, directory?)`

Returns a single post by slug. Supports both with and without the `.md` extension.

```ts
const post = getPostBySlug<PostMeta>("hello-world");
// {
//   slug: 'hello-world',
//   metadata: { title: 'Hello World', ... },
//   content: '...'
// }
```

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `slug`      | `string` | —          | Filename (with or without `.md`) |
| `directory` | `string` | `"posts/"` | Path relative to `process.cwd()` |

**Return type:**
`{ slug: string; metadata: T; content: string }`

---

### `getAllPostSlugs(directory?)`

Returns all raw filenames (including the `.md` extension) from the specified directory.

```ts
const slugs = getAllPostSlugs();
// ['hello-world.md', 'getting-started.md']
```

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `directory` | `string` | `"posts/"` | Path relative to `process.cwd()` |

**Return type:**
`string[]`

---

### `getAllPostParams(directory?)`

Returns slug parameter objects suitable for Next.js `generateStaticParams` or `getStaticPaths`. Automatically removes the `.md` extension.

```ts
const params = getAllPostParams();
// [{ slug: 'hello-world' }, { slug: 'getting-started' }]
```

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `directory` | `string` | `"posts/"` | Path relative to `process.cwd()` |

**Return type:**
`Array<{ slug: string }>`

---

### `parseFrontmatter(input)`

Parses a raw Markdown string and extracts YAML frontmatter. Useful when Markdown is not loaded from the filesystem or when lower-level control is needed.

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

- `data`: Parsed YAML frontmatter object. Returns `{}` if no valid frontmatter exists.
- `content`: Markdown content with the frontmatter removed.

| Parameter | Type     | Description                                |
| --------- | -------- | ------------------------------------------ |
| `input`   | `string` | Raw Markdown string containing frontmatter |

**Return type:**
`{ data: Record<string, unknown>; content: string }`

---

## Using with Next.js

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
      {/* ReactMarkdown is recommended, but you can use any renderer you prefer */}
      <ReactMarkdown>{content}</ReactMarkdown>
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

## Custom Post Directory

All functions accept a custom directory:

```ts
const posts = getAllPosts("content/articles/");
const post = getPostBySlug("my-article", "content/articles/");
```

---

## Migrating from v0.x

Migration is straightforward since most APIs remain compatible.

1. Package rename:

`next-posts` was previously called `next-staticblog`. Simply replace the package name and install the latest version. The old package is deprecated and no longer maintained.

2. Explicit typing:

In `v0.x`, `metadata` was typed as `any`.
In `v1.x`, it is typed as `unknown` to improve type safety.
Refer to the documentation on how to pass generics for safe typing.

Additionally, the package removed `gray-matter` and now uses `@std/yaml` for parsing. While all tests pass, there may be minor differences in some non-standard use cases.

---

## FAQ

### no such file or directory

SSG is strongly recommended for maximum efficiency. Using `next-posts` inside dynamic routes may cause errors.

Typically, you only need to combine `getAllPostParams()` with `generateStaticParams()` to enable SSG.

```ts
Error: ENOENT: no such file or directory, scandir '/var/task/posts/news/zh'
```

If you insist on using dynamic routes, add the following configuration to `next.config.ts` to ensure Markdown files are included:

```ts
// next.config.ts
outputFileTracingIncludes: {
  "/**": ["./posts/**/*.{md,mdx}"],
},
```

---

## Contributing

You can improve this package by reporting issues or submitting new features!

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Format code
npm run format
```

---

## License

MIT © yd-tw
[https://github.com/yd-tw/next-posts](https://github.com/yd-tw/next-posts)
