import { TruckIcon, Shield, RotateCcw, CreditCard } from 'lucide-react';

const trustItems = [
  {
    icon: TruckIcon,
    title: 'Free Delivery',
    description: 'On orders over R500',
  },
  {
    icon: Shield,
    title: 'Warranty Included',
    description: 'Every purchase covered',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: CreditCard,
    title: 'Secure Checkout',
    description: 'Safe & encrypted payments',
  },
];

export default function TrustSignals() {
  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-4 md:p-6 bg-white rounded-xl border border-border shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
