import { Suspense } from "react";
import HomePageContent from "@/components/home/HomePageContent";
import FeaturedBlogSection, { FeaturedBlogFallback } from "@/components/home/FeaturedBlogSection";
import { publicPageCopy } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: publicPageCopy.home.metadataTitle,
  description: publicPageCopy.home.metadataDescription,
  path: "/",
  tags: publicPageCopy.home.keywords,
  titleSuffix: "",
  absoluteTitle: true,
});

export const revalidate = 300;

export default function Home() {
  const featuredBlog = (
    <Suspense fallback={<FeaturedBlogFallback />}>
      <FeaturedBlogSection />
    </Suspense>
  );

  return <HomePageContent featuredBlog={featuredBlog} />;
}
