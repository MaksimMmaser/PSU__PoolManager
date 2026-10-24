import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Components/Sidebar';
import { Navbar } from './Components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ClientsPage } from './pages/ClientsPage';
import { ServicesPage } from './pages/ServicesPage';
import { SchedulePage } from './pages/SchedulePage';
import { LoginPage } from './pages/LoginPage';
import { TransactionProvider } from './context/TransactionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NewTransactionModal } from './Components/NewTransactionModal';
import { ProfileModal } from './Components/ProfileModal';

function AppContent() {
  const { user } = useAuth();

  // Если не авторизован — показываем красивый экран логина
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-3.5 sm:p-5 md:p-8 pb-20 sm:pb-24 md:pb-8 max-w-[1600px] w-full mx-auto min-w-0">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
          </Routes>
        </main>
      </div>

      <NewTransactionModal />
      <ProfileModal />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <AppContent />
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;