import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ContentListPage from './pages/Content/ContentListPage';
import ContentDetailPage from './pages/Content/ContentDetailPage';
import LearningPathsPage from './pages/Education/LearningPathsPage';
import DiscussionsPage from './pages/Community/DiscussionsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';
import { checkAuth } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Content Routes */}
          <Route path="content">
            <Route index element={<ContentListPage />} />
            <Route path=":slug" element={<ContentDetailPage />} />
          </Route>

          {/* Education Routes */}
          <Route path="learning-paths">
            <Route index element={<LearningPathsPage />} />
            <Route path=":id" element={<LearningPathsPage />} />
          </Route>

          {/* Community Routes */}
          <Route path="discussions">
            <Route index element={<DiscussionsPage />} />
            <Route path=":id" element={<DiscussionsPage />} />
          </Route>

          {/* Protected Routes */}
          <Route path="profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />

          <Route path="dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
