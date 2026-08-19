import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AuthModal } from './AuthModal';

const AuthModalContext = createContext(undefined);

export function AuthModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);

  const openAuthModal = useCallback((onSuccess) => {
    if (onSuccess) setOnSuccessCallback(() => onSuccess);
    else setOnSuccessCallback(null);
    setOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setOpen(false);
    setOnSuccessCallback(null);
  }, []);

  const handleSuccess = useCallback(() => {
    onSuccessCallback?.();
    closeAuthModal();
  }, [onSuccessCallback, closeAuthModal]);

  const value = useMemo(() => ({ openAuthModal, closeAuthModal }), [openAuthModal, closeAuthModal]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeAuthModal();
        }}
        onSuccess={handleSuccess}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    return {
      openAuthModal: () => {},
      closeAuthModal: () => {},
    };
  }
  return context;
}

export default AuthModalContext;
