import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "url";
import path from "path";
import {
  getAllPostSlugs,
  getAllPosts,
  getAllPostParams,
  getPostBySlug,
  parseFrontmatter,
} from "../index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, "fixtures");

beforeEach(() => {
  vi.spyOn(process, "cwd").mockReturnValue(FIXTURES_DIR);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAllPostSlugs", () => {
  // 回傳預設 posts 目錄中的所有檔名
  it("returns filenames from default posts directory", () => {
    const slugs = getAllPostSlugs();
    expect(slugs).toEqual(
      expect.arrayContaining(["hello-world.md", "second-post.md"]),
    );
  });

  // 回傳自訂目錄中的所有檔名
  it("returns filenames from custom directory", () => {
    const slugs = getAllPostSlugs("custom-posts/");
    expect(slugs).toEqual(["custom.md"]);
  });

  // 回傳目錄中所有檔案（數量正確）
  it("returns all files in directory", () => {
    const slugs = getAllPostSlugs();
    expect(slugs).toHaveLength(2);
  });
});

describe("getAllPostParams", () => {
  // 回傳不含 .md 副檔名的 slug 參數物件
  it("returns slug params without .md extension", () => {
    const params = getAllPostParams();
    expect(params).toEqual(
      expect.arrayContaining([
        { slug: "hello-world" },
        { slug: "second-post" },
      ]),
    );
  });

  // 回傳自訂目錄中的 slug 參數
  it("returns slug params from custom directory", () => {
    const params = getAllPostParams("custom-posts/");
    expect(params).toEqual([{ slug: "custom" }]);
  });

  // 確保所有 slug 都已移除 .md 副檔名
  it("strips .md extension from all slugs", () => {
    const params = getAllPostParams();
    for (const param of params) {
      expect(param.slug).not.toMatch(/\.md$/);
    }
  });
});

describe("getPostBySlug", () => {
  // 使用不含副檔名的 slug 取得文章資料
  it("returns post data for slug without extension", () => {
    const post = getPostBySlug("hello-world");
    expect(post.slug).toBe("hello-world");
    expect(post.metadata.title).toBe("Hello World");
    expect(post.content).toContain(
      "This is the content of the hello world post.",
    );
  });

  // 使用含 .md 副檔名的 slug 取得文章資料
  it("returns post data for slug with .md extension", () => {
    const post = getPostBySlug("hello-world.md");
    expect(post.slug).toBe("hello-world");
    expect(post.metadata.title).toBe("Hello World");
  });

  // 正確解析 frontmatter 中的 metadata
  it("parses frontmatter metadata correctly", () => {
    const post = getPostBySlug("second-post");
    expect(post.metadata.title).toBe("Second Post");
    expect(post.metadata.tags).toEqual(["test", "blog"]);
  });

  // 回傳內容不包含 frontmatter 區塊
  it("returns content without frontmatter", () => {
    const post = getPostBySlug("second-post");
    expect(post.content).toContain("This is the second post content.");
    expect(post.content).not.toContain("---");
  });

  // 可從自訂目錄中取得文章
  it("returns post from custom directory", () => {
    const post = getPostBySlug("custom", "custom-posts/");
    expect(post.slug).toBe("custom");
    expect(post.metadata.title).toBe("Custom Post");
    expect(post.content).toContain("Content from custom directory.");
  });

  // 回傳的 slug 永遠不包含 .md 副檔名
  it("returned slug never has .md extension", () => {
    const postWithExt = getPostBySlug("hello-world.md");
    const postWithoutExt = getPostBySlug("hello-world");
    expect(postWithExt.slug).toBe("hello-world");
    expect(postWithoutExt.slug).toBe("hello-world");
  });
});

describe("parseFrontmatter", () => {
  // 正確解析標準 frontmatter 並回傳 data 與 content
  it("parses standard frontmatter and returns data and content", () => {
    const input = "---\ntitle: Hello\nauthor: yd\n---\n\nContent here";
    const { data, content } = parseFrontmatter(input);
    expect(data.title).toBe("Hello");
    expect(data.author).toBe("yd");
    expect(content).toContain("Content here");
  });

  // 輸入不含 frontmatter 時回傳空 data 和原始內容
  it("returns empty data and original input when no frontmatter", () => {
    const input = "Just plain content without frontmatter.";
    const { data, content } = parseFrontmatter(input);
    expect(data).toEqual({});
    expect(content).toBe(input);
  });

  // 缺少結尾 --- 時回傳空 data 和原始內容
  it("returns empty data when closing delimiter is missing", () => {
    const input = "---\ntitle: Hello\n";
    const { data, content } = parseFrontmatter(input);
    expect(data).toEqual({});
    expect(content).toBe(input);
  });

  // 正確處理 Windows 換行符號 (CRLF)
  it("handles Windows line endings (CRLF)", () => {
    const input = "---\r\ntitle: Hello\r\n---\r\n\r\nContent here";
    const { data, content } = parseFrontmatter(input);
    expect(data.title).toBe("Hello");
    expect(content).toContain("Content here");
  });

  // 關閉分隔符後緊接 CRLF 時，正確去除開頭的 \r\n
  it("strips leading CRLF after closing delimiter", () => {
    const input = "---\r\ntitle: Hello\r\n---\r\nContent here";
    const { data, content } = parseFrontmatter(input);
    expect(data.title).toBe("Hello");
    expect(content).toBe("Content here");
  });

  // 關閉分隔符後無換行符時，內容保持原樣不做裁切
  it("preserves content when no newline follows closing delimiter", () => {
    const input = "---\ntitle: Hello\n---Content here";
    const { data, content } = parseFrontmatter(input);
    expect(data.title).toBe("Hello");
    expect(content).toBe("Content here");
  });

  // 回傳內容不包含 frontmatter 區塊
  it("strips frontmatter block from content", () => {
    const input = "---\ntitle: Hello\n---\n\nContent here";
    const { content } = parseFrontmatter(input);
    expect(content).not.toContain("---");
    expect(content).not.toContain("title:");
  });

  // @std/yaml 自動將裸 ISO 日期字串轉為 Date 物件
  it("auto-converts bare ISO date strings to Date objects", () => {
    const input = "---\ndate: 2024-01-01\n---\n\nContent";
    const { data } = parseFrontmatter(input);
    expect(data.date).toBeInstanceOf(Date);
    expect(data.date).toEqual(new Date("2024-01-01"));
  });

  // 正確解析含陣列的 YAML 欄位
  it("parses YAML array fields correctly", () => {
    const input = "---\ntitle: Hello\ntags:\n  - foo\n  - bar\n---\n\nContent";
    const { data } = parseFrontmatter(input);
    expect(data.tags).toEqual(["foo", "bar"]);
  });

  // 當 YAML 根節點為陣列時回傳空 data
  it("returns empty data when YAML root is an array", () => {
    const input = "---\n- item1\n- item2\n---\n\nContent";
    const { data } = parseFrontmatter(input);
    expect(data).toEqual({});
  });

  // 空 frontmatter 區塊回傳空 data
  it("returns empty data for empty frontmatter block", () => {
    const input = "---\n---\n\nContent";
    const { data, content } = parseFrontmatter(input);
    expect(data).toEqual({});
    expect(content).toContain("Content");
  });
});

describe("getAllPosts", () => {
  // 回傳預設目錄中的所有文章
  it("returns all posts from default directory", () => {
    const posts = getAllPosts();
    expect(posts).toHaveLength(2);
  });

  // 回傳的文章物件結構正確
  it("returns posts with correct structure", () => {
    const posts = getAllPosts();
    for (const post of posts) {
      expect(post).toHaveProperty("slug");
      expect(post).toHaveProperty("metadata");
      expect(post).toHaveProperty("content");
    }
  });

  // 所有文章的 slug 都不包含 .md 副檔名
  it("returns posts with slugs without .md extension", () => {
    const posts = getAllPosts();
    for (const post of posts) {
      expect(post.slug).not.toMatch(/\.md$/);
    }
  });

  // 可從自訂目錄取得文章列表
  it("returns posts from custom directory", () => {
    const posts = getAllPosts("custom-posts/");
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("custom");
    expect(posts[0].metadata.title).toBe("Custom Post");
  });

  // 所有回傳的文章內容都不是空字串
  it("all returned posts have non-empty content", () => {
    const posts = getAllPosts();
    for (const post of posts) {
      expect(post.content.trim().length).toBeGreaterThan(0);
    }
  });
});
