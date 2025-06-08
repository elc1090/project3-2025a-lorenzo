// lib/useFirebaseAuth.ts

import { useState, useEffect } from "react";
import { auth } from "./firebase"; // Assumindo que 'auth' é sua instância de getAuth(app) ou initializeAuth(app)
import type { User, UserCredential } from "firebase/auth"; // Importe UserCredential para tipagem
import {
  onAuthStateChanged as _onAuthStateChanged,
  createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
  signOut as _signOut,
  GoogleAuthProvider, // <--- Importe o provedor Google
  signInWithPopup, // <--- Importe a função para login com popup
  // Se preferir redirecionamento, importe signInWithRedirect e getRedirectResult
} from "firebase/auth";

// Tipagem do usuário que você quer expor
type AuthUser = {
  uid: string;
  email: string | null;
  // Adicione outras propriedades User do Firebase que você precisa expor
  // Por exemplo: displayName, photoURL, phoneNumber, etc.
  // displayName: string | null;
  // photoURL: string | null;
};

// Helper para formatar o objeto User do Firebase para sua tipagem AuthUser
const formatAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  // Mapeie outras propriedades aqui se adicionou na tipagem AuthUser
  // displayName: user.displayName,
  // photoURL: user.photoURL,
});

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Começa como true para indicar que está verificando o estado inicial

  // Este handler processa as mudanças no estado de autenticação
  // Ele é chamado tanto no carregamento inicial quanto após operações como login/logout
  const authStateChanged = (authState: User | null) => {
    if (!authState) {
      // Usuário deslogado
      setAuthUser(null);
      setLoading(false); // Terminou de carregar/verificar o estado
      return;
    }

    // Usuário logado
    // setLoading(true); // Esta linha aqui parece redundante com o setLoading(false) logo abaixo.
                      // A lógica de loading deve ser gerada PELAS FUNÇÕES (signIn, signOut)
                      // que setam loading=true no INÍCIO da operação assíncrona,
                      // e o authStateChanged seta loading=false APÓS o estado ser atualizado.
    const formattedUser = formatAuthUser(authState);
    setAuthUser(formattedUser);
    setLoading(false); // Terminou de carregar/verificar o estado ou a operação assíncrona
  };

  // Assina as mudanças de estado de autenticação do Firebase
  // Este useEffect roda apenas uma vez no mount para configurar o listener
  useEffect(() => {
    const unsubscribe = _onAuthStateChanged(auth, authStateChanged);

    // Cleanup function: desinscreve o listener quando o componente desmonta
    return () => unsubscribe();
  }, [auth]); // Dependência na instância auth

  // --- Suas funções de autenticação existentes ---

  // Login com Email e Senha
  const signInWithEmailAndPassword = async (email: string, password: string): Promise<UserCredential> => {
    setLoading(true); // Indica que uma operação de autenticação começou
    try {
      const result = await _signInWithEmailAndPassword(auth, email, password);
      // authStateChanged (do useEffect) será chamado automaticamente pelo Firebase
      // para atualizar authUser e setar loading(false).
      return result; // Retorna o resultado da operação
    } catch (error) {
      console.error("Erro no login com email/senha:", error);
      setLoading(false); // Garante que loading seja false em caso de erro ANTES que onAuthStateChanged possa ser chamado com null
      throw error; // Propaga o erro para quem chamou
    }
  };

  // Criar usuário com Email e Senha
  const createUserWithEmailAndPassword = async (email: string, password: string): Promise<UserCredential> => {
    setLoading(true); // Indica que uma operação de autenticação começou
    try {
      const result = await _createUserWithEmailAndPassword(auth, email, password);
       // authStateChanged será chamado automaticamente
      return result; // Retorna o resultado da operação
    } catch (error) {
      console.error("Erro na criação de usuário:", error);
      setLoading(false); // Garante que loading seja false em caso de erro
      throw error; // Propaga o erro para quem chamou
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
     setLoading(true); // Indica que uma operação de autenticação começou
    try {
      await _signOut(auth);
      // authStateChanged será chamado automaticamente (com null)
      // e setará authUser(null) e loading(false).
      // A linha "setAuthUser(null); setLoading(true);" no seu código original DEPOIS do then()
      // não é necessária e estava invertendo a lógica de loading.
    } catch (error) {
       console.error("Erro no sign out:", error);
       setLoading(false); // Garante que loading seja false em caso de erro
       throw error; // Propaga o erro
    }
  };

  // --- NOVA FUNÇÃO: Login com Google ---
  const signInWithGoogle = async (): Promise<UserCredential> => {
    setLoading(true); // Indica que uma operação de autenticação começou
    try {
      const provider = new GoogleAuthProvider(); // Cria uma instância do provedor Google
      // Opcional: Você pode adicionar escopos ou parâmetros customizados aqui se precisar
      // Ex: provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      // Ex: provider.setCustomParameters({ prompt: 'select_account' }); // Força a seleção de conta

      // Inicia o fluxo de login usando popup
      const result = await signInWithPopup(auth, provider);

      // O listener onAuthStateChanged configurado no useEffect
      // detectará o sucesso do login (result.user não é null)
      // e chamará authStateChanged, que por sua vez atualizará
      // o estado `authUser` e setará `loading(false)`.

      console.log("Login com Google bem-sucedido:", result.user);
      return result; // Você pode retornar o resultado completo se precisar
    } catch (error) {
      console.error("Erro no login com Google:", error);
      // Lide com erros específicos do GoogleAuthProvider aqui se precisar
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // const email = (error as any).email; // Acessa email se o erro tiver
      // const credential = GoogleAuthProvider.credentialFromError(error); // Se o erro veio de um credencial inválido

      setLoading(false); // Garante que loading seja false em caso de erro
      throw error; // Propaga o erro para quem chamou
    }
  };

  // Retorne todas as propriedades e funções que seu AuthProvider precisa expor
  return {
    authUser,
    loading,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithGoogle, // <--- Inclua a nova função aqui
  };
}
