// registerPage.tsx
import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import './registerPage.scss';

const RegisterPage: React.FC = () => {
  return (
    <div className="registerPage">
      <div className="registerContainer">
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
};

export default RegisterPage;