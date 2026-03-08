import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const handleClick = () => {
    const message = 'Hello DK Pizza Cafe, I want to order...';
    window.open(`https://wa.me/919956407087?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <button
      data-testid="floating-whatsapp-btn"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all animate-bounce-subtle"
      aria-label="Order on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

export default WhatsAppButton;
