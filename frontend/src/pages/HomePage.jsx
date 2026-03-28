import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck, Activity, Zap, ArrowRight,
  CheckCircle2, Send, Star, Compass
} from 'lucide-react';

const HomePage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const getStartedPath = () => {
    if (!isAuthenticated) return '/signup';
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'PROVIDER') return '/provider/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-surface-50 overflow-hidden font-sans selection:bg-primary-500/30 selection:text-primary-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-32 px-4 overflow-hidden">
        {/* Soft Animated Background Image & Gradients */}
        <div className="absolute inset-0 z-0 bg-surface-50">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80" 
            alt="Soft nature background" 
            className="w-full h-full object-cover opacity-70 filter blur-[8px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/50 to-blue-50/60 backdrop-blur-[4px]"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center space-x-2 bg-surface-900 text-white rounded-full px-4 py-1.5 mb-8 shadow-md"
            >
              <span className="text-xs font-bold tracking-widest uppercase">Local Services Platform</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-6xl md:text-7xl lg:text-[5.5rem] font-sans font-medium text-surface-900 leading-[1.05] mb-6 tracking-tight"
            >
              Find Trusted <br />
              Services Near You
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-xl md:text-2xl text-surface-700 mb-10 max-w-xl font-normal leading-relaxed"
            >
              Instantly match with verified professionals for any task. Experience seamless booking, live tracking, and premium service quality.
            </motion.p>
          </div>

          {/* Right Glass Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg mx-auto lg:ml-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-[2.5rem] blur opacity-40"></div>
            <div className="relative bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[2rem] p-10 shadow-glass-hover flex flex-col items-center text-center">
              
              <div className="w-20 h-20 bg-gradient-to-tr from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/60">
                <Compass size={36} className="text-primary-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-surface-900 mb-3 tracking-tight">Introducing ServeConnect</h3>
              <p className="text-surface-600 font-medium mb-10 leading-relaxed px-2">
                Get real-time answers and find reliable local services in under a second. Focus on what matters.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link to={getStartedPath()} className="w-full sm:w-auto px-8 py-3.5 bg-surface-900 text-white rounded-full font-bold hover:bg-surface-800 hover:shadow-lg transition-all duration-300 text-sm tracking-wide">
                  {isAuthenticated ? 'GO TO DASHBOARD' : 'GET STARTED'}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="services" className="py-28 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-surface-900 mb-6 tracking-tight"> Engineered for Excellence </h2>
            <p className="text-surface-600 text-xl max-w-2xl mx-auto font-medium">Built with cutting-edge technology to ensure speed, safety, and reliability down to the last second.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
            {[
              { icon: Zap, title: "Real-Time Matching", desc: "Our powerful algorithm connects you with the closest available experts precisely when you need them.", color: "bg-blue-50 text-blue-600 border-blue-100" },
              { icon: ShieldCheck, title: "Verified Providers", desc: "Every professional undergoes rigorous background checks, ensuring uncompromising safety and quality.", color: "bg-green-50 text-green-600 border-green-100" },
              { icon: Activity, title: "Live Tracking", desc: "Monitor exactly when your provider will arrive with our beautiful real-time mapping technology.", color: "bg-primary-50 text-primary-600 border-primary-100" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative p-10 rounded-3xl bg-surface-50 border border-surface-200 hover:bg-white hover:border-surface-300 hover:shadow-xl hover:shadow-surface-200/50 hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center border ${feature.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-surface-900 mb-4">{feature.title}</h3>
                <p className="text-surface-600 leading-relaxed font-medium">{feature.desc}</p>
                
                {/* Subtle Hover Gradient Base */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS TIMELINE */}
      <section id="how-it-works" className="py-32 relative bg-surface-50 border-t border-surface-200 overflow-hidden">
        {/* Background Blur Elements */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-200/50 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-surface-900 mb-6 tracking-tight">How It Works</h2>
              <p className="text-xl text-surface-600 mb-14 font-medium">Booking a verified service provider operates flawlessly through three simple steps.</p>
              
              <div className="space-y-16 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-primary-300 before:via-secondary-200 before:to-transparent before:rounded-full">
                {[
                  { step: "1", title: "Post a Request", desc: "Describe what you need and set your location. Our platform immediately processes your parameters." },
                  { step: "2", title: "Get Matched", desc: "Local premium providers receive your request and accept it in milliseconds. We handle the heavy lifting." },
                  { step: "3", title: "Track & Chat", desc: "Interact via real-time WebSockets and track their physical arrival. Pure transparency." },
                ].map((item, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border-[3px] border-primary-500 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 group-hover:border-secondary-500 duration-300">
                      <span className="text-surface-900 font-extrabold text-lg">{item.step}</span>
                    </div>
                    <div className="w-[calc(100%-5rem)] md:w-[calc(50%-4rem)] p-8 bg-white border border-surface-200 shadow-sm rounded-3xl group-hover:shadow-xl group-hover:border-primary-100 transition-all duration-300 group-hover:-translate-y-1">
                      <h3 className="text-2xl font-bold text-surface-900 mb-3">{item.title}</h3>
                      <p className="text-surface-600 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Interactive Visual Representation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-50 blur-3xl rounded-full" />
              <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-surface-200 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                
                <div className="space-y-6 relative z-10">
                  {/* Fake UI Card 1 */}
                  <div className="flex items-center gap-5 p-5 bg-white border border-surface-100 shadow-sm rounded-2xl animate-float">
                     <span className="w-14 h-14 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center"><Send size={24}/></span>
                     <div>
                       <div className="h-5 w-40 bg-surface-200 rounded-md mb-3" />
                       <div className="h-4 w-56 bg-surface-100 rounded-md" />
                     </div>
                  </div>
                  {/* Fake UI Card 2 */}
                  <div className="flex items-center gap-5 p-5 bg-white border border-surface-100 shadow-sm rounded-2xl animate-float-delayed">
                     <span className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><CheckCircle2 size={24}/></span>
                     <div>
                       <div className="h-5 w-48 bg-surface-200 rounded-md mb-3" />
                       <div className="h-4 w-32 bg-surface-100 rounded-md" />
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="py-32 bg-white border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-surface-900 mb-20 tracking-tight">Beloved by Thousands</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah L.", role: "Homeowner", text: "ServeConnect entirely changed how I find help. The live tracking is an absolute game-changer. Clean, fast, and remarkably reliable.", avatar: "SL" },
              { name: "Mike T.", role: "Electrician", text: "As a provider, the platform is flawless. Instant requests and seamless WebSockets chat make my job so much easier.", avatar: "MT" },
              { name: "Emily R.", role: "Business Owner", text: "Premium quality from start to finish. Highly recommend for any quick fixes you need for an office. Extremely professional.", avatar: "ER" },
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="p-10 rounded-3xl bg-surface-50 border border-surface-200 text-left hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex text-amber-400 mb-6 gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={20} fill="currentColor" />
                  ))}
                </div>
                <p className="text-surface-700 mb-8 font-medium leading-relaxed text-lg">"{t.text}"</p>
                <div className="flex items-center gap-4 border-t border-surface-200 pt-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <span className="block font-bold text-surface-900">{t.name}</span>
                    <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-surface-50 pt-24 pb-12 border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-extrabold text-surface-900 tracking-tight">ServeConnect</span>
              </div>
              <p className="text-surface-600 max-w-sm text-base font-medium leading-relaxed">The world's most premium and reliable marketplace for local services. Engineered for speed and pristine user experience.</p>
            </div>
            <div>
              <h4 className="text-surface-900 font-bold mb-6 tracking-wide">Platform</h4>
              <ul className="space-y-4 font-medium text-surface-600">
                <li><a href="#how-it-works" className="hover:text-primary-600 transition-colors">How it works</a></li>
                <li><a href="#services" className="hover:text-primary-600 transition-colors">Pricing</a></li>
                <li><Link to="/signup" className="hover:text-primary-600 transition-colors">For Providers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-surface-900 font-bold mb-6 tracking-wide">Support</h4>
              <ul className="space-y-4 font-medium text-surface-600">
                <li><a href="#contact" className="hover:text-primary-600 transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-surface-500 font-medium text-sm">© {new Date().getFullYear()} ServeConnect Inc. All rights reserved.</p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-white border border-surface-200 hover:border-primary-300 hover:shadow-sm transition cursor-pointer" />
              <div className="w-10 h-10 rounded-full bg-white border border-surface-200 hover:border-primary-300 hover:shadow-sm transition cursor-pointer" />
              <div className="w-10 h-10 rounded-full bg-white border border-surface-200 hover:border-primary-300 hover:shadow-sm transition cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
