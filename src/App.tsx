import { Routes, Route } from 'react-router'
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
      <Route path="/" element={<Home />} />
      <Route path="/cycles" element={<Cycles />} />
      <Route path="/products" element={<Products />} />
      <Route path="/marketing" element={<Marketing />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/team" element={<Team />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/admin" element={<AdminSettings />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}