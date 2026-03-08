import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../App';
import WhatsAppButton from '../components/WhatsAppButton';
import { toast } from 'sonner';

const MenuPage = () => {
  const navigate = useNavigate();
  const { API, cart, addToCart, updateCartQuantity, removeFromCart, clearCart } = useApp();
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Pizzas', 'Garlic Bread', 'Burgers', 'Pasta', 'Fries & Sides', 'Beverages'];

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API}/menu`);
      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Error fetching menu:', err);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderText = cart.map(item => `- ${item.name} x${item.quantity} (₹${item.price * item.quantity})`).join('\n');
    const message = `Hello DK Pizza Cafe,\n\nI want to order:\n${orderText}\n\nTotal: ₹${cartTotal}\n\nPlease confirm the order.`;
    
    // Log order to backend
    fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        total: cartTotal
      })
    }).catch(err => console.error('Error logging order:', err));

    window.open(`https://wa.me/919956407087?text=${encodeURIComponent(message)}`, '_blank');
    clearCart();
    setShowCart(false);
    toast.success('Order sent to WhatsApp!');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button 
            data-testid="back-to-home-btn"
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground">Menu</h1>
          <button
            data-testid="cart-button"
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Category Filter */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-white/10 overflow-x-auto">
        <div className="flex gap-2 px-6 py-4">
          {categories.map(category => (
            <button
              key={category}
              data-testid={`category-${category.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-surface text-muted-foreground hover:bg-surface/80 border border-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-xl">Loading menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-xl">No items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredItems.map(item => (
              <div
                key={item.id}
                data-testid={`menu-item-${item.id}`}
                className="menu-item-card bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 group"
              >
                {item.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                    <Button
                      data-testid={`add-to-cart-${item.id}`}
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2 font-semibold transition-all hover:scale-105"
                    >
                      Add to Cart
                    </Button>
                  </div>
                  {!item.available && (
                    <p className="text-red-500 text-sm mt-2">Currently unavailable</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)}></div>
          <div className="relative bg-surface w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Cart</h2>
              <button 
                data-testid="close-cart-btn"
                onClick={() => setShowCart(false)} 
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} data-testid={`cart-item-${item.id}`} className="bg-background/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <p className="text-primary font-bold">₹{item.price}</p>
                        </div>
                        <button
                          data-testid={`remove-item-${item.id}`}
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          data-testid={`decrease-qty-${item.id}`}
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="bg-muted hover:bg-muted/80 text-foreground w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-foreground font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          data-testid={`increase-qty-${item.id}`}
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="bg-muted hover:bg-muted/80 text-foreground w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-muted-foreground ml-auto">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-foreground font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary" data-testid="cart-total">₹{cartTotal}</span>
                  </div>
                </div>

                <Button
                  data-testid="order-whatsapp-btn"
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full py-6 text-lg font-bold shadow-lg"
                >
                  Order on WhatsApp
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
};

export default MenuPage;
