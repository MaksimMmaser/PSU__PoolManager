import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Components/Sidebar';
import { Navbar } from './Components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ClientsPage } from './pages/ClientsPage';
import { ServicesPage } from './pages/ServicesPage';
import { TransactionProvider } from './context/TransactionContext';
import { NewTransactionModal } from './Components/NewTransactionModal';
import { SchedulePage } from './pages/SchedulePage';

function App() {
  return (
    <TransactionProvider>
      <div className="flex min-h-screen bg-[#f1f5f9] text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
        {/* Адаптивное меню: слева на десктопе / снизу на мобилках */}
        <Sidebar />

        {/* Основная область контента */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Верхняя шапка */}
          <Navbar />

          {/* Рабочая зона с адаптивными отступами */}
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

        {/* Адаптивное модальное окно добавления транзакции */}
        <NewTransactionModal />
      </div>
    </TransactionProvider>
  );
}

export default App;