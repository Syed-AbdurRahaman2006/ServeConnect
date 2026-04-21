import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Zap, ArrowRight, ArrowUpRight,
  CheckCircle2, Send, Star, Compass,
  Wrench, Paintbrush, Sparkles, Home as HomeIcon,
  Truck, Dog, ChefHat, Search, MapPin,
  Users, Clock, Award, MessageCircle,
  Shield, Eye, Headphones, Globe, Heart
} from 'lucide-react';

/* ─── Animated Number Counter ─── */
const AnimatedCounter = ({ target, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Data ─── */
const serviceCategories = [
  { icon: Wrench, label: 'Plumbing', color: 'from-blue-500 to-cyan-400' },
  { icon: Zap, label: 'Electrical', color: 'from-amber-500 to-orange-400' },
  { icon: Paintbrush, label: 'Painting', color: 'from-pink-500 to-rose-400' },
  { icon: Sparkles, label: 'Cleaning', color: 'from-emerald-500 to-teal-400' },
  { icon: HomeIcon, label: 'Home Repair', color: 'from-violet-500 to-purple-400' },
  { icon: Truck, label: 'Moving', color: 'from-sky-500 to-blue-400' },
  { icon: ChefHat, label: 'Cooking', color: 'from-red-500 to-pink-400' },
  { icon: Dog, label: 'Pet Care', color: 'from-lime-500 to-green-400' },
];

const liveActivities = [
  { name: 'Rahul S.', action: 'booked a Plumber', time: '2 min ago', icon: Wrench },
  { name: 'Priya K.', action: 'rated ★★★★★', time: '5 min ago', icon: Star },
  { name: 'Amit T.', action: 'just signed up', time: '8 min ago', icon: Users },
];

const testimonials = [
  {
    name: 'Ananya Sharma',
    role: 'Homeowner, Mumbai',
    text: 'I had a plumbing emergency at 11 PM and ServeConnect had someone at my door within 30 minutes. The real-time chat kept me updated the entire time. This is how services should work.',
    rating: 5,
    featured: true,
  },
  {
    name: 'Vikram Patel',
    role: 'Electrician, Pune',
    text: 'As a provider, I\'ve doubled my monthly clients since joining. The interface is clean and the booking system just works — no drama.',
    rating: 5,
  },
  {
    name: 'Meera Iyer',
    role: 'Restaurant Owner, Bangalore',
    text: 'We use ServeConnect for all our maintenance needs. The verified professionals give us peace of mind, and the pricing is always transparent.',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Interior Designer, Delhi',
    text: 'The location-based matching is brilliant. I only see providers who actually service my area. No more wasted time.',
    rating: 4,
  },
];

/* ─── Component ─── */
const HomePage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [activeActivity, setActiveActivity] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActivity((prev) => (prev + 1) % liveActivities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStartedPath = () => {
    if (!isAuthenticated) return '/signup';
    if (user?.role === 'PROVIDER') return '/provider/dashboard';
    return '/dashboard';
  };

  const sectionFade = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  };

  return (
    <div className="min-h-screen bg-surface-50 overflow-hidden font-sans selection:bg-primary-500/30 selection:text-primary-900">

      {/* ═══════════════════════════════════════════
          §1  HERO
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-[95vh] flex flex-col justify-center pt-24 pb-16 px-4 overflow-hidden">
        {/* Ambient Orbs */}
        <div className="absolute inset-0 z-0 bg-surface-50 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-primary-200/60 to-secondary-200/40 rounded-full blur-[120px] animate-hero-orb-1" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-secondary-200/50 to-accent-200/30 rounded-full blur-[100px] animate-hero-orb-2" />
          <div className="absolute top-[30%] left-[40%] w-[350px] h-[350px] bg-gradient-to-br from-pink-200/30 to-purple-200/20 rounded-full blur-[80px] animate-hero-orb-3" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2.5 bg-white border border-surface-200 text-surface-700 rounded-full px-5 py-2 mb-8 shadow-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500" />
              </span>
              <span className="text-xs font-bold tracking-widest uppercase">Trusted by 10,000+ users across India</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold text-surface-900 leading-[1.05] mb-6 tracking-tight"
            >
              Your Neighbourhood,{' '}
              <span className="bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
                Your Experts
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg md:text-xl text-surface-600 mb-10 max-w-2xl font-medium leading-relaxed"
            >
              Instantly connect with verified local professionals — from plumbers to pet care. Book in seconds, track live, and pay securely.
            </motion.p>

            {/* Search CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="w-full max-w-2xl mb-10"
            >
              <div
                onClick={() => navigate(getStartedPath())}
                className="flex items-center bg-white rounded-2xl border border-surface-200 shadow-lg shadow-surface-200/60 hover:shadow-xl hover:shadow-primary-200/40 hover:border-primary-200 transition-all duration-500 cursor-pointer group p-2"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-r border-surface-200 text-surface-500 min-w-[140px]">
                  <MapPin size={18} className="text-secondary-500 shrink-0" />
                  <span className="text-sm font-semibold">Your City</span>
                </div>
                <div className="flex flex-1 items-center gap-2 px-4 py-3 text-surface-400">
                  <Search size={18} className="shrink-0" />
                  <span className="text-sm font-medium">What service do you need?</span>
                </div>
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 group-hover:shadow-md group-hover:shadow-primary-500/30 text-sm shrink-0">
                  Search
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Category pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-12"
            >
              <span className="text-sm font-semibold text-surface-500 mr-1">Popular:</span>
              {serviceCategories.map((cat, i) => (
                <motion.button
                  key={cat.label}
                  onMouseEnter={() => setHoveredCategory(i)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => navigate(getStartedPath())}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative flex items-center gap-2 bg-white border border-surface-200 rounded-full px-4 py-2 text-sm font-semibold text-surface-700 hover:border-primary-300 hover:text-primary-700 hover:shadow-md hover:shadow-primary-100/50 transition-all duration-300"
                >
                  <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                    <cat.icon size={14} className="text-white" />
                  </span>
                  {cat.label}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Stats + Live Feed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4"
          >
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users, value: 10000, suffix: '+', label: 'Active Users', accent: 'text-primary-600 bg-primary-50' },
                { icon: Award, value: 5000, suffix: '+', label: 'Verified Pros', accent: 'text-accent-600 bg-accent-50' },
                { icon: CheckCircle2, value: 50000, suffix: '+', label: 'Jobs Done', accent: 'text-secondary-600 bg-secondary-50' },
                { icon: Clock, value: 4.9, suffix: '★', label: 'Avg Rating', accent: 'text-amber-600 bg-amber-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm border border-surface-200/80 rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className={`w-10 h-10 ${stat.accent} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon size={20} />
                  </div>
                  <div className="text-2xl font-extrabold text-surface-900 tracking-tight">
                    {stat.label === 'Avg Rating' ? stat.value + stat.suffix : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                  </div>
                  <div className="text-xs font-semibold text-surface-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-surface-200/80 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-bold text-surface-500 uppercase tracking-widest">Live Activity</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeActivity}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center shrink-0 border border-primary-200/50">
                    {(() => { const Icon = liveActivities[activeActivity].icon; return <Icon size={20} className="text-primary-600" />; })()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">
                      {liveActivities[activeActivity].name}{' '}
                      <span className="font-medium text-surface-600">{liveActivities[activeActivity].action}</span>
                    </p>
                    <p className="text-xs text-surface-400 font-medium mt-0.5">{liveActivities[activeActivity].time}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          §2  WHY SERVECONNECT — Bento Grid
      ═══════════════════════════════════════════ */}
      <section id="services" className="py-24 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...sectionFade} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <p className="text-primary-600 font-bold text-sm tracking-widest uppercase mb-3">Why ServeConnect</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-surface-900 tracking-tight leading-tight">
                Built different.<br className="hidden sm:block" /> Not just another marketplace.
              </h2>
            </div>
            <p className="text-surface-600 font-medium text-lg max-w-md leading-relaxed lg:text-right">
              Every detail—from matching algorithms to chat—is designed to make hiring local pros feel effortless.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 — Tall */}
            <motion.div
              {...sectionFade}
              transition={{ ...sectionFade.transition, delay: 0 }}
              className="md:row-span-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 lg:p-10 text-white flex flex-col justify-between min-h-[380px] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/10">
                  <Zap size={28} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-snug">Real-Time<br />Matching Engine</h3>
                <p className="text-white/80 font-medium leading-relaxed text-base">
                  Our proprietary algorithm analyses location, ratings, availability, and expertise to find your perfect match — typically in under 8 seconds.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-8 text-white/70 group-hover:text-white transition-colors text-sm font-bold">
                <span>Learn more</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              {...sectionFade}
              transition={{ ...sectionFade.transition, delay: 0.1 }}
              className="bg-surface-50 rounded-3xl p-8 border border-surface-200 group hover:border-surface-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-green-100 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-5 text-green-600 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Verified & Background-Checked</h3>
              <p className="text-surface-600 font-medium leading-relaxed">
                Every provider passes ID verification, skill assessment, and police clearance before they can accept a single job.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              {...sectionFade}
              transition={{ ...sectionFade.transition, delay: 0.15 }}
              className="bg-surface-50 rounded-3xl p-8 border border-surface-200 group hover:border-surface-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-100 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Compass size={24} />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Hyperlocal Discovery</h3>
              <p className="text-surface-600 font-medium leading-relaxed">
                GPS-powered search shows only providers who actively service your pin code. No more "we don't cover your area" disappointments.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              {...sectionFade}
              transition={{ ...sectionFade.transition, delay: 0.2 }}
              className="bg-surface-50 rounded-3xl p-8 border border-surface-200 group hover:border-surface-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-violet-100 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-5 text-violet-600 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Live Chat & Updates</h3>
              <p className="text-surface-600 font-medium leading-relaxed">
                WebSocket-powered real-time messaging keeps you connected from booking to completion. No phone tag needed.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              {...sectionFade}
              transition={{ ...sectionFade.transition, delay: 0.25 }}
              className="bg-surface-50 rounded-3xl p-8 border border-surface-200 group hover:border-surface-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-100 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5 text-amber-600 group-hover:scale-110 transition-transform duration-300">
                <Eye size={24} />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Transparent Pricing</h3>
              <p className="text-surface-600 font-medium leading-relaxed">
                See exact quotes before you book. No surprise charges, no hidden fees, no awkward negotiations at the door.
              </p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          §3  HOW IT WORKS — Three big numbered steps
      ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-surface-50 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-l from-primary-100/40 to-transparent rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...sectionFade} className="text-center mb-20">
            <p className="text-primary-600 font-bold text-sm tracking-widest uppercase mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-surface-900 tracking-tight mb-6">
              Three steps. That's it.
            </h2>
            <p className="text-surface-600 text-lg max-w-xl mx-auto font-medium">
              No lengthy forms, no waiting on hold. From need to done in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-[2px]">
              <div className="w-full h-full bg-gradient-to-r from-primary-300 via-secondary-300 to-accent-300 rounded-full" />
            </div>

            {[
              {
                num: '01',
                title: 'Describe your need',
                desc: 'Tell us what you need done and where. Add photos or voice notes for extra clarity.',
                icon: Send,
                accent: 'from-primary-500 to-primary-600',
              },
              {
                num: '02',
                title: 'Get matched instantly',
                desc: 'Our system finds the best-rated, closest available provider and connects you in seconds.',
                icon: Zap,
                accent: 'from-secondary-500 to-secondary-600',
              },
              {
                num: '03',
                title: 'Track, chat & done',
                desc: 'Chat live, track arrival, get the job done, and pay securely — all inside the app.',
                icon: CheckCircle2,
                accent: 'from-accent-500 to-accent-600',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col items-center text-center px-6 py-8 relative group"
              >
                {/* Number circle */}
                <div className={`w-[72px] h-[72px] rounded-full bg-gradient-to-br ${step.accent} flex items-center justify-center mb-8 shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon size={28} className="text-white" />
                </div>
                {/* Step number */}
                <span className="text-[80px] font-black text-surface-100 absolute top-0 right-8 leading-none select-none pointer-events-none">{step.num}</span>
                <h3 className="text-xl font-bold text-surface-900 mb-3 relative z-10">{step.title}</h3>
                <p className="text-surface-600 font-medium leading-relaxed max-w-xs relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          §4  TESTIMONIALS — Editorial Layout
      ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-primary-50 to-transparent rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...sectionFade} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <p className="text-primary-600 font-bold text-sm tracking-widest uppercase mb-3">Real Stories</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-surface-900 tracking-tight leading-tight">
                People love what we've built.
              </h2>
            </div>
            <p className="text-surface-600 font-medium text-lg max-w-sm leading-relaxed lg:text-right">
              Don't take our word for it. Here's what users and providers actually say.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Featured testimonial — large */}
            <motion.div
              {...sectionFade}
              className="lg:col-span-3 bg-surface-900 rounded-3xl p-10 lg:p-12 text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-600/10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex text-amber-400 mb-6 gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="currentColor" />)}
                </div>
                <blockquote className="text-xl lg:text-2xl font-medium leading-relaxed mb-10 text-white/95">
                  "{testimonials[0].text}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm">
                    {testimonials[0].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="block font-bold text-white">{testimonials[0].name}</span>
                    <span className="text-sm text-white/60 font-medium">{testimonials[0].role}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Smaller testimonials */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {testimonials.slice(1).map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-surface-50 rounded-2xl p-7 border border-surface-200 hover:shadow-md hover:border-surface-300 transition-all duration-300 group"
                >
                  <div className="flex text-amber-400 mb-4 gap-0.5">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-surface-700 font-medium leading-relaxed mb-5 text-[15px]">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 border border-primary-200/50 flex items-center justify-center text-primary-700 font-bold text-xs">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="block font-bold text-surface-900 text-sm">{t.name}</span>
                      <span className="text-xs text-surface-500 font-medium">{t.role}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          §5  CTA — Clean Dark
      ═══════════════════════════════════════════ */}
      <section id="contact" className="relative overflow-hidden">
        {/* Dark section */}
        <div className="bg-surface-900 py-24 lg:py-28 relative">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-primary-600/15 to-transparent rounded-full blur-[80px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div {...sectionFade}>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Ready to find your<br />
                <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                  perfect service pro?
                </span>
              </h2>
              <p className="text-lg text-surface-400 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
                Join 10,000+ happy customers. Your first booking is free — zero commitment, zero risk.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={getStartedPath()}
                  className="px-8 py-4 bg-white text-surface-900 rounded-full font-bold hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-0.5 transition-all duration-300 text-base inline-flex items-center gap-2.5 group"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-full font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-base"
                >
                  Sign In →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          §6  FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="bg-surface-50 pt-20 pb-10 border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-5">
              <div className="flex items-center space-x-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-extrabold text-surface-900 tracking-tight">ServeConnect</span>
              </div>
              <p className="text-surface-600 text-sm font-medium leading-relaxed max-w-sm mb-6">
                India's most trusted marketplace for local services. Engineered for speed, built on trust.
              </p>
              {/* Social icons */}
              <div className="flex space-x-3">
                {['X', 'In', 'Ig'].map((label) => (
                  <a key={label} href="#" className="w-9 h-9 rounded-full bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all duration-300 text-xs font-bold">
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: 'Platform',
                links: [
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Browse Services', href: '#services' },
                  { label: 'Become a Provider', to: '/signup' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', href: '#' },
                  { label: 'Careers', href: '#' },
                  { label: 'Blog', href: '#' },
                ],
              },
              {
                title: 'Support',
                links: [
                  { label: 'Help Center', href: '#contact' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="col-span-1 md:col-span-2">
                <h4 className="text-surface-900 font-bold text-sm mb-5 tracking-wide">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to} className="text-sm text-surface-600 font-medium hover:text-primary-600 transition-colors">{link.label}</Link>
                      ) : (
                        <a href={link.href} className="text-sm text-surface-600 font-medium hover:text-primary-600 transition-colors">{link.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-surface-200 pt-7 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-surface-500 font-medium text-xs">© {new Date().getFullYear()} ServeConnect Inc. All rights reserved.</p>
            <p className="text-surface-400 text-xs font-medium flex items-center gap-1.5">
              Made with <Heart size={12} className="text-red-400" fill="currentColor" /> in India
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;