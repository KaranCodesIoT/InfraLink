import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import {
  Users, ShieldCheck, Zap, ArrowRight, Star, CheckCircle2,
  Building2, Briefcase, CreditCard, BarChart3, Globe2, Sparkles,
  ChevronRight, Play, Layers, Eye
} from 'lucide-react';
import heroBg from '../../../assets/hero-bg.png';
import dashboardMockup from '../../../assets/dashboard-mockup.png';

/* ─── Scroll-reveal hook ──────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Data ────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Users,
    title: 'Verified Professionals',
    desc: 'Every contractor, builder and worker is background-checked with verified portfolios, reviews and skill certifications.',
    color: 'orange',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Contracts',
    desc: 'Milestone-based escrow payments with built-in dispute resolution so your money is always protected.',
    color: 'blue',
  },
  {
    icon: Zap,
    title: 'Seamless Management',
    desc: 'Track progress, manage equipment rentals, schedule workers and communicate in real-time from one dashboard.',
    color: 'emerald',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Insights',
    desc: 'Get real-time market pricing, demand forecasting and intelligent matching powered by our construction AI.',
    color: 'violet',
  },
  {
    icon: Globe2,
    title: 'AR Project Viewer',
    desc: 'Visualize projects in augmented reality before a single brick is laid. Walk through 3D models on-site.',
    color: 'rose',
  },
  {
    icon: CreditCard,
    title: 'Instant Payments',
    desc: 'UPI, bank transfers and digital wallets — pay workers and suppliers instantly with full audit trails.',
    color: 'amber',
  },
];

const STATS = [
  { value: '10,000+', label: 'Verified Professionals' },
  { value: '₹250Cr+', label: 'Projects Managed' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '45+', label: 'Cities Covered' },
];

const ICON_COLOR = {
  orange: 'bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white',
  blue: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white',
  emerald: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white',
  violet: 'bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white',
  rose: 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white',
  amber: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white',
};

/* ═══════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [heroRef, heroVis] = useReveal(0.05);
  const [trustRef, trustVis] = useReveal();
  const [featRef, featVis] = useReveal(0.08);
  const [dashRef, dashVis] = useReveal(0.1);
  const [statsRef, statsVis] = useReveal();
  const [ctaRef, ctaVis] = useReveal();

  return (
    <div className="home-page">
      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="hero-section relative overflow-hidden"
        id="hero"
      >
        {/* Background image + overlays */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/95 via-[#0F172A]/80 to-orange-900/60" />
          <div className="absolute inset-0 hero-grid-pattern opacity-[0.03]" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-float-slower" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className={`transition-all duration-1000 ${heroVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm text-orange-300 font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Now with AI-Powered Matching
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                The Ultimate{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                  Construction
                </span>{' '}
                Network
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 max-w-xl mb-10 leading-relaxed">
                Connect with top-tier contractors, builders, and skilled workers.
                Manage projects, payments, and equipment — all in one powerful platform.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={ROUTES.REGISTER}
                  className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={ROUTES.JOBS}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  Browse Jobs
                  <Briefcase className="w-5 h-5" />
                </Link>
              </div>

              {/* Social proof mini */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[...'ABCDE'].map((l, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-[#0F172A] flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: ['#FF5A1F','#3B82F6','#10B981','#8B5CF6','#F59E0B'][i] }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400" />)}
                  </div>
                  <span className="text-gray-400">Trusted by <strong className="text-white">10,000+</strong> professionals</span>
                </div>
              </div>
            </div>

            {/* Right — Dashboard preview */}
            <div className={`relative transition-all duration-1000 delay-300 ${heroVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 group">
                <img
                  src={dashboardMockup}
                  alt="InfraLink Dashboard Preview"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Live Dashboard Preview</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-300 text-xs font-semibold">Live</span>
                  </div>
                </div>
              </div>
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-transparent to-blue-500/20 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
      </section>

      {/* ═══ TRUST BAR ═════════════════════════════════════════════════ */}
      <section
        ref={trustRef}
        className={`py-12 bg-[#F8FAFC] transition-all duration-700 ${trustVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Trusted by leading construction firms across India
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['L&T Construction', 'Godrej Properties', 'Sobha Limited', 'Prestige Group'].map((name, i) => (
              <div key={i} className="flex items-center justify-center gap-3 opacity-40 hover:opacity-70 transition-opacity">
                <Building2 className="w-6 h-6 text-gray-500" />
                <span className="text-lg font-bold text-gray-500 tracking-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════════════ */}
      <section ref={featRef} className="py-24 bg-white relative overflow-hidden" id="features">
        {/* Decorative bg */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-50 rounded-full blur-[200px] opacity-50 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${featVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold mb-4">
              <Layers className="w-4 h-4" />
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Build Better</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              One platform to find talent, manage projects, process payments, and grow your construction business.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-default ${
                    featVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 100 + 200}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${ICON_COLOR[f.color]}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">{f.desc}</p>
                  <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </div>
                  {/* Hover gradient border effect */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-500/20 transition-colors duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ DASHBOARD SHOWCASE ════════════════════════════════════════ */}
      <section ref={dashRef} className="py-24 bg-[#0F172A] relative overflow-hidden" id="showcase">
        <div className="absolute inset-0 hero-grid-pattern opacity-[0.03]" />
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Feature list */}
            <div className={`transition-all duration-700 ${dashVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange-400 text-sm font-semibold mb-6 border border-white/10">
                <Eye className="w-4 h-4" />
                Product Preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                Your Entire Construction Business,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">One Dashboard</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                From project tracking to worker payments, AR site visualizations to AI-powered insights — manage everything from a single, beautiful interface.
              </p>

              <div className="space-y-5">
                {[
                  { text: 'Real-time project tracking with Gantt charts', icon: BarChart3 },
                  { text: 'Live worker map & attendance management', icon: Globe2 },
                  { text: 'AI Assistant for instant construction help', icon: Sparkles },
                  { text: '3D/AR visualization for builder projects', icon: Building2 },
                ].map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                        <ItemIcon className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="text-gray-300 font-medium">{item.text}</span>
                    </div>
                  );
                })}
              </div>

              <Link
                to={ROUTES.REGISTER}
                className="mt-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Try It Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right — Dashboard image */}
            <div className={`relative transition-all duration-1000 delay-200 ${dashVis ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                <img src={dashboardMockup} alt="InfraLink Dashboard" className="w-full h-auto" />
              </div>
              <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-3xl blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div
                key={i}
                className={`text-center transition-all duration-700 ${statsVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mb-2">
                  {s.value}
                </div>
                <div className="text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="py-24 bg-[#F8FAFC] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-blue-50 opacity-70" />
        <div className={`max-w-4xl mx-auto px-4 text-center relative z-10 transition-all duration-700 ${ctaVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Ready to Transform Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Construction Business?</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            Join thousands of contractors, builders, and suppliers already using InfraLink to grow their business and manage projects smarter.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={ROUTES.REGISTER}
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={ROUTES.JOBS}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-lg hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
            >
              Explore the Platform
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Setup in 2 minutes</span>
          </div>
        </div>
      </section>
    </div>
  );
}
