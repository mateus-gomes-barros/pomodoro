package com.mateusgomes.focusapp.pulse.tile

import android.content.Context
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders
import androidx.wear.protolayout.DimensionBuilders
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import com.mateusgomes.focusapp.pulse.MainActivity
import com.mateusgomes.focusapp.pulse.sync.PulseRemoteTimerStore
import com.mateusgomes.focusapp.pulse.sync.PulseWearDataLayer
import com.mateusgomes.focusapp.pulse.timer.FocusHomeKey
import com.mateusgomes.focusapp.pulse.timer.PulseSession
import com.mateusgomes.focusapp.pulse.timer.PulseTimerAlarmScheduler
import com.mateusgomes.focusapp.pulse.timer.PulseTimerOngoingService
import com.mateusgomes.focusapp.pulse.timer.PulseTimerPersistence
import com.mateusgomes.focusapp.pulse.timer.PulseTimerSettings
import com.mateusgomes.focusapp.pulse.timer.PulseTimerSnapshot
import com.mateusgomes.focusapp.pulse.timer.PulseTimerStatus
import kotlin.math.ceil

class PulseTimerTileService : TileService() {
    override fun onTileRequest(
        requestParams: RequestBuilders.TileRequest,
    ): ListenableFuture<TileBuilders.Tile> {
        handleAction(requestParams.currentState.lastClickableId)

        val snapshot = PulseTimerPersistence(this).load(PulseTimerSettings())
        val remote = PulseRemoteTimerStore(this).load()
        val remaining = currentRemaining(snapshot)
        val accent = FocusHomeKey.fromWireValue(remote?.focusHome)?.let(::accentFor)
            ?: 0xFF34D399.toInt()
        val contextLine = listOfNotNull(
            remote?.taskName?.takeIf { it.isNotBlank() },
            remote?.projectName?.takeIf { it.isNotBlank() },
        ).joinToString(" • ").ifBlank {
            when (snapshot.session) {
                PulseSession.FOCUS -> "Foco"
                PulseSession.SHORT_BREAK -> "Pausa curta"
                PulseSession.LONG_BREAK -> "Pausa longa"
            }
        }

        val layout = tileLayout(
            time = formatTime(remaining),
            contextLine = contextLine,
            status = snapshot.status,
            accent = accent,
        )
        val freshness = if (snapshot.status == PulseTimerStatus.RUNNING) {
            1_000L
        } else {
            60_000L
        }

        return Futures.immediateFuture(
            TileBuilders.Tile.Builder()
                .setResourcesVersion(RESOURCES_VERSION)
                .setFreshnessIntervalMillis(freshness)
                .setTileTimeline(
                    TimelineBuilders.Timeline.fromLayoutElement(layout),
                )
                .build(),
        )
    }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<ResourceBuilders.Resources> =
        Futures.immediateFuture(
            ResourceBuilders.Resources.Builder()
                .setVersion(requestParams.version)
                .build(),
        )

    private fun handleAction(action: String) {
        if (action != ACTION_TOGGLE) return

        val persistence = PulseTimerPersistence(this)
        val settings = PulseTimerSettings()
        val snapshot = persistence.load(settings)
        val dataLayer = PulseWearDataLayer(this)
        val focusHome = FocusHomeKey.fromWireValue(
            PulseRemoteTimerStore(this).load()?.focusHome,
        )
        val totalSeconds = when (snapshot.session) {
            PulseSession.FOCUS -> snapshot.workDurationMinutes * 60
            PulseSession.SHORT_BREAK -> snapshot.shortBreakDurationMinutes * 60
            PulseSession.LONG_BREAK -> snapshot.longBreakDurationMinutes * 60
        }

        if (snapshot.status == PulseTimerStatus.RUNNING) {
            val pausedRemaining = currentRemaining(snapshot)
            val paused = snapshot.copy(
                status = PulseTimerStatus.PAUSED,
                remainingSeconds = pausedRemaining,
                endsAtEpochMillis = 0L,
            )
            persistence.save(paused)
            PulseTimerAlarmScheduler(this).cancel()
            PulseTimerOngoingService.stop(this)
            dataLayer.publishTimer(
                session = snapshot.session,
                status = PulseTimerStatus.PAUSED,
                durationSeconds = totalSeconds,
                remainingSeconds = pausedRemaining,
                endsAt = 0L,
                focusHome = focusHome,
            )
        } else {
            val startingRemaining = snapshot.remainingSeconds
                .takeIf { it > 0 }
                ?: totalSeconds
            val endsAt =
                System.currentTimeMillis() + startingRemaining * 1000L
            val running = snapshot.copy(
                status = PulseTimerStatus.RUNNING,
                remainingSeconds = startingRemaining,
                endsAtEpochMillis = endsAt,
            )
            persistence.save(running)
            PulseTimerAlarmScheduler(this).schedule(endsAt, snapshot.session)
            PulseTimerOngoingService.start(this, endsAt, snapshot.session)
            dataLayer.publishTimer(
                session = snapshot.session,
                status = PulseTimerStatus.RUNNING,
                durationSeconds = totalSeconds,
                remainingSeconds = startingRemaining,
                endsAt = endsAt,
                focusHome = focusHome,
            )
        }
    }

    private fun currentRemaining(snapshot: PulseTimerSnapshot): Int {
        if (
            snapshot.status != PulseTimerStatus.RUNNING ||
            snapshot.endsAtEpochMillis <= 0L
        ) {
            return snapshot.remainingSeconds.coerceAtLeast(0)
        }
        return ceil(
            (snapshot.endsAtEpochMillis - System.currentTimeMillis())
                .coerceAtLeast(0L) / 1000.0,
        ).toInt()
    }

    private fun tileLayout(
        time: String,
        contextLine: String,
        status: PulseTimerStatus,
        accent: Int,
    ): LayoutElementBuilders.LayoutElement {
        val toggleLabel =
            if (status == PulseTimerStatus.RUNNING) "Pausar" else "Iniciar"

        val content = LayoutElementBuilders.Column.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.expand())
            .setHorizontalAlignment(
                LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER,
            )
            .addContent(spacer(20f))
            .addContent(text("Focus Pulse", 13f, 0x99FFFFFF.toInt()))
            .addContent(spacer(10f))
            .addContent(text(time, 38f, accent))
            .addContent(spacer(5f))
            .addContent(text(contextLine.take(28), 12f, 0x99FFFFFF.toInt()))
            .addContent(spacer(13f))
            .addContent(
                LayoutElementBuilders.Row.Builder()
                    .setWidth(DimensionBuilders.wrap())
                    .setHeight(DimensionBuilders.wrap())
                    .addContent(
                        actionButton(
                            label = toggleLabel,
                            id = ACTION_TOGGLE,
                            accent = accent,
                            launchApp = false,
                        ),
                    )
                    .addContent(
                        LayoutElementBuilders.Spacer.Builder()
                            .setWidth(DimensionBuilders.dp(8f))
                            .setHeight(DimensionBuilders.dp(1f))
                            .build(),
                    )
                    .addContent(
                        actionButton(
                            label = "Abrir",
                            id = ACTION_OPEN,
                            accent = 0xFF17211D.toInt(),
                            launchApp = true,
                        ),
                    )
                    .build(),
            )
            .build()

        return LayoutElementBuilders.Box.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.expand())
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setBackground(
                        ModifiersBuilders.Background.Builder()
                            .setColor(ColorBuilders.argb(0xFF020604.toInt()))
                            .build(),
                    )
                    .build(),
            )
            .addContent(content)
            .build()
    }

    private fun actionButton(
        label: String,
        id: String,
        accent: Int,
        launchApp: Boolean,
    ): LayoutElementBuilders.LayoutElement {
        val action = if (launchApp) {
            ActionBuilders.LaunchAction.Builder()
                .setAndroidActivity(
                    ActionBuilders.AndroidActivity.Builder()
                        .setPackageName(packageName)
                        .setClassName(MainActivity::class.java.name)
                        .build(),
                )
                .build()
        } else {
            ActionBuilders.LoadAction.Builder().build()
        }

        return LayoutElementBuilders.Box.Builder()
            .setWidth(DimensionBuilders.dp(72f))
            .setHeight(DimensionBuilders.dp(38f))
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setClickable(
                        ModifiersBuilders.Clickable.Builder()
                            .setId(id)
                            .setOnClick(action)
                            .build(),
                    )
                    .setBackground(
                        ModifiersBuilders.Background.Builder()
                            .setColor(ColorBuilders.argb(accent))
                            .setCorner(
                                ModifiersBuilders.Corner.Builder()
                                    .setRadius(DimensionBuilders.dp(18f))
                                    .build(),
                            )
                            .build(),
                    )
                    .build(),
            )
            .addContent(
                text(
                    label,
                    12f,
                    if (accent == 0xFF17211D.toInt()) {
                        0xCCFFFFFF.toInt()
                    } else {
                        0xFF020604.toInt()
                    },
                ),
            )
            .build()
    }

    private fun text(
        value: String,
        size: Float,
        color: Int,
    ): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Text.Builder()
            .setText(value)
            .setMaxLines(1)
            .setOverflow(LayoutElementBuilders.TEXT_OVERFLOW_ELLIPSIZE_END)
            .setFontStyle(
                LayoutElementBuilders.FontStyle.Builder()
                    .setSize(DimensionBuilders.sp(size))
                    .setColor(ColorBuilders.argb(color))
                    .build(),
            )
            .build()

    private fun spacer(height: Float): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Spacer.Builder()
            .setWidth(DimensionBuilders.dp(1f))
            .setHeight(DimensionBuilders.dp(height))
            .build()

    private fun accentFor(key: FocusHomeKey): Int = when (key) {
        FocusHomeKey.ASTER -> 0xFFA78BFA.toInt()
        FocusHomeKey.ATLAS -> 0xFF4F8EF7.toInt()
        FocusHomeKey.FORGE -> 0xFFF59E0B.toInt()
        FocusHomeKey.PULSE -> 0xFFFB7185.toInt()
        FocusHomeKey.LOOM -> 0xFF22D3EE.toInt()
        FocusHomeKey.ORBIT -> 0xFF818CF8.toInt()
        FocusHomeKey.TIDE -> 0xFF2DD4BF.toInt()
        FocusHomeKey.EMBER -> 0xFFF97316.toInt()
        FocusHomeKey.NOVA -> 0xFFFBBF24.toInt()
        FocusHomeKey.PRISM -> 0xFFE879F9.toInt()
        FocusHomeKey.VANGUARD -> 0xFFF43F5E.toInt()
        FocusHomeKey.VERDANT -> 0xFF34D399.toInt()
    }

    private fun formatTime(totalSeconds: Int): String =
        "%02d:%02d".format(
            totalSeconds / 60,
            totalSeconds % 60,
        )

    companion object {
        private const val RESOURCES_VERSION = "1"
        private const val ACTION_TOGGLE = "pulse_timer_toggle"
        private const val ACTION_OPEN = "pulse_timer_open"

        fun requestUpdate(context: Context) {
            runCatching {
                TileService.getUpdater(context.applicationContext)
                    .requestUpdate(PulseTimerTileService::class.java)
            }
        }
    }
}
