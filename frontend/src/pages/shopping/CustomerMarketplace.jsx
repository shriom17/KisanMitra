import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import MarketplaceChatBot from '../../components/MarketplaceChatBot/MarketplaceChatBot';
import './CustomerMarketplace.css';

const CustomerMarketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    addToCart, 
    toggleFavorite, 
    isInCart, 
    isInFavorites, 
    formatPrice 
  } = useMarketplace();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', message: '' });
  const [showContactModal, setShowContactModal] = useState(false);

  // Default products
  const defaultProducts = [
    {
      id: 'DEFAULT001',
      name: 'Fresh Tomatoes',
      category: 'vegetables',
      price: 40,
      originalPrice: 50,
      image: `${process.env.PUBLIC_URL}/images/products/tomatoes.jpeg`,
      rating: 4.5,
      reviews: 45,
      description: 'Fresh, juicy red tomatoes directly from the farm. Perfect for salads and cooking.',
      unit: 'kg',
      quantity: 50,
      inStock: true,
      farmerId: 'FARMER001',
      farmerName: 'Ramesh Kumar',
      location: 'Punjab',
      phoneNumber: '+91-98765-43210',
      organicCertified: true,
      deliveryAvailable: true,
      harvestDate: '2026-01-25'
    },
    {
      id: 'DEFAULT002',
      name: 'Organic Potatoes',
      category: 'vegetables',
      price: 30,
      originalPrice: 35,
      image: `${process.env.PUBLIC_URL}/images/products/potatoes.jpeg`,
      rating: 4.7,
      reviews: 62,
      description: 'Premium quality organic potatoes, freshly harvested. Great for all your cooking needs.',
      unit: 'kg',
      quantity: 100,
      inStock: true,
      farmerId: 'FARMER002',
      farmerName: 'Sunita Devi',
      location: 'Haryana',
      phoneNumber: '+91-98765-43211',
      organicCertified: true,
      deliveryAvailable: true,
      harvestDate: '2026-01-20'
    },
    {
      id: 'DEFAULT003',
      name: 'Fresh Onions',
      category: 'vegetables',
      price: 35,
      originalPrice: 40,
      image: `${process.env.PUBLIC_URL}/images/products/onions.jpeg`,
      rating: 4.3,
      reviews: 38,
      description: 'Quality red onions with rich flavor. Essential ingredient for every kitchen.',
      unit: 'kg',
      quantity: 80,
      inStock: true,
      farmerId: 'FARMER003',
      farmerName: 'Amit Singh',
      location: 'Maharashtra',
      phoneNumber: '+91-98765-43212',
      organicCertified: false,
      deliveryAvailable: true,
      harvestDate: '2026-01-22'
    },
    {
      id: 'DEFAULT004',
      name: 'Green Spinach',
      category: 'vegetables',
      price: 25,
      originalPrice: 30,
      image: `${process.env.PUBLIC_URL}/images/products/spinach.jpeg`,
      rating: 4.6,
      reviews: 52,
      description: 'Fresh green spinach leaves, rich in iron and nutrients. Organically grown.',
      unit: 'kg',
      quantity: 30,
      inStock: true,
      farmerId: 'FARMER004',
      farmerName: 'Priya Sharma',
      location: 'Uttar Pradesh',
      phoneNumber: '+91-98765-43213',
      organicCertified: true,
      deliveryAvailable: true,
      harvestDate: '2026-01-28'
    },
    {
      id: 'DEFAULT005',
      name: 'Fresh Cauliflower',
      category: 'vegetables',
      price: 45,
      originalPrice: 55,
      image: `${process.env.PUBLIC_URL}/images/products/cauliflower.jpeg`,
      rating: 4.4,
      reviews: 41,
      description: 'White, firm cauliflower heads. Perfect for parathas, curries, and stir-fries.',
      unit: 'kg',
      quantity: 40,
      inStock: true,
      farmerId: 'FARMER005',
      farmerName: 'Rajesh Patel',
      location: 'Gujarat',
      phoneNumber: '+91-98765-43214',
      organicCertified: false,
      deliveryAvailable: true,
      harvestDate: '2026-01-26'
    },
    {
      id: 'DEFAULT006',
      name: 'Green Peas',
      category: 'vegetables',
      price: 60,
      originalPrice: 70,
      image: `${process.env.PUBLIC_URL}/images/products/greenpeas.jpeg`,
      rating: 4.8,
      reviews: 55,
      description: 'Sweet and tender green peas. Freshly shelled and ready to cook.',
      unit: 'kg',
      quantity: 25,
      inStock: true,
      farmerId: 'FARMER006',
      farmerName: 'Meena Devi',
      location: 'Himachal Pradesh',
      phoneNumber: '+91-98765-43215',
      organicCertified: true,
      deliveryAvailable: false,
      harvestDate: '2026-01-29'
    },
    {
      id: 'DEFAULT007',
      name: 'Fresh Carrots',
      category: 'vegetables',
      price: 50,
      originalPrice: 60,
      image: `${process.env.PUBLIC_URL}/images/products/carrots.jpeg`,
      rating: 4.5,
      reviews: 48,
      description: 'Crunchy orange carrots, rich in vitamins. Great for salads and juices.',
      unit: 'kg',
      quantity: 60,
      inStock: true,
      farmerId: 'FARMER007',
      farmerName: 'Vikram Singh',
      location: 'Rajasthan',
      phoneNumber: '+91-98765-43216',
      organicCertified: true,
      deliveryAvailable: true,
      harvestDate: '2026-01-24'
    },
    {
      id: 'DEFAULT008',
      name: 'Green Capsicum',
      category: 'vegetables',
      price: 55,
      originalPrice: 65,
      image: `${process.env.PUBLIC_URL}/images/products/greencapsicum .jpeg`,
      rating: 4.2,
      reviews: 33,
      description: 'Fresh green bell peppers. Add crunch and flavor to your dishes.',
      unit: 'kg',
      quantity: 35,
      inStock: true,
      farmerId: 'FARMER008',
      farmerName: 'Anita Verma',
      location: 'Karnataka',
      phoneNumber: '+91-98765-43217',
      organicCertified: false,
      deliveryAvailable: true,
      harvestDate: '2026-01-27'
    }
  ];

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/products`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.products.length > 0) {
        // Transform backend products to match frontend format
        const transformedProducts = data.products.map(p => ({
          id: p.id,
          name: p.productName,
          category: p.category,
          price: p.price,
          originalPrice: p.price * 1.2,
          image: p.productImage || `${process.env.PUBLIC_URL}/images/products/tomatoes.jpeg`,
          rating: 4.5,
          reviews: p.views || 0,
          description: p.description,
          unit: p.unit,
          quantity: p.quantity,
          inStock: p.status === 'active',
          farmerId: p.farmerId,
          farmerName: p.farmerName,
          location: p.location,
          phoneNumber: p.phoneNumber,
          organicCertified: p.organicCertified,
          deliveryAvailable: p.deliveryAvailable,
          harvestDate: p.harvestDate
        }));
        
        // Combine backend products with default products
        setProducts([...transformedProducts, ...defaultProducts]);
      } else {
        // If no backend products, use only default products
        setProducts(defaultProducts);
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      // On error, show default products
      setProducts(defaultProducts);
    } finally {
      setLoading(false);
    }
  };

  // Categories
  const categories = [
    { id: 'all', name: 'All Products', icon: '🌾' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥕' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'grains', name: 'Grains', icon: '🌾' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'organic', name: 'Organic', icon: '🌿' }
  ];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handleContactFarmer = (product) => {
    setSelectedProduct(product);
    setShowContactModal(true);
  };

  const handleSendInquiry = async () => {
    // In a real app, this would send the inquiry to the backend
    alert(`Inquiry sent to ${selectedProduct.farmerName}!\nThey will contact you at: ${contactInfo.phone}`);
    setShowContactModal(false);
    setContactInfo({ name: '', phone: '', message: '' });
  };

  if (loading) {
    return (
      <div className="customer-marketplace-loading">
        <div className="loading-spinner"></div>
        <p>Loading fresh products from local farmers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-marketplace-error">
        <h2>⚠️ {error}</h2>
        <button onClick={fetchProducts} className="retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="customer-marketplace">
      {/* Header */}
      <div className="marketplace-header">
        <div className="header-content">
          <h1>🌾 Farm Fresh Marketplace</h1>
          <p>Direct from local farmers to your doorstep</p>
        </div>
        <div className="header-actions">
          <Link to="/cart" className="cart-link">
            🛒 Cart
          </Link>
          <Link to="/my-orders" className="orders-link">
            📦 My Orders
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="marketplace-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="sort-control">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-bar">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Products Grid/List */}
      <div className={`products-container ${viewMode}`}>
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${process.env.PUBLIC_URL}/images/products/tomatoes.jpeg`;
                  }}
                />
                {product.organicCertified && (
                  <span className="organic-badge">🌿 Organic</span>
                )}
                {product.deliveryAvailable && (
                  <span className="delivery-badge">🚚 Delivery</span>
                )}
                <button
                  className={`favorite-btn ${isInFavorites(product.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(product)}
                >
                  ❤️
                </button>
              </div>

              <div className="product-info">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <div className="product-rating">
                    ⭐ {product.rating} ({product.reviews})
                  </div>
                </div>

                <p className="product-description">{product.description}</p>

                <div className="product-meta">
                  <span className="farmer-info">👨‍🌾 {product.farmerName}</span>
                  <span className="location-info">📍 {product.location}</span>
                </div>

                <div className="product-footer">
                  <div className="price-info">
                    <span className="current-price">₹{formatPrice(product.price)}</span>
                    <span className="unit">/ {product.unit}</span>
                    {product.quantity && (
                      <span className="stock-info">
                        ({product.quantity} {product.unit} available)
                      </span>
                    )}
                  </div>

                  <div className="product-actions">
                    <button
                      className="quick-view-btn"
                      onClick={() => handleQuickView(product)}
                    >
                      👁️ Quick View
                    </button>
                    <button
                      className="contact-btn"
                      onClick={() => handleContactFarmer(product)}
                    >
                      📞 Contact
                    </button>
                    <button
                      className={`add-to-cart-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      {isInCart(product.id) ? '✓ In Cart' : '🛒 Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowQuickView(false)}>
          <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowQuickView(false)}>×</button>
            
            <div className="modal-content">
              <div className="modal-image">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${process.env.PUBLIC_URL}/images/products/tomatoes.jpeg`;
                  }}
                />
              </div>

              <div className="modal-details">
                <h2>{selectedProduct.name}</h2>
                <div className="modal-rating">
                  ⭐ {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                </div>

                <p className="modal-description">{selectedProduct.description}</p>

                <div className="modal-info-grid">
                  <div className="info-item">
                    <strong>👨‍🌾 Farmer:</strong>
                    <span>{selectedProduct.farmerName}</span>
                  </div>
                  <div className="info-item">
                    <strong>📍 Location:</strong>
                    <span>{selectedProduct.location}</span>
                  </div>
                  <div className="info-item">
                    <strong>📦 Available:</strong>
                    <span>{selectedProduct.quantity} {selectedProduct.unit}</span>
                  </div>
                  <div className="info-item">
                    <strong>🌿 Organic:</strong>
                    <span>{selectedProduct.organicCertified ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="info-item">
                    <strong>🚚 Delivery:</strong>
                    <span>{selectedProduct.deliveryAvailable ? 'Available' : 'Pickup Only'}</span>
                  </div>
                  {selectedProduct.harvestDate && (
                    <div className="info-item">
                      <strong>📅 Harvest Date:</strong>
                      <span>{new Date(selectedProduct.harvestDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="modal-price">
                  <span className="price">₹{formatPrice(selectedProduct.price)}</span>
                  <span className="unit">per {selectedProduct.unit}</span>
                </div>

                <div className="modal-actions">
                  <button
                    className="modal-contact-btn"
                    onClick={() => {
                      setShowQuickView(false);
                      handleContactFarmer(selectedProduct);
                    }}
                  >
                    📞 Contact Farmer
                  </button>
                  <button
                    className="modal-add-cart-btn"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setShowQuickView(false);
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Farmer Modal */}
      {showContactModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowContactModal(false)}>×</button>
            
            <h2>📞 Contact {selectedProduct.farmerName}</h2>
            <p>Send an inquiry about {selectedProduct.name}</p>

            <div className="contact-form">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Your Phone Number</label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={contactInfo.message}
                  onChange={(e) => setContactInfo({ ...contactInfo, message: e.target.value })}
                  placeholder="What would you like to know?"
                  rows="4"
                />
              </div>

              <div className="farmer-contact-info">
                <p><strong>Farmer's Contact:</strong> {selectedProduct.phoneNumber}</p>
                <p><strong>Location:</strong> {selectedProduct.location}</p>
              </div>

              <div className="contact-actions">
                <button className="cancel-btn" onClick={() => setShowContactModal(false)}>
                  Cancel
                </button>
                <button 
                  className="send-btn" 
                  onClick={handleSendInquiry}
                  disabled={!contactInfo.name || !contactInfo.phone}
                >
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Assistant ChatBot */}
      <MarketplaceChatBot products={products} />
    </div>
  );
};

export default CustomerMarketplace;
