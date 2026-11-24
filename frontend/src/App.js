import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import { Web3Provider } from './contexts/Web3Context';
import Home from './pages/Home/home';
import Dash from './pages/dashboard/dash.jsx';
import About from './pages/about/About.jsx';
import GovtSchemes from './pages/govt/govtS.jsx';
import Login from './pages/login/login.jsx';
import OTPLogin from './pages/login/OTPLogin.jsx';
import SignUp from './pages/signup/sign.jsx';
import Profile from './pages/profile';
import Settings from './pages/settings/Settings.jsx';
import ADOFinder from './pages/contacts/ADOFinder.jsx';
import Ecommerce from './pages/shopping/ecommerce.jsx';
import CustomerMarketplace from './pages/shopping/CustomerMarketplace.jsx';
import MyOrders from './pages/shopping/MyOrders.jsx';
import Cart from './pages/shopping/Cart.jsx';
import Favorites from './pages/shopping/Favorites.jsx';
import Checkout from './pages/shopping/Checkout.jsx';
import SellProducts from './pages/shopping/SellProducts.jsx';
import MarketPriceDashboard from './pages/market&loan/ml.jsx';
import AgriContractForm from './pages/agrifarm/agrifarm.jsx';
import ContractAdmin from './pages/agrifarm/ContractAdmin.jsx';
import KhetiSaath from './pages/khetisaath/KhetiSaath.jsx';
import KhetiSaathFavorites from './pages/khetisaath/KhetiSaathFavorites.jsx';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import RoleRoute from './components/RoleRoute/RoleRoute';
import './i18n/i18n'; // Initialize i18n

// Layout component that includes Navbar
function Layout() {
  return (
    <div className="App">
      <Navbar />
      <Outlet />
    </div>
  );
}

// Create router using the new v7 API
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "home",
        element: <Home />
      },
      {
        path: "dashboard",
        element: <RoleRoute allowedRoles={['farmer', 'customer']}><Dash /></RoleRoute>
      },
      {
        path: "market-prices",
        element: <MarketPriceDashboard />
      },
      {
        path: "marketplace",
        element: <RoleRoute allowedRoles={['farmer']}><Ecommerce /></RoleRoute>
      },
      {
        path: "customer-marketplace",
        element: <CustomerMarketplace />
      },
      {
        path: "my-orders",
        element: <ProtectedRoute><MyOrders /></ProtectedRoute>
      },
      {
        path: "cart",
        element: <ProtectedRoute><Cart /></ProtectedRoute>
      },
      {
        path: "favorites",
        element: <ProtectedRoute><Favorites /></ProtectedRoute>
      },
      {
        path: "checkout",
        element: <ProtectedRoute><Checkout /></ProtectedRoute>
      },
      {
        path: "sell-products",
        element: <RoleRoute allowedRoles={['farmer']}><SellProducts /></RoleRoute>
      },
      {
        path: "agrifarm",
        element: <RoleRoute allowedRoles={['farmer']}><AgriContractForm /></RoleRoute>
      },
      {
        path: "contract-admin",
        element: <RoleRoute allowedRoles={['farmer']}><ContractAdmin /></RoleRoute>
      },
      {
        path: "kheti-saath",
        element: <RoleRoute allowedRoles={['farmer']}><KhetiSaath /></RoleRoute>
      },
      {
        path: "kheti-saath/favorites",
        element: <RoleRoute allowedRoles={['farmer']}><KhetiSaathFavorites /></RoleRoute>
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "government-schemes",
        element: <RoleRoute allowedRoles={['farmer']}><GovtSchemes /></RoleRoute>
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "otp-login",
        element: <OTPLogin />
      },
      {
        path: "signup",
        element: <SignUp />
      },
      {
        path: "profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: "settings",
        element: <ProtectedRoute><Settings /></ProtectedRoute>
      },
      {
        path: "contacts",
        element: <RoleRoute allowedRoles={['farmer']}><ADOFinder /></RoleRoute>
      },
      {
        path: "*",
        element: (
          <div className="error-page">
            <div className="error-content">
              <h1>🌾 Oops! Page Not Found</h1>
              <p>The page you're looking for doesn't exist or has been moved.</p>
              <div className="error-actions">
                <Link to="/" className="btn btn-primary">🏠 Go Home</Link>
                <Link to="/kheti-saath" className="btn btn-secondary">🌾 Visit KisanGuide</Link>
              </div>
            </div>
          </div>
        )
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <MarketplaceProvider>
          <RouterProvider router={router} />
        </MarketplaceProvider>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;