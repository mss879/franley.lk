import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS, BlogPost } from "../data";
import ReadingProgressBar from "./ReadingProgressBar";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  return post || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | Franley",
    };
  }

  const titleText = `${post.title} | Setup Journal | Franley`;

  return {
    title: titleText,
    description: post.excerpt,
    alternates: {
      canonical: `https://www.franley.lk/blog/${post.slug}`,
    },
    openGraph: {
      title: titleText,
      description: post.excerpt,
      url: `https://www.franley.lk/blog/${post.slug}`,
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      authors: ["Franley Editorial Team"],
      images: [post.image],
    },
  };
}

// Custom Markdown-to-HTML parser helper for structural SEO tags
function parseMarkdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight mt-10 mb-5">$1</h1>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="font-playfair text-xl md:text-2xl font-bold text-[#7b0323] tracking-tight mt-8 mb-4">$1</h2>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="font-outfit text-xs font-black text-zinc-800 tracking-[0.2em] mt-6 mb-2 uppercase">$1</h3>');

  // Horizontal rules
  html = html.replace(/^---\s*$/gm, '<hr class="border-zinc-200/60 my-10" />');

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-zinc-950">$1</strong>');

  // Inline Code
  html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-100 text-[#7b0323] px-1.5 py-0.5 rounded text-[13px] font-semibold">$1</code>');

  // Splitting blocks
  const lines = html.split('\n');
  let inList = false;
  let inTable = false;
  let tableRows: string[] = [];
  
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();

    // Table rows parsing
    if (trimmed.startsWith('|')) {
      inTable = true;
      if (trimmed.includes('---')) {
        return ''; // Skip spacer row
      } else {
        const cols = trimmed.split('|').map(c => c.trim()).filter(c => c);
        const isHeader = tableRows.length === 0;
        const cellTag = isHeader ? 'th' : 'td';
        const rowClass = isHeader 
          ? 'bg-zinc-50 border-b-2 border-zinc-200 text-zinc-950 font-black text-xs uppercase' 
          : 'border-b border-zinc-100 text-zinc-600 text-xs';
        const cells = cols.map(col => `<${cellTag} class="px-4 py-3 text-left font-semibold">${col}</${cellTag}>`).join('');
        tableRows.push(`<tr class="${rowClass}">${cells}</tr>`);
        return '';
      }
    } else {
      let suffixHtml = '';
      if (inTable) {
        inTable = false;
        suffixHtml = `<div class="overflow-x-auto my-8 border border-zinc-200/50 rounded-2xl shadow-sm"><table class="w-full border-collapse bg-white">${tableRows.join('')}</table></div>`;
        tableRows = [];
      }

      // Bullet lists parsing
      if (trimmed.startsWith('- ')) {
        if (!inList) {
          inList = true;
          return suffixHtml + '<ul class="list-disc pl-5 my-5 flex flex-col gap-2.5 font-medium text-sm md:text-base text-zinc-650">' + `<li class="pl-1">${trimmed.slice(2)}</li>`;
        }
        return `<li class="pl-1">${trimmed.slice(2)}</li>`;
      } else {
        let prefixHtml = '';
        if (inList) {
          inList = false;
          prefixHtml = '</ul>';
        }
        if (!trimmed) return prefixHtml + suffixHtml;
        if (trimmed.startsWith('<h') || trimmed.startsWith('<hr') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
          return prefixHtml + suffixHtml + trimmed;
        }
        return prefixHtml + suffixHtml + `<p class="my-5 leading-relaxed font-medium text-sm md:text-base text-zinc-600">${trimmed}</p>`;
      }
    }
  });

  return parsedLines.join('\n');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Get related posts (exclude current, max 2 related)
  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  const parsedHtmlContent = parseMarkdownToHtml(post.content);

  return (
    <div className="min-h-screen bg-[#fdfcf9] text-zinc-900 font-outfit flex flex-col justify-between">
      {/* Scroll Progress Bar at the top */}
      <ReadingProgressBar />

      {/* Main Container */}
      <div className="pt-24 md:pt-32 flex-grow">
        <article className="max-w-3xl mx-auto px-6 md:px-8">
          
          {/* Breadcrumbs & Back Link */}
          <nav className="mb-6 flex justify-between items-center text-[10px] font-black tracking-widest text-[#7b0323] uppercase text-left">
            <div>
              <Link href="/" className="hover:text-[#d4af37] transition-colors duration-300">HOME</Link>
              <span className="mx-2.5 text-zinc-300">/</span>
              <Link href="/blog" className="hover:text-[#d4af37] transition-colors duration-300">BLOG</Link>
              <span className="mx-2.5 text-zinc-300">/</span>
              <span className="text-zinc-500 truncate max-w-[150px] inline-block align-bottom">{post.title.toUpperCase()}</span>
            </div>
            <Link 
              href="/blog" 
              className="text-[#7b0323] hover:text-[#d4af37] transition-colors duration-300 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              BACK TO JOURNAL
            </Link>
          </nav>

          {/* Article Header info */}
          <header className="mb-10 text-left">
            <div className="flex items-center gap-3 text-[9px] font-black tracking-widest text-[#7b0323] uppercase mb-4">
              <span>{post.category}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span className="text-zinc-400">{post.readTime}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span className="text-zinc-400">{post.date}</span>
            </div>
            
            <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl font-bold text-zinc-950 tracking-tight leading-[1.1] mb-6">
              {post.title}
            </h1>
            
            <p className="text-zinc-600 text-base md:text-lg leading-relaxed font-medium border-l-4 border-[#7b0323]/40 pl-4 py-1 italic bg-[#7b0323]/[0.02] rounded-r-xl">
              {post.excerpt}
            </p>
          </header>

          {/* Article Cover Art */}
          <div className="w-full h-[220px] md:h-[380px] rounded-3xl border border-zinc-200/40 relative mb-12 shadow-md overflow-hidden bg-zinc-50 group">
            <img 
              src={post.image} 
              alt={post.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-5 left-5 text-[10px] font-black tracking-[0.25em] text-[#7b0323] bg-white border border-[#7b0323]/20/30 px-4 py-2 rounded-full shadow-sm z-10 select-none">
              JOURNAL ENTRY #{post.slug.length}
            </span>
          </div>

          {/* Main Article Content */}
          <section 
            className="text-left font-outfit border-b border-zinc-200/60 pb-12"
            dangerouslySetInnerHTML={{ __html: parsedHtmlContent }}
          />

          {/* Related Articles recommendation */}
          {relatedPosts.length > 0 && (
            <section className="py-12 text-left">
              <h2 className="font-outfit text-sm md:text-base font-extrabold tracking-widest uppercase text-zinc-400 mb-8">
                Continue Reading
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((rPost) => (
                  <Link
                    key={rPost.slug}
                    href={`/blog/${rPost.slug}`}
                    className="group flex flex-col justify-between bg-[#faf9f6] border border-zinc-200/60 p-5 rounded-2xl transition-all duration-500 hover:shadow-xl hover:border-[#d4af37]/35 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-900/50 via-amber-600 to-rose-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex flex-col gap-2">
                      <span className="text-[8px] font-bold tracking-widest text-rose-900 uppercase">
                        {rPost.category}
                      </span>
                      <h3 className="font-playfair text-sm md:text-base font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-rose-900 transition-colors duration-300">
                        {rPost.title}
                      </h3>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {rPost.excerpt}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-950 uppercase tracking-widest pt-4 border-t border-zinc-200/40 mt-4 group-hover:text-[#7b0323] transition-colors duration-300">
                      <span>READ ARTICLE</span>
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </article>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
