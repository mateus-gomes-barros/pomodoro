package com.mateusgomes.focusapp.pulse

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Text
import com.mateusgomes.focusapp.pulse.sync.PulseRemoteTimerStore
import com.mateusgomes.focusapp.pulse.timer.FocusHomeKey
import com.mateusgomes.focusapp.pulse.timer.PulseTimerScreen

private val PulseInk = Color(0xFF020604)
private val PulseGreen = Color(0xFF34D399)

private enum class PulseDestination {
    HOME,
    TIMER,
    TODAY,
    TASKS,
    CREATE_TASK,
    GOALS,
    SYNC,
    SETTINGS,
}

@Composable
fun FocusPulseApp() {
    var destination by remember { mutableStateOf(PulseDestination.HOME) }

    BackHandler(enabled = destination != PulseDestination.HOME) {
        destination = PulseDestination.HOME
    }

    when (destination) {
        PulseDestination.HOME -> PulseHomeScreen(onNavigate = { destination = it })
        PulseDestination.TIMER -> PulseTimerScreen()
        PulseDestination.TODAY -> PulsePlaceholderScreen(
            title = stringResource(R.string.pulse_today_title),
            body = stringResource(R.string.pulse_today_empty),
            action = stringResource(R.string.pulse_start_focus),
            onAction = { destination = PulseDestination.TIMER },
        )
        PulseDestination.TASKS -> PulsePlaceholderScreen(
            title = stringResource(R.string.pulse_tasks_title),
            body = stringResource(R.string.pulse_tasks_empty),
            action = stringResource(R.string.pulse_new_task),
            onAction = { destination = PulseDestination.CREATE_TASK },
        )
        PulseDestination.CREATE_TASK -> PulsePlaceholderScreen(
            title = stringResource(R.string.pulse_create_task_title),
            body = stringResource(R.string.pulse_create_task_hint),
            action = stringResource(R.string.pulse_back),
            onAction = { destination = PulseDestination.TASKS },
        )
        PulseDestination.GOALS -> PulsePlaceholderScreen(
            title = stringResource(R.string.pulse_goals_title),
            body = stringResource(R.string.pulse_goals_empty),
            action = stringResource(R.string.pulse_back),
            onAction = { destination = PulseDestination.HOME },
        )
        PulseDestination.SYNC -> PulseSyncScreen(
            onSettings = { destination = PulseDestination.SETTINGS },
        )
        PulseDestination.SETTINGS -> PulsePlaceholderScreen(
            title = stringResource(R.string.pulse_settings_title),
            body = stringResource(R.string.pulse_settings_body),
            action = stringResource(R.string.pulse_back),
            onAction = { destination = PulseDestination.HOME },
        )
    }
}

@Composable
private fun PulseHomeScreen(
    onNavigate: (PulseDestination) -> Unit,
) {
    val context = LocalContext.current
    val remote = remember { PulseRemoteTimerStore(context).load() }
    val focusHome = FocusHomeKey.fromWireValue(remote?.focusHome)
    val accent = focusHome?.color ?: PulseGreen
    val task = remote?.taskName?.takeIf { it.isNotBlank() }
        ?: stringResource(R.string.pulse_no_next_task)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    listOf(accent.copy(alpha = 0.15f), PulseInk),
                ),
            )
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 18.dp, vertical = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(
            text = stringResource(R.string.pulse_home_title),
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = task,
            color = Color.White.copy(alpha = 0.58f),
            fontSize = 11.sp,
            maxLines = 2,
        )
        Spacer(Modifier.height(2.dp))
        PulseMenuButton(
            label = stringResource(R.string.pulse_start_focus),
            accent = accent,
            prominent = true,
        ) { onNavigate(PulseDestination.TIMER) }
        PulseMenuButton(stringResource(R.string.pulse_today_title), accent) {
            onNavigate(PulseDestination.TODAY)
        }
        PulseMenuButton(stringResource(R.string.pulse_tasks_title), accent) {
            onNavigate(PulseDestination.TASKS)
        }
        PulseMenuButton(stringResource(R.string.pulse_goals_title), accent) {
            onNavigate(PulseDestination.GOALS)
        }
        PulseMenuButton(stringResource(R.string.pulse_sync_title), accent) {
            onNavigate(PulseDestination.SYNC)
        }
    }
}

@Composable
private fun PulseMenuButton(
    label: String,
    accent: Color,
    prominent: Boolean = false,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth(0.82f)
            .height(if (prominent) 42.dp else 35.dp)
            .background(
                if (prominent) accent else Color.White.copy(alpha = 0.055f),
                RoundedCornerShape(16.dp),
            )
            .clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            color = if (prominent) PulseInk else Color.White.copy(alpha = 0.78f),
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun PulseSyncScreen(onSettings: () -> Unit) {
    val context = LocalContext.current
    val state = remember { PulseRemoteTimerStore(context).load() }
    PulsePlaceholderScreen(
        title = stringResource(R.string.pulse_sync_title),
        body = if (state == null) {
            stringResource(R.string.pulse_sync_waiting)
        } else {
            stringResource(R.string.pulse_sync_ready)
        },
        action = stringResource(R.string.pulse_settings_title),
        onAction = onSettings,
    )
}

@Composable
private fun PulsePlaceholderScreen(
    title: String,
    body: String,
    action: String,
    onAction: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PulseInk)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 34.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = title,
            color = Color.White,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
        )
        Spacer(Modifier.height(9.dp))
        Text(
            text = body,
            color = Color.White.copy(alpha = 0.55f),
            fontSize = 11.sp,
        )
        Spacer(Modifier.height(16.dp))
        PulseMenuButton(action, PulseGreen, prominent = true, onClick = onAction)
    }
}
