import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Components/Sidebar';
import { Navbar } from './Components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ClientsPage } from './pages/ClientsPage';
import { ServicesPage } from './pages/ServicesPage';
import { TransactionProvider } from './context/TransactionContext';
import { NewTransactionModal } from './Components/NewTransactionModal';

function App() {
  return (
    <TransactionProvider>
      <div className="flex min-h-screen bg-[#f1f5f9]">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />

          <main className="p-6 md:p-8 max-w-[1600px] w-full mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/services" element={<ServicesPage />} />
            </Routes>
          </main>
        </div>

        {/* Всплывающее окно добавления транзакции */}
        <NewTransactionModal />
      </div>
    </TransactionProvider>
  );
}

export default App;