import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from './components/Layout';
import { checkAuth } from './store/slices/authSlice';

// Pages
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ContentListPage from './pages/Content/ContentListPage';
import ContentDetailPage from './pages/Content/ContentDetailPage';
import LearningPathsPage from './pages/Learning/LearningPathsPage';
import DiscussionsPage from './pages/Discussion/DiscussionsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import DashboardPage from './pages/Profile/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication on app load
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Content Routes */}
        <Route path="content">
          <Route index element={<ContentListPage />} />
          <Route path=":id" element={<ContentDetailPage />} />
        </Route>

        {/* Learning Routes */}
        <Route path="learning-paths">
          <Route index element={<LearningPathsPage />} />
        </Route>

        {/* Discussion Routes */}
        <Route path="discussions">
          <Route index element={<DiscussionsPage />} />
        </Route>

        {/* Profile Routes */}
        <Route path="profile/:userId?" element={<ProfilePage />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
