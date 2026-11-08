package com.auroravpn.app.service

import android.content.Intent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi
import com.auroravpn.app.model.VpnStatus

@RequiresApi(Build.VERSION_CODES.N)
class AuroraVpnTileService : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        updateTileState()
    }

    override fun onClick() {
        super.onClick()
        val isConnected = AuroraVpnService.currentStatus == VpnStatus.CONNECTED

        val intent = Intent(this, AuroraVpnService::class.java).apply {
            action = if (isConnected) AuroraVpnService.ACTION_DISCONNECT else AuroraVpnService.ACTION_CONNECT
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }

        updateTileState()
    }

    private fun updateTileState() {
        val tile = qsTile ?: return
        val isConnected = AuroraVpnService.currentStatus == VpnStatus.CONNECTED

        tile.state = if (isConnected) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
        tile.label = if (isConnected) "AuroraVPN: ON" else "AuroraVPN: OFF"
        tile.updateTile()
    }
}
