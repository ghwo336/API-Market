"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterForm() {
  const { address, isConnected } = useAccount();
  const { register, loading, error, result } = useRegister();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [priceInEth, setPriceInMon] = useState("");
  const [category, setCategory] = useState("general");

  if (!isConnected) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">Connect your wallet to register an API</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="card text-center py-8">
        <h3 className="text-xl font-semibold text-green-600 mb-2">
          API Registered Successfully!
        </h3>
        <p className="text-gray-600 mb-2">
          Your API has been submitted for review.
        </p>
        <p className="text-sm text-gray-400">ID: {result.id}</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;

    try {
      const priceInWei = parseEther(priceInEth).toString();
      await register({
        name,
        description,
        endpoint,
        price: priceInWei,
        sellerAddress: address,
        category,
      });
    } catch {
      // Error handled in hook state
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="e.g. Weather API"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-[100px]"
          placeholder="Describe what your API does..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Endpoint URL
        </label>
        <input
          type="url"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="input"
          placeholder="https://your-api.com/endpoint"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={priceInEth}
            onChange={(e) => setPriceInMon(e.target.value)}
            className="input"
            placeholder="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            <option value="general">General</option>
            <option value="ai">AI / ML</option>
            <option value="data">Data</option>
            <option value="finance">Finance</option>
            <option value="social">Social</option>
            <option value="utility">Utility</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Register API"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Seller address: {address}
      </p>
    </form>
  );
}
