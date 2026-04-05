import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Agent API Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
          Discover verified APIs. Pay on-chain. Get instant results.
        </p>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Built for AI agents and developers on Monad
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/marketplace" className="btn-primary text-lg px-8 py-3">
            Browse APIs
          </Link>
          <Link href="/register" className="btn-secondary text-lg px-8 py-3">
            Sell Your API
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-3xl mb-4">1</div>
          <h3 className="text-lg font-semibold mb-2">Discover</h3>
          <p className="text-gray-600">
            Browse curated, admin-verified APIs in the marketplace
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-4">2</div>
          <h3 className="text-lg font-semibold mb-2">Pay On-Chain</h3>
          <p className="text-gray-600">
            Secure escrow payments on Monad with instant finality
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-4">3</div>
          <h3 className="text-lg font-semibold mb-2">Get Results</h3>
          <p className="text-gray-600">
            Gateway executes the API and delivers verified results
          </p>
        </div>
      </div>
    </div>
  );
}
