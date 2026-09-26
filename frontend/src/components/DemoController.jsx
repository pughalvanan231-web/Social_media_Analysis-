import React, { useState } from 'react'



const PROCESSING_STEPS = [
  "Collecting signals...",
  "Normalizing data...",
  "Analyzing sentiment...",
  "Detecting topics...",
  "Analyzing trends...",
  "Checking anomalies...",
  "Correlating platforms...",
  "Generating intelligence..."
];

export default function DemoController({ onComplete }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const runDemo = async () => {
    setIsProcessing(true)
    setCurrentStep(0)

    // Trigger backend pipeline (no await yet to let UI play)
    const backendPromise = fetch(`http://127.0.0.1:8000/api/demo/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // In case auth is needed
      }
    }).catch(e => console.error("Demo trigger failed", e))

    // Play visual sequence
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setCurrentStep(i)
      // Wait between 400ms and 800ms per step
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400))
    }

    // Wait for backend to actually finish just in case
    await backendPromise

    setIsProcessing(false)
    setIsOpen(false)
    if (onComplete) onComplete()
  }

  if (!isOpen && !isProcessing) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 rounded-full h-14 w-14 flex items-center justify-center font-black text-xl z-50 border-2 border-blue-400 transition-transform hover:scale-105"
        title="Demo Controller"
      >
        ★
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-gray-900 border border-gray-700 shadow-2xl rounded-lg overflow-hidden z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-800 p-3 flex justify-between items-center">
        <span className="font-bold text-gray-200 text-sm tracking-wider uppercase flex items-center gap-2">
          <span className="text-blue-500">★</span> Demo Mode
        </span>
        {!isProcessing && (
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">✕</button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {isProcessing ? (
          <div className="space-y-3 py-2">
            <div className="font-mono text-xs text-blue-400 mb-4 animate-pulse">
              EXECUTING INTELLIGENCE PIPELINE...
            </div>
            
            <div className="space-y-2 h-40 overflow-hidden">
              {PROCESSING_STEPS.slice(0, currentStep + 1).map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-mono text-gray-300">
                  <span className="text-green-500">[{idx === currentStep ? '*' : 'OK'}]</span> 
                  <span className={idx === currentStep ? 'text-white font-bold' : 'text-gray-500'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="w-full bg-gray-800 h-1 mt-4">
              <div 
                className="bg-blue-500 h-1 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400">
              Click the button below to automatically select a random emerging issue and run a live intelligence scan against social media.
            </p>
            <button 
              onClick={runDemo}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest py-3 rounded shadow-lg shadow-blue-900/20 transition-colors"
            >
              RUN INTELLIGENCE SCAN
            </button>
          </>
        )}
      </div>
    </div>
  )
}
