import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  loginUser: (user: any, token: string) => void;
  logoutUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Issue request with token to verify signature, expiration, and user validity
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.data?.user) {
            setUser(data.data.user);
            setToken(storedToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
          } else {
            logoutUser();
          }
        } else {
          // Token expired or invalid on server
          logoutUser();
        }
      } catch (err) {
        // Server unreachable or network error, fallback to storedUser if available
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          logoutUser();
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const loginUser = (userData: any, userToken: string) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};