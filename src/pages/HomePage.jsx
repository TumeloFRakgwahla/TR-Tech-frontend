/**
 * Home Page Component
 *
 * Mobile-first homepage with product carousels, category navigation,
 * and trust signals optimized for conversion on small screens.
 */

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import WhyChooseUs from '../components/Why-Choose-Us';
import ProductCarousel from '../components/ProductCarousel';
import CategoryChips from '../components/CategoryChips';
import TrustSignals from '../components/TrustSignals';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero section - main banner with CTAs */}
        <Hero />

        {/* Category chips - horizontal scroll for quick navigation */}
        <section className="py-4 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <CategoryChips />
          </div>
        </section>

        {/* Trending Products - horizontal scroll carousel */}
        <section className="py-6 md:py-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="px-4 mb-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Trending Now
              </h2>
              <a
                href="/shop"
                className="text-sm font-medium text-primary hover:text-primary/80 min-h-[44px] flex items-center"
              >
                See All →
              </a>
            </div>
            <ProductCarousel
              endpoint="/api/v1/products?sort=featured&limit=8"
              emptyMessage="No trending products yet"
            />
          </div>
        </section>

        {/* Promo Banner */}
        <section className="py-4 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 md:p-8 text-primary-foreground">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold mb-1">
                    Free Delivery on Orders Over R500
                  </h3>
                  <p className="text-primary-foreground/80 text-sm">
                    Fast, reliable shipping across South Africa
                  </p>
                </div>
                <a
                  href="/shop"
                  className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors min-h-[48px] flex items-center"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals - horizontal scroll carousel */}
        <section className="py-6 md:py-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="px-4 mb-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                New Arrivals
              </h2>
              <a
                href="/shop?sort=newest"
                className="text-sm font-medium text-primary hover:text-primary/80 min-h-[44px] flex items-center"
              >
                See All →
              </a>
            </div>
            <ProductCarousel
              endpoint="/api/v1/products?sort=newest&limit=8"
              emptyMessage="No new arrivals yet"
            />
          </div>
        </section>

        {/* Trust Signals */}
        <TrustSignals />

        {/* Services section - showcase what we offer */}
        <Services />

        {/* Why Choose Us section - highlight our advantages */}
        <WhyChooseUs />

        {/* Call-to-Action section */}
        <CTA />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Home;
