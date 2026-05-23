import { Hero } from '@/components/sections/Hero';
import { MissionSection } from '@/components/sections/MissionSection';
import { YearThemeSection } from '@/components/sections/YearThemeSection';
import { AvenuesSection } from '@/components/sections/AvenuesSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { CTASection } from '@/components/sections/CTASection';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <MissionSection />
      <YearThemeSection />
      <AvenuesSection />
      <GallerySection />
      <CTASection />
      <Footer />
    </>
  );
}
