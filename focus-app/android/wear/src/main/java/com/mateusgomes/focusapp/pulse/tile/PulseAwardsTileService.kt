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
import com.mateusgomes.focusapp.pulse.R
import com.mateusgomes.focusapp.pulse.sync.PulseFocusSnapshotStore
import com.mateusgomes.focusapp.pulse.timer.FocusHomeKey

class PulseAwardsTileService : TileService() {
    override fun onTileRequest(
        requestParams: RequestBuilders.TileRequest,
    ): ListenableFuture<TileBuilders.Tile> {
        if (requestParams.currentState.lastClickableId == ACTION_TOGGLE) {
            val preferences = getSharedPreferences(PREFERENCES, MODE_PRIVATE)
            preferences.edit()
                .putBoolean(KEY_BADGE, !preferences.getBoolean(KEY_BADGE, false))
                .apply()
        }
        val snapshot = PulseFocusSnapshotStore(this).load()
        val showBadge = getSharedPreferences(PREFERENCES, MODE_PRIVATE)
            .getBoolean(KEY_BADGE, false)
        val focusHome = FocusHomeKey.fromWireValue(snapshot?.focusHome)
        val accent = focusHome?.let(::accentFor) ?: 0xFF34D399.toInt()
        val mainLabel = if (showBadge) {
            snapshot?.badgeName ?: "First Drop"
        } else {
            focusHome?.wireValue?.replaceFirstChar { it.uppercase() } ?: "FocushoMe"
        }
        val eyebrow = getString(
            if (showBadge) R.string.tile_awards_badge
            else R.string.tile_awards_focus_home,
        )
        val hint = getString(
            if (showBadge) R.string.tile_awards_show_personality
            else R.string.tile_awards_show_badge,
        )

        val layout = LayoutElementBuilders.Box.Builder()
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
                    .setClickable(
                        ModifiersBuilders.Clickable.Builder()
                            .setId(ACTION_TOGGLE)
                            .setOnClick(ActionBuilders.LoadAction.Builder().build())
                            .build(),
                    )
                    .build(),
            )
            .addContent(
                ring(
                    diameter = 178f,
                    color = accent,
                    innerDiameter = 158f,
                    content = LayoutElementBuilders.Column.Builder()
                        .setWidth(DimensionBuilders.expand())
                        .setHeight(DimensionBuilders.expand())
                        .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                        .addContent(spacer(46f))
                        .addContent(text(eyebrow, 10f, 0x88FFFFFF.toInt()))
                        .addContent(spacer(8f))
                        .addContent(text(mainLabel.take(22), if (showBadge) 19f else 23f, accent))
                        .addContent(spacer(9f))
                        .addContent(text(hint, 10f, 0x88FFFFFF.toInt()))
                        .build(),
                ),
            )
            .build()

        return Futures.immediateFuture(
            TileBuilders.Tile.Builder()
                .setResourcesVersion(RESOURCES_VERSION)
                .setFreshnessIntervalMillis(60_000L)
                .setTileTimeline(TimelineBuilders.Timeline.fromLayoutElement(layout))
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

    private fun ring(
        diameter: Float,
        color: Int,
        innerDiameter: Float,
        content: LayoutElementBuilders.LayoutElement,
    ): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Box.Builder()
            .setWidth(DimensionBuilders.dp(diameter))
            .setHeight(DimensionBuilders.dp(diameter))
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setBackground(
                        ModifiersBuilders.Background.Builder()
                            .setColor(ColorBuilders.argb(color))
                            .setCorner(
                                ModifiersBuilders.Corner.Builder()
                                    .setRadius(DimensionBuilders.dp(diameter / 2f))
                                    .build(),
                            )
                            .build(),
                    )
                    .build(),
            )
            .addContent(
                LayoutElementBuilders.Box.Builder()
                    .setWidth(DimensionBuilders.dp(innerDiameter))
                    .setHeight(DimensionBuilders.dp(innerDiameter))
                    .setModifiers(
                        ModifiersBuilders.Modifiers.Builder()
                            .setBackground(
                                ModifiersBuilders.Background.Builder()
                                    .setColor(ColorBuilders.argb(0xFF07110C.toInt()))
                                    .setCorner(
                                        ModifiersBuilders.Corner.Builder()
                                            .setRadius(DimensionBuilders.dp(innerDiameter / 2f))
                                            .build(),
                                    )
                                    .build(),
                            )
                            .build(),
                    )
                    .addContent(content)
                    .build(),
            )
            .build()

    private fun text(value: String, size: Float, color: Int) =
        LayoutElementBuilders.Text.Builder()
            .setText(value)
            .setMaxLines(2)
            .setOverflow(LayoutElementBuilders.TEXT_OVERFLOW_ELLIPSIZE_END)
            .setFontStyle(
                LayoutElementBuilders.FontStyle.Builder()
                    .setSize(DimensionBuilders.sp(size))
                    .setColor(ColorBuilders.argb(color))
                    .build(),
            )
            .build()

    private fun spacer(height: Float) =
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

    companion object {
        private const val RESOURCES_VERSION = "1"
        private const val ACTION_TOGGLE = "pulse_awards_toggle"
        private const val PREFERENCES = "pulse_awards_tile"
        private const val KEY_BADGE = "show_badge"

        fun requestUpdate(context: Context) {
            runCatching {
                TileService.getUpdater(context.applicationContext)
                    .requestUpdate(PulseAwardsTileService::class.java)
            }
        }
    }
}
