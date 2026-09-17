package com.mateusgomes.focusapp.pulse.timer

import androidx.compose.foundation.background
import androidx.compose.foundation.basicMarquee
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.scrollBy
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Text
import com.mateusgomes.focusapp.pulse.R
import com.mateusgomes.focusapp.pulse.sync.PulseProject
import kotlinx.coroutines.launch

@Composable
fun PulseTimerSetupScreen(
    session: PulseSession,
    durationMinutes: Int,
    projects: List<PulseProject>,
    selectedProjectId: String,
    accent: Color,
    onSessionChange: (PulseSession) -> Unit,
    onDurationChange: (Int) -> Unit,
    onProjectChange: (PulseProject?) -> Unit,
    onDone: () -> Unit,
) {
    var projectPickerVisible by rememberSaveable { mutableStateOf(false) }
    if (projectPickerVisible) {
        PulseProjectPicker(
            projects = projects,
            selectedProjectId = selectedProjectId,
            accent = accent,
            onProjectChange = { project ->
                onProjectChange(project)
                projectPickerVisible = false
            },
        )
        return
    }

    val scrollState = rememberScrollState()
    val scrollScope = rememberCoroutineScope()
    val focusRequester = remember { FocusRequester() }
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
            modifier = Modifier
                .fillMaxSize()
                .onRotaryScrollEvent {
                    scrollScope.launch {
                        scrollState.scrollBy(it.verticalScrollPixels)
                    }
                    true
                }
                .focusRequester(focusRequester)
                .focusable()
                .verticalScroll(scrollState)
                .padding(vertical = 24.dp),
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

            Text(
                text = stringResource(R.string.timer_project_label),
                color = Color.White.copy(alpha = 0.42f),
                fontSize = 8.sp,
                fontWeight = FontWeight.SemiBold,
            )
            Box(
                modifier = Modifier
                    .size(width = 148.dp, height = 38.dp)
                    .background(
                        Color.White.copy(alpha = 0.065f),
                        RoundedCornerShape(13.dp),
                    )
                    .clickable(
                        role = Role.Button,
                        onClick = { projectPickerVisible = true },
                    )
                    .padding(horizontal = 13.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = projects.firstOrNull { it.id == selectedProjectId }?.name
                        ?: stringResource(R.string.timer_no_project),
                    color = accent,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    modifier = Modifier.basicMarquee(),
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
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }
}


@Composable
private fun PulseProjectPicker(
    projects: List<PulseProject>,
    selectedProjectId: String,
    accent: Color,
    onProjectChange: (PulseProject?) -> Unit,
) {
    val scrollState = rememberScrollState()
    val scrollScope = rememberCoroutineScope()
    val focusRequester = remember { FocusRequester() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    listOf(accent.copy(alpha = 0.12f), Color(0xFF020604)),
                ),
            )
            .onRotaryScrollEvent {
                scrollScope.launch {
                    scrollState.scrollBy(it.verticalScrollPixels)
                }
                true
            }
            .focusRequester(focusRequester)
            .focusable()
            .verticalScroll(scrollState)
            .padding(horizontal = 22.dp, vertical = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(
            text = stringResource(R.string.timer_select_project),
            color = Color.White,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
        )
        ProjectOption(
            name = stringResource(R.string.timer_no_project),
            selected = selectedProjectId.isBlank(),
            accent = accent,
            onClick = { onProjectChange(null) },
        )
        projects.forEach { project ->
            ProjectOption(
                name = project.name,
                selected = project.id == selectedProjectId,
                accent = accent,
                onClick = { onProjectChange(project) },
            )
        }
    }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }
}

@Composable
private fun ProjectOption(
    name: String,
    selected: Boolean,
    accent: Color,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .size(width = 154.dp, height = 38.dp)
            .background(
                if (selected) accent.copy(alpha = 0.20f)
                else Color.White.copy(alpha = 0.055f),
                RoundedCornerShape(13.dp),
            )
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = name,
            color = if (selected) accent else Color.White.copy(alpha = 0.72f),
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            modifier = Modifier.basicMarquee(),
        )
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
