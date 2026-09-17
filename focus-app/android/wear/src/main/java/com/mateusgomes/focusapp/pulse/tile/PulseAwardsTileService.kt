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
        val imageId = if (showBadge) {
            badgeImageId(snapshot?.badgeLevel ?: 0)
        } else {
            focusHomeImageId(focusHome)
        }

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
                        .addContent(spacer(25f))
                        .addContent(text(eyebrow, 10f, 0x88FFFFFF.toInt()))
                        .addContent(spacer(4f))
                        .addContent(
                            LayoutElementBuilders.Image.Builder()
                                .setResourceId(imageId)
                                .setWidth(DimensionBuilders.dp(76f))
                                .setHeight(DimensionBuilders.dp(76f))
                                .setContentScaleMode(LayoutElementBuilders.CONTENT_SCALE_MODE_FIT)
                                .build(),
                        )
                        .addContent(text(mainLabel.take(22), 10f, 0xDDFFFFFF.toInt()))
                        .addContent(spacer(4f))
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
                .apply {
                    imageResources().forEach { (id, resourceId) ->
                        addIdToImageMapping(
                            id,
                            ResourceBuilders.ImageResource.Builder()
                                .setAndroidResourceByResId(
                                    ResourceBuilders.AndroidImageResourceByResId.Builder()
                                        .setResourceId(resourceId)
                                        .build(),
                                )
                                .build(),
                        )
                    }
                }
                .build(),
        )

    private fun focusHomeImageId(key: FocusHomeKey?): String =
        "focushome_${key?.wireValue ?: "default"}"

    private fun badgeImageId(level: Int): String = "badge_" + when {
        level >= 2000 -> "2000"
        level >= 1500 -> "1500"
        level >= 1000 -> "1000"
        level >= 750 -> "750"
        level >= 600 -> "600"
        level >= 500 -> "500"
        level >= 365 -> "365"
        level >= 300 -> "300"
        level >= 200 -> "200"
        level >= 150 -> "150"
        level >= 100 -> "100"
        level >= 75 -> "75"
        level >= 50 -> "50"
        level >= 30 -> "30"
        level >= 14 -> "14"
        level >= 7 -> "7"
        level >= 3 -> "3"
        else -> "0"
    }

    private fun imageResources(): Map<String, Int> = mapOf(
        "focushome_default" to R.drawable.ic_focushome_default,
        "focushome_aster" to R.drawable.ic_focushome_aster,
        "focushome_atlas" to R.drawable.ic_focushome_atlas,
        "focushome_forge" to R.drawable.ic_focushome_forge,
        "focushome_pulse" to R.drawable.ic_focushome_pulse,
        "focushome_loom" to R.drawable.ic_focushome_loom,
        "focushome_orbit" to R.drawable.ic_focushome_orbit,
        "focushome_tide" to R.drawable.ic_focushome_tide,
        "focushome_ember" to R.drawable.ic_focushome_ember,
        "focushome_nova" to R.drawable.ic_focushome_nova,
        "focushome_prism" to R.drawable.ic_focushome_prism,
        "focushome_vanguard" to R.drawable.ic_focushome_vanguard,
        "focushome_verdant" to R.drawable.ic_focushome_verdant,
        "badge_drop" to R.drawable.ic_badge_drop,
        "badge_sprout" to R.drawable.ic_badge_sprout,
        "badge_fire" to R.drawable.ic_badge_fire,
        "badge_heart" to R.drawable.ic_badge_heart,
        "badge_bolt" to R.drawable.ic_badge_bolt,
        "badge_rocket" to R.drawable.ic_badge_rocket,
        "badge_moon" to R.drawable.ic_badge_moon,
        "badge_star" to R.drawable.ic_badge_star,
        "badge_medal" to R.drawable.ic_badge_medal,
        "badge_diamond" to R.drawable.ic_badge_diamond,
        "badge_crystal" to R.drawable.ic_badge_crystal,
        "badge_crown" to R.drawable.ic_badge_crown,
        "badge_trophy" to R.drawable.ic_badge_trophy,
        "badge_infinity" to R.drawable.ic_badge_infinity,
        "badge_0" to R.drawable.ic_streak_badge_0,
        "badge_3" to R.drawable.ic_streak_badge_3,
        "badge_7" to R.drawable.ic_streak_badge_7,
        "badge_14" to R.drawable.ic_streak_badge_14,
        "badge_30" to R.drawable.ic_streak_badge_30,
        "badge_50" to R.drawable.ic_streak_badge_50,
        "badge_75" to R.drawable.ic_streak_badge_75,
        "badge_100" to R.drawable.ic_streak_badge_100,
        "badge_150" to R.drawable.ic_streak_badge_150,
        "badge_200" to R.drawable.ic_streak_badge_200,
        "badge_300" to R.drawable.ic_streak_badge_300,
        "badge_365" to R.drawable.ic_streak_badge_365,
        "badge_500" to R.drawable.ic_streak_badge_500,
        "badge_600" to R.drawable.ic_streak_badge_600,
        "badge_750" to R.drawable.ic_streak_badge_750,
        "badge_1000" to R.drawable.ic_streak_badge_1000,
        "badge_1500" to R.drawable.ic_streak_badge_1500,
        "badge_2000" to R.drawable.ic_streak_badge_2000,
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
        private const val RESOURCES_VERSION = "4"
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
