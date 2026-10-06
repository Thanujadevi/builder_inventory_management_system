import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('portal_active_role') || 'BUILDER';
  });

  useEffect(() => {
    localStorage.setItem('portal_active_role', role);
  }, [role]);

  const toggleRole = () => {
    setRole(prev => (prev === 'BUILDER' ? 'SUPPLIER' : 'BUILDER'));
  };

  const activeUserInfo = role === 'BUILDER' ? {
    name: "Vikram Malhotra",
    title: "Chief Site Procurement Head",
    organization: "BuildCorp Infrastructure Ltd.",
    badge: "Builder Admin",
    avatarColor: "bg-amber-500 text-slate-950"
  } : {
    name: "Rahul Verma",
    title: "Regional B2B Sales Manager",
    organization: "Apex & Multi-Supplier Network",
    badge: "Supplier Sales Manager",
    avatarColor: "bg-blue-600 text-white"
  };

  return (
    <RoleContext.Provider value={{ role, setRole, toggleRole, activeUserInfo }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
