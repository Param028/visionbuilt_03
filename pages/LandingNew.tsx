import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Palette, Smartphone, Globe, Zap, Layers } from 'lucide-react';
import { BorderGlow, RotatingText, ShinyText } from '../components/ui/GlassComponents';
import { User } from '../types';

// ── COMPONENT ─────────────────────────────────────────────────
const LandingNew: React.FC<{ user: User | null }> = ({ user: _user }) => {
  return (
    <main className="relative min-h-screen">
      {/* Content Container - z-10 */}
      <div className="relative z-10">
        
        {/* ═══════════════════════════════════════════════
            HERO SECTION (100vh)
        ═══════════════════════════════════════════════ */}
        <section className="min-h-screen flex items-center px-6">
          <div className="max-w-6xl">
            {/* Massive Headline */}
            <h1 className="font-display tracking-tighter text-6xl md:text-8xl mb-8">
              <ShinyText 
                text="We build " 
                color="#b5b5b5"
                shineColor="#ffffff"
                speed={3}
                spread={120}
              />
              <RotatingText 
                texts={['Native Software', 'Premium UI/UX', 'Cinematic Trailers', 'Digital Reality']}
                mainClassName="px-3 md:px-4 bg-white/5 backdrop-blur-md text-white overflow-hidden py-1 md:py-2 justify-start rounded-lg border border-white/10"
                staggerFrom="last"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2500}
              />
            </h1>

            {/* Subheading */}
            <p className="text-[#CCCCCC] text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-light">
              Premium digital experiences for brands that demand excellence. 
              We craft cinematic websites, immersive applications, and stunning brand identities.
            </p>

            {/* CTAs */}
            <div className="flex flex-col w-full gap-3 md:flex-row md:gap-4 md:w-auto">
              <Link 
                to="/services"
                className="px-8 py-4 bg-white text-[#1C1C1C] rounded-full font-semibold hover:bg-white/90 transition-all duration-300"
              >
                Start a Project
              </Link>
              <Link 
                to="/marketplace"
                className="px-8 py-4 bg-white/5 backdrop-blur-md text-white rounded-full font-semibold border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                View Our Work
              </Link>
            </div>
          </div>

          {/* Floating Element - Bottom Right */}
          <div className="absolute bottom-12 right-12 font-mono text-xs text-[#CCCCCC] bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
            50+ PROJECTS DELIVERED
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            PROJECT SHOWCASE (Staggered Grid)
        ═══════════════════════════════════════════════ */}
        <section id="work" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <p className="font-mono text-xs text-[#CCCCCC] mb-4 tracking-widest uppercase">Selected Work</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                <ShinyText 
                  text="Featured Projects"
                  color="#b5b5b5"
                  shineColor="#ffffff"
                  speed={3}
                  spread={120}
                />
              </h2>
            </div>

            {/* Staggered 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-12">
              {/* Card 1 */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={20}
                className="overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full min-h-[400px] flex flex-col justify-end group cursor-pointer hover:bg-white/10 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-transparent opacity-60" />
                  <div className="relative z-10">
                    <p className="font-mono text-xs text-[#CCCCCC] mb-2">Web3 / DeFi</p>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">
                      <ShinyText 
                        text="Cyberware Dashboard"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm">Real-time trading interface with WebGL visualizations</p>
                  </div>
                </div>
              </BorderGlow>

              {/* Card 2 - Staggered */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={20}
                className="overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full min-h-[400px] flex flex-col justify-end group cursor-pointer hover:bg-white/10 transition-all duration-300 md:mt-16">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-transparent opacity-60" />
                  <div className="relative z-10">
                    <p className="font-mono text-xs text-[#CCCCCC] mb-2">SaaS / Enterprise</p>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">
                      <ShinyText 
                        text="Hadid Construct"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm">Architecture management platform</p>
                  </div>
                </div>
              </BorderGlow>

              {/* Card 3 - Staggered */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={20}
                className="overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full min-h-[400px] flex flex-col justify-end group cursor-pointer hover:bg-white/10 transition-all duration-300 md:mt-16">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-transparent opacity-60" />
                  <div className="relative z-10">
                    <p className="font-mono text-xs text-[#CCCCCC] mb-2">Creative / Portfolio</p>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">
                      <ShinyText 
                        text="Aether Nexus"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm">Immersive 3D portfolio experience</p>
                  </div>
                </div>
              </BorderGlow>

              {/* Card 4 */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={20}
                className="overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full min-h-[400px] flex flex-col justify-end group cursor-pointer hover:bg-white/10 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-transparent opacity-60" />
                  <div className="relative z-10">
                    <p className="font-mono text-xs text-[#CCCCCC] mb-2">Motion Graphics / WebGL</p>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">
                      <ShinyText 
                        text="Driftwood Rebranding"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm">Complete brand overhaul with cinematic motion graphics</p>
                  </div>
                </div>
              </BorderGlow>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SERVICES (Bento Box Layout)
        ═══════════════════════════════════════════════ */}
        <section id="services" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <p className="font-mono text-xs text-[#CCCCCC] mb-4 tracking-widest uppercase">What We Do</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                <ShinyText 
                  text="Our Services"
                  color="#b5b5b5"
                  shineColor="#ffffff"
                  speed={3}
                  spread={120}
                />
              </h2>
            </div>

            {/* Bento Box Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-6">
              {/* Service 1 - Web Dev (spans 2 columns) */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={40}
                className="md:col-span-2"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                      <Code size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      <ShinyText 
                        text="Web Development"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm leading-relaxed">
                      Custom websites and web applications built with modern technologies. 
                      From landing pages to complex platforms.
                    </p>
                  </div>
                </div>
              </BorderGlow>

              {/* Service 2 - UI/UX Design */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={40}
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                      <Palette size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      <ShinyText 
                        text="UI/UX Design"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm leading-relaxed">
                      User-centered design that balances aesthetics with functionality. 
                      Wireframes, prototypes, and final designs.
                    </p>
                  </div>
                </div>
              </BorderGlow>

              {/* Service 3 - Mobile Apps */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={40}
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                      <Smartphone size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      <ShinyText 
                        text="Mobile Apps"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm leading-relaxed">
                      Native and cross-platform mobile applications. 
                      iOS, Android, and React Native solutions.
                    </p>
                  </div>
                </div>
              </BorderGlow>

              {/* Service 4 - Brand Identity */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={40}
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                      <Globe size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      <ShinyText 
                        text="Brand Identity"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm leading-relaxed">
                      Complete brand systems including logos, typography, 
                      color palettes, and brand guidelines.
                    </p>
                  </div>
                </div>
              </BorderGlow>

              {/* Service 5 - Motion Graphics */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={40}
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                      <Zap size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      <ShinyText 
                        text="Motion Graphics"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm leading-relaxed">
                      Cinematic animations, video editing, and motion design. 
                      From social media to full-scale productions.
                    </p>
                  </div>
                </div>
              </BorderGlow>

              {/* Service 6 - 3D & WebGL (spans 2 rows) */}
              <BorderGlow 
                glowColor="0 0 100"
                colors={['#FFFFFF', '#CCCCCC', '#8A8A8A']}
                backgroundColor="transparent"
                edgeSensitivity={30}
                glowRadius={40}
                className="md:row-span-2"
              >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                      <Layers size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      <ShinyText 
                        text="3D & WebGL"
                        color="#b5b5b5"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                      />
                    </h3>
                    <p className="text-[#CCCCCC] text-sm leading-relaxed">
                      Interactive 3D experiences and WebGL visualizations. 
                      Three.js, OGL, and custom shader development.
                    </p>
                  </div>
                </div>
              </BorderGlow>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════ */}
        <footer className="mt-32 p-16 md:p-32">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-20 text-center">
              {/* Giant CTA */}
              <h2 className="font-display text-5xl md:text-9xl font-bold text-white mb-12">
                <ShinyText 
                  text="Ready to Begin?"
                  color="#b5b5b5"
                  shineColor="#ffffff"
                  speed={3}
                  spread={120}
                />
              </h2>

              {/* Contact Email */}
              <a 
                href="mailto:vbuilt20@gmail.com"
                className="text-2xl md:text-4xl text-white font-display font-bold hover:text-[#CCCCCC] transition-colors duration-300 mb-16 block"
              >
                vbuilt20@gmail.com
              </a>

              {/* CTA Button */}
              <Link 
                to="/services"
                className="inline-block px-10 py-4 bg-white text-[#1C1C1C] rounded-full font-semibold text-lg hover:bg-white/90 transition-all duration-300"
              >
                Get in Touch
              </Link>

              {/* Bottom Meta */}
              <div className="mt-16 pt-8 border-t border-white/10">
                <p className="text-[#CCCCCC] text-sm font-mono">
                  © 2026 Vision Built
                </p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
};

export default LandingNew;
