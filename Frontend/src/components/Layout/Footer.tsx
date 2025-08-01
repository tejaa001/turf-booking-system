import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Socials Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">TurfBook</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Your premier destination for booking sports turfs. Find and reserve the perfect playing field for your team with ease.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/turfs" className="hover:text-green-400 transition-colors">
                  Browse Turfs
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-green-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-green-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Auth Links */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Account & Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="hover:text-green-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-green-400 transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-green-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-green-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} TurfBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;