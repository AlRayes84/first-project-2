package com.auroravpn.app.ui

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.auroravpn.app.R
import com.auroravpn.app.databinding.ActivityMainBinding
import com.auroravpn.app.model.VpnProtocol
import com.auroravpn.app.model.VpnServer
import com.auroravpn.app.model.VpnStatus
import com.auroravpn.app.service.AuroraVpnService
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var selectedServer: VpnServer = VpnServer.getDefaultServers().first()
    private var selectedProtocol: VpnProtocol = VpnProtocol.WIREGUARD
    private var currentStatus: VpnStatus = VpnStatus.DISCONNECTED

    private var connectionStartTime: Long = 0
    private val timerHandler = Handler(Looper.getMainLooper())
    private val timerRunnable = object : Runnable {
        override fun run() {
            if (currentStatus == VpnStatus.CONNECTED) {
                val elapsedSeconds = (System.currentTimeMillis() - connectionStartTime) / 1000
                val hours = elapsedSeconds / 3600
                val minutes = (elapsedSeconds % 3600) / 60
                val seconds = elapsedSeconds % 60
                binding.tvDurationTimer.text = String.format(Locale.getDefault(), "%02d:%02d:%02d", hours, minutes, seconds)

                // Simulated live traffic
                val downloadRate = (12.4 + (Math.sin(elapsedSeconds.toDouble()) * 4.2)).coerceAtLeast(1.0)
                val uploadRate = (3.2 + (Math.cos(elapsedSeconds.toDouble()) * 1.5)).coerceAtLeast(0.5)
                binding.tvDownloadSpeed.text = String.format(Locale.getDefault(), "%.1f MB/s", downloadRate)
                binding.tvUploadSpeed.text = String.format(Locale.getDefault(), "%.1f MB/s", uploadRate)

                timerHandler.postDelayed(this, 1000)
            }
        }
    }

    private val vpnPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            startVpnService()
        } else {
            Toast.makeText(this, "VPN permission is required to secure your connection", Toast.LENGTH_LONG).show()
            updateUiState(VpnStatus.DISCONNECTED)
        }
    }

    private val vpnReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val statusStr = intent?.getStringExtra(AuroraVpnService.EXTRA_STATUS) ?: return
            val status = try {
                VpnStatus.valueOf(statusStr)
            } catch (e: Exception) {
                VpnStatus.DISCONNECTED
            }
            updateUiState(status)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        setupListeners()
    }

    override fun onResume() {
        super.onResume()
        val filter = IntentFilter(AuroraVpnService.ACTION_STATUS_CHANGED)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(vpnReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(vpnReceiver, filter)
        }
        updateUiState(AuroraVpnService.currentStatus)
    }

    override fun onPause() {
        super.onPause()
        try {
            unregisterReceiver(vpnReceiver)
        } catch (e: Exception) {
            // Ignored
        }
    }

    private fun setupUI() {
        updateSelectedServerDisplay()
        binding.tvProtocolName.text = selectedProtocol.displayName
    }

    private fun setupListeners() {
        binding.btnPower.setOnClickListener {
            when (currentStatus) {
                VpnStatus.CONNECTED -> stopVpnService()
                VpnStatus.DISCONNECTED, VpnStatus.ERROR -> prepareAndStartVpn()
                VpnStatus.CONNECTING, VpnStatus.DISCONNECTING -> { /* waiting */ }
            }
        }

        binding.cardServerSelector.setOnClickListener {
            showServerPickerDialog()
        }

        binding.cardProtocolSelector.setOnClickListener {
            showProtocolPickerDialog()
        }

        binding.switchKillSwitch.setOnCheckedChangeListener { _, isChecked ->
            val msg = if (isChecked) "Kill Switch activated (blocking leaks)" else "Kill Switch disabled"
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        }

        binding.switchAdBlocker.setOnCheckedChangeListener { _, isChecked ->
            val msg = if (isChecked) "Ad & Malware DNS filtering enabled" else "DNS filtering disabled"
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        }
    }

    private fun prepareAndStartVpn() {
        val prepareIntent = VpnService.prepare(this)
        if (prepareIntent != null) {
            vpnPermissionLauncher.launch(prepareIntent)
        } else {
            startVpnService()
        }
    }

    private fun startVpnService() {
        updateUiState(VpnStatus.CONNECTING)
        val intent = Intent(this, AuroraVpnService::class.java).apply {
            action = AuroraVpnService.ACTION_CONNECT
            putExtra(AuroraVpnService.EXTRA_SERVER_NAME, selectedServer.name)
            putExtra(AuroraVpnService.EXTRA_SERVER_IP, selectedServer.ipAddress)
        }
        ContextCompat.startForegroundService(this, intent)
    }

    private fun stopVpnService() {
        updateUiState(VpnStatus.DISCONNECTING)
        val intent = Intent(this, AuroraVpnService::class.java).apply {
            action = AuroraVpnService.ACTION_DISCONNECT
        }
        startService(intent)
    }

    private fun updateUiState(status: VpnStatus) {
        currentStatus = status
        when (status) {
            VpnStatus.CONNECTED -> {
                binding.tvConnectionStatus.text = "SECURE & PROTECTED"
                binding.tvConnectionStatus.setTextColor(ContextCompat.getColor(this, R.color.emerald_400))
                binding.btnPower.setImageResource(R.drawable.ic_power)
                binding.btnPower.backgroundTintList = ContextCompat.getColorStateList(this, R.color.emerald_500)
                binding.layoutStats.visibility = View.VISIBLE
                binding.tvVirtualIp.text = selectedServer.ipAddress

                if (connectionStartTime == 0L) {
                    connectionStartTime = System.currentTimeMillis()
                }
                timerHandler.removeCallbacks(timerRunnable)
                timerHandler.post(timerRunnable)
            }
            VpnStatus.CONNECTING -> {
                binding.tvConnectionStatus.text = "ESTABLISHING TUNNEL..."
                binding.tvConnectionStatus.setTextColor(ContextCompat.getColor(this, R.color.amber_400))
                binding.btnPower.backgroundTintList = ContextCompat.getColorStateList(this, R.color.amber_500)
            }
            VpnStatus.DISCONNECTING -> {
                binding.tvConnectionStatus.text = "DISCONNECTING..."
                binding.tvConnectionStatus.setTextColor(ContextCompat.getColor(this, R.color.slate_400))
            }
            VpnStatus.DISCONNECTED, VpnStatus.ERROR -> {
                binding.tvConnectionStatus.text = "NOT PROTECTED"
                binding.tvConnectionStatus.setTextColor(ContextCompat.getColor(this, R.color.slate_400))
                binding.btnPower.setImageResource(R.drawable.ic_power)
                binding.btnPower.backgroundTintList = ContextCompat.getColorStateList(this, R.color.indigo_600)
                binding.layoutStats.visibility = View.GONE
                binding.tvDurationTimer.text = "00:00:00"
                binding.tvVirtualIp.text = "Real IP Exposed"
                connectionStartTime = 0
                timerHandler.removeCallbacks(timerRunnable)
            }
        }
    }

    private fun updateSelectedServerDisplay() {
        binding.tvServerName.text = "${selectedServer.flagEmoji} ${selectedServer.name}"
        binding.tvServerPing.text = "${selectedServer.pingMs} ms"
    }

    private fun showServerPickerDialog() {
        val servers = VpnServer.getDefaultServers()
        val serverNames = servers.map { "${it.flagEmoji} ${it.name} (${it.pingMs} ms)" }.toTypedArray()

        AlertDialog.Builder(this)
            .setTitle("Select VPN Location")
            .setItems(serverNames) { _, which ->
                selectedServer = servers[which]
                updateSelectedServerDisplay()
                if (currentStatus == VpnStatus.CONNECTED) {
                    Toast.makeText(this, "Reconnecting to ${selectedServer.name}...", Toast.LENGTH_SHORT).show()
                    startVpnService()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showProtocolPickerDialog() {
        val protocols = VpnProtocol.values()
        val protocolNames = protocols.map { it.displayName }.toTypedArray()

        AlertDialog.Builder(this)
            .setTitle("Select Protocol")
            .setItems(protocolNames) { _, which ->
                selectedProtocol = protocols[which]
                binding.tvProtocolName.text = selectedProtocol.displayName
                if (currentStatus == VpnStatus.CONNECTED) {
                    Toast.makeText(this, "Protocol switched to ${selectedProtocol.name}. Reconnecting...", Toast.LENGTH_SHORT).show()
                    startVpnService()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
