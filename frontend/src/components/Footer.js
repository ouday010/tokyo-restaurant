import Link from 'next/link';
import { UtensilsCrossed, MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">Tokyo Healthy</p>
                <p className="text-primary text-sm font-semibold">& Tacos</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Where Japanese health-food culture meets the bold spirit of Mexican tacos. Fresh, vibrant, and crafted with love.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-primary transition-colors">Menu</Link></li>
              <li><Link href="/checkout" className="hover:text-primary transition-colors">Cart & Checkout</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Contact & Hours</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Mon – Sat: 11:00 AM – 10:00 PM<br />Sun: 12:00 PM – 9:00 PM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+216 23 442 822</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>We deliver to your door — call us to confirm!</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Tokyo Healthy & Tacos. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
