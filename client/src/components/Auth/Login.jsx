import { useState } from 'react';
import { getGoogleLoginUrl } from '../../services/auth';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = getGoogleLoginUrl();
  };
  
  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Calendar Call Alert</h1>
          <p className="text-gray-600 mt-2">
            Get phone call reminders for your Google Calendar events
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
            <p className="font-medium">How it works:</p>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>Login with your Google account</li>
              <li>Allow access to your Google Calendar</li>
              <li>Enter your phone number for call alerts</li>
              <li>Receive call reminders before your events</li>
            </ol>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            <span className="font-medium">
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </span>
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to allow Calendar Call Alert to access your Google Calendar data
            and make automated calls to your provided phone number.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;