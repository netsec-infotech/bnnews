'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Youtube, Instagram, Mail, Phone, MapPin, Heart, Radio } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { NAV_CATEGORIES } from './Navbar';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-dark text-white pt-12 pb-6 border-t-4 border-secondary mt-16 font-gujarati">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & About */}
          <div>
            <BrandLogo variant="white" size="lg" />
            <p className="text-gray-300 text-xs md:text-sm mt-4 leading-relaxed font-normal">
              BN NEWS ગુજરાતી એ ગુજરાતનું અગ્રણી ડિજિટલ સમાચાર માધ્યમ છે, જે આપ સુધી તમામ સ્થાનિક, રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય સત્યપૂર્ણ અને વિશ્વસનીય સમાચારો સૌથી ઝડપથી પહોંચાડે છે.
            </p>

            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/share/1DvY4dAr2u/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                title="Facebook"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://www.instagram.com/bnnewsgujarati?rpxt=bWIycTZlb3lkbmYw"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                title="Instagram"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://youtube.com/@bnnewsgujarati2323?si=9nlsu3gkoakzvzIG"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                title="YouTube"
              >
                <Youtube className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-accent-gold rounded-full"></span>
              <span>મુખ્ય સમાચાર શ્રેણીઓ</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-gray-300">
              {NAV_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="hover:text-accent-gold hover:translate-x-1 transition-all"
                >
                  • {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Quick Links & Policies */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-accent-gold rounded-full"></span>
              <span>ઝડપી લિંક્સ</span>
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-gray-300">
              <li>
                <Link href="/about" className="hover:text-accent-gold transition-colors">અમારા વિશે (About Us)</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent-gold transition-colors">સંપર્ક કરો (Contact Us)</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-accent-gold transition-colors">ગોપનીયતા નીતિ (Privacy Policy)</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-accent-gold transition-colors">નિયમો અને શરતો (Terms & Conditions)</Link>
              </li>
              <li>
                <Link href="/live-tv" className="hover:text-breaking text-accent-gold font-bold flex items-center gap-1 transition-colors">
                  <Radio className="w-3.5 h-3.5 text-breaking" />
                  <span>LIVE 24x7 ટીવી પ્રસારણ</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-secondary text-gray-400 transition-colors">સંપાદકીય લૉગિન (CMS Login)</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-accent-gold rounded-full"></span>
              <span>સંપર્ક વિગતો</span>
            </h4>
            <ul className="space-y-3 text-xs md:text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>2nd Floor, Office No 207/1 ,Akshar Plaza Complex Padra, Padra, Gujarat 391440</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-secondary shrink-0" />
                <a href="tel:+919099676267" className="hover:text-white transition-colors">+91 90996 76267</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <span>contact@bnnews.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} BN NEWS ગુજરાતી. તમામ હકો અનામત છે (All Rights Reserved).</p>
          <p className="flex items-center gap-1 font-semibold text-gray-300">
            તમારા વિસ્તારની, તમારા ભાષામાં... <Heart className="w-3.5 h-3.5 text-breaking fill-breaking" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
