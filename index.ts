import fs from "fs";
import path from "path";
import matter from "gray-matter";

export function getAllPostSlugs(directory: string = "posts/") {
  const postsDirectory = path.join(process.cwd(), directory);
  return fs.readdirSync(postsDirectory);
}

export function getAllPosts(directory: string = "posts/") {
  const slugs = getAllPostSlugs(directory);
  return slugs.map((slug) => getPostBySlug(slug, directory));
}

export function getAllPostParams(directory: string = "posts/") {
  const slugs = getAllPostSlugs(directory);
  return slugs.map((slug) => ({ slug: slug.replace(/\.md$/, "") }));
}

export function getPostBySlug(slug: string, directory: string = "posts/") {
  const realSlug = slug.replace(/\.md$/, "");
  const postsDirectory = path.join(process.cwd(), directory);
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { slug: realSlug, metadata: data, content };
}
