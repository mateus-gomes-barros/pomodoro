package com.mateusgomes.focusapp.pulse

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.speech.RecognizerIntent
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.basicMarquee
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.scrollBy
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material3.Text
import com.mateusgomes.focusapp.pulse.sync.PulseFocusSnapshot
import com.mateusgomes.focusapp.pulse.sync.PulseFocusSnapshotStore
import com.mateusgomes.focusapp.pulse.sync.PulseProject
import com.mateusgomes.focusapp.pulse.sync.PulseProjectSelectionStore
import com.mateusgomes.focusapp.pulse.sync.PulseTask
import com.mateusgomes.focusapp.pulse.sync.PulseWearDataLayer
import com.mateusgomes.focusapp.pulse.sync.PulseWearListenerService
import com.mateusgomes.focusapp.pulse.timer.FocusHomeKey
import com.mateusgomes.focusapp.pulse.timer.PulseTimerScreen
import com.mateusgomes.focusapp.pulse.timer.PulseUserPreferencesStore
import kotlinx.coroutines.launch
import java.util.Locale

private val PulseInk = Color(0xFF020604)
private val PulseGreen = Color(0xFF34D399)

private enum class PulseDestination {
    HOME, TIMER, TODAY, TASKS, CREATE_TASK, TASK_DETAIL, GOALS, SYNC, SETTINGS,
}

private data class PulseNewTaskDraft(
    val title: String,
    val projectId: String?,
    val plannedForToday: Boolean,
    val urgent: Boolean,
    val estimatedPomodoros: Int,
)

@Composable
fun FocusPulseApp() {
    val context = LocalContext.current
    val snapshotStore = remember(context) { PulseFocusSnapshotStore(context) }
    var snapshot by remember { mutableStateOf(snapshotStore.load()) }
    var destination by rememberSaveable { mutableStateOf(PulseDestination.HOME.name) }
    var selectedTaskId by rememberSaveable { mutableStateOf<String?>(null) }
    val current = PulseDestination.valueOf(destination)

    DisposableEffect(context) {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(receiverContext: Context?, intent: Intent?) {
                snapshot = snapshotStore.load()
            }
        }
        ContextCompat.registerReceiver(
            context,
            receiver,
            IntentFilter(PulseWearListenerService.ACTION_FOCUS_SNAPSHOT_UPDATED),
            ContextCompat.RECEIVER_NOT_EXPORTED,
        )
        onDispose { runCatching { context.unregisterReceiver(receiver) } }
    }

    BackHandler(enabled = current != PulseDestination.HOME) {
        destination = PulseDestination.HOME.name
    }

    when (current) {
        PulseDestination.HOME -> PulseHomeScreen(snapshot) { destination = it.name }
        PulseDestination.TIMER -> PulseTimerScreen(
            settings = PulseUserPreferencesStore(context).timerSettings(),
        )
        PulseDestination.TODAY -> PulseTaskListScreen(
            title = stringResource(R.string.pulse_today_title),
            tasks = snapshot?.todayTasks.orEmpty(),
            emptyText = stringResource(R.string.pulse_today_empty),
            onTask = { selectedTaskId = it.id; destination = PulseDestination.TASK_DETAIL.name },
            onCreate = { destination = PulseDestination.CREATE_TASK.name },
        )
        PulseDestination.TASKS -> PulseTaskListScreen(
            title = stringResource(R.string.pulse_tasks_title),
            tasks = snapshot?.tasks.orEmpty(),
            emptyText = stringResource(R.string.pulse_tasks_empty),
            onTask = { selectedTaskId = it.id; destination = PulseDestination.TASK_DETAIL.name },
            onCreate = { destination = PulseDestination.CREATE_TASK.name },
        )
        PulseDestination.CREATE_TASK -> PulseCreateTaskScreen(
            projects = snapshot?.projects.orEmpty(),
            onSave = { draft ->
                PulseWearDataLayer(context).publishAction(
                    type = "create_task",
                    title = draft.title,
                    projectId = draft.projectId.orEmpty(),
                    plannedForToday = draft.plannedForToday,
                    priority = if (draft.urgent) "high" else "medium",
                    estimatedPomodoros = draft.estimatedPomodoros,
                )
                destination = PulseDestination.TODAY.name
            },
        )
        PulseDestination.TASK_DETAIL -> {
            val task = snapshot?.tasks?.firstOrNull { it.id == selectedTaskId }
            PulseTaskDetailScreen(
                task = task,
                onFocus = {
                    if (task != null) {
                        PulseProjectSelectionStore(context).save(
                            task.projectId?.let { projectId ->
                                PulseProject(
                                    id = projectId,
                                    name = task.projectName.orEmpty(),
                                    color = null,
                                )
                            },
                        )
                        PulseWearDataLayer(context).publishAction(
                            type = "select_task",
                            taskId = task.id,
                        )
                        destination = PulseDestination.TIMER.name
                    }
                },
                onComplete = {
                    if (task != null) {
                        PulseWearDataLayer(context).publishAction(
                            type = "complete_task",
                            taskId = task.id,
                        )
                        destination = PulseDestination.TODAY.name
                    }
                },
                onToggleToday = {
                    if (task != null) {
                        PulseWearDataLayer(context).publishAction(
                            type = "plan_task",
                            taskId = task.id,
                            plannedForToday = task.plannedDate != snapshot?.today,
                        )
                    }
                },
                onPriority = { priority ->
                    if (task != null) {
                        PulseWearDataLayer(context).publishAction(
                            type = "set_daily_priority",
                            taskId = task.id,
                            dailyPriority = priority,
                        )
                    }
                },
            )
        }
        PulseDestination.GOALS -> PulseGoalsScreen(snapshot)
        PulseDestination.SYNC -> PulseSyncScreen(snapshotStore.savedAt()) {
            destination = PulseDestination.SETTINGS.name
        }
        PulseDestination.SETTINGS -> PulseSettingsScreen(snapshot)
    }
}

@Composable
private fun PulseHomeScreen(
    snapshot: PulseFocusSnapshot?,
    onNavigate: (PulseDestination) -> Unit,
) {
    val focusHome = FocusHomeKey.fromWireValue(snapshot?.focusHome)
    val accent = focusHome?.color ?: PulseGreen
    val nextTask = snapshot?.todayTasks?.firstOrNull()?.title
        ?: stringResource(R.string.pulse_no_next_task)
    PulseScrollableScreen(accent = accent) {
        Text(
            text = stringResource(R.string.pulse_home_title),
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = stringResource(
                R.string.pulse_daily_progress,
                snapshot?.focusMinutes ?: 0,
                snapshot?.goalMinutes ?: 120,
            ),
            color = accent,
            fontSize = 11.sp,
        )
        Text(
            text = nextTask,
            color = Color.White.copy(alpha = 0.58f),
            fontSize = 11.sp,
            maxLines = 2,
        )
        PulseMenuButton(stringResource(R.string.pulse_start_focus), accent, true) {
            onNavigate(PulseDestination.TIMER)
        }
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
private fun PulseTaskListScreen(
    title: String,
    tasks: List<PulseTask>,
    emptyText: String,
    onTask: (PulseTask) -> Unit,
    onCreate: () -> Unit,
) {
    PulseScrollableScreen {
        Text(title, color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold)
        PulseMenuButton(stringResource(R.string.pulse_new_task), PulseGreen, true, onCreate)
        if (tasks.isEmpty()) {
            Text(emptyText, color = Color.White.copy(alpha = 0.5f), fontSize = 11.sp)
        } else {
            tasks.forEach { task ->
                PulseListCard(
                    title = task.title,
                    subtitle = listOfNotNull(
                        task.dailyPriority?.let { "#$it" },
                        task.projectName,
                    ).joinToString(" • "),
                    onClick = { onTask(task) },
                )
            }
        }
    }
}

@Composable
private fun PulseTaskDetailScreen(
    task: PulseTask?,
    onFocus: () -> Unit,
    onComplete: () -> Unit,
    onToggleToday: () -> Unit,
    onPriority: (Int) -> Unit,
) {
    PulseScrollableScreen {
        Text(
            task?.title ?: stringResource(R.string.pulse_task_missing),
            color = Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
        )
        task?.projectName?.let {
            Text(it, color = PulseGreen, fontSize = 11.sp)
        }
        if (task != null) {
            Text(
                stringResource(
                    R.string.pulse_task_sessions,
                    task.completedPomodoros,
                    task.estimatedPomodoros,
                ),
                color = Color.White.copy(alpha = 0.52f),
                fontSize = 10.sp,
            )
            PulseMenuButton(stringResource(R.string.pulse_start_focus), PulseGreen, true, onFocus)
            PulseMenuButton(stringResource(R.string.pulse_complete_task), PulseGreen, false, onComplete)
            PulseMenuButton(stringResource(R.string.pulse_toggle_today), PulseGreen, false, onToggleToday)
            PulseMenuButton(
                stringResource(
                    R.string.pulse_priority_value,
                    task.dailyPriority ?: 1,
                ),
                PulseGreen,
            ) {
                onPriority(((task.dailyPriority ?: 0) % 3) + 1)
            }
        }
    }
}

@Composable
private fun PulseCreateTaskScreen(
    projects: List<PulseProject>,
    onSave: (PulseNewTaskDraft) -> Unit,
) {
    var title by rememberSaveable { mutableStateOf("") }
    var projectIndex by rememberSaveable { mutableIntStateOf(-1) }
    var plannedForToday by rememberSaveable { mutableStateOf(true) }
    var urgent by rememberSaveable { mutableStateOf(false) }
    var estimatedPomodoros by rememberSaveable { mutableIntStateOf(1) }
    val context = LocalContext.current
    val voiceLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartActivityForResult(),
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            title = result.data
                ?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                ?.firstOrNull()
                .orEmpty()
        }
    }
    PulseScrollableScreen {
        Text(
            stringResource(R.string.pulse_create_task_title),
            color = Color.White,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
        )
        BasicTextField(
            value = title,
            onValueChange = { title = it.take(120) },
            textStyle = TextStyle(color = Color.White, fontSize = 13.sp),
            singleLine = false,
            modifier = Modifier
                .fillMaxWidth(0.82f)
                .background(Color.White.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
                .padding(12.dp)
                .semantics { contentDescription = context.getString(R.string.pulse_task_name) },
        )
        PulseMenuButton(stringResource(R.string.pulse_dictate), PulseGreen) {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(
                    RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                    RecognizerIntent.LANGUAGE_MODEL_FREE_FORM,
                )
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            }
            voiceLauncher.launch(intent)
        }
        PulseMenuButton(
            projects.getOrNull(projectIndex)?.name
                ?: stringResource(R.string.timer_no_project),
            PulseGreen,
        ) {
            projectIndex = if (projectIndex >= projects.lastIndex) -1 else projectIndex + 1
        }
        PulseMenuButton(
            stringResource(
                if (plannedForToday) R.string.pulse_planned_today
                else R.string.pulse_not_planned_today,
            ),
            PulseGreen,
        ) { plannedForToday = !plannedForToday }
        PulseMenuButton(
            stringResource(if (urgent) R.string.pulse_urgent else R.string.pulse_normal_priority),
            PulseGreen,
        ) { urgent = !urgent }
        PulseMenuButton(
            stringResource(R.string.pulse_estimate_value, estimatedPomodoros),
            PulseGreen,
        ) {
            estimatedPomodoros = estimatedPomodoros % 8 + 1
        }
        PulseMenuButton(
            stringResource(R.string.pulse_save),
            PulseGreen,
            prominent = true,
        ) {
            if (title.isNotBlank()) {
                onSave(
                    PulseNewTaskDraft(
                        title = title.trim(),
                        projectId = projects.getOrNull(projectIndex)?.id,
                        plannedForToday = plannedForToday,
                        urgent = urgent,
                        estimatedPomodoros = estimatedPomodoros,
                    ),
                )
            }
        }
    }
}

@Composable
private fun PulseGoalsScreen(snapshot: PulseFocusSnapshot?) {
    PulseScrollableScreen {
        Text(
            stringResource(R.string.pulse_goals_title),
            color = Color.White,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
        )
        Text(
            stringResource(
                R.string.pulse_daily_progress,
                snapshot?.focusMinutes ?: 0,
                snapshot?.goalMinutes ?: 120,
            ),
            color = PulseGreen,
            fontSize = 12.sp,
        )
        snapshot?.goals?.forEach { goal ->
            PulseListCard(
                title = goal.title,
                subtitle = if (goal.completed) {
                    stringResource(R.string.pulse_completed)
                } else {
                    stringResource(R.string.pulse_in_progress)
                },
                onClick = {},
            )
        }
    }
}

@Composable
private fun PulseSyncScreen(savedAt: Long, onSettings: () -> Unit) {
    val context = LocalContext.current
    val dataLayer = remember(context) { PulseWearDataLayer(context) }
    var pendingActions by remember { mutableIntStateOf(dataLayer.pendingActionCount()) }
    PulseScrollableScreen {
        Text(
            stringResource(R.string.pulse_sync_title),
            color = Color.White,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
        )
        Text(
            if (savedAt > 0L) stringResource(R.string.pulse_sync_ready)
            else stringResource(R.string.pulse_sync_waiting),
            color = Color.White.copy(alpha = 0.56f),
            fontSize = 11.sp,
        )
        if (pendingActions > 0) {
            Text(
                stringResource(R.string.pulse_pending_actions, pendingActions),
                color = PulseGreen,
                fontSize = 10.sp,
            )
            PulseMenuButton(stringResource(R.string.pulse_sync_now), PulseGreen) {
                dataLayer.retryPendingActions()
                pendingActions = dataLayer.pendingActionCount()
            }
        }
        PulseMenuButton(stringResource(R.string.pulse_settings_title), PulseGreen, true, onSettings)
    }
}

@Composable
private fun PulseSettingsScreen(snapshot: PulseFocusSnapshot?) {
    val context = LocalContext.current
    val preferences = remember(context) { PulseUserPreferencesStore(context) }
    var vibration by remember { mutableStateOf(preferences.vibrationEnabled()) }
    var autoBreaks by remember { mutableStateOf(preferences.autoStartBreaks()) }
    var autoFocus by remember { mutableStateOf(preferences.autoStartFocus()) }
    PulseScrollableScreen {
        Text(
            stringResource(R.string.pulse_settings_title),
            color = Color.White,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
        )
        PulseListCard(
            stringResource(R.string.pulse_vibration_setting),
            stringResource(if (vibration) R.string.pulse_enabled else R.string.pulse_disabled),
            {
                vibration = !vibration
                preferences.setVibrationEnabled(vibration)
            },
        )
        PulseListCard(
            stringResource(R.string.pulse_auto_break_setting),
            stringResource(if (autoBreaks) R.string.pulse_enabled else R.string.pulse_disabled),
            {
                autoBreaks = !autoBreaks
                preferences.setAutoStartBreaks(autoBreaks)
            },
        )
        PulseListCard(
            stringResource(R.string.pulse_auto_focus_setting),
            stringResource(if (autoFocus) R.string.pulse_enabled else R.string.pulse_disabled),
            {
                autoFocus = !autoFocus
                preferences.setAutoStartFocus(autoFocus)
            },
        )
        PulseListCard(
            stringResource(R.string.pulse_language_setting),
            Locale.getDefault().displayLanguage,
            {},
        )
        PulseListCard(
            stringResource(R.string.pulse_identity_setting),
            snapshot?.focusHome ?: stringResource(R.string.pulse_default_identity),
            {},
        )
    }
}

@Composable
private fun PulseScrollableScreen(
    accent: Color = PulseGreen,
    content: @Composable ColumnScope.() -> Unit,
) {
    val scroll = rememberScrollState()
    val scope = rememberCoroutineScope()
    val requester = remember { FocusRequester() }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    listOf(accent.copy(alpha = 0.13f), PulseInk),
                ),
            )
            .onRotaryScrollEvent {
                scope.launch { scroll.scrollBy(it.verticalScrollPixels) }
                true
            }
            .focusRequester(requester)
            .focusable()
            .verticalScroll(scroll)
            .padding(horizontal = 20.dp, vertical = 26.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(9.dp),
        content = content,
    )
    LaunchedEffect(Unit) { requester.requestFocus() }
}

@Composable
private fun PulseListCard(title: String, subtitle: String, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth(0.86f)
            .background(Color.White.copy(alpha = 0.055f), RoundedCornerShape(15.dp))
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 13.dp, vertical = 10.dp),
    ) {
        Text(
            title,
            color = Color.White.copy(alpha = 0.88f),
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            modifier = Modifier.basicMarquee(),
        )
        if (subtitle.isNotBlank()) {
            Spacer(Modifier.height(2.dp))
            Text(subtitle, color = Color.White.copy(alpha = 0.42f), fontSize = 9.sp)
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
            .clickable(role = Role.Button, onClick = onClick)
            .semantics { contentDescription = label },
        contentAlignment = Alignment.Center,
    ) {
        Text(
            label,
            color = if (prominent) PulseInk else Color.White.copy(alpha = 0.78f),
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
        )
    }
}
