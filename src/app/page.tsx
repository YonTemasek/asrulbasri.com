import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Layers, Terminal, BookOpen, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';

// Static data for now - will be fetched from Supabase later
const SAMPLE_ARTICLES = [
  {
    id: 1,
    title: "How to Actually Finish What You Start",
    date: "Oct 12, 2024",
    category: "Operations",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=400&auto=format&fit=crop",
    excerpt: "Why setting big goals often fails without small steps. A simple guide to getting things done daily.",
  },
  {
    id: 2,
    title: "Why You Don't Need More Apps",
    date: "Sep 28, 2024",
    category: "Tech",
    image: "https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=400&auto=format&fit=crop",
    excerpt: "Stop looking for the perfect app. Focus on your workflow first, then pick the simplest tool.",
  },
  {
    id: 3,
    title: "Making Decisions When Stressed",
    date: "Aug 15, 2024",
    category: "Mindset",
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=400&auto=format&fit=crop",
    excerpt: "A simple way to stay calm and choose the right path when everything feels chaotic.",
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center pt-24">
        <div className="absolute inset-0 z-0 bg-slate-50">
          <img
            src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop"
            alt="Hero background"
            className="w-full h-full object-cover grayscale opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-mono font-medium text-slate-600 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SYSTEM BUILDER
            </div>
            <h1 className="text-5xl md:text-8xl font-bold text-slate-900 tracking-tight leading-[1] mb-8">
              Turning Decisions <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-200">
                Into Action.
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
              I work with people who have learned a lot — but are still stuck making decisions and closing work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/articles">
                <Button primary>
                  Read My Insights <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/work-with-me">
                <Button>Decision Review Session</Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 italic mt-4">
              For people ready to close decisions, not explore more ideas.
            </p>
          </div>
        </div>
      </section>

      {/* Animated Filtering Ticker */}
      <section className="py-8 bg-slate-900 overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-8 animate-scroll whitespace-nowrap">
            <span className="text-emerald-400 font-bold uppercase text-sm tracking-wider">This Is Not For Everyone</span>
            <span className="text-slate-400">→</span>
            <span className="text-white">You are looking for frameworks or templates</span>
            <span className="text-slate-400">→</span>
            <span className="text-white">You want someone to decide for you</span>
            <span className="text-slate-400">→</span>
            <span className="text-white">You are still collecting information instead of acting</span>
            <span className="text-slate-400">→</span>
            {/* Duplicate for seamless loop */}
            <span className="text-emerald-400 font-bold uppercase text-sm tracking-wider">This Is Not For Everyone</span>
            <span className="text-slate-400">→</span>
            <span className="text-white">You are looking for frameworks or templates</span>
            <span className="text-slate-400">→</span>
            <span className="text-white">You want someone to decide for you</span>
            <span className="text-slate-400">→</span>
            <span className="text-white">You are still collecting information instead of acting</span>
            <span className="text-slate-400">→</span>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionLabel text="My Approach" />
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                How I <br />Work.
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                I help you close decisions that keep work unfinished. Not by giving you more frameworks, but by removing what's blocking you from moving forward.
              </p>
              <div className="grid gap-4">
                {[
                  { title: "Decision Clarity", desc: "Identifying what truly needs to be decided" },
                  { title: "Closure", desc: "Removing options that delay action" },
                  { title: "Execution Focus", desc: "Finishing what has been left open" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[450px] hidden md:block">
              <div className="absolute top-0 right-0 w-4/5 h-4/5 bg-slate-900 z-0 rounded-2xl"></div>
              <img
                src="https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?q=80&w=2070&auto=format&fit=crop"
                alt="Systems"
                className="absolute bottom-0 left-0 w-4/5 h-4/5 object-cover grayscale z-10 border-8 border-white shadow-2xl rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-8 bg-slate-50">
        <div className="flex justify-between items-end mb-12">
          <div>
            <SectionLabel text="Notes & Insights" />
            <h2 className="text-3xl font-bold">Latest Articles</h2>
          </div>
          <Link
            href="/articles"
            className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-black pb-1 hover:text-emerald-600 hover:border-emerald-600 transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {SAMPLE_ARTICLES.map((post) => {
            // Generate slug from title
            const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <Link key={post.id} href={`/articles/${slug}`}>
                <Card className="group p-0 overflow-hidden border-0 shadow-sm">
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
                      <span className="text-emerald-600 font-bold uppercase">{post.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="text-sm font-bold flex items-center gap-2">
                      Read More <ArrowRight size={14} />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Resources Teaser */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
          alt="Tech"
          className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <SectionLabel text="My Resources" light />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Tools I Use — Not What I Sell</h2>
            <p className="text-slate-400 mb-2 leading-relaxed text-lg">
              I don't just talk about tools; I use them every day. Here are the simple templates and guides I use to keep my life and business organized.
            </p>
            <p className="text-slate-500 text-sm mb-8 italic">
              Tools support decisions. They are not the solution.
            </p>
            <Link href="/library">
              <Button className="bg-emerald-500 text-white border-none hover:bg-emerald-400">
                Access Library
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
              <Layers className="text-emerald-400 mb-4" size={32} />
              <div className="font-bold text-lg">Notion Templates</div>
              <div className="text-sm text-slate-400 mt-2">Get organized</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 translate-y-8 hover:bg-slate-800 transition-colors">
              <Terminal className="text-emerald-400 mb-4" size={32} />
              <div className="font-bold text-lg">Digital Tools</div>
              <div className="text-sm text-slate-400 mt-2">Automate boring tasks</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
              <BookOpen className="text-emerald-400 mb-4" size={32} />
              <div className="font-bold text-lg">Guides</div>
              <div className="text-sm text-slate-400 mt-2">Simple Playbooks</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 translate-y-8 hover:bg-slate-800 transition-colors">
              <Briefcase className="text-emerald-400 mb-4" size={32} />
              <div className="font-bold text-lg">Travel & Life</div>
              <div className="text-sm text-slate-400 mt-2">Planning Checklists</div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
