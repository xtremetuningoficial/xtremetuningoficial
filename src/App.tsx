import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Layout } from './routes/Layout'
import Home from './routes/Home'
import ProductDetail from './routes/ProductDetail'
import Cart from './routes/Cart'
import AdminLogin from './routes/admin/Login'
import { RequireAuth } from './routes/admin/RequireAuth'
import { AdminLayout } from './routes/admin/AdminLayout'
import AdminDashboard from './routes/admin/Dashboard'
import AdminProductForm from './routes/admin/ProductForm'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/categoria/:categorySlug" element={<Home />} />
              <Route path="/producto/:slug" element={<ProductDetail />} />
              <Route path="/carrito" element={<Cart />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<RequireAuth />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="productos/nuevo" element={<AdminProductForm />} />
                <Route path="productos/:id" element={<AdminProductForm />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
