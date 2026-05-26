import { Hero } from '@/components/sections/Hero';
import { MissionSection } from '@/components/sections/MissionSection';
import { YearThemeSection } from '@/components/sections/YearThemeSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { CTASection } from '@/components/sections/CTASection';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <MissionSection />
      <YearThemeSection />
      <GallerySection />
      <CTASection />
      <Footer />
    </>
  );
}
