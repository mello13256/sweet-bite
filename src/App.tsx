import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CartProvider } from './context/CartContext'
import { CatalogProvider } from './context/CatalogContext'
import { ToastProvider } from './context/ToastContext'
import { UIProvider } from './context/UIContext'
import HomePage from './pages/HomePage'

// As restantes páginas são carregadas só quando necessárias.
const ShopPage = lazy(() => import('./pages/ShopPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const InfoPage = lazy(() => import('./pages/InfoPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CatalogProvider>
          <CartProvider>
            <UIProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="loja" element={<ShopPage />} />
                  <Route path="categorias" element={<CategoriesPage />} />
                  <Route path="produto/:slug" element={<ProductPage />} />
                  <Route path="carrinho" element={<CartPage />} />
                  <Route path="encomenda" element={<CheckoutPage />} />
                  <Route path="sobre" element={<AboutPage />} />
                  <Route path="contactos" element={<ContactPage />} />
                  <Route path="informacoes/:slug" element={<InfoPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </UIProvider>
          </CartProvider>
        </CatalogProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
