# 🛡️ AuroraVPN for Android

[![Build Android APK](https://github.com/AlRayes84/first-project-2/actions/workflows/build-apk.yml/badge.svg)](https://github.com/AlRayes84/first-project-2/actions/workflows/build-apk.yml)
[![Android](https://img.shields.io/badge/Android-7.0%2B%20(API%2024%2B)-3DDC84?logo=android&logoColor=white)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.22-7F52FF?logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![WireGuard](https://img.shields.io/badge/Protocol-WireGuard%20%7C%20OpenVPN-0080FF)](https://www.wireguard.com)
[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/gpl-2.0)

**AuroraVPN** is a modern, privacy-first Android VPN client engineered with high-speed **WireGuard** (ChaCha20-Poly1305) and military-grade **OpenVPN** (AES-256-GCM) protocols.

---

## 🚀 Quick Download

- 📦 **[Download AuroraVPN APK (Primary)](downloads/AuroraVPN.apk)** (v1.0.0, ~37.6 MB)
- 🥷 **[Download AuroraVPN Stealth Shadowsocks APK](downloads/AuroraVPN-Shadowsocks.apk)** (~24.9 MB)
- 🌐 **[Live Web App & Interactive Simulator](https://antigravity.luch.dev/site/6eec2cf3-7e9c-43bf-b64f-c7ff2458ee63/2689fc35d25582cea6ad5e48/)**

---

## ✨ Features

- **⚡ Blazing Fast Protocols**: Full support for WireGuard®, OpenVPN (UDP/TCP), and obfuscated Shadowsocks.
- **🛡️ Android `VpnService` Core**: Official kernel TUN interface allocation with `protect()` socket descriptors to prevent routing loops.
- **🚫 Always-On Kill Switch**: Blocks all unencrypted traffic if the VPN connection drops unexpectedly.
- **🔒 Zero DNS / IPv6 Leaks**: Built-in Quad9 and Cloudflare encrypted DNS resolvers (1.1.1.1, 9.9.9.9) with malware and ad tracking filtering.
- **🌍 10 High-Speed Global Locations**:
  - 🇺🇸 New York & Los Angeles (United States)
  - 🇩🇪 Frankfurt (Germany)
  - 🇬🇧 London (United Kingdom)
  - 🇳🇱 Amsterdam (Netherlands)
  - 🇨🇭 Zurich (Switzerland)
  - 🇯🇵 Tokyo (Japan)
  - 🇸🇬 Singapore
  - 🇨🇦 Toronto (Canada)
  - 🇫🇷 Paris (France)
- **🎛️ Quick Settings Tile**: One-tap VPN toggle directly from the Android system notification shade.

---

## 📲 How to Install on Android

1. Download the [`AuroraVPN.apk`](downloads/AuroraVPN.apk) file to your phone.
2. Tap the downloaded `.apk` file in your notifications or File Manager.
3. If prompted by Android, tap **Settings** and toggle **"Allow from this source"**.
4. Tap **Install**.
5. Open AuroraVPN, select a location, and tap the big **Connect** button.
6. When Android displays the system **Connection Request** dialog, tap **OK**.

---

## 🛠️ Building with Android Studio & Gradle

### Prerequisites
- Android Studio Iguana / Hedgehog or newer
- JDK 17
- Android SDK 34 (API 34)

### Command Line Build
```bash
# Clone the repository
git clone https://github.com/AlRayes84/first-project-2.git
cd first-project-2

# Grant execution permissions
chmod +x gradlew

# Build Debug APK
./gradlew assembleDebug

# Output APK location:
# app/build/outputs/apk/debug/app-debug.apk
```

---

## 🤖 GitHub Actions CI/CD Pipeline

The repository includes an automated workflow in `.github/workflows/build-apk.yml`. Every commit pushed to GitHub automatically:
1. Spins up an `ubuntu-latest` runner with JDK 17 and Android SDK.
2. Executes `./gradlew assembleDebug`.
3. Uploads `AuroraVPN-debug.apk` as a build artifact.
4. Generates a GitHub Release with the compiled APK ready to download!
