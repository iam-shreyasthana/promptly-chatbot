"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, clearErrors } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    clearErrors();
    debugger;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: String(data.password)
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Login failed');
      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      router.push('/chat');
    } catch (err: any) {
      setError('root', { message: err.message || 'Login failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-full max-w-sm flex flex-col items-center border border-slate-100"
      >
        <div className="bg-gradient-to-br from-blue-200 to-blue-400 rounded-full p-4 shadow mb-6 flex items-center justify-center">
          <span className="text-3xl">🔐</span>
        </div>
        <h2 className="font-semibold text-2xl mb-2 text-gray-800">Sign in</h2>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Welcome back! Please enter your credentials to continue.
        </p>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
          {...register('email', { required: 'Email is required', pattern: { value: /.+@.+\..+/, message: 'Invalid email address' } })}
        />
        {errors.email && <div className="text-red-500 mb-2 text-sm w-full text-left">{errors.email.message as string}</div>}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 px-4 py-2 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
        />
        {errors.password && <div className="text-red-500 mb-2 text-sm w-full text-left">{errors.password.message as string}</div>}
        <div className="w-full flex justify-end items-center mb-4">
          <a href="#" className="text-xs text-blue-500 hover:underline">Forgot password?</a>
        </div>
        {errors.root && <div className="text-red-500 mb-4 text-center text-sm">{errors.root.message as string}</div>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg font-semibold text-base shadow hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Sign In'}
        </button>
        <div className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">Sign up</a>
        </div>
      </form>
    </div>
  );
} 