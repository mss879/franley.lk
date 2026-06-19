"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOG_POSTS } from "./data";
import Footer from "@/components/Footer";

export default function BlogClient() {
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(" ");

  // Initializing with space to ensure state transitions work smoothly, then resetting immediately
  useState(() => {
    setTimeout(() => setSearchQuery(""), 50);
  });

  const categories = ["All", "Style Guides", "Cufflinks", "Neckties", "Sartorial", "Lifestyle"];

  // Filter posts based on search query and category
  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCat === "All" || post.category === selectedCat;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured post: first post when category is All and no search, or first matching post
  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-[#fdfcf9] text-zinc-900 font-outfit flex flex-col justify-between">
      {/* Content wrapper */}
      <div className="pt-24 md:pt-32 pb-16 flex-grow">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          {/* Breadcrumbs */}
          <nav className="mb-8 text-[10px] font-black tracking-widest text-[#7b0323] uppercase text-left">
            <Link href="/" className="hover:text-[#d4af37] transition-colors duration-300">HOME</Link>
            <span className="mx-2.5 text-zinc-300">/</span>
            <span className="text-zinc-500">SARTORIAL JOURNAL</span>
          </nav>

          {/* Header Title Section */}
          <header className="mb-14 text-left border-b border-zinc-200/50 pb-8 relative">
            <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#7b0323] uppercase block mb-3 font-outfit">
              Sartorial Insights & Style Blueprints
            </span>
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-normal text-zinc-950 tracking-tight leading-[1.05] mb-6">
              The <span className="italic font-normal">Sartorial</span> <br />
              <span className="font-extrabold bg-gradient-to-r from-[#7b0323] via-[#d4af37] to-[#7b0323] bg-clip-text text-transparent">
                Journal
              </span>
            </h1>
            <p className="text-zinc-600 text-sm md:text-[15px] font-medium tracking-wide max-w-2xl leading-relaxed font-outfit">
              Detailed style blueprints, silk necktie knot instructions, and luxury cufflink rules curated specifically for the modern gentleman who values sartorial excellence.
            </p>
            <div className="absolute bottom-0 left-0 w-24 h-[3px] bg-[#d4af37]" />
          </header>

          {/* Search & Category Filter Section */}
          <section className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200/40 pb-6 relative z-20">
            {/* Category Selector Tabs */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 order-2 md:order-1 items-center">
              {categories.map((cat) => {
                const isActive = selectedCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className="relative py-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer bg-transparent border-0 text-left outline-none"
                  >
                    <span className={`transition-colors duration-300 ${isActive ? "text-[#7b0323]" : "text-zinc-500 hover:text-[#7b0323]"}`}>
                      {cat}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#d4af37] rounded-full shadow-[0_1px_4px_rgba(212,175,55,0.4)] animate-in fade-in duration-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input Box */}
            <div className="flex items-center bg-white border border-zinc-200/80 rounded-lg px-4 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.02)] focus-within:border-[#7b0323] focus-within:ring-1 focus-within:ring-[#7b0323]/10 w-full md:w-[280px] order-1 md:order-2 transition-all duration-300">
              <svg className="w-4 h-4 text-[#7b0323] shrink-0 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search blueprints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-400 hover:text-zinc-650 p-0.5 ml-1 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </section>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-[#faf9f6]/60 border border-zinc-200/60 rounded-3xl p-8 max-w-xl mx-auto shadow-inner">
              <div className="p-4 bg-[#7b0323]/5 rounded-full text-[#d4af37] mb-4 border border-[#7b0323]/20 shadow-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-zinc-800 mb-2 font-outfit uppercase tracking-wider">
                No Blueprints Found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-medium">
                We couldn't find any articles matching "{searchQuery}". Try searching for neckties, cufflinks, dress codes, or storage.
              </p>
            </div>
          )}

          {/* Featured Post Card */}
          {featuredPost && (
            <section className="mb-16 text-left">
              <Link 
                href={`/blog/${featuredPost.slug}`}
                className="group flex flex-col lg:grid lg:grid-cols-12 gap-8 bg-[#faf9f6] border border-zinc-200/60 p-6 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#7b0323]/5 hover:border-[#d4af37]/30"
              >
                {/* Blog Cover Image */}
                <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-zinc-200/50 relative aspect-video lg:aspect-auto lg:h-[380px] bg-zinc-100 shadow-inner">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute top-4 left-4 text-[9px] font-black tracking-[0.25em] text-white bg-[#7b0323] border border-[#d4af37]/30 px-4 py-2 rounded-full shadow-md z-10 font-outfit uppercase">
                    Featured Entry
                  </span>
                </div>
                {/* Text Details */}
                <div className="lg:col-span-5 flex flex-col justify-between py-2">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2.5 text-[10px] font-bold tracking-widest text-[#7b0323] uppercase font-outfit">
                      <span>{featuredPost.category}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                      <span className="text-zinc-400">{featuredPost.readTime}</span>
                    </div>
                    <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight leading-tight group-hover:text-[#7b0323] transition-colors duration-300">
                      {featuredPost.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium font-outfit">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-950 uppercase tracking-widest border-t border-zinc-200/50 pt-5 mt-6 group-hover:text-[#7b0323] transition-colors duration-300 font-outfit">
                    <span>Read Article</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Grid of Remaining Posts */}
          {gridPosts.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 text-left">
              {gridPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col justify-between bg-[#faf9f6] border border-zinc-200/60 p-5 rounded-2xl transition-all duration-500 hover:shadow-xl hover:border-[#d4af37]/35 relative overflow-hidden"
                >
                  {/* Fine gold gradient strip on top of the card */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7b0323]/50 via-[#d4af37] to-[#7b0323]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex flex-col gap-5">
                    {/* Cover Frame */}
                    <div className="h-44 rounded-xl overflow-hidden border border-zinc-200/40 relative bg-zinc-100 shadow-inner">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute bottom-3 left-3 text-[8px] font-bold tracking-[0.2em] text-[#7b0323] bg-white border border-[#7b0323]/10 px-2.5 py-1 rounded-full shadow-sm z-10 font-outfit uppercase">
                        {post.category}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase font-outfit">
                        {post.readTime}
                      </span>
                      <h3 className="font-playfair text-lg font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-[#7b0323] transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium font-outfit">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] font-black text-zinc-950 uppercase tracking-widest border-t border-zinc-200/50 pt-4 mt-6 group-hover:text-[#7b0323] transition-colors duration-300 font-outfit">
                    <span>Read Article</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </section>
          )}

          {/* Newsletter Concierge */}
          <section className="mb-8">
            <div className="bg-[#0c0c0c] border border-zinc-900 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              {/* Background elegant circles/mesh */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7b0323]/10 via-transparent to-[#d4af37]/10 opacity-60 pointer-events-none" />
              
              <div className="relative z-10 max-w-xl flex flex-col items-center gap-5">
                <span className="text-[9px] font-black tracking-[0.3em] text-[#d4af37] uppercase font-outfit">
                  EXCLUSIVES & BLUEPRINTS
                </span>
                <h2 className="font-playfair text-2xl md:text-4xl font-normal text-white tracking-tight leading-tight">
                  Subscribe to the <span className="italic">Sartorial</span> Letter
                </h2>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-outfit max-w-md">
                  Join our inner circle of gentlemen. Receive monthly style blueprints, private collection announcements, and sartorial guides directly to your inbox.
                </p>
                
                {/* Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Thank you for subscribing to the Sartorial Letter.");
                  }}
                  className="flex flex-col sm:flex-row gap-3 w-full mt-4"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-xs font-semibold text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] transition-colors duration-300"
                  />
                  <button
                    type="submit"
                    className="bg-[#7b0323] hover:bg-[#8e1534] text-white border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-xs font-black tracking-[0.2em] uppercase px-6 py-3 rounded-lg transition-all duration-300 cursor-pointer shadow-md shadow-[#7b0323]/15 whitespace-nowrap active:scale-[0.98]"
                  >
                    Subscribe
                  </button>
                </form>
                
                <span className="text-[9px] text-white/50 tracking-wider font-outfit">
                  Zero spam. Unsubscribe at any time.
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
