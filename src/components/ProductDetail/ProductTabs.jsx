import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function ProductTabs({ product, specifications, reviews }) {
  return (
    <Card className="mb-14 rounded-xl border border-border bg-muted shadow-sm">
      <Tabs defaultValue="description" className="p-6">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent gap-0">
          {[
            { value: 'description', label: 'Description' },
            { value: 'specifications', label: 'Specifications' },
            {
              value: 'reviews',
              label: `Reviews${reviews > 0 ? ` (${reviews})` : ''}`,
            },
            { value: 'shipping', label: 'Shipping' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent px-5 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-muted/30 bg-transparent shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div>
            <h3 className="text-base font-bold text-foreground mb-2">
              Product Description
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {product.description || 'No description available.'}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This premium product combines cutting-edge technology with sleek
              design. Perfect for professionals and enthusiasts alike, it delivers
              exceptional performance and reliability. Every detail has been
              carefully crafted to provide the best user experience possible.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <div>
            <h3 className="text-base font-bold text-foreground mb-4">
              Technical Specifications
            </h3>
            <div className="border border-border rounded-lg overflow-hidden">
              {specifications.map(([key, value], i) => (
                <div
                  key={key}
                  className={`grid grid-cols-1 md:grid-cols-[140px_1fr] text-sm px-4 py-3 ${
                    i % 2 === 0 ? 'bg-muted' : 'bg-white'
                  }`}
                >
                  <span className="text-muted-foreground font-medium">
                    {key}:
                  </span>
                  <span className="text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div>
            <h3 className="text-base font-bold text-foreground mb-4">
              Customer Reviews
            </h3>
            <p className="text-sm text-muted-foreground">
              {reviews > 0
                ? `${reviews} review${reviews === 1 ? '' : 's'} for this product.`
                : 'No reviews yet. Be the first to review this product!'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground mb-4">
              Shipping Information
            </h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Delivery:</span>{' '}
              Contact TR-Tech for available delivery options and costs.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Processing:</span>{' '}
              Orders are processed as soon as payment and delivery details are
              confirmed.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
