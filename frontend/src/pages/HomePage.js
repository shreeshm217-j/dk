import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Phone, Clock, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../App';
import WhatsAppButton from '../components/WhatsAppButton';

const HomePage = () => {
  const navigate = useNavigate();
  const { API } = useApp();
  const [settings, setSettings] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch settings
    fetch(`${API}/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));

    // Fetch reviews
    fetch(`${API}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error('Error fetching reviews:', err));
  }, [API]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center parallax-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHw0fHxwaXp6YSUyMGNoZWVzZSUyMHB1bGx8ZW58MHx8fHwxNzcyODkzMjIxfDA&ixlib=rb-4.1.0&q=85')`,
        }}
      >
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="relative z-10 text-center px-6 py-20">
          <div className="mb-6 inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-6 py-3 rounded-full border border-secondary/30">
            <Star className="w-5 h-5 text-secondary fill-secondary" />
            <span className="text-foreground font-semibold">{settings?.rating || 4.9} Rating</span>
            <span className="text-muted-foreground">({settings?.total_reviews || 67} reviews)</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4">
            DK Pizza Cafe
          </h1>
          <p className="text-3xl sm:text-4xl lg:text-5xl text-gradient-gold font-bold mb-8">
            डीके पिज्जा कैफे
          </p>
          <p className="text-xl sm:text-2xl text-foreground/80 mb-12 max-w-2xl mx-auto">
            Authentic Italian flavors in the heart of Mallawan
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              data-testid="hero-order-whatsapp-btn"
              onClick={() => window.open(`https://wa.me/919956407087?text=${encodeURIComponent('Hello DK Pizza Cafe, I want to order...')}`, '_blank')}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Order on WhatsApp
            </Button>
            <Button 
              data-testid="hero-view-menu-btn"
              onClick={() => navigate('/menu')}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:scale-105 transition-transform"
            >
              View Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface/50 backdrop-blur-sm p-8 rounded-xl border border-white/5 hover:-translate-y-1 transition-transform text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Dine-In</h3>
              <p className="text-muted-foreground">Enjoy your meal in our cozy restaurant atmosphere</p>
            </div>

            <div className="bg-surface/50 backdrop-blur-sm p-8 rounded-xl border border-white/5 hover:-translate-y-1 transition-transform text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Drive-Through</h3>
              <p className="text-muted-foreground">Quick pickup without leaving your car</p>
            </div>

            <div className="bg-surface/50 backdrop-blur-sm p-8 rounded-xl border border-white/5 hover:-translate-y-1 transition-transform text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No-Contact Delivery</h3>
              <p className="text-muted-foreground">Safe and fast delivery to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About DK Pizza Cafe
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                DK Pizza Cafe is a popular pizza spot in Mallawan known for delicious pizzas, quick service and affordable prices. Located near the Government Hospital on Unnao-Hardoi Road, the cafe offers dine-in, drive-through and delivery options.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We take pride in using fresh ingredients, authentic recipes, and providing exceptional service to every customer. Whether you're craving a classic Margherita or an adventurous specialty pizza, we've got something for everyone.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Opening Hours</p>
                    <p className="text-muted-foreground">{settings?.opening_hours || '11:00 AM – 10:00 PM'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <p className="text-muted-foreground">{settings?.phone || '+91 99564 07087'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Address</p>
                    <p className="text-muted-foreground">{settings?.address || 'Unnao - Hardoi Rd, Mallawan, UP 241303'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxyZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MHx8fHwxNzcyODkzMjIzfDA&ixlib=rb-4.1.0&q=85"
                alt="Restaurant interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-8 h-8 text-secondary fill-secondary" />
              <span className="text-4xl font-bold text-foreground">{settings?.rating || 4.9}</span>
            </div>
            <p className="text-muted-foreground text-lg">Based on {settings?.total_reviews || 67} reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Static reviews */}
            <div className="bg-surface p-8 rounded-xl border border-white/5">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                ))}
              </div>
              <p className="text-foreground mb-4 text-lg">"Best pizza in Mallawan! The cheese quality is amazing and prices are very reasonable."</p>
              <p className="text-muted-foreground font-semibold">- Rajesh Kumar</p>
            </div>

            <div className="bg-surface p-8 rounded-xl border border-white/5">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                ))}
              </div>
              <p className="text-foreground mb-4 text-lg">"Affordable and delicious. Their pasta is also very good. Fast service!"</p>
              <p className="text-muted-foreground font-semibold">- Priya Singh</p>
            </div>

            <div className="bg-surface p-8 rounded-xl border border-white/5">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                ))}
              </div>
              <p className="text-foreground mb-4 text-lg">"Great taste and amazing service. The drive-through is very convenient!"</p>
              <p className="text-muted-foreground font-semibold">- Amit Verma</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
            Find Us
          </h2>
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.123456789012!2d80.12345678901234!3d26.87654321098765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDUyJzM1LjYiTiA4MMKwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DK Pizza Cafe Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">DK Pizza Cafe</h3>
              <p className="text-muted-foreground mb-2">{settings?.price_range || '₹200 - ₹400'} per person</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Contact</h4>
              <p className="text-muted-foreground mb-2">{settings?.phone || '+91 99564 07087'}</p>
              <p className="text-muted-foreground">{settings?.opening_hours || '11:00 AM - 10:00 PM'}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Address</h4>
              <p className="text-muted-foreground text-sm">{settings?.address || 'Unnao - Hardoi Rd, Mallawan, UP 241303'}</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-muted-foreground">&copy; 2026 DK Pizza Cafe. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default HomePage;
