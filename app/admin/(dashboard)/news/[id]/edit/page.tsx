import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import NewsForm from "../../NewsForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();
  return <NewsForm post={post} />;
}
