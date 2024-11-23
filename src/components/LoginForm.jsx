"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from 'cookies-next';

const VALID_CREDENTIALS = {
  username: "admin",
  password: "admin"
};

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username === VALID_CREDENTIALS.username && 
        password === VALID_CREDENTIALS.password) {
      // Store auth state in cookie
      setCookie('isAuthenticated', 'true', {
        maxAge: 60 * 60 * 1, // 24 hours
        path: '/',
      });
      // Redirect to dashboard
      router.push("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-foreground">
        Flood Scout - Login
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-muted-foreground"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
        </div>

        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-muted-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="*** ***"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Login
        </button>
      </form>
    </div>
  );
} 