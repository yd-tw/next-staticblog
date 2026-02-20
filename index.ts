import fs from "fs";
import path from "path";
import { parse } from "@std/yaml";

function parseFrontmatter(input: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const delimiter = "---";
  if (
    !input.startsWith(delimiter + "\n") &&
    !input.startsWith(delimiter + "\r\n")
  ) {
    return { data: {}, content: input };
  }

  const afterOpen = input.slice(delimiter.length);
  const closeIndex = afterOpen.indexOf("\n" + delimiter);
  if (closeIndex === -1) {
    return { data: {}, content: input };
  }

  const yamlStr = afterOpen.slice(0, closeIndex).trim();
  let content = afterOpen.slice(closeIndex + 1 + delimiter.length);
  if (content.startsWith("\r\n")) content = content.slice(2);
  else if (content.startsWith("\n")) content = content.slice(1);

  const parsed = parse(yamlStr);
  const data =
    typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};

  return { data, content };
}

export function getAllPostSlugs(directory: string = "posts/") {
  const postsDirectory = path.join(process.cwd(), directory);
  return fs.readdirSync(postsDirectory);
}

export function getAllPosts<
  T extends Record<string, unknown> = Record<string, unknown>,
>(directory: string = "posts/"): { slug: string; metadata: T; content: string }[] {
  const slugs = getAllPostSlugs(directory);
  return slugs.map((slug) => getPostBySlug<T>(slug, directory));
}

export function getAllPostParams(directory: string = "posts/") {
  const slugs = getAllPostSlugs(directory);
  return slugs.map((slug) => ({ slug: slug.replace(/\.md$/, "") }));
}

export function getPostBySlug<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  slug: string,
  directory: string = "posts/",
): { slug: string; metadata: T; content: string } {
  const realSlug = slug.replace(/\.md$/, "");
  const postsDirectory = path.join(process.cwd(), directory);
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = parseFrontmatter(fileContents);

  return { slug: realSlug, metadata: data as T, content };
}
