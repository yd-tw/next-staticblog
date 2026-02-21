# next-staticblog

> Quickly configure the markdown component in a Next.js project and create a blog page!

A lightweight, zero-runtime-dependency TypeScript library for building static blogs in Next.js. It parses markdown files with YAML frontmatter and provides simple utilities to retrieve posts for use with static site generation (SSG).

## Features

- Zero runtime dependencies — uses Node.js built-ins only
- Full TypeScript support with generic metadata types
- Works with any directory structure
- Handles both `slug` and `slug.md` inputs transparently
- Compatible with Next.js App Router and Pages Router

## Installation

```bash
npm install next-staticblog
```

```bash
pnpm add next-staticblog
```

```bash
yarn add next-staticblog
```

## Quick Start

Place your markdown files in a `posts/` directory at the project root:

```
my-next-app/
└── posts/
    ├── hello-world.md
    └── getting-started.md
```

Each file should contain a YAML frontmatter block followed by the post content:

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

Then use the library in your Next.js pages:

```typescript
import { getAllPosts, getPostBySlug, getAllPostParams } from "next-staticblog";

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

## API

### `getAllPosts<T>(directory?)`

Returns all posts from the specified directory, each with parsed frontmatter and content.

```typescript
const posts = getAllPosts<PostMeta>();
// [{ slug: 'hello-world', metadata: { title: '...' }, content: '...' }, ...]
```

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `directory` | `string` | `"posts/"` | Path relative to `process.cwd()` |

**Returns:** `Array<{ slug: string; metadata: T; content: string }>`

---

### `getPostBySlug<T>(slug, directory?)`

Returns a single post by slug. Accepts slugs with or without the `.md` extension.

```typescript
const post = getPostBySlug<PostMeta>("hello-world");
// { slug: 'hello-world', metadata: { title: 'Hello World', ... }, content: '...' }
```

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `slug`      | `string` | —          | Filename with or without `.md`   |
| `directory` | `string` | `"posts/"` | Path relative to `process.cwd()` |

**Returns:** `{ slug: string; metadata: T; content: string }`

---

### `getAllPostSlugs(directory?)`

Returns the raw filenames (including `.md` extension) from the specified directory.

```typescript
const slugs = getAllPostSlugs();
// ['hello-world.md', 'getting-started.md']
```

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `directory` | `string` | `"posts/"` | Path relative to `process.cwd()` |

**Returns:** `string[]`

---

### `getAllPostParams(directory?)`

Returns slug parameter objects suitable for use with Next.js `generateStaticParams` or `getStaticPaths`. The `.md` extension is stripped automatically.

```typescript
const params = getAllPostParams();
// [{ slug: 'hello-world' }, { slug: 'getting-started' }]
```

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `directory` | `string` | `"posts/"` | Path relative to `process.cwd()` |

**Returns:** `Array<{ slug: string }>`

---

### `parseFrontmatter(input)`

Parses a raw markdown string and extracts YAML frontmatter metadata. Useful when you have markdown content not loaded from the filesystem, or when you need lower-level parsing control.

```typescript
import { parseFrontmatter } from "next-staticblog";

const raw = `---
title: Hello World
date: 2024-01-01
tags:
  - blog
---

Welcome to my blog!`;

const { data, content } = parseFrontmatter(raw);
// data:    { title: 'Hello World', date: '2024-01-01', tags: ['blog'] }
// content: '\nWelcome to my blog!'
```

| Parameter | Type     | Description                          |
| --------- | -------- | ------------------------------------ |
| `input`   | `string` | Raw markdown string with frontmatter |

**Returns:** `{ data: Record<string, unknown>; content: string }`

- `data` — parsed YAML frontmatter as a plain object. Returns `{}` if no valid frontmatter is found.
- `content` — the markdown body after the frontmatter block.

---

## Usage with Next.js

### App Router (Next.js 13+)

```typescript
// app/blog/[slug]/page.tsx
import { getAllPostParams, getPostBySlug } from 'next-staticblog';

interface PostMeta {
  title: string;
  date: string;
}

export function generateStaticParams() {
  return getAllPostParams();
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const { metadata, content } = getPostBySlug<PostMeta>(params.slug);

  return (
    <article>
      <h1>{metadata.title}</h1>
      <p>{metadata.date}</p>
      {/* render content with your preferred markdown renderer */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
```

### Pages Router

```typescript
// pages/blog/[slug].tsx
import { GetStaticPaths, GetStaticProps } from "next";
import { getAllPostParams, getPostBySlug } from "next-staticblog";

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

### Custom Post Directory

All functions accept an optional `directory` parameter:

```typescript
// Use a custom directory
const posts = getAllPosts("content/articles/");
const post = getPostBySlug("my-article", "content/articles/");
```

## Development

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

## License

MIT © [twyd](https://github.com/yd-tw/next-staticblog)
