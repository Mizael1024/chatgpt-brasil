import { BlogHeader } from '@/components/blog/header';
import { BlogFooter } from '@/components/blog/footer';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`antialiased min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 ${inter.className}`}>
      <BlogHeader />
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-10 flex-grow">
        <main className="py-12">
          {children}
        </main>
      </div>
      <BlogFooter />
    </div>
  );
}
