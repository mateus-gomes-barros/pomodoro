package com.mateusgomes.focusapp.pulse.timer

import android.content.Context

class PulseUserPreferencesStore(context: Context) {
    private val preferences = context.getSharedPreferences(
        "focus_pulse_preferences",
        Context.MODE_PRIVATE,
    )

    fun vibrationEnabled(): Boolean = preferences.getBoolean(KEY_VIBRATION, true)

    fun setVibrationEnabled(value: Boolean) {
        preferences.edit().putBoolean(KEY_VIBRATION, value).apply()
    }

    fun autoStartBreaks(): Boolean = preferences.getBoolean(KEY_AUTO_BREAKS, false)

    fun setAutoStartBreaks(value: Boolean) {
        preferences.edit().putBoolean(KEY_AUTO_BREAKS, value).apply()
    }

    fun autoStartFocus(): Boolean = preferences.getBoolean(KEY_AUTO_FOCUS, false)

    fun setAutoStartFocus(value: Boolean) {
        preferences.edit().putBoolean(KEY_AUTO_FOCUS, value).apply()
    }

    fun timerSettings(): PulseTimerSettings = PulseTimerSettings(
        autoStartBreaks = autoStartBreaks(),
        autoStartWork = autoStartFocus(),
    )

    private companion object {
        const val KEY_VIBRATION = "vibration"
        const val KEY_AUTO_BREAKS = "auto_start_breaks"
        const val KEY_AUTO_FOCUS = "auto_start_focus"
    }
}
