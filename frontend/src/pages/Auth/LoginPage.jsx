import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import { selectIsLoading, selectError, selectIsAuthenticated } from '../../store/slices/authSlice';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import Card from '../../components/Common/Card';
import Alert from '../../components/Common/Alert';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Local state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts or when user starts editing
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!password.trim()) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Dispatch login action
    const result = await dispatch(
      login({
        email: email.trim(),
        password,
      })
    );

    // Redirect on successful login
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  // Handle input change and clear validation error
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors((prev) => ({
        ...prev,
        email: '',
      }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors((prev) => ({
        ...prev,
        password: '',
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8 rtl">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            منصة المعرفة
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            تسجيل الدخول إلى حسابك
          </p>
        </div>

        {/* Login Card */}
        <Card padding="lg" className="shadow-lg">
          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              title="خطأ في تسجيل الدخول"
              onClose={() => dispatch(clearError())}
              className="mb-6"
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={handleEmailChange}
                error={validationErrors.email}
                required
                fullWidth
                disabled={isLoading}
                dir="rtl"
              />
            </div>

            {/* Password Field */}
            <div>
              <Input
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={handlePasswordChange}
                error={validationErrors.password}
                required
                fullWidth
                disabled={isLoading}
                dir="rtl"
              />
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="showPassword"
                className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                إظهار كلمة المرور
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              className="mt-6"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-3 text-sm text-gray-500 dark:text-gray-400">أو</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Footer Links */}
          <div className="space-y-3">
            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
              >
                هل نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ليس لديك حساب؟{' '}
              </span>
              <Link
                to="/register"
                className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>هذه المنصة محمية وآمنة</p>
          <p>
            باستخدام حسابك فإنك توافق على{' '}
            <Link
              to="/terms"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              شروط الاستخدام
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
