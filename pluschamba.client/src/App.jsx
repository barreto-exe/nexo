// =============================================================================
// App Component - Routing Principal
// =============================================================================
import { useAuth } from './contexts/useAuth';
import LoginPage from './components/Auth/LoginPage';
import AppLayout from './components/Layout/AppLayout';
import LoadingScreen from './components/common/LoadingScreen';
import Dashboard from './pages/Dashboard';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Usuario autenticado - mostrar la aplicación principal
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

export default App;