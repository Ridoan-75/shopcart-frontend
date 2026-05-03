// src/app/(main)/page.tsx
import HeroSlider from "../../components/home/HeroSlider";
import FeaturedCategories from "../../components/home/FeaturedCategories";
import FlashSaleSection from "../../components/home/FlashSaleSection";
import FeaturedProducts from "../../components/home/FeaturedProducts";
import NewArrivals from "../../components/home/NewArrivals";
import BrandsSection from "../../components/home/BrandsSection";
import BestSellers from "../../components/home/BestSellers";
import StatsSection from "../../components/home/StatsSection";
import TestimonialsSection from "../../components/home/TestimonialsSection";
import BlogSection from "../../components/home/BlogSection";
import NewsletterSection from "../../components/home/NewsletterSection";
import FaqSection from "../../components/home/FaqSection";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <FeaturedCategories />
      <FlashSaleSection />
      <FeaturedProducts />
      <NewArrivals />
      <BrandsSection />
      <BestSellers />
      <StatsSection />
      <TestimonialsSection />
      <BlogSection />
      <NewsletterSection />
      <FaqSection />
    </>
  );
}