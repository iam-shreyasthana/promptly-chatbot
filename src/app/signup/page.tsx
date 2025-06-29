"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, clearErrors } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    clearErrors();
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: String(data.password),
          firstName: data.firstName,
          lastName: data.lastName
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Signup failed');
      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      router.push('/chat');
    } catch (err: any) {
      setError('root', { message: err.message || 'Signup failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-full max-w-sm flex flex-col items-center border border-slate-100"
      >
        <div className="bg-gradient-to-br from-blue-200 to-blue-400 rounded-full p-4 shadow mb-6 flex items-center justify-center">
          <span className="text-3xl">📝</span>
        </div>
        <h2 className="font-semibold text-2xl mb-2 text-gray-800">Sign up</h2>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Create your account to get started.
        </p>
        <input
          type="text"
          placeholder="First Name"
          className="w-full mb-3 px-4 py-2 rounded-lg bg-slate-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
          {...register('firstName', { required: 'First name is required' })}
        />
        {errors.firstName && <div className="text-red-500 mb-2 text-sm w-full text-left">{errors.firstName.message as string}</div>}
        <input
          type="text"
          placeholder="Last Name"
          className="w-full mb-3 px-4 py-2 rounded-lg bg-slate-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
          {...register('lastName', { required: 'Last name is required' })}
        />
        {errors.lastName && <div className="text-red-500 mb-2 text-sm w-full text-left">{errors.lastName.message as string}</div>}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 rounded-lg bg-slate-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
          {...register('email', { required: 'Email is required', pattern: { value: /.+@.+\..+/, message: 'Invalid email address' } })}
        />
        {errors.email && <div className="text-red-500 mb-2 text-sm w-full text-left">{errors.email.message as string}</div>}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 px-4 py-2 rounded-lg bg-slate-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
        />
        {errors.password && <div className="text-red-500 mb-2 text-sm w-full text-left">{errors.password.message as string}</div>}
        {errors.root && <div className="text-red-500 mb-4 text-center text-sm">{errors.root.message as string}</div>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg font-semibold text-base shadow hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
} 