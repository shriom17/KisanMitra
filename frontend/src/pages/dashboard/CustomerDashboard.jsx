import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import './CustomerDashboard.css';

const readStoredOrders = () => {
  try {
    return JSON.parse(localStorage.getItem('KisanMitra_orders') || '[]');
  } catch {
    return [];
  }
};

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatus = (order) => String(order.status || 'confirmed').toLowerCase();

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { cart, cartItemCount, favoritesCount } = useMarketplace();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    setOrders(readStoredOrders());
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError('');
      const apiBase = process.env.REACT_APP_API_BASE_URL
        ? process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '')
        : 'http://localhost:5000';

      try {
        const response = await fetch(`${apiBase}/api/products`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Unable to load recommended products.');
        }
        const available = (data.products || []).filter(product => product.status === 'active').map(product => ({
          id: product.id,
          name: product.productName,
          price: Number(product.price) || 0,
          unit: product.unit || 'unit',
          image: product.productImage || '/logo192.png',
          rating: product.rating || 4.5,
          location: product.location || ''
        }));
        setProducts(available.slice(0, 4));
      } catch (error) {
        setProductsError(error.message || 'Unable to load recommended products.');
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const totals = useMemo(() => {
    const activeStatuses = ['confirmed', 'pending', 'packed', 'shipped'];
    const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const activeOrders = orders.filter(order => activeStatuses.includes(getStatus(order))).length;
    return { totalSpent, activeOrders };
  }, [orders]);

  const statusCounts = useMemo(() => {
    return orders.reduce((counts, order) => {
      const status = getStatus(order);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
  }, [orders]);

  const displayName = user?.full_name?.trim()
    || user?.email?.split('@')[0]
    || 'Customer';
  const recentOrders = [...orders].sort((a, b) =>
    new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  ).slice(0, 5);

  return (
    <main className="customer-dashboard">
      <div className="customer-dashboard-shell">
        <header className="customer-welcome">
          <div>
            <span className="customer-welcome-kicker">Customer Dashboard</span>
            <h1>Welcome back, {displayName}</h1>
            <p>Track your orders and discover fresh farm products.</p>
          </div>
          <Link className="customer-shop-button" to="/customer-marketplace">
            <ShoppingBag size={18} /> Shop fresh
          </Link>
        </header>

        <section className="customer-stat-grid" aria-label="Shopping statistics">
          <article className="customer-stat-card">
            <div className="customer-stat-icon green"><Package size={21} /></div>
            <div><span>Total orders</span><strong>{orders.length}</strong></div>
          </article>
          <article className="customer-stat-card">
            <div className="customer-stat-icon amber"><TrendingUp size={21} /></div>
            <div><span>Active orders</span><strong>{totals.activeOrders}</strong></div>
          </article>
          <article className="customer-stat-card">
            <div className="customer-stat-icon blue"><ShoppingCart size={21} /></div>
            <div><span>Cart items</span><strong>{cartItemCount}</strong></div>
          </article>
          <article className="customer-stat-card">
            <div className="customer-stat-icon rose"><Heart size={21} /></div>
            <div><span>Saved items</span><strong>{favoritesCount}</strong></div>
          </article>
        </section>

        <section className="customer-dashboard-grid">
          <article className="customer-panel recent-orders-panel">
            <div className="customer-panel-heading">
              <div><span>Purchases</span><h2>Recent orders</h2></div>
              <Link to="/my-orders">View all <ArrowRight size={15} /></Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="customer-empty-state">
                <Package size={30} />
                <h3>No recent orders</h3>
                <p>Your checkout purchases will appear here.</p>
                <Link to="/customer-marketplace">Browse products</Link>
              </div>
            ) : (
              <div className="customer-orders-table-wrap">
                <table className="customer-orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr key={order.orderNumber || `order-${index}`}>
                        <td>#{order.orderNumber || `KM${index + 1}`}</td>
                        <td>{formatDate(order.date)}</td>
                        <td><span className={`customer-status ${getStatus(order)}`}>{getStatus(order)}</span></td>
                        <td>{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="customer-panel order-status-panel">
            <div className="customer-panel-heading">
              <div><span>Live overview</span><h2>Order status</h2></div>
            </div>
            <div className="customer-status-list">
              {[
                ['confirmed', 'Confirmed'],
                ['packed', 'Packed'],
                ['shipped', 'Shipped'],
                ['delivered', 'Delivered']
              ].map(([key, label]) => (
                <div className="customer-status-row" key={key}>
                  <span className={`customer-status-dot ${key}`} />
                  <span>{label}</span>
                  <strong>{statusCounts[key] || 0}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="customer-panel recommendations-panel">
            <div className="customer-panel-heading">
              <div><span>Fresh this week</span><h2>Recommended products</h2></div>
              <Link to="/customer-marketplace">Explore <ArrowRight size={15} /></Link>
            </div>
            {productsLoading ? (
              <div className="customer-products-loading" role="status">Loading recommendations...</div>
            ) : productsError ? (
              <div className="customer-products-error" role="alert">
                <p>{productsError}</p>
                <Link to="/customer-marketplace">Open marketplace</Link>
              </div>
            ) : products.length === 0 ? (
              <div className="customer-empty-products">No products are available right now.</div>
            ) : (
              <div className="customer-product-grid">
                {products.map(product => (
                  <Link className="customer-product-card" to="/customer-marketplace" key={product.id}>
                    <img src={product.image} alt={product.name} onError={event => { event.currentTarget.src = '/logo192.png'; }} />
                    <div>
                      <span>{product.location || 'Farm fresh'}</span>
                      <h3>{product.name}</h3>
                      <strong>{formatCurrency(product.price)} <small>/ {product.unit}</small></strong>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <article className="customer-panel shopping-insights-panel">
            <div className="customer-panel-heading">
              <div><span>At a glance</span><h2>Shopping insights</h2></div>
            </div>
            <div className="customer-insight-grid">
              <div>
                <span>Total spent</span>
                <strong>{formatCurrency(totals.totalSpent)}</strong>
              </div>
              <div>
                <span>Items in cart</span>
                <strong>{cart.length}</strong>
              </div>
              <div>
                <span>Favorites</span>
                <strong>{favoritesCount}</strong>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
};

export default CustomerDashboard;
