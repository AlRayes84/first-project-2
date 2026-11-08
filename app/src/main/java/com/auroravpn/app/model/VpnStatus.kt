package com.auroravpn.app.model

enum class VpnStatus {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    DISCONNECTING,
    ERROR
}

enum class VpnProtocol(val displayName: String, val port: Int) {
    WIREGUARD("WireGuard (ChaCha20)", 51820),
    OPENVPN_UDP("OpenVPN UDP (AES-256)", 1194),
    OPENVPN_TCP("OpenVPN TCP (AES-256)", 443),
    SHADOWSOCKS("Shadowsocks (AEAD)", 8388)
}
