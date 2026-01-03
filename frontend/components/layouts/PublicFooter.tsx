import Link from 'next/link';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-[#CBD5E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left Section - Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">D-Menu</h3>
            <p className="text-sm leading-relaxed">
              Simple QR ordering system for restaurants.
            </p>
          </div>

          {/* Middle Section - Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm hover:text-[#22C55E] transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="text-sm hover:text-[#22C55E] transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm hover:text-[#22C55E] transition-colors duration-200"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:text-[#22C55E] transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Section - Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@dmenu.in"
                  className="text-sm hover:text-[#22C55E] transition-colors duration-200"
                >
                  support@dmenu.in
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/918332063638"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-[#22C55E] transition-colors duration-200"
                >
                  +91-8332063638
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-sm text-center text-[#CBD5E1]">
            © {currentYear} TapMenu. All rights reserved.
          </p>
          <p className="text-sm text-center text-[#CBD5E1]">
  Crafted by Fynexon Technologies
</p>

        </div>
      </div>
    </footer>
  );
}

