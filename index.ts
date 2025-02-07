import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DEFAULT_POSTS_PATH = "posts";

export function getAllPostSlugs(filePath: string = DEFAULT_POSTS_PATH) {
  return fs.readdirSync(path.join(process.cwd(), filePath));
}

export function getAllPosts(filePath: string = DEFAULT_POSTS_PATH) {
  const slugs = getAllPostSlugs(filePath);
  return slugs.map((slug) => getPostBySlug(filePath, slug));
}

export function getAllPostParams(filePath: string = DEFAULT_POSTS_PATH) {
  const slugs = getAllPostSlugs(filePath);
  return slugs.map((slug) => ({ slug: slug.replace(/\.md$/, "") }));
}

export function getPostBySlug(filePath: string = DEFAULT_POSTS_PATH, slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(process.cwd(), filePath, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { slug: realSlug, metadata: data, content };
}
