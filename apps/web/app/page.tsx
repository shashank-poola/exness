import { TradingLayout } from "@/components/trading-layout";
import { AuthHeader } from "@/components/auth-header";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Navigation Bar */}
      <div className="bg-[#1a1d23] border-b border-[#2a2d35] px-6 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Exness Trading
            </h1>
            <p className="text-sm text-gray-400">Professional Trading Platform</p>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <a 
            href="/signin" 
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors duration-200"
          >
            Sign In
          </a>
          <a 
            href="/register" 
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 py-16 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Trade Like a <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Professional</span>
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Access real-time market data, advanced charting tools, and execute trades with precision. 
          Start your trading journey with our demo account.
        </p>
        <div className="flex justify-center space-x-4">
          <a 
            href="/register" 
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Start Trading Now
          </a>
          <a 
            href="/signin" 
            className="px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-all duration-200 font-semibold text-lg"
          >
            Access Account
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 py-16 bg-[#111111]">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Exness Trading?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1d23] p-6 rounded-xl border border-[#2a2d35]">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Real-Time Charts</h4>
              <p className="text-gray-400">Advanced charting with multiple timeframes and technical indicators</p>
            </div>
            
            <div className="bg-[#1a1d23] p-6 rounded-xl border border-[#2a2d35]">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Lightning Fast</h4>
              <p className="text-gray-400">Execute trades instantly with our high-performance platform</p>
            </div>
            
            <div className="bg-[#1a1d23] p-6 rounded-xl border border-[#2a2d35]">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Secure Trading</h4>
              <p className="text-gray-400">Bank-level security and encrypted data transmission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Account CTA */}
      <div className="px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
          <h3 className="text-4xl font-bold text-white mb-4">
            Start with $100,000 Demo Balance
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Practice trading with virtual money. No risk, all the experience.
          </p>
          <a 
            href="/register" 
            className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-bold text-lg shadow-lg"
          >
            Create Free Demo Account
          </a>
        </div>
      </div>
    </div>
  );
}
