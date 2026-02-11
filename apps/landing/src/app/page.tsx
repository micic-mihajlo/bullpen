"use client";

import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { WhatWeBuild } from "@/components/what-we-build";
import { SpeedStrip } from "@/components/speed-strip";
import { HowItWorks } from "@/components/how-it-works";
import { Features } from "@/components/features";
import { BlackBoxVsGlassBox } from "@/components/black-box-vs-glass-box";
import { LogoCloud } from "@/components/logo-cloud";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <WhatWeBuild />
      <SpeedStrip />
      <HowItWorks />
      <Features />
      <BlackBoxVsGlassBox />
      <LogoCloud />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
