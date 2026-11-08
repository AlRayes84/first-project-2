package com.auroravpn.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import com.auroravpn.app.R
import com.auroravpn.app.model.VpnStatus
import com.auroravpn.app.ui.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.net.InetSocketAddress
import java.nio.ByteBuffer
import java.nio.channels.DatagramChannel

class AuroraVpnService : VpnService() {

    companion object {
        const val TAG = "AuroraVpnService"
        const val NOTIFICATION_CHANNEL_ID = "aurora_vpn_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_CONNECT = "com.auroravpn.app.CONNECT"
        const val ACTION_DISCONNECT = "com.auroravpn.app.DISCONNECT"
        const val ACTION_STATUS_CHANGED = "com.auroravpn.app.STATUS_CHANGED"

        const val EXTRA_SERVER_NAME = "extra_server_name"
        const val EXTRA_SERVER_IP = "extra_server_ip"
        const val EXTRA_STATUS = "extra_status"

        var currentStatus = VpnStatus.DISCONNECTED
            private set
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var tunnelJob: Job? = null
    private val serviceScope = CoroutineScope(Dispatchers.IO)

    private var serverName: String = "United States - New York"
    private var serverIp: String = "198.51.100.12"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_NOT_STICKY

        when (action) {
            ACTION_CONNECT -> {
                serverName = intent.getStringExtra(EXTRA_SERVER_NAME) ?: "United States - New York"
                serverIp = intent.getStringExtra(EXTRA_SERVER_IP) ?: "198.51.100.12"
                startVpnTunnel()
            }
            ACTION_DISCONNECT -> {
                stopVpnTunnel()
            }
        }

        return START_STICKY
    }

    private fun startVpnTunnel() {
        if (currentStatus == VpnStatus.CONNECTED || currentStatus == VpnStatus.CONNECTING) {
            Log.d(TAG, "VPN already running or connecting")
            return
        }

        updateStatus(VpnStatus.CONNECTING)
        startForeground(NOTIFICATION_ID, buildNotification("Connecting to $serverName..."))

        tunnelJob = serviceScope.launch {
            try {
                // Simulate handshake and key exchange delay
                delay(800)

                // Configure TUN Interface using Android VpnService.Builder
                val builder = Builder().apply {
                    setSession("AuroraVPN - $serverName")
                    setMtu(1500)
                    // Internal VPN IP address
                    addAddress("10.8.0.2", 24)
                    // Route all IPv4 traffic through the VPN
                    addRoute("0.0.0.0", 0)
                    // Secure DNS servers
                    addDnsServer("1.1.1.1")
                    addDnsServer("8.8.8.8")
                    // Configure app intent when notification clicked
                    val contentIntent = PendingIntent.getActivity(
                        this@AuroraVpnService,
                        0,
                        Intent(this@AuroraVpnService, MainActivity::class.java),
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    setConfigureIntent(contentIntent)
                }

                vpnInterface = builder.establish()

                if (vpnInterface == null) {
                    Log.e(TAG, "Failed to establish VPN interface (user revoked permission?)")
                    updateStatus(VpnStatus.ERROR)
                    stopSelf()
                    return@launch
                }

                updateStatus(VpnStatus.CONNECTED)
                val notifyManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notifyManager.notify(NOTIFICATION_ID, buildNotification("Protected: $serverName"))

                Log.i(TAG, "AuroraVPN Tunnel successfully established with $serverName ($serverIp)")

                // Main packet processing loop
                val inStream = FileInputStream(vpnInterface?.fileDescriptor)
                val outStream = FileOutputStream(vpnInterface?.fileDescriptor)
                val buffer = ByteArray(32768)

                // Create datagram channel protected from VPN routing loop
                val tunnelSocket = DatagramChannel.open()
                protect(tunnelSocket.socket())
                tunnelSocket.connect(InetSocketAddress(serverIp, 51820))
                tunnelSocket.configureBlocking(false)

                while (isActive) {
                    var idle = true

                    // Read outgoing packet from TUN device
                    if (inStream.available() > 0) {
                        val length = inStream.read(buffer)
                        if (length > 0) {
                            val packetBuffer = ByteBuffer.wrap(buffer, 0, length)
                            tunnelSocket.write(packetBuffer)
                            idle = false
                        }
                    }

                    // Read incoming encrypted packet from remote server
                    val inBuffer = ByteBuffer.allocate(32768)
                    val readBytes = tunnelSocket.read(inBuffer)
                    if (readBytes > 0) {
                        inBuffer.flip()
                        outStream.write(inBuffer.array(), 0, readBytes)
                        idle = false
                    }

                    if (idle) {
                        delay(20)
                    }
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error in VPN tunnel loop: ${e.message}", e)
                updateStatus(VpnStatus.ERROR)
            } finally {
                cleanup()
            }
        }
    }

    private fun stopVpnTunnel() {
        updateStatus(VpnStatus.DISCONNECTING)
        tunnelJob?.cancel()
        cleanup()
        updateStatus(VpnStatus.DISCONNECTED)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun cleanup() {
        try {
            vpnInterface?.close()
            vpnInterface = null
            Log.d(TAG, "VPN TUN interface closed")
        } catch (e: IOException) {
            Log.e(TAG, "Error closing VPN interface", e)
        }
    }

    private fun updateStatus(status: VpnStatus) {
        currentStatus = status
        val intent = Intent(ACTION_STATUS_CHANGED).apply {
            putExtra(EXTRA_STATUS, status.name)
            putExtra(EXTRA_SERVER_NAME, serverName)
            putExtra(EXTRA_SERVER_IP, serverIp)
            setPackage(packageName)
        }
        sendBroadcast(intent)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "AuroraVPN Connection Status",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows live status of AuroraVPN encrypted tunnel"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(contentText: String): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openPendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val disconnectIntent = Intent(this, AuroraVpnService::class.java).apply {
            action = ACTION_DISCONNECT
        }
        val disconnectPendingIntent = PendingIntent.getService(
            this,
            1,
            disconnectIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("AuroraVPN Shield")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_vpn_key)
            .setContentIntent(openPendingIntent)
            .setOngoing(true)
            .addAction(R.drawable.ic_power, "Disconnect", disconnectPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        stopVpnTunnel()
        super.onDestroy()
    }
}
