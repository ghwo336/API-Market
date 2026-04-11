"use client";

import RegisterForm from "@/components/register/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>
          Register Your API
        </h1>
        <p style={{ color: "var(--text2)" }}>
          Submit your API for review. Once approved by an admin, it will be
          listed on the marketplace.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
