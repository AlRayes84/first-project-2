package com.auroravpn.app.model

data class VpnServer(
    val id: String,
    val name: String,
    val country: String,
    val city: String,
    val flagEmoji: String,
    val ipAddress: String,
    val port: Int = 51820,
    val pingMs: Int,
    val loadPercent: Int,
    val protocol: VpnProtocol = VpnProtocol.WIREGUARD,
    val isRecommended: Boolean = false
) {
    companion object {
        fun getDefaultServers(): List<VpnServer> = listOf(
            VpnServer(
                id = "us-east",
                name = "United States - New York",
                country = "United States",
                city = "New York",
                flagEmoji = "🇺🇸",
                ipAddress = "198.51.100.12",
                pingMs = 18,
                loadPercent = 42,
                isRecommended = true
            ),
            VpnServer(
                id = "us-west",
                name = "United States - Los Angeles",
                country = "United States",
                city = "Los Angeles",
                flagEmoji = "🇺🇸",
                ipAddress = "198.51.100.45",
                pingMs = 28,
                loadPercent = 38
            ),
            VpnServer(
                id = "de-fra",
                name = "Germany - Frankfurt",
                country = "Germany",
                city = "Frankfurt",
                flagEmoji = "🇩🇪",
                ipAddress = "193.174.198.5",
                pingMs = 24,
                loadPercent = 35,
                isRecommended = true
            ),
            VpnServer(
                id = "uk-lon",
                name = "United Kingdom - London",
                country = "United Kingdom",
                city = "London",
                flagEmoji = "🇬🇧",
                ipAddress = "185.190.140.22",
                pingMs = 31,
                loadPercent = 51
            ),
            VpnServer(
                id = "nl-ams",
                name = "Netherlands - Amsterdam",
                country = "Netherlands",
                city = "Amsterdam",
                flagEmoji = "🇳🇱",
                ipAddress = "194.135.216.7",
                pingMs = 22,
                loadPercent = 29
            ),
            VpnServer(
                id = "jp-tyo",
                name = "Japan - Tokyo",
                country = "Japan",
                city = "Tokyo",
                flagEmoji = "🇯🇵",
                ipAddress = "133.242.18.91",
                pingMs = 85,
                loadPercent = 47
            ),
            VpnServer(
                id = "sg-sin",
                name = "Singapore - Jurong",
                country = "Singapore",
                city = "Singapore",
                flagEmoji = "🇸🇬",
                ipAddress = "128.199.204.33",
                pingMs = 72,
                loadPercent = 40
            ),
            VpnServer(
                id = "ch-zrh",
                name = "Switzerland - Zurich",
                country = "Switzerland",
                city = "Zurich",
                flagEmoji = "🇨🇭",
                ipAddress = "185.220.101.42",
                pingMs = 26,
                loadPercent = 21
            ),
            VpnServer(
                id = "ca-tor",
                name = "Canada - Toronto",
                country = "Canada",
                city = "Toronto",
                flagEmoji = "🇨🇦",
                ipAddress = "192.99.148.11",
                pingMs = 34,
                loadPercent = 33
            ),
            VpnServer(
                id = "fr-par",
                name = "France - Paris",
                country = "France",
                city = "Paris",
                flagEmoji = "🇫🇷",
                ipAddress = "51.15.24.89",
                pingMs = 27,
                loadPercent = 44
            )
        )
    }
}
