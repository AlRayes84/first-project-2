import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, Zap, Globe, Settings, User, 
  ChevronRight, Power, RefreshCw, Lock, Unlock, CheckCircle2,
  Server, Activity, Wifi, ArrowUpRight, ArrowDownRight, Smartphone, Download, X
} from 'lucide-react';

export default function App() {
  // Connection states: 'disconnected' | 'connecting' | 'connected'
  const [connectionState, setConnectionState] = useState('disconnected');
  const [selectedServer, setSelectedServer] = useState({
    id: 'us-east-1',
    country: 'United States',
    city: 'New York',
    flag: '🇺🇸',
    ping: '24 ms',
    load: '32%',
    ip: '198.51.100.42'
  });
  
  const [activeTab, setActiveTab] = useState('home');
  const [protocol, setProtocol] = useState('WireGuard');
  const [killSwitch, setKillSwitch] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [timer, setTimer] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [showServerModal, setShowServerModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);

  // Mock server list
  const servers = [
    { id: 'us-east-1', country: 'United States', city: 'New York', flag: '🇺🇸', ping: '24 ms', load: '32%', ip: '198.51.100.42' },
    { id: 'us-west-2', country: 'United States', city: 'Los Angeles', flag: '🇺🇸', ping: '45 ms', load: '58%', ip: '198.51.100.89' },
    { id: 'de-fra-1', country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', ping: '18 ms', load: '41%', ip: '192.0.2.14' },
    { id: 'jp-tok-1', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', ping: '110 ms', load: '22%', ip: '203.0.113.55' },
    { id: 'gb-lon-1', country: 'United Kingdom', city: 'London', flag: '🇬🇧', ping: '21 ms', load: '65%', ip: '198.51.100.120' },
    { id: 'ca-tor-1', country: 'Canada', city: 'Toronto', flag: '🇨🇦', ping: '30 ms', load: '29%', ip: '192.0.2.210' }
  ];

  // Timer and speed simulation when connected
  useEffect(() => {
    let interval;
    if (connectionState === 'connected') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        // Random fluctuate speeds
        setDownloadSpeed((Math.random() * 45 + 35).toFixed(1));
        setUploadSpeed((Math.random() * 15 + 8).toFixed(1));
      }, 1000);
    } else {
      setTimer(0);
      setDownloadSpeed(0);
      setUploadSpeed(0);
    }
    return () => clearInterval(interval);
  }, [connectionState]);

  // Handle connection toggle sequence
  const toggleConnection = () => {
    if (connectionState === 'disconnected') {
      setConnectionState('connecting');
      setTimeout(() => {
        setConnectionState('connected');
      }, 2000);
    } else if (connectionState === 'connected') {
      setConnectionState('disconnected');
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans text-slate-100 p-2 sm:p-4 selection:bg-cyan-500 selection:text-white">
      
      {/* Mobile Device Frame */}
      <div className="w-full max-w-[412px] h-[840px] max-h-[96vh] bg-slate-900 rounded-[40px] border-[8px] border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Status Bar */}
        <div className="h-8 bg-slate-900/80 backdrop-blur px-6 flex justify-between items-center text-xs text-slate-400 select-none z-20 shrink-0">
          <span>09:41</span>
          <div className="w-20 h-3 bg-black rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"></div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-semibold text-emerald-400">5G</span>
            <Wifi size={13} />
            <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-300 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Top Header */}
        <div className="px-6 py-3 flex justify-between items-center bg-slate-900 z-10 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-wide text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">NexusVPN</span>
          </div>
          <button 
            onClick={() => setShowApkModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 transition text-xs font-medium rounded-full flex items-center space-x-1.5 text-cyan-400 border border-cyan-500/20 shadow-inner"
          >
            <Download size={13} />
            <span>Get APK</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-20 pt-2 flex flex-col">
          
          {/* TAB 1: HOME (VPN CONTROL) */}
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col justify-between py-2 animate-fadeIn">
              
              {/* Connection Status Banner */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                connectionState === 'connected' 
                  ? 'bg-emerald-950/30 border-emerald-500/30 shadow-lg shadow-emerald-950/40' 
                  : connectionState === 'connecting'
                  ? 'bg-amber-950/30 border-amber-500/30 animate-pulse'
                  : 'bg-slate-800/40 border-slate-700/50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionState === 'connected' ? 'bg-emerald-400 animate-ping' :
                    connectionState === 'connecting' ? 'bg-amber-400' : 'bg-rose-500'
                  }`} />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-200">
                      {connectionState === 'connected' ? 'Protected & Encrypted' :
                       connectionState === 'connecting' ? 'Establishing Tunnel...' : 'Unprotected Connection'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      {connectionState === 'connected' ? `IP: ${selectedServer.ip}` : 'Your data is vulnerable'}
                    </p>
                  </div>
                </div>
                {connectionState === 'connected' ? (
                  <Lock size={18} className="text-emerald-400" />
                ) : (
                  <Unlock size={18} className="text-rose-400" />
                )}
              </div>

              {/* Central Power Button */}
              <div className="my-auto py-8 flex flex-col items-center justify-center relative">
                
                {/* Glow rings when connected */}
                {connectionState === 'connected' && (
                  <div className="absolute w-56 h-56 rounded-full bg-emerald-500/10 animate-ping pointer-events-none"></div>
                )}
                {connectionState === 'connecting' && (
                  <div className="absolute w-56 h-56 rounded-full bg-cyan-500/15 animate-spin pointer-events-none"></div>
                )}

                <button
                  onClick={toggleConnection}
                  disabled={connectionState === 'connecting'}
                  className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 group relative ${
                    connectionState === 'connected'
                      ? 'bg-gradient-to-b from-emerald-500 to-teal-700 shadow-emerald-500/40 ring-4 ring-emerald-400/30'
                      : connectionState === 'connecting'
                      ? 'bg-gradient-to-b from-amber-500 to-orange-700 shadow-amber-500/40 ring-4 ring-amber-400/30'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 shadow-slate-950 border border-slate-700 ring-4 ring-slate-800'
                  }`}
                >
                  <Power size={48} className={`transition-transform duration-300 ${
                    connectionState === 'connected' ? 'text-white scale-110' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <span className="mt-3 text-xs font-bold tracking-widest uppercase text-slate-200">
                    {connectionState === 'connected' ? 'Disconnect' : connectionState === 'connecting' ? 'Connecting' : 'Tap to Connect'}
                  </span>
                </button>

                {/* Session Timer */}
                {connectionState === 'connected' && (
                  <div className="mt-6 px-4 py-1.5 bg-slate-800/80 rounded-full border border-slate-700 text-xs font-mono text-emerald-400 flex items-center space-x-2 shadow">
                    <Activity size={13} className="animate-spin" />
                    <span>Duration: {formatTime(timer)}</span>
                  </div>
                )}
              </div>

              {/* Server Selector Card */}
              <div 
                onClick={() => setShowServerModal(true)}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition active:scale-[0.99] group shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedServer.flag}</span>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Selected Location</div>
                    <div className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                      <span>{selectedServer.city}, {selectedServer.country}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-400 font-mono">{selectedServer.ping}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Load {selectedServer.load}</div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Speed Stats (When Connected) */}
              {connectionState === 'connected' && (
                <div className="grid grid-cols-2 gap-3 mt-3 animate-fadeIn">
                  <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <ArrowDownRight size={18} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Download</div>
                      <div className="text-sm font-bold font-mono text-slate-200">{downloadSpeed} <span className="text-[10px] text-slate-400">MB/s</span></div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <ArrowUpRight size={18} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Upload</div>
                      <div className="text-sm font-bold font-mono text-slate-200">{uploadSpeed} <span className="text-[10px] text-slate-400">MB/s</span></div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: SERVERS */}
          {activeTab === 'servers' && (
            <div className="flex-1 flex flex-col py-2 animate-fadeIn">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white">VPN Server Locations</h2>
                <p className="text-xs text-slate-400">Choose from ultra-fast secure nodes worldwide.</p>
              </div>

              <div className="space-y-2.5 overflow-y-auto pr-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Recommended / Smart</div>
                
                {servers.map((srv) => {
                  const isSelected = selectedServer.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setSelectedServer(srv);
                        setActiveTab('home');
                      }}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/50' 
                          : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{srv.flag}</span>
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{srv.city}, {srv.country}</div>
                          <div className="text-xs text-slate-400 font-mono">IP: {srv.ip}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs font-mono text-emerald-400">{srv.ping}</div>
                          <div className="text-[10px] font-mono text-slate-400">Load {srv.load}</div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-cyan-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex-1 flex flex-col py-2 animate-fadeIn space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Advanced Settings</h2>
                <p className="text-xs text-slate-400">Configure your security tunnel parameters.</p>
              </div>

              {/* Protocol Section */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">VPN Protocol</div>
                <div className="grid grid-cols-3 gap-2">
                  {['WireGuard', 'OpenVPN', 'IKEv2'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border transition ${
                        protocol === p 
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20' 
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles Section */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Features</div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Kill Switch</div>
                    <div className="text-xs text-slate-400">Block internet if VPN drops</div>
                  </div>
                  <button 
                    onClick={() => setKillSwitch(!killSwitch)}
                    className={`w-12 h-6 rounded-full transition p-1 ${killSwitch ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${killSwitch ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="border-t border-slate-700/50 pt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Auto-Connect on Startup</div>
                    <div className="text-xs text-slate-400">Connect to optimal server on boot</div>
                  </div>
                  <button 
                    onClick={() => setAutoConnect(!autoConnect)}
                    className={`w-12 h-6 rounded-full transition p-1 ${autoConnect ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${autoConnect ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-4 text-center">
                <div className="text-xs text-slate-400 font-medium">NexusVPN App Version</div>
                <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">v2.4.1 (Stable Build)</div>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around items-center px-4 z-20">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 transition ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Shield size={20} />
            <span className="text-[10px] font-medium">Shield</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('servers')}
            className={`flex flex-col items-center space-y-1 transition ${activeTab === 'servers' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Globe size={20} />
            <span className="text-[10px] font-medium">Servers</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-1 transition ${activeTab === 'settings' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>

        {/* Server Selection Modal */}
        {showServerModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-fadeIn">
            <div className="bg-slate-900 rounded-t-[32px] border-t border-slate-800 p-6 max-h-[75%] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Globe size={18} className="text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Select Location</h3>
                </div>
                <button 
                  onClick={() => setShowServerModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto space-y-2 pr-1 flex-1">
                {servers.map((srv) => {
                  const isSelected = selectedServer.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setSelectedServer(srv);
                        setShowServerModal(false);
                      }}
                      className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm' 
                          : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{srv.flag}</span>
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{srv.city}, {srv.country}</div>
                          <div className="text-[11px] text-slate-400 font-mono">IP: {srv.ip}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-[11px] font-mono text-emerald-400">{srv.ping}</div>
                          <div className="text-[10px] font-mono text-slate-400">Load {srv.load}</div>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-cyan-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* APK Download Modal */}
        {showApkModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative space-y-4">
              <button 
                onClick={() => setShowApkModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X size={16} />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">NexusVPN for Android</h3>
                  <p className="text-xs text-slate-400">Version 2.4.1 • 37.6 MB</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/50 space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span className="font-medium">Direct Sideload APK</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span className="font-medium">No Google Play account needed</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span className="font-medium">WireGuard & OpenVPN Native</span>
                </div>
              </div>

              <div className="space-y-2">
                <a 
                  href="downloads/NexusVPN.apk" 
                  download="NexusVPN-v2.4.1.apk"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition"
                >
                  <Download size={18} />
                  <span>Download NexusVPN APK</span>
                </a>
                
                <a 
                  href="downloads/AuroraVPN-Shadowsocks.apk" 
                  download="NexusVPN-Stealth.apk"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center space-x-2 border border-slate-700 transition"
                >
                  <Lock size={14} />
                  <span>Stealth Shadowsocks APK (24.9 MB)</span>
                </a>
              </div>

              <p className="text-[11px] text-center text-slate-500">
                Supports Android 7.0 (Nougat) through Android 14+
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
