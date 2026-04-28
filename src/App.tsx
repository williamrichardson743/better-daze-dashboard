import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import Cycles from './pages/Cycles'
import Products from './pages/Products'
import Marketing from './pages/Marketing'
import Analytics from './pages/Analytics'
import Team from './pages/Team'
import Billing from './pages/Billing'
import AdminSettings from './pages/AdminSettings'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Home />} />
      <Route path="/app/cycles" element={<Cycles />} />
      <Route path="/app/products" element={<Products />} />
      <Route path="/app/marketing" element={<Marketing />} />
      <Route path="/app/analytics" element={<Analytics />} />
      <Route path="/app/team" element={<Team />} />
      <Route path="/app/billing" element={<Billing />} />
      <Route path="/app/admin" element={<AdminSettings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
