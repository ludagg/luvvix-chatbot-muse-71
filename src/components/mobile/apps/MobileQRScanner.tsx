
import React, { useState } from 'react';
import { ArrowLeft, Camera, Image, History, Share, Copy } from 'lucide-react';

interface ScanResult {
  id: string;
  content: string;
  type: 'url' | 'text' | 'wifi' | 'contact';
  date: Date;
}

interface MobileQRScannerProps {
  onBack: () => void;
}

const MobileQRScanner = ({ onBack }: MobileQRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([
    { id: '1', content: 'https://example.com', type: 'url', date: new Date() },
    { id: '2', content: 'Hello World!', type: 'text', date: new Date() },
  ]);
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');

  const startScan = () => {
    setScanning(true);
    // Simulate scan after 2 seconds
    setTimeout(() => {
      const newScan: ScanResult = {
        id: Date.now().toString(),
        content: 'https://luvvix.it.com',
        type: 'url',
        date: new Date()
      };
      setHistory([newScan, ...history]);
      setScanning(false);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Scanner QR</h1>
        <div className="w-10" />
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'scan' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'
          }`}
        >
          Scanner
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'
          }`}
        >
          Historique
        </button>
      </div>
      
      <div className="flex-1">
        {activeTab === 'scan' ? (
          <div className="h-full flex flex-col">
            {/* Camera View */}
            <div className="flex-1 bg-black relative">
              {scanning ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white text-center">Scan en cours...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-lg mb-4 flex items-center justify-center">
                      <div className="w-32 h-32 border border-white/30 rounded-lg flex items-center justify-center">
                        <Camera className="w-16 h-16 text-white/50" />
                      </div>
                    </div>
                    <p className="text-lg">Positionnez le QR code dans le cadre</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="p-6 bg-gray-900">
              <div className="flex justify-center space-x-6">
                <button className="p-4 bg-gray-700 rounded-full">
                  <Image className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={startScan}
                  disabled={scanning}
                  className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center disabled:opacity-50"
                >
                  <Camera className="w-10 h-10 text-white" />
                </button>
                
                <button className="p-4 bg-gray-700 rounded-full">
                  <History className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {history.map((result) => (
              <div key={result.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.type === 'url' ? 'bg-blue-100 text-blue-800' :
                        result.type === 'text' ? 'bg-gray-100 text-gray-800' :
                        result.type === 'wifi' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {result.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {result.date.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-900 break-all">{result.content}</p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(result.content)}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <Share className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {history.length === 0 && (
              <div className="text-center py-8">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun scan</h3>
                <p className="text-gray-600">Vos codes QR scannés apparaîtront ici</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileQRScanner;
