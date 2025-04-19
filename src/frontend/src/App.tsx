import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import TodayView from './components/TodayView';
import WardrobeList from './components/WardrobeList';
import HistoryLog from './components/HistoryLog';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import AddClothingModal from './components/AddClothingModal';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddItem = async (item: any) => {
    // Handle adding the item
    setIsAddModalOpen(false);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Router>
            <Layout>
              <Routes>
                <Route path="/login" element={<AuthForm />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <div className="container mx-auto px-4 py-8">
                        <WardrobeList onAddItem={() => setIsAddModalOpen(true)} />
                        <AddClothingModal
                          isOpen={isAddModalOpen}
                          onClose={() => setIsAddModalOpen(false)}
                          onAdd={handleAddItem}
                        />
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/today"
                  element={
                    <PrivateRoute>
                      <div className="container mx-auto px-4 py-8">
                        <TodayView />
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <PrivateRoute>
                      <div className="container mx-auto px-4 py-8">
                        <HistoryLog />
                      </div>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Layout>
          </Router>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
