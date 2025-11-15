import React from 'react';

const HomePage = ({ setPage }) => {
  return (
    <div className="flex flex-col items-center justify-between px-8" 
         style={{minHeight: '95vh', paddingTop: '5vh', paddingBottom: '5vh'}}>
      
      {/* Main Message */}
      {/* <div className="w-full bg-black bg-opacity-70 rounded-lg p-8 text-center mb-8"> */}
        <h1 className="text-black text-shadow-xl text-2xl font-bold leading-relaxed">
          One platform to Issue & Verify any certificate in Secure, Immutable and Decentralized way.
        </h1>
      {/* </div> */}
      
      {/* Three Cards */}
      <div className="w-full flex gap-8 justify-center mb-10">
        <div className="flex-1 shadow-4xl/50 max-w-sm h-80 bg-black bg-opacity-70 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-10">Are you an institution?</h2>
          <p className="mb-20 text-gray-300">
            Issue certificates on a secure, decentralized, verifiable chain.
          </p>
          <button 
            onClick={() => setPage('issue')}
            className="w-full bg-black border border-white text-white py-3 rounded-lg font-semibold transition"
          >
            Issue
          </button>
        </div>
        
        <div className="flex-1 max-w-sm bg-black bg-opacity-70 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-10">Are you a holder?</h2>
          <p className="mb-20 text-gray-300">
            Check the certificates issued to you on the chain.
          </p>
          <button 
            onClick={() => setPage('holder')}
            className="w-full bg-black border border-white text-white py-3 rounded-lg font-semibold transition"
          >
            View
          </button>
        </div>
        
        <div className="flex-1 max-w-sm bg-black bg-opacity-70 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-10">Are you a verifier?</h2>
          <p className="mb-20 text-gray-300">
            Submit a certificate to verify its credibility and authenticity in one-click.
          </p>
          <button 
            onClick={() => setPage('verify')}
            className="w-full bg-black border border-white text-white py-3 rounded-lg font-semibold transition"
          >
            Verify
          </button>
        </div>
      </div>
      
      {/* Bottom CTA */}
      <div className="flex items-center gap-4">
        <p className="text-white text-xl">
          Join the decentralized network to issue verifiable certificates.
        </p>
        <button 
          onClick={() => setPage('register')}
          className="bg-white text-purple-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default HomePage;