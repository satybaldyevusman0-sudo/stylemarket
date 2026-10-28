import { lazy, Suspense } from 'react';
import { Routes, useLocation } from './lib/router.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import ScrollTopButton from './components/layout/ScrollTopButton.jsx';
import ChatBot from './components/ChatBot.jsx';
import Toasts from './components/ui/Toasts.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { PrivateRoute, AdminRoute } from './components/RouteGuards.jsx';
import { Spinner } from './components/ui/States.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import Plans from './pages/Plans.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Booking from './pages/Booking.jsx';
import Favorites from './pages/Favorites.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Contact from './pages/Contact.jsx';
import Rates from './pages/Rates.jsx';
import NotFound from './pages/NotFound.jsx';
import WhatsAppFab from './components/WhatsAppFab.jsx';

// Админ панели (recharts менен) өзүнчө жүктөлөт — башкы бет тезирээк ачылат
const Admin = lazy(() => import('./pages/Admin.jsx'));
const admin = <AdminRoute><Suspense fallback={<Spinner />}><Admin /></Suspense></AdminRoute>;

const routes = [
  { path: '/', element: <Home /> },
  { path: '/catalog', element: <Catalog /> },
  { path: '/catalog/:id', element: <ItemDetail /> },
  { path: '/plans', element: <Plans /> },
  { path: '/cart', element: <Cart /> },
  { path: '/checkout', element: <PrivateRoute><Checkout /></PrivateRoute> },
  { path: '/order/success', element: <PrivateRoute><OrderSuccess /></PrivateRoute> },
  { path: '/booking', element: <Booking /> },
  { path: '/favorites', element: <PrivateRoute><Favorites /></PrivateRoute> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/profile', element: <PrivateRoute><Profile /></PrivateRoute> },
  { path: '/contact', element: <Contact /> },
  { path: '/rates', element: <Rates /> },
  { path: '/admin', element: admin },
  { path: '/admin/:tab', element: admin },
  { path: '*', element: <NotFound /> }
];

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main">
        <ErrorBoundary resetKey={pathname}>
          <Routes routes={routes} />
        </ErrorBoundary>
      </main>
      <Footer />
      <ScrollTopButton />
      <WhatsAppFab />
      <ChatBot />
      <Toasts />
    </>
  );
}
