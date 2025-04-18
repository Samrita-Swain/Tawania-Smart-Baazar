import Navbar from '../../components/website/Navbar';
import Hero from '../../components/website/Hero';
import FeaturedProducts from '../../components/website/FeaturedProducts';
import Footer from '../../components/website/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Hero />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
