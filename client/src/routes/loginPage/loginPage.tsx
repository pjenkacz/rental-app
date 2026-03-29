// loginPage.tsx
import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import './loginPage.scss';

const LoginPage: React.FC = () => {
  return (
    <div className="loginPage">
      <div className="loginContainer">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
};

export default LoginPage;