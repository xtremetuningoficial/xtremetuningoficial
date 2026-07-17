import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Layout } from './routes/Layout'
import Home from './routes/Home'
import ProductDetail from './routes/ProductDetail'
import Cart from './routes/Cart'

// El panel /admin nunca lo visita un comprador — se separa en su propio chunk
// para no hacerle pagar ese peso a quien solo viene a ver el catálogo.
const AdminLogin = lazy(() => import('./routes/admin/Login'))
const RequireAuth = lazy(() =>
  import('./routes/admin/RequireAuth').then((m) => ({ default: m.RequireAuth })),
)
const AdminLayout = lazy(() =>
  import('./routes/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboard = lazy(() => import('./routes/admin/Dashboard'))
const AdminProductForm = lazy(() => import('./routes/admin/ProductForm'))
const AdminCategories = lazy(() => import('./routes/admin/Categories'))
const AdminReviews = lazy(() => import('./routes/admin/Reviews'))

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900">
      <p className="font-mono text-sm text-white/50">Cargando...</p>
    </div>
  )
}

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

            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              element={
                <Suspense fallback={<AdminFallback />}>
                  <RequireAuth />
                </Suspense>
              }
            >
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminLayout />
                  </Suspense>
                }
              >
                <Route
                  index
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminDashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="productos/nuevo"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminProductForm />
                    </Suspense>
                  }
                />
                <Route
                  path="productos/:id"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminProductForm />
                    </Suspense>
                  }
                />
                <Route
                  path="categorias"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminCategories />
                    </Suspense>
                  }
                />
                <Route
                  path="resenas"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminReviews />
                    </Suspense>
                  }
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
