import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
  return (
    <footer className="bg-[#f5f5f7] border-t border-gray-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <Logo iconSize={42} className="opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-gray-500 mb-6 max-w-xs text-sm leading-relaxed">
              Revolutionizing urban mobility with cutting-edge electric performance and sustainable design. Join the EV revolution today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-[#1d1d1f]">Quick Links</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link></li>
              <li><Link to="/bikes" className="hover:text-primary transition-colors font-medium">Our Bikes</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors font-medium">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors font-medium">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-[#1d1d1f]">Customer Care</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link to="/dashboard" className="hover:text-primary transition-colors font-medium">My Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors font-medium">Book Test Ride</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors font-medium">Service Booking</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-[#1d1d1f]">Contact Info</h4>
            <ul className="space-y-5 text-gray-500 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">
                  Plot No. 24, BAFNA E-BYKES, Sai Baba Colony,<br />
                  Behind Agrasen Bhavan, Karwand Naka,<br />
                  Shirpur, Dist. Dhule, Maharashtra - 425405
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+917558533371" className="font-medium hover:text-primary transition-colors">
                  +91 75585 33371 / 77096 16271
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:bafnaebykes@gmail.com" className="font-medium hover:text-primary transition-colors">
                  bafnaebykes@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-400 text-xs font-medium tracking-wide">
          <p>© {new Date().getFullYear()} BAFNA E-BYKES. All rights reserved. | Shirpur, Maharashtra</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
