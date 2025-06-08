// signup/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FirebaseError } from "firebase/app";
import { useAuth } from "@/providers/AuthProvider"; // Importe seu hook useAuth

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Get signup and signin (for Google) functions and loading state from context
  const {
    createUserWithEmailAndPassword,
    signInWithGoogle, // <--- NOVO: Obtenha a função para login com Google
    loading, // <--- NOVO: Obtenha o estado de loading
  } = useAuth();

  // Handler para cadastro com Email e Senha (já existente)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpa erro anterior
    try {
      await createUserWithEmailAndPassword(email, password);
      // Se chegou aqui, o cadastro foi bem-sucedido.
      // O hook useAuth já atualizou o estado do usuário (pois createUserWithEmailAndPassword também loga o usuário).
      router.push("/dashboard"); // Redireciona para o dashboard
    } catch (error) {
      const firebaseError = error as FirebaseError;
       console.error("Erro no cadastro com email/senha:", firebaseError);
      setError(firebaseError.message); // Mostra a mensagem de erro do Firebase
    }
  };

  // --- NOVO: Handler para login/cadastro com Google ---
  const handleGoogleAuth = async () => {
    setError(""); // Limpa erro anterior
    try {
      await signInWithGoogle();
      // Se chegou aqui, a autenticação com Google foi bem-sucedida.
      // Se o usuário Google já existia, ele foi logado.
      // Se não existia, uma nova conta foi criada E ele foi logado.
      // O hook useAuth já atualizou o estado do usuário.
      router.push("/dashboard"); // Redireciona para o dashboard
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Erro na autenticação com Google:", firebaseError);
      // Lide com erros específicos do Google aqui, se necessário.
      // Um erro comum na página de cadastro seria auth/account-exists-with-different-credential
      // se o usuário tentar usar Google com um email que já existe com senha (ou outro provedor).
      // Você pode adicionar lógica para lidar com isso se for importante para sua UX.
      setError(firebaseError.message); // Mostra a mensagem de erro do Firebase
    }
  };


  return (
    <div>
      <h2>Sign Up</h2>
      {/* Formulário de Cadastro com Email e Senha */}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading} // <--- Use o estado loading
        />
        <br />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          disabled={loading} // <--- Use o estado loading
        />
        <br />
        <button type="submit" disabled={loading}> {/* <--- Use o estado loading */}
          Sign Up
        </button>
      </form>

       {/* Mensagem de Erro */}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Adicionado estilo básico para erro */}

      {/* --- NOVO: Botão para Login/Cadastro com Google --- */}
      <button
        onClick={handleGoogleAuth} // <--- Use o novo handler
        disabled={loading} // <--- Use o estado loading
      >
        Sign up with Google {/* O texto pode ser "Sign up with Google" ou "Continue with Google" */}
      </button>
    </div>
  );
}
