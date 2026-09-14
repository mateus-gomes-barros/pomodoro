package com.mateusgomes.focusapp.pulse.timer

import androidx.compose.ui.graphics.Color

enum class PulseSession(
    val labelKey: String,
    val defaultMinutes: Int,
) {
    FOCUS("session_focus", 25),
    SHORT_BREAK("session_short_break", 5),
    LONG_BREAK("session_long_break", 15),
}

enum class PulseTimerStatus {
    IDLE,
    RUNNING,
    PAUSED,
    COMPLETED,
}

enum class FocusHomeKey(val wireValue: String, val color: Color) {
    ASTER("aster", Color(0xFFA78BFA)),
    ATLAS("atlas", Color(0xFF4F8EF7)),
    FORGE("forge", Color(0xFFF59E0B)),
    PULSE("pulse", Color(0xFFFB7185)),
    LOOM("loom", Color(0xFF22D3EE)),
    ORBIT("orbit", Color(0xFF818CF8)),
    TIDE("tide", Color(0xFF2DD4BF)),
    EMBER("ember", Color(0xFFF97316)),
    NOVA("nova", Color(0xFFFBBF24)),
    PRISM("prism", Color(0xFFE879F9)),
    VANGUARD("vanguard", Color(0xFFF43F5E)),
    VERDANT("verdant", Color(0xFF34D399));

    companion object {
        fun fromWireValue(value: String?): FocusHomeKey? =
            entries.firstOrNull { it.wireValue == value }
    }
}

data class PulseTimerSettings(
    val workDurationMinutes: Int = 25,
    val shortBreakDurationMinutes: Int = 5,
    val longBreakDurationMinutes: Int = 15,
    val sessionsUntilLongBreak: Int = 4,
    val soundEnabled: Boolean = true,
    val autoStartBreaks: Boolean = false,
    val autoStartWork: Boolean = false,
) {
    fun durationSecondsFor(session: PulseSession): Int =
        when (session) {
            PulseSession.FOCUS -> workDurationMinutes * 60
            PulseSession.SHORT_BREAK -> shortBreakDurationMinutes * 60
            PulseSession.LONG_BREAK -> longBreakDurationMinutes * 60
        }
}
