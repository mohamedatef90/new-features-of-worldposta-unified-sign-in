import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, Button } from '@/components/ui';

export const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <AuthLayout formTitle="Verify Your Email" formSubtitle="One last step to secure your account." isLoginPage={false}>
            <div className="text-center space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                    A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.
                </p>
                <Button onClick={() => navigate('/login')} fullWidth size="lg">
                    Continue to Login
                </Button>
                <button className="text-sm text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
                    Didn't receive email? Resend verification
                </button>
            </div>
        </AuthLayout>
    );
};
