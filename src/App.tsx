import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import ClearanceSignup from './pages/ClearanceSignup'
import Home from './pages/Home'
import Cycles from './pages/Cycles'
import Products from './pages/Products'
import SocialAutopilot from './pages/SocialAutopilot'
import Analytics from './pages/Analytics'
import Team from './pages/Team'
import Billing from './pages/Billing'
import AdminSettings from './pages/AdminSettings'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import StoreLayout from './components/StoreLayout'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import TrackOrder from './pages/TrackOrder'
import SellerOrders from './pages/SellerOrders'
import DesignStudio from './pages/DesignStudio'
import CampaignBuilder from './pages/CampaignBuilder'
import Pipeline from './pages/Pipeline'
import Checklist from './pages/Checklist'
import HealthPanel from './pages/HealthPanel'
import AgentHub from './pages/AgentHub'

export default function App() {
  return (
    <Routes>
      {/* Public landing + store */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/clearance" element={<ClearanceSignup />} />
      <Route path="/login" element={<Login />} />

      {/* Store */}
      <Route element={<StoreLayout />}>
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/product/:id" element={<ProductDetail />} />
        <Route path="/shop/cart" element={<Cart />} />
        <Route path="/shop/checkout" element={<Checkout />} />
        <Route path="/shop/order-success" element={<OrderSuccess />} />
        <Route path="/shop/track" element={<TrackOrder />} />
        <Route path="/shop/collections/:slug" element={<Shop />} />
      </Route>

      {/* App Dashboard */}
      <Route path="/app" element={<Home />} />
      <Route path="/app/cycles" element={<Cycles />} />
      <Route path="/app/products" element={<Products />} />
      <Route path="/app/marketing" element={<SocialAutopilot />} />
      <Route path="/app/analytics" element={<Analytics />} />
      <Route path="/app/team" element={<Team />} />
      <Route path="/app/billing" element={<Billing />} />
      <Route path="/app/admin" element={<AdminSettings />} />
      <Route path="/app/orders" element={<SellerOrders />} />
      <Route path="/app/design-studio" element={<DesignStudio />} />
      <Route path="/app/campaigns" element={<CampaignBuilder />} />
      <Route path="/app/pipeline" element={<Pipeline />} />
      <Route path="/app/checklist" element={<Checklist />} />
      <Route path="/app/health" element={<HealthPanel />} />
      <Route path="/app/agents" element={<AgentHub />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
