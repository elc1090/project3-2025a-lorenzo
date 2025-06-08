// providers/AuthProvider.tsx

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import useFirebaseAuth from "../lib/useFirebaseAuth";
// O import de GoogleAuthProvider aqui não é estritamente necessário neste arquivo,
// pois a instância e o uso estão dentro do useFirebaseAuth,
// mas mantê-lo não prejudica. Vou deixar comentado para clareza, mas sinta-se à vontade para remover.
// import { GoogleAuthProvider } from "firebase/auth";

// Tipagem do usuário (mantenha consistente com o useFirebaseAuth)
type AuthUser = {
  uid: string;
  email: string | null;
  // Adicione outras propriedades se formatou elas no useFirebaseAuth
};

// Interface que define o formato do objeto de contexto
interface AuthContextType {
  authUser: AuthUser | null;
  loading: boolean;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<any>; // Pode refinar para Promise<UserCredential> se quiser
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<any>; // Pode refinar para Promise<UserCredential> se quiser
  signOut: () => Promise<void>;
  // === NOVO: Adicione a função para o Google Sign-In ===
  signInWithGoogle: () => Promise<any>; // A Promise<any> pode ser refinada para Promise<UserCredential>
}

// Objeto de contexto padrão/inicial
const defaultContext: AuthContextType = {
  authUser: null,
  loading: true,
  // Placeholder functions - boas para evitar erros se o contexto for usado fora do provider
  signInWithEmailAndPassword: async () => { throw new Error("signInWithEmailAndPassword not implemented"); },
  createUserWithEmailAndPassword: async () => { throw new Error("createUserWithEmailAndPassword not implemented"); },
  signOut: async () => { throw new Error("signOut not implemented"); },
  // === NOVO: Adicione um placeholder para a função Google ===
  signInWithGoogle: async () => { throw new Error("signInWithGoogle not implemented"); },
};

// Cria o contexto
const AuthUserContext = createContext<AuthContextType>(defaultContext);

// Componente provedor que envolve a aplicação
export function AuthUserProvider({ children }: { children: ReactNode }) {
  // Pega os valores e funções do seu custom hook
  const {
    authUser,
    loading,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithGoogle, // <--- NOVO: Pegue a função de signIn com Google aqui
  } = useFirebaseAuth(); // O hook agora retorna essa função

  return (
    // Passa todos os valores e funções relevantes para o Provider
    <AuthUserContext.Provider
      value={{
        authUser,
        loading,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        signOut,
        signInWithGoogle, // <--- NOVO: Passe a função para o value do contexto
      }}
    >
      {children}
    </AuthUserContext.Provider>
  );
}

// Custom hook para consumir o contexto facilmente em outros componentes
export const useAuth = () => useContext(AuthUserContext);
