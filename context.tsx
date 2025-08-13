





import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthContextType } from '@/types';
import { MOCK_USERS } from '@/data';
import { Icon } from '@/components/ui';

// --- Auth Context ---
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('worldpostaUser');
        if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, pass: string, redirectPath?: string): Promise<void> => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const foundUser = MOCK_USERS[email.toLowerCase()];

            let expectedPassword = "";
            if (foundUser?.role === 'customer') expectedPassword = "password";
            else if (foundUser?.role === 'admin') expectedPassword = "password_admin";
            else if (foundUser?.role === 'reseller') expectedPassword = "password_reseller";
            
            const isPasswordCorrect = (pass === expectedPassword);

            if (foundUser && isPasswordCorrect) {
                const { passwordHash, ...userData } = foundUser;
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('worldpostaUser', JSON.stringify(userData));
                
                if (redirectPath) {
                    navigate(redirectPath);
                } else {
                    const role = userData.role;
                    if (role === 'admin') navigate('/app/admin-dashboard');
                    else if (role === 'reseller') navigate('/app/reseller-dashboard');
                    else navigate('/app/dashboard');
                }
            } else {
                throw new Error("Invalid account name or password.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const signup = useCallback(async (details: Omit<User, 'id' | 'avatarUrl' | 'displayName' | 'phoneNumber' | 'role' | 'teamManagerId' | 'assignedGroupId' | 'status' | 'creationDate' | 'mfaEnabled' | 'country' | 'isTrial'> & {password: string}) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (MOCK_USERS[details.email.toLowerCase()]) {
        alert("User with this email already exists.");
        setIsLoading(false);
        return;
        }
        const newUser: User = {
        id: `user${Date.now()}`,
        fullName: details.fullName,
        email: details.email,
        companyName: details.companyName,
        role: 'customer',
        status: 'active',
        avatarUrl: `https://picsum.photos/seed/newUser${Date.now()}/100/100`,
        creationDate: new Date().toISOString(),
        country: 'US',
        isTrial: true,
        };
        MOCK_USERS[details.email.toLowerCase()] = { ...newUser, passwordHash: `hashed${details.password}` };
        
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('worldpostaUser', JSON.stringify(newUser));
        navigate('/email-verification'); 
        setIsLoading(false);
    }, [navigate]);

    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('worldpostaUser');
        navigate('/login');
    }, [navigate]);

    const updateProfile = useCallback(async (details: Partial<Pick<User, 'fullName' | 'companyName' | 'displayName' | 'phoneNumber' | 'avatarUrl'>>) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (user) {
        const updatedUser = { ...user, ...details };
        setUser(updatedUser);
        localStorage.setItem('worldpostaUser', JSON.stringify(updatedUser));
        MOCK_USERS[user.email.toLowerCase()] = { ...MOCK_USERS[user.email.toLowerCase()], ...updatedUser };
        alert("Profile updated successfully!");
        }
        setIsLoading(false);
    }, [user]);

    const changePassword = useCallback(async (oldPass: string, newPass: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let currentExpectedOldPass = "password";
         if (user?.role === 'admin') currentExpectedOldPass = "password_admin";
         else if (user?.role === 'reseller') currentExpectedOldPass = "password_reseller";

        if (user && oldPass === currentExpectedOldPass) { 
        MOCK_USERS[user.email.toLowerCase()].passwordHash = `hashed${newPass}`;
        alert("Password changed successfully!");
        } else {
        alert("Failed to change password. Old password incorrect.");
        }
        setIsLoading(false);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signup, logout, updateProfile, changePassword }}>
        {children}
        </AuthContext.Provider>
    );
};

// --- Theme Context ---
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  ThemeIconComponent: React.FC<{className?: string}>; 
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const storedTheme = localStorage.getItem('worldpostaTheme') as 'light' | 'dark' | null;
        return storedTheme || 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        } else {
        document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('worldpostaTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    
    const ThemeIconComponent: React.FC<{className?: string}> = ({className}) => {
        const iconName = theme === 'light' ? "fas fa-moon" : "fas fa-sun";
        return <Icon name={iconName} className={className} />;
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, ThemeIconComponent }}>
        {children}
        </ThemeContext.Provider>
    );
};

// --- App Layout Context ---
interface AppLayoutContextType {
    setSearchPanelOpen: (isOpen: boolean) => void;
}
export const AppLayoutContext = createContext<AppLayoutContextType | null>(null);
export const useAppLayout = () => {
    const context = useContext(AppLayoutContext);
    if (!context) {
        throw new Error("useAppLayout must be used within AppLayout");
    }
    return context;
};