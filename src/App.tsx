import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './routes/Layout'
import Home from './routes/Home'
import ProductDetail from './routes/ProductDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categoria/:categorySlug" element={<Home />} />
          <Route path="/producto/:slug" element={<ProductDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
