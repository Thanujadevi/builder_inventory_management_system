import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const registeredAccounts = [
  {
    id: "USR-B-101",
    name: "Vikram Malhotra",
    email: "builder@buildcorp.com",
    role: "BUILDER",
    title: "Chief Site Procurement Head",
    organization: "BuildCorp Infrastructure Ltd.",
    phone: "+91 98765 43210",
    gstin: "07AAACB9912E1ZB",
    address: "Plot 104, Cyber City, Gurgaon, HR - 122002",
    badge: "Builder Admin",
    avatarColor: "bg-amber-500 text-slate-950"
  },
  {
    id: "USR-S-201",
    name: "Rahul Verma",
    email: "supplier@apexsteel.com",
    role: "SUPPLIER",
    title: "Regional B2B Sales Manager",
    organization: "Apex Steel Mills & Multi-Supplier Hub",
    phone: "+91 98112 88776",
    gstin: "27AAACU9988G1Z2",
    address: "Industrial Area Phase 2, Mumbai, MH - 400015",
    badge: "Supplier Vendor",
    avatarColor: "bg-blue-600 text-white"
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('portal_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('portal_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('portal_auth_user');
    }
  }, [user]);

  const login = (emailOrUsername, password) => {
    setAuthError(null);
    const query = (emailOrUsername || '').toLowerCase().trim();

    if (!query) {
      setAuthError("Please enter your registered email or username.");
      return false;
    }

    let matchedUser = null;

    if (query.includes('supplier') || query === 'supplier@apexsteel.com') {
      matchedUser = registeredAccounts.find(a => a.role === 'SUPPLIER');
    } else if (query.includes('builder') || query === 'builder@buildcorp.com') {
      matchedUser = registeredAccounts.find(a => a.role === 'BUILDER');
    } else {
      matchedUser = registeredAccounts.find(a => a.email.toLowerCase() === query) || registeredAccounts[0];
    }

    setUser(matchedUser);
    return true;
  };

  const demoLogin = (role) => {
    setAuthError(null);
    const target = registeredAccounts.find(a => a.role === role);
    setUser(target);
    return target;
  };

  const updateProfile = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, demoLogin, logout, updateProfile, authError, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
