import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import { selectIsLoading, selectError, selectIsAuthenticated } from '../../store/slices/authSlice';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import Card from '../../components/Common/Card';
import Alert from '../../components/Common/Alert';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Local state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Full Name validation
    if (!fullName.trim()) {
      errors.fullName = 'الاسم الكامل مطلوب';
    } else if (fullName.trim().length < 3) {
      errors.fullName = 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل';
    } else if (fullName.trim().length > 100) {
      errors.fullName = 'الاسم الكامل لا يجب أن يتجاوز 100 حرف';
    }

    // Username validation
    if (!username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
    } else if (username.trim().length < 3) {
      errors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    } else if (username.trim().length > 50) {
      errors.username = 'اسم المستخدم لا يجب أن يتجاوز 50 حرف';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username = 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام و underscore و dash فقط';
    }

    // Email validation
    if (!email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }

    // Password validation
    if (!password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    } else if (password.length > 100) {
      errors.password = 'كلمة المرور لا يجب أن تتجاوز 100 حرف';
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = 'كلمة المرور يجب أن تحتوي على أحرف صغيرة على الأقل';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = 'كلمة المرور يجب أن تحتوي على أحرف كبيرة على الأقل';
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = 'كلمة المرور يجب أن تحتوي على أرقام على الأقل';
    }

    // Password Confirmation validation
    if (!passwordConfirmation) {
      errors.passwordConfirmation = 'تأكيد كلمة المرور مطلوب';
    } else if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'كلمات المرور غير متطابقة';
    }

    // Terms validation
    if (!agreeTerms) {
      errors.agreeTerms = 'يجب أن توافق على شروط الاستخدام';
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

    // Dispatch register action
    const result = await dispatch(
      register({
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        agree_terms: agreeTerms,
      })
    );

    // Redirect on successful registration
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  // Handle input change and clear validation error
  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
    if (validationErrors.fullName) {
      setValidationErrors((prev) => ({
        ...prev,
        fullName: '',
      }));
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (validationErrors.username) {
      setValidationErrors((prev) => ({
        ...prev,
        username: '',
      }));
    }
  };

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

  const handlePasswordConfirmationChange = (e) => {
    setPasswordConfirmation(e.target.value);
    if (validationErrors.passwordConfirmation) {
      setValidationErrors((prev) => ({
        ...prev,
        passwordConfirmation: '',
      }));
    }
  };

  const handleAgreeTermsChange = (e) => {
    setAgreeTerms(e.target.checked);
    if (validationErrors.agreeTerms) {
      setValidationErrors((prev) => ({
        ...prev,
        agreeTerms: '',
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
            إنشاء حساب جديد
          </p>
        </div>

        {/* Register Card */}
        <Card padding="lg" className="shadow-lg">
          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              title="خطأ في التسجيل"
              onClose={() => dispatch(clearError())}
              className="mb-6"
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <Input
                label="الاسم الكامل"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={fullName}
                onChange={handleFullNameChange}
                error={validationErrors.fullName}
                required
                fullWidth
                disabled={isLoading}
                dir="rtl"
              />
            </div>

            {/* Username Field */}
            <div>
              <Input
                label="اسم المستخدم"
                type="text"
                placeholder="اختر اسم مستخدم"
                value={username}
                onChange={handleUsernameChange}
                error={validationErrors.username}
                helperText="أحرف وأرقام و underscore و dash فقط"
                required
                fullWidth
                disabled={isLoading}
                dir="rtl"
              />
            </div>

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
                placeholder="أدخل كلمة مرور قوية"
                value={password}
                onChange={handlePasswordChange}
                error={validationErrors.password}
                helperText="على الأقل 6 أحرف تحتوي على أحرف صغيرة وكبيرة وأرقام"
                required
                fullWidth
                disabled={isLoading}
                dir="rtl"
              />
            </div>

            {/* Password Confirmation Field */}
            <div>
              <Input
                label="تأكيد كلمة المرور"
                type={showPasswordConfirmation ? 'text' : 'password'}
                placeholder="أعد إدخال كلمة المرور"
                value={passwordConfirmation}
                onChange={handlePasswordConfirmationChange}
                error={validationErrors.passwordConfirmation}
                required
                fullWidth
                disabled={isLoading}
                dir="rtl"
              />
            </div>

            {/* Show Password Toggles */}
            <div className="space-y-3">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPasswordConfirmation"
                  checked={showPasswordConfirmation}
                  onChange={(e) => setShowPasswordConfirmation(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="showPasswordConfirmation"
                  className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  إظهار التأكيد
                </label>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={handleAgreeTermsChange}
                  disabled={isLoading}
                  className="w-4 h-4 mt-1 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-600 dark:border-gray-500"
                />
                <label
                  htmlFor="agreeTerms"
                  className="mr-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  أوافق على{' '}
                  <Link
                    to="/terms"
                    className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                  >
                    شروط الاستخدام
                  </Link>
                  {' '}و{' '}
                  <Link
                    to="/privacy"
                    className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                  >
                    سياسة الخصوصية
                  </Link>
                </label>
              </div>
              {validationErrors.agreeTerms && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.agreeTerms}
                </p>
              )}
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
              {isLoading ? 'جاري التسجيل...' : 'إنشاء حساب جديد'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-3 text-sm text-gray-500 dark:text-gray-400">أو</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Footer Links */}
          <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              هل لديك حساب بالفعل؟{' '}
            </span>
            <Link
              to="/login"
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
            >
              تسجيل الدخول
            </Link>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>هذه المنصة محمية وآمنة</p>
          <p>
            سيتم إرسال بريد تأكيد على عنوانك الإلكتروني
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
