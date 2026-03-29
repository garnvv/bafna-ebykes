import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, Gem, ShieldCheck, MapPin, Phone, Mail, Clock, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../../components/common/Logo';

const stats = [
  { value: '500+', label: 'Happy Customers' },
  { value: '15+', label: 'Bike Models' },
  { value: '5★', label: 'Customer Rating' },
  { value: '2019', label: 'Est. Since' },
];

const values = [
  { icon: Target, title: 'Our Mission', desc: 'To transition the world to sustainable energy through high-performance electric bikes accessible to everyone.' },
  { icon: Gem, title: 'Premium Quality', desc: 'Every bike is assembled with precision and rigorously tested for safety, durability and peak performance.' },
  { icon: Users, title: 'Community First', desc: 'Built by riders, for riders. We support our customers through every kilometer of their journey.' },
  { icon: ShieldCheck, title: 'Peace of Mind', desc: 'Comprehensive warranty and dedicated service centers right here in Shirpur for worry-free ownership.' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const About = () => {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#f5f5f7] via-white to-[#edfbf4] overflow-hidden pt-20">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center space-x-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8">
                <Zap className="w-3.5 h-3.5" />
                <span>Our Story</span>
              </span>
              <div className="mb-6">
                <Logo iconSize={56} className="scale-110 origin-left" />
              </div>
              <h1 className="text-6xl lg:text-7xl font-black mb-8 leading-[1.05] tracking-tight text-[#1d1d1f]">
                Driving the <br />
                <span className="text-primary">EV Revolution</span>
                <span className="text-[#1d1d1f]">.</span>
              </h1>
              <p className="text-xl text-gray-500 mb-6 leading-relaxed font-medium max-w-lg">
                Bafna E-BYKES started with a simple vision — to make sustainable urban mobility accessible, powerful, and undeniably elegant.
              </p>
              <p className="text-gray-400 leading-relaxed mb-10 max-w-lg">
                Our showroom isn't just a place to buy a bike. It's a hub for the future of transportation.
                We combine world-class engineering with a commitment to a greener planet.
              </p>
              <Link
                to="/bikes"
                className="inline-flex items-center space-x-2 bg-[#1d1d1f] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-primary/30 hover:scale-[1.02]"
              >
                <span>Explore Our Bikes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Image — no floating badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src="/about-showroom.png"
                  alt="BAFNA E-BYKES Showroom"
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '4/3' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────── */}
      <section className="bg-[#1d1d1f] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="text-center">
                <p className="text-4xl font-black text-primary mb-1">{stat.value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-20">
            <span className="text-xs font-black uppercase tracking-widest text-primary">What We Stand For</span>
            <h2 className="text-5xl font-black mt-4 mb-4 tracking-tight text-[#1d1d1f]">Our Core Values</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Everything we do is guided by a commitment to quality, community, and a sustainable future.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="group p-8 bg-[#f8f8fa] border border-transparent rounded-[32px] hover:border-primary/20 hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white group-hover:bg-primary/10 flex items-center justify-center mb-6 shadow-sm transition-colors duration-300">
                  <item.icon className="w-8 h-8 text-[#1d1d1f] group-hover:text-primary transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight text-[#1d1d1f]">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWROOM INFO ─────────────────────────────────────────── */}
      <section className="py-32 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div {...fadeUp(0)}>
              <span className="text-xs font-black uppercase tracking-widest text-primary">Find Us</span>
              <h2 className="text-5xl font-black mt-4 mb-6 tracking-tight text-[#1d1d1f]">Visit Our Showroom</h2>
              <p className="text-gray-500 leading-relaxed text-lg mb-8">
                Come experience our full range of electric bikes first-hand. Our experts are ready to guide you to your perfect ride.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: MapPin,
                    label: 'Address',
                    content: 'Plot No. 24, BAFNA E-BYKES, Sai Baba Colony, Behind Agrasen Bhavan, Karwand Naka, Shirpur, Dist. Dhule, Maharashtra – 425405',
                  },
                  {
                    icon: Phone,
                    label: 'Phone',
                    content: '+91 75585 33371  /  +91 77096 16271',
                    href: 'tel:+917558533371',
                  },
                  {
                    icon: Mail,
                    label: 'Email',
                    content: 'bafnaebykes@gmail.com',
                    href: 'mailto:bafnaebykes@gmail.com',
                  },
                  {
                    icon: Clock,
                    label: 'Opening Hours',
                    content: 'Monday – Saturday: 10:00 AM – 8:30 PM',
                  },
                ].map((info, i) => (
                  <div key={i} className="flex items-start space-x-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{info.label}</p>
                      {info.href ? (
                        <a href={info.href} className="font-bold text-[#1d1d1f] hover:text-primary transition-colors leading-relaxed">
                          {info.content}
                        </a>
                      ) : (
                        <p className="font-bold text-[#1d1d1f] leading-relaxed">{info.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Map */}
            <motion.div {...fadeUp(0.15)}>
              <div className="rounded-[32px] overflow-hidden border border-gray-100 shadow-2xl h-[520px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3714.341484252516!2d74.88636137595083!3d21.346805576856526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39be57a8a1435213%3A0xd68994324f2b1d03!2s9V4Q%2BF8%2C%20Shirpur%2C%20Maharashtra%20425405!5e0!3m2!1sen!2sin!4v1711555555555!5m2!1sen!2sin"
                  className="w-full h-full border-none"
                  allowFullScreen=""
                  loading="lazy"
                  title="BAFNA E-BYKES Showroom Location"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
