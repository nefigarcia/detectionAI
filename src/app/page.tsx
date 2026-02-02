import Link from 'next/link';
import Image from 'next/image';
import {
  BarChartIcon,
  CheckCircle,
  CloudIcon,
  CombineIcon,
  CpuIcon,
  DollarSignIcon,
  LayersIcon,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <LayersIcon className="h-8 w-8 text-primary" />,
    title: 'Lower Entry Barrier',
    description:
      'Easily upload images or use live camera streams from affordable cameras. No complex software or industrial hardware needed.',
  },
  {
    icon: <CombineIcon className="h-8 w-8 text-primary" />,
    title: 'Domain-Agnostic Inspection',
    description:
      'Our multi-industry SaaS supports any image/video source and self-training on custom datasets with custom defect labeling.',
  },
  {
    icon: <CloudIcon className="h-8 w-8 text-primary" />,
    title: 'Simplified UX & Cloud Orchestration',
    description:
      'Experience a cloud-first, turnkey solution that eliminates complex setups and local hardware integration.',
  },
  {
    icon: <DollarSignIcon className="h-8 w-8 text-primary" />,
    title: 'Lower Total Cost of Ownership',
    description:
      'A competitively priced SaaS model for SMEs, mid-tier manufacturers, and quality labs, without expensive premium packages.',
  },
  {
    icon: <BarChartIcon className="h-8 w-8 text-primary" />,
    title: 'Advanced Data & Analytics',
    description:
      'Go beyond detection with dashboards, trends, root-cause analytics, and predictive insights to make actionable decisions.',
  },
  {
    icon: <CpuIcon className="h-8 w-8 text-primary" />,
    title: 'Hybrid Workflow Integration',
    description:
      'Benefit from cloud training and edge inference, with API connectivity for your existing MES, ERP, or SCADA systems.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: '$49',
    period: '/ month',
    description: 'For small teams and startups getting started with vision AI.',
    features: [
      '1 Project',
      'Up to 1,000 images',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Choose Starter',
  },
  {
    name: 'Pro',
    price: '$199',
    period: '/ month',
    description: 'For growing businesses that need more power and scale.',
    features: [
      '10 Projects',
      'Up to 50,000 images',
      'Advanced analytics & insights',
      'Priority support',
      'API Access',
    ],
    cta: 'Choose Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    period: '',
    description: 'For large organizations with custom needs and integrations.',
    features: [
      'Unlimited Projects',
      'Custom image/video volume',
      'On-premise deployment option',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
  },
];

const Logo = () => (
  <div className="flex items-center gap-2">
    <ShieldCheck className="h-8 w-8 text-primary" />
    <span className="text-xl font-bold tracking-tight text-foreground">
      Defect Detective
    </span>
  </div>
);

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-4">
            <Link href="#features">
              <Button variant="ghost">Features</Button>
            </Link>
            <Link href="#pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative h-[60vh] min-h-[500px] w-full">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              AI-Powered Defect Detection
            </h1>
            <p className="mt-4 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Streamline your quality control with our easy-to-use, cloud-native
              SaaS solution. Find defects faster, reduce waste, and improve
              your bottom line.
            </p>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button size="lg">Start Your Free Trial</Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="container py-12 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              Why Defect Detective?
            </h2>
            <p className="mt-4 text-muted-foreground">
              We differentiate from the competition by focusing on accessibility,
              flexibility, and actionable insights.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  {feature.icon}
                  <CardTitle className="font-headline text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="bg-secondary/50 py-12 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Choose the plan that's right for your business.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`flex flex-col ${
                    tier.popular ? 'border-2 border-primary shadow-lg' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="w-full bg-primary py-2 text-center text-sm font-semibold text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">
                      {tier.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">
                        {tier.period}
                      </span>
                    </div>
                    <p className="pt-2 text-muted-foreground">
                      {tier.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="flex-1 space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-8 w-full"
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-20 items-center justify-between">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Defect Detective. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
