package com.mateusgomes.focusapp.pulse.timer

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Text
import com.mateusgomes.focusapp.pulse.R

@Composable
fun PulseTimerSetupScreen(
    session: PulseSession,
    durationMinutes: Int,
    accent: Color,
    onSessionChange: (PulseSession) -> Unit,
    onDurationChange: (Int) -> Unit,
    onDone: () -> Unit,
) {
    val range = when (session) {
        PulseSession.FOCUS -> 5..90
        PulseSession.SHORT_BREAK -> 1..30
        PulseSession.LONG_BREAK -> 5..60
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    listOf(accent.copy(alpha = 0.12f), Color(0xFF020604)),
                ),
            )
            .padding(horizontal = 18.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = stringResource(R.string.timer_setup_title),
                color = Color.White.copy(alpha = 0.72f),
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
            )

            Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                SessionChoice(
                    label = stringResource(R.string.session_focus_short),
                    selected = session == PulseSession.FOCUS,
                    accent = accent,
                    onClick = { onSessionChange(PulseSession.FOCUS) },
                )
                SessionChoice(
                    label = stringResource(R.string.session_short_break_short),
                    selected = session == PulseSession.SHORT_BREAK,
                    accent = accent,
                    onClick = { onSessionChange(PulseSession.SHORT_BREAK) },
                )
                SessionChoice(
                    label = stringResource(R.string.session_long_break_short),
                    selected = session == PulseSession.LONG_BREAK,
                    accent = accent,
                    onClick = { onSessionChange(PulseSession.LONG_BREAK) },
                )
            }

            Row(
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                ValueButton(
                    label = "−",
                    enabled = durationMinutes > range.first,
                    onClick = {
                        onDurationChange((durationMinutes - 1).coerceAtLeast(range.first))
                    },
                )
                Text(
                    text = stringResource(R.string.timer_minutes_value, durationMinutes),
                    color = accent,
                    fontSize = 25.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                )
                ValueButton(
                    label = "+",
                    enabled = durationMinutes < range.last,
                    onClick = {
                        onDurationChange((durationMinutes + 1).coerceAtMost(range.last))
                    },
                )
            }

            Box(
                modifier = Modifier
                    .size(width = 72.dp, height = 34.dp)
                    .background(
                        brush = Brush.linearGradient(
                            listOf(accent, accent.copy(alpha = 0.74f)),
                        ),
                        shape = RoundedCornerShape(12.dp),
                    )
                    .clickable(role = Role.Button, onClick = onDone),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = stringResource(R.string.timer_setup_done),
                    color = Color(0xFF020604),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                )
            }
        }
    }
}

@Composable
private fun SessionChoice(
    label: String,
    selected: Boolean,
    accent: Color,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .size(width = 54.dp, height = 29.dp)
            .background(
                color = if (selected) accent.copy(alpha = 0.18f)
                else Color.White.copy(alpha = 0.045f),
                shape = RoundedCornerShape(10.dp),
            )
            .clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            color = if (selected) accent else Color.White.copy(alpha = 0.40f),
            fontSize = 8.sp,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun ValueButton(
    label: String,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .size(34.dp)
            .background(Color.White.copy(alpha = 0.065f), CircleShape)
            .clickable(
                enabled = enabled,
                role = Role.Button,
                onClick = onClick,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            color = Color.White.copy(alpha = if (enabled) 0.72f else 0.20f),
            fontSize = 18.sp,
        )
    }
}
