/**
 * AuroraVPN - Interactive Mobile Simulator & Config Generator
 */

// Available Servers
const VPN_SERVERS = [
  {
    id: "us-east",
    name: "United States - New York",
    country: "United States",
    city: "New York",
    flag: "🇺🇸",
    ip: "198.51.100.12",
    port: 51820,
    ping: 18,
    load: 42,
    tag: "Ultra Low Latency"
  },
  {
    id: "us-west",
    name: "United States - Los Angeles",
    country: "United States",
    city: "Los Angeles",
    flag: "🇺🇸",
    ip: "198.51.100.45",
    port: 51820,
    ping: 28,
    load: 38,
    tag: "Streaming Optimized"
  },
  {
    id: "de-fra",
    name: "Germany - Frankfurt",
    country: "Germany",
    city: "Frankfurt",
    flag: "🇩🇪",
    ip: "193.174.198.5",
    port: 51820,
    ping: 24,
    load: 35,
    tag: "P2P / Torrenting"
  },
  {
    id: "uk-lon",
    name: "United Kingdom - London",
    country: "United Kingdom",
    city: "London",
    flag: "🇬🇧",
    ip: "185.190.140.22",
    port: 51820,
    ping: 31,
    load: 51,
    tag: "BBC iPlayer Ready"
  },
  {
    id: "nl-ams",
    name: "Netherlands - Amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    flag: "🇳🇱",
    ip: "194.135.216.7",
    port: 51820,
    ping: 22,
    load: 29,
    tag: "Strict No-Logs"
  },
  {
    id: "ch-zrh",
    name: "Switzerland - Zurich",
    country: "Switzerland",
    city: "Zurich",
    flag: "🇨🇭",
    ip: "185.220.101.42",
    port: 51820,
    ping: 26,
    load: 21,
    tag: "Swiss Privacy Laws"
  },
  {
    id: "jp-tyo",
    name: "Japan - Tokyo",
    country: "Japan",
    city: "Tokyo",
    flag: "🇯🇵",
    ip: "133.242.18.91",
    port: 51820,
    ping: 85,
    load: 47,
    tag: "Gaming Optimized"
  },
  {
    id: "sg-sin",
    name: "Singapore - Jurong",
    country: "Singapore",
    city: "Singapore",
    flag: "🇸🇬",
    ip: "128.199.204.33",
    port: 51820,
    ping: 72,
    load: 40,
    tag: "Asia Pacific Hub"
  },
  {
    id: "ca-tor",
    name: "Canada - Toronto",
    country: "Canada",
    city: "Toronto",
    flag: "🇨🇦",
    ip: "192.99.148.11",
    port: 51820,
    ping: 34,
    load: 33,
    tag: "North America Fast"
  },
  {
    id: "fr-par",
    name: "France - Paris",
    country: "France",
    city: "Paris",
    flag: "🇫🇷",
    ip: "51.15.24.89",
    port: 51820,
    ping: 27,
    load: 44,
    tag: "High Bandwidth"
  }
];

// App State
let appState = {
  status: "DISCONNECTED", // DISCONNECTED, CONNECTING, CONNECTED, DISCONNECTING
  selectedServer: VPN_SERVERS[0],
  selectedProtocol: "WireGuard (ChaCha20)",
  protocolKey: "wireguard",
  connectionSeconds: 0,
  timerInterval: null,
  statsInterval: null,
  killSwitch: true,
  adBlocker: true,
  splitTunnel: false,
  autoWifi: true
};

// DOM Elements
const phoneTime = document.getElementById("phoneTime");
const vpnIconStatus = document.getElementById("vpnIconStatus");
const statusLabel = document.getElementById("statusLabel");
const appTimer = document.getElementById("appTimer");
const appIp = document.getElementById("appIp");
const vpnPowerBtn = document.getElementById("vpnPowerBtn");
const powerBtnHint = document.getElementById("powerBtnHint");
const powerButtonWrapper = document.querySelector(".power-button-wrapper");
const statsCard = document.getElementById("statsCard");
const speedDown = document.getElementById("speedDown");
const speedUp = document.getElementById("speedUp");
const currentPing = document.getElementById("currentPing");

const btnOpenServerSheet = document.getElementById("btnOpenServerSheet");
const pickerFlag = document.getElementById("pickerFlag");
const selectedServerName = document.getElementById("selectedServerName");
const selectedServerPing = document.getElementById("selectedServerPing");

const btnOpenProtocolSheet = document.getElementById("btnOpenProtocolSheet");
const selectedProtoName = document.getElementById("selectedProtoName");

const btnToggleSettings = document.getElementById("btnToggleSettings");
const btnToggleLogs = document.getElementById("btnToggleLogs");
const logsArrow = document.getElementById("logsArrow");
const terminalBox = document.getElementById("terminalBox");
const logContent = document.getElementById("logContent");
const btnClearLogs = document.getElementById("btnClearLogs");

// Modals
const serverModal = document.getElementById("serverModal");
const btnCloseServerModal = document.getElementById("btnCloseServerModal");
const serverListContainer = document.getElementById("serverListContainer");

const protocolModal = document.getElementById("protocolModal");
const btnCloseProtoModal = document.getElementById("btnCloseProtoModal");

const settingsModal = document.getElementById("settingsModal");
const btnCloseSettingsModal = document.getElementById("btnCloseSettingsModal");

// Config Generator Elements
const configServerSelect = document.getElementById("configServerSelect");
const tabWireguard = document.getElementById("tabWireguard");
const tabOpenvpn = document.getElementById("tabOpenvpn");
const configFileName = document.getElementById("configFileName");
const configText = document.getElementById("configText");
const btnCopyConfig = document.getElementById("btnCopyConfig");
const copyBtnText = document.getElementById("copyBtnText");
const btnDownloadConfigFile = document.getElementById("btnDownloadConfigFile");

let activeConfigType = "wireguard"; // wireguard or openvpn

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 1000);

  populateServerList();
  renderSelectedServer();
  setupEventListeners();
  updateConfigDisplay();
});

// Real-time phone clock
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  if (phoneTime) phoneTime.textContent = `${hours}:${minutes}`;
}

// -------------------------------------------------------------
// Interactive VPN State Machine
// -------------------------------------------------------------
function handlePowerClick() {
  if (appState.status === "DISCONNECTED") {
    startConnecting();
  } else if (appState.status === "CONNECTED") {
    disconnectVpn();
  }
}

function startConnecting() {
  appState.status = "CONNECTING";
  updateUIForState();

  addLog(`[TUN] Requesting VpnService.prepare(this)`, "info");
  addLog(`[INIT] Binding to TUN file descriptor...`, "info");

  setTimeout(() => {
    if (appState.status !== "CONNECTING") return;
    addLog(`[CRYPTO] Initiating handshake with ${appState.selectedServer.name} (${appState.selectedServer.ip}:${appState.selectedServer.port})`, "info");
    addLog(`[AUTH] Key exchange verified (Curve25519 + ChaCha20-Poly1305)`, "success");
    addLog(`[ROUTE] Redirecting default gateway -> 10.8.0.1/32`, "info");
    addLog(`[DNS] Encrypted Quad9/Cloudflare DNS active (1.1.1.1)`, "info");
    addLog(`[SECURE] Tunnel connected: Virtual IP assigned ${appState.selectedServer.ip}`, "success");

    appState.status = "CONNECTED";
    updateUIForState();
    startTimer();
    startStatsSimulation();
  }, 1200);
}

function disconnectVpn() {
  appState.status = "DISCONNECTING";
  updateUIForState();
  addLog(`[TUN] Releasing TUN interface and tearing down socket...`, "warn");

  setTimeout(() => {
    appState.status = "DISCONNECTED";
    stopTimer();
    stopStatsSimulation();
    updateUIForState();
    addLog(`[SHIELD] VPN disconnected. Protection offline.`, "warn");
  }, 500);
}

function updateUIForState() {
  // Clear classes
  vpnPowerBtn.classList.remove("state-disconnected", "state-connecting", "state-connected");
  powerButtonWrapper.classList.remove("is-connected");
  statusLabel.classList.remove("connected", "connecting");
  appTimer.classList.remove("active");
  statsCard.classList.remove("active");
  vpnIconStatus.classList.remove("active");

  if (appState.status === "DISCONNECTED") {
    vpnPowerBtn.classList.add("state-disconnected");
    statusLabel.textContent = "NOT PROTECTED";
    powerBtnHint.textContent = "TAP TO CONNECT";
    appIp.innerHTML = 'Real IP Exposed: <span class="dim">192.0.2.14</span>';
    appTimer.textContent = "00:00:00";
    speedDown.textContent = "0.0 MB/s";
    speedUp.textContent = "0.0 MB/s";
    currentPing.textContent = "-- ms";
  } else if (appState.status === "CONNECTING") {
    vpnPowerBtn.classList.add("state-connecting");
    statusLabel.classList.add("connecting");
    statusLabel.textContent = "ESTABLISHING TUNNEL...";
    powerBtnHint.textContent = "CONNECTING...";
    appIp.innerHTML = `Negotiating with ${appState.selectedServer.city}...`;
  } else if (appState.status === "CONNECTED") {
    vpnPowerBtn.classList.add("state-connected");
    powerButtonWrapper.classList.add("is-connected");
    statusLabel.classList.add("connected");
    statusLabel.textContent = "SECURE & ENCRYPTED";
    powerBtnHint.textContent = "PROTECTED";
    appIp.innerHTML = `Virtual IP: <strong style="color:#10b981;">${appState.selectedServer.ip}</strong> (${appState.selectedServer.city})`;
    appTimer.classList.add("active");
    statsCard.classList.add("active");
    vpnIconStatus.classList.add("active");
    currentPing.textContent = `${appState.selectedServer.ping} ms`;
  } else if (appState.status === "DISCONNECTING") {
    statusLabel.textContent = "DISCONNECTING...";
    powerBtnHint.textContent = "STOPPING...";
  }
}

// Timer Logic
function startTimer() {
  appState.connectionSeconds = 0;
  clearInterval(appState.timerInterval);
  appState.timerInterval = setInterval(() => {
    appState.connectionSeconds++;
    const hrs = String(Math.floor(appState.connectionSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((appState.connectionSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(appState.connectionSeconds % 60).padStart(2, "0");
    appTimer.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(appState.timerInterval);
}

// Live Speed Simulation
function startStatsSimulation() {
  clearInterval(appState.statsInterval);
  appState.statsInterval = setInterval(() => {
    if (appState.status !== "CONNECTED") return;
    const baseDown = 22.5;
    const baseUp = 6.2;
    const jitterDown = (Math.random() * 8 - 4).toFixed(1);
    const jitterUp = (Math.random() * 2 - 1).toFixed(1);
    const pingJitter = Math.floor(appState.selectedServer.ping + (Math.random() * 4 - 2));

    speedDown.textContent = `${(baseDown + parseFloat(jitterDown)).toFixed(1)} MB/s`;
    speedUp.textContent = `${(baseUp + parseFloat(jitterUp)).toFixed(1)} MB/s`;
    currentPing.textContent = `${pingJitter} ms`;
  }, 1200);
}

function stopStatsSimulation() {
  clearInterval(appState.statsInterval);
}

// -------------------------------------------------------------
// Server List & Selection
// -------------------------------------------------------------
function populateServerList() {
  serverListContainer.innerHTML = "";
  VPN_SERVERS.forEach((server) => {
    const item = document.createElement("div");
    item.className = `server-item ${server.id === appState.selectedServer.id ? "active" : ""}`;
    item.innerHTML = `
      <div class="server-item-flag">${server.flag}</div>
      <div class="server-item-details">
        <div class="server-item-name">${server.name}</div>
        <div class="server-item-meta">${server.tag} • Load ${server.load}%</div>
      </div>
      <div class="server-item-ping">${server.ping} ms</div>
    `;

    item.addEventListener("click", () => {
      selectServer(server);
      closeServerModal();
    });

    serverListContainer.appendChild(item);
  });
}

function selectServer(server) {
  appState.selectedServer = server;
  renderSelectedServer();
  populateServerList();
  updateConfigDisplay();

  if (appState.status === "CONNECTED") {
    addLog(`[SERVER] Switching location to ${server.name}...`, "info");
    disconnectVpn();
    setTimeout(() => {
      startConnecting();
    }, 600);
  }
}

function renderSelectedServer() {
  if (pickerFlag) pickerFlag.textContent = appState.selectedServer.flag;
  if (selectedServerName) selectedServerName.textContent = appState.selectedServer.name;
  if (selectedServerPing) selectedServerPing.textContent = `${appState.selectedServer.ping} ms`;
}

// -------------------------------------------------------------
// Log Output
// -------------------------------------------------------------
function addLog(message, type = "info") {
  const line = document.createElement("div");
  const time = new Date().toTimeString().split(" ")[0];
  line.className = `log-line ${type}`;
  line.textContent = `[${time}] ${message}`;
  logContent.appendChild(line);
  terminalBox.querySelector(".terminal-content").scrollTop = terminalBox.querySelector(".terminal-content").scrollHeight;
}

// -------------------------------------------------------------
// Modals Control
// -------------------------------------------------------------
function openServerModal() {
  serverModal.classList.remove("hidden");
}

function closeServerModal() {
  serverModal.classList.add("hidden");
}

function openProtoModal() {
  protocolModal.classList.remove("hidden");
}

function closeProtoModal() {
  protocolModal.classList.add("hidden");
}

function openSettingsModal() {
  settingsModal.classList.remove("hidden");
}

function closeSettingsModal() {
  settingsModal.classList.add("hidden");
}

// -------------------------------------------------------------
// Config Generator
// -------------------------------------------------------------
function generateWireguardConfig(server) {
  return `[Interface]
PrivateKey = aA123...PLACEHOLDER_CLIENT_KEY...456xZ=
Address = 10.8.0.2/24, fd00::2/64
DNS = 1.1.1.1, 8.8.8.8
MTU = 1420

[Peer]
PublicKey = bB789...AURORA_SERVER_PUBKEY...012yW=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${server.ip}:${server.port}
PersistentKeepalive = 25`;
}

function generateOpenvpnConfig(server) {
  return `client
dev tun
proto udp
remote ${server.ip} 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
key-direction 1
verb 3

<ca>
-----BEGIN CERTIFICATE-----
MIIDQjCCAiqgAwIBAgIUQ...AURORA_VPN_ROOT_CA...==
-----END CERTIFICATE-----
</ca>

<cert>
-----BEGIN CERTIFICATE-----
MIIDSTCCAjGgAwIBAgIUZ...AURORA_VPN_CLIENT_CERT...==
-----END CERTIFICATE-----
</cert>

<key>
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9...AURORA_VPN_CLIENT_KEY...==
-----END PRIVATE KEY-----
</key>`;
}

function updateConfigDisplay() {
  const selectedId = configServerSelect.value;
  const server = VPN_SERVERS.find(s => s.id === selectedId) || appState.selectedServer;

  if (activeConfigType === "wireguard") {
    configFileName.textContent = `aurora-${server.id}.conf`;
    configText.textContent = generateWireguardConfig(server);
  } else {
    configFileName.textContent = `aurora-${server.id}.ovpn`;
    configText.textContent = generateOpenvpnConfig(server);
  }
}

// -------------------------------------------------------------
// Event Listeners
// -------------------------------------------------------------
function setupEventListeners() {
  // Power button
  vpnPowerBtn.addEventListener("click", handlePowerClick);

  // Sheets
  btnOpenServerSheet.addEventListener("click", openServerModal);
  btnCloseServerModal.addEventListener("click", closeServerModal);
  serverModal.addEventListener("click", (e) => {
    if (e.target === serverModal) closeServerModal();
  });

  btnOpenProtocolSheet.addEventListener("click", openProtoModal);
  btnCloseProtoModal.addEventListener("click", closeProtoModal);
  protocolModal.addEventListener("click", (e) => {
    if (e.target === protocolModal) closeProtoModal();
  });

  // Protocol options
  document.querySelectorAll(".proto-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".proto-option").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      const protoName = opt.querySelector(".proto-opt-name").textContent;
      selectedProtoName.textContent = protoName;
      appState.selectedProtocol = protoName;
      closeProtoModal();

      if (appState.status === "CONNECTED") {
        addLog(`[PROTO] Switching protocol to ${protoName}...`, "info");
        disconnectVpn();
        setTimeout(startConnecting, 500);
      }
    });
  });

  btnToggleSettings.addEventListener("click", openSettingsModal);
  btnCloseSettingsModal.addEventListener("click", closeSettingsModal);
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });

  // Terminal toggle
  btnToggleLogs.addEventListener("click", () => {
    terminalBox.classList.toggle("hidden");
    logsArrow.style.transform = terminalBox.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
  });

  btnClearLogs.addEventListener("click", () => {
    logContent.innerHTML = "";
    addLog("[SYS] Log console cleared", "info");
  });

  // Config Generator Controls
  configServerSelect.addEventListener("change", updateConfigDisplay);

  tabWireguard.addEventListener("click", () => {
    activeConfigType = "wireguard";
    tabWireguard.classList.add("active");
    tabOpenvpn.classList.remove("active");
    updateConfigDisplay();
  });

  tabOpenvpn.addEventListener("click", () => {
    activeConfigType = "openvpn";
    tabOpenvpn.classList.add("active");
    tabWireguard.classList.remove("active");
    updateConfigDisplay();
  });

  // Copy Config
  btnCopyConfig.addEventListener("click", () => {
    navigator.clipboard.writeText(configText.textContent).then(() => {
      copyBtnText.textContent = "Copied!";
      setTimeout(() => {
        copyBtnText.textContent = "Copy Config";
      }, 2000);
    });
  });

  // Download Config File
  btnDownloadConfigFile.addEventListener("click", () => {
    const filename = configFileName.textContent;
    const content = configText.textContent;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}
