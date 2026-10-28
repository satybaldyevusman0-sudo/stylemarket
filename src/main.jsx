import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { RouterProvider } from './lib/router.jsx';
import { I18nProvider } from './context/I18nContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/admin.css';
import './styles/theme.css';
import site from './site.js';

// Сайттын түстөрү конфигурациядан алынат
const root = document.documentElement.style;
root.setProperty('--green', site.theme.primary);
root.setProperty('--green-600', site.theme.primaryDark);
root.setProperty('--green-900', site.theme.dark);
root.setProperty('--red', site.theme.accent);
document.title = site.name;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider>
        <I18nProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <FavoritesProvider>
                  <CartProvider>
                    <App />
                  </CartProvider>
                </FavoritesProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </I18nProvider>
      </RouterProvider>
    </ErrorBoundary>
  </StrictMode>
);
