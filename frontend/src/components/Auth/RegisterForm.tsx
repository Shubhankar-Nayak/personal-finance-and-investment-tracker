import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { register as registerAction } from '../../store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, User, TrendingUp } from 'lucide-react';
import { registerUser } from '../../api/auth'; 
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios'


interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.auth);
  const { darkMode } = useAppSelector(state => state.ui);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [otp, setOtp] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [hash, setHash] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await axios.post('/api/auth/send-otp', {
        email: data.email,
      });
      setUserName(data.name);
      setUserEmail(data.email);
      setUserPassword(data.password);
      setHash(response.data.hash);
      setEmailForVerification(data.email);
      setStep('verify');
    } catch (error: any) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const { user, token } = await registerUser({
        name: userName,
        email: userEmail,
        password: userPassword,
        otp,
        hash,
      });
      dispatch(registerAction({ user, token }));
    } catch (error: any) {
      alert(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Create your account
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join us to start tracking your finances
          </p>
        </div>

        {step === 'register' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className={`
                    appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg
                    placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    ${errors.name ? 'border-red-500' : ''}
                  `}
                  placeholder="Full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  type="email"
                  className={`
                    appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg
                    placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    ${errors.email ? 'border-red-500' : ''}
                  `}
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`
                    appearance-none relative block w-full pl-10 pr-10 py-3 border rounded-lg
                    placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    ${errors.password ? 'border-red-500' : ''}
                  `}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`
                    appearance-none relative block w-full pl-10 pr-10 py-3 border rounded-lg
                    placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    ${errors.confirmPassword ? 'border-red-500' : ''}
                  `}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="w-full flex items-center justify-center my-4">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="mx-2 text-gray-500 text-sm">or</span>
              <div className="border-t border-gray-300 w-full"></div>
            </div>

            <GoogleLogin
              onSuccess={async credentialResponse => {
                try {
                  const { data } = await axios.post('/api/auth/google', {
                    credential: credentialResponse.credential,
                  });

                  dispatch(registerAction({
                    user: data,
                    token: data.token,
                  }));
                } catch (err) {
                  console.error('Google login failed', err);
                  alert('Google login failed');
                }
              }}
              onError={() => {
                console.error('Google Login Failed');
                alert('Google Login Failed');
              }}
            />
          </div>

          <div className="text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
        ) : (
          <div className="mt-8 space-y-4">
            <p className={`text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Enter the OTP sent to <strong>{emailForVerification}</strong>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              className={`
                block w-full p-3 rounded-lg border
                ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}
              `}
              placeholder="Enter OTP"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Verify OTP
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default RegisterForm;