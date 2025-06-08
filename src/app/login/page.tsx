// login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FirebaseError } from "firebase/app";
import { useAuth } from "@/providers/AuthProvider"; // Importe seu hook useAuth

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const router = useRouter();

  // Get signIn functions and loading state from context
  const {
    signInWithEmailAndPassword,
    signInWithGoogle, // <--- NOVO: Obtenha a função para login com Google
    loading, // <--- NOVO: Obtenha o estado de loading
  } = useAuth();

  // Handler para login com Email e Senha (já existente)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSignupPrompt(false);
    setError(""); // Limpa erro anterior
    try {
      await signInWithEmailAndPassword(email, password);
      // Se chegou aqui, o login com email/senha foi bem-sucedido.
      // O hook useAuth já atualizou o estado do usuário.
      router.push("/dashboard"); // Redireciona para o dashboard
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Erro no login com email/senha:", firebaseError);
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/invalid-credential" || // 'auth/invalid-credential' é mais comum para senha errada
        firebaseError.code === "auth/wrong-password" // Código antigo, mas bom verificar
      ) {
        // Se o erro for relacionado a usuário não encontrado ou credenciais inválidas,
        // sugere o cadastro.
        setShowSignupPrompt(true);
        setError(""); // Não mostra a mensagem de erro padrão do Firebase neste caso
      } else {
        // Para outros erros, mostra a mensagem do Firebase
        setError(firebaseError.message);
        setShowSignupPrompt(false);
      }
    }
  };

  // --- NOVO: Handler para login com Google ---
  const handleGoogleLogin = async () => {
    setShowSignupPrompt(false); // Limpa prompts
    setError(""); // Limpa erro anterior
    try {
      await signInWithGoogle();
      // Se chegou aqui, o login com Google foi bem-sucedido.
      // O hook useAuth já atualizou o estado do usuário.
      router.push("/dashboard"); // Redireciona para o dashboard
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Erro no login com Google:", firebaseError);
      // Lidar com erros específicos do Google aqui, se necessário.
      // Geralmente, um erro genérico é suficiente, a menos que você
      // precise lidar com, por exemplo, auth/account-exists-with-different-credential.
      setError(firebaseError.message); // Mostra a mensagem de erro do Firebase
      setShowSignupPrompt(false);
    }
  };

  return (
    <div>
      <h2>Please Login to Continue</h2>
      {/* Formulário de Login com Email e Senha */}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading} // Desabilita enquanto alguma operação estiver em andamento
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading} // Desabilita enquanto alguma operação estiver em andamento
        />
        <br />
        <button type="submit" disabled={loading}> {/* <--- Use o estado loading */}
          Login
        </button>
      </form>

      {/* Mensagem de Erro ou Prompt de Cadastro */}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Adicionado estilo básico para erro */}

      {showSignupPrompt && (
        <p>
          User not found or invalid credentials. Please <Link href="/signup">sign up</Link> to continue.
        </p>
      )}

      {/* --- NOVO: Botão para Login com Google --- */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading} // <--- Use o estado loading para desabilitar
      >
        SignIn with  Google
      </button>

    </div>
  );
}
