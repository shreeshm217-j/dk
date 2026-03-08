import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useApp } from '../App';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, API } = useApp();
  const [menuItems, setMenuItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizzas',
    image_url: '',
    available: true
  });

  const categories = ['Pizzas', 'Garlic Bread', 'Burgers', 'Pasta', 'Fries & Sides', 'Beverages'];

  useEffect(() => {
    fetchMenuItems();
    fetchSettings();
    fetchOrders();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${API}/menu`);
      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/orders`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleAddEdit = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Pizzas',
      image_url: '',
      available: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || '',
      available: item.available
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: parseFloat(formData.price)
    };

    try {
      const url = editingItem ? `${API}/menu/${editingItem.id}` : `${API}/menu`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Item ${editingItem ? 'updated' : 'added'} successfully`);
        setIsDialogOpen(false);
        fetchMenuItems();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to save item');
      }
    } catch (err) {
      console.error('Error saving item:', err);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`${API}/menu/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        toast.success('Item deleted successfully');
        fetchMenuItems();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('An error occurred');
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        toast.success('Settings updated successfully');
        fetchSettings();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error('An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-white/10 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Site</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <Button
            data-testid="logout-btn"
            onClick={handleLogout}
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-surface/50 border-b border-white/10">
        <div className="px-6 flex gap-4">
          {['menu', 'orders', 'settings'].map(tab => (
            <button
              key={tab}
              data-testid={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">Menu Items</h2>
              <Button
                data-testid="add-item-btn"
                onClick={handleAddEdit}
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div
                  key={item.id}
                  data-testid={`admin-menu-item-${item.id}`}
                  className="bg-surface rounded-xl border border-white/5 overflow-hidden"
                >
                  {item.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                      <span className="text-primary font-bold">₹{item.price}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                    <p className="text-secondary text-xs mb-3">{item.category}</p>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`edit-item-${item.id}`}
                        onClick={() => handleEdit(item)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-primary/50 text-primary hover:bg-primary hover:text-white"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        data-testid={`delete-item-${item.id}`}
                        onClick={() => handleDelete(item.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="bg-surface border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {editingItem ? 'Update the details below' : 'Fill in the details for the new item'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Item Name</Label>
                    <Input
                      id="name"
                      data-testid="item-name-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-muted text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-foreground">Description</Label>
                    <Textarea
                      id="description"
                      data-testid="item-description-input"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="bg-muted text-foreground"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-foreground">Price (₹)</Label>
                      <Input
                        id="price"
                        data-testid="item-price-input"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="bg-muted text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-foreground">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger data-testid="item-category-select" className="bg-muted text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image_url" className="text-foreground">Image URL (optional)</Label>
                    <Input
                      id="image_url"
                      data-testid="item-image-input"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="bg-muted text-foreground"
                    />
                  </div>

                  <Button
                    type="submit"
                    data-testid="save-item-btn"
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">WhatsApp Orders</h2>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    data-testid={`order-${order.id}`}
                    className="bg-surface p-6 rounded-xl border border-white/5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-primary">₹{order.total}</span>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-foreground">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Cafe Settings</h2>
            <form onSubmit={handleSettingsUpdate} className="bg-surface p-8 rounded-xl border border-white/5 space-y-6">
              <div>
                <Label htmlFor="opening_hours" className="text-foreground">Opening Hours</Label>
                <Input
                  id="opening_hours"
                  data-testid="settings-hours-input"
                  value={settings.opening_hours}
                  onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
                  className="bg-muted text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  data-testid="settings-phone-input"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="bg-muted text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-foreground">Address</Label>
                <Textarea
                  id="address"
                  data-testid="settings-address-input"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="bg-muted text-foreground"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price_range" className="text-foreground">Price Range</Label>
                <Input
                  id="price_range"
                  data-testid="settings-price-input"
                  value={settings.price_range}
                  onChange={(e) => setSettings({ ...settings, price_range: e.target.value })}
                  className="bg-muted text-foreground"
                />
              </div>

              <Button
                type="submit"
                data-testid="save-settings-btn"
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
