package com.mateusgomes.focusapp.pulse.timer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material3.Text
import com.mateusgomes.focusapp.pulse.R
import com.mateusgomes.focusapp.pulse.sync.PulseRemoteTimerStore
import com.mateusgomes.focusapp.pulse.sync.PulseWearDataLayer
import com.mateusgomes.focusapp.pulse.sync.PulseWearListenerService
import kotlinx.coroutines.delay
import kotlin.math.ceil
import kotlin.math.min

private val DefaultFocusGreen = Color(0xFF34D399)
private val DefaultBreakBlue = Color(0xFF60A5FA)
private val Ink = Color(0xFF020604)

@Composable
fun PulseTimerScreen(
    activeFocusHome: FocusHomeKey? = null,
    settings: PulseTimerSettings = PulseTimerSettings(),
) {
    val context = LocalContext.current
    val persistence = remember(context) { PulseTimerPersistence(context) }
    val alarmScheduler = remember(context) { PulseTimerAlarmScheduler(context) }
    val wearDataLayer = remember(context) { PulseWearDataLayer(context) }
    val restored = remember(persistence, settings) { persistence.load(settings) }

    var sessionName by rememberSaveable { mutableStateOf(restored.session.name) }
    val session = PulseSession.valueOf(sessionName)
    var statusName by rememberSaveable { mutableStateOf(restored.status.name) }
    val status = PulseTimerStatus.valueOf(statusName)
    var workDurationMinutes by rememberSaveable {
        mutableIntStateOf(restored.workDurationMinutes)
    }
    var shortBreakDurationMinutes by rememberSaveable {
        mutableIntStateOf(restored.shortBreakDurationMinutes)
    }
    var longBreakDurationMinutes by rememberSaveable {
        mutableIntStateOf(restored.longBreakDurationMinutes)
    }
    fun durationSecondsFor(target: PulseSession): Int =
        when (target) {
            PulseSession.FOCUS -> workDurationMinutes * 60
            PulseSession.SHORT_BREAK -> shortBreakDurationMinutes * 60
            PulseSession.LONG_BREAK -> longBreakDurationMinutes * 60
        }
    var remainingSeconds by rememberSaveable {
        mutableIntStateOf(restored.remainingSeconds)
    }
    var endsAtEpochMillis by rememberSaveable {
        mutableLongStateOf(restored.endsAtEpochMillis)
    }
    var completedFocusSessions by rememberSaveable {
        mutableIntStateOf(restored.completedFocusSessions)
    }
    var completionPulse by rememberSaveable { mutableIntStateOf(0) }
    var controlsVisible by rememberSaveable {
        mutableStateOf(restored.status != PulseTimerStatus.RUNNING)
    }
    var setupVisible by rememberSaveable { mutableStateOf(false) }
    val remoteStore = remember(context) { PulseRemoteTimerStore(context) }
    var remoteState by remember { mutableStateOf(remoteStore.load()) }
    var remoteFocusHome by rememberSaveable {
        mutableStateOf(remoteState?.focusHome.orEmpty())
    }

    DisposableEffect(context, remoteStore) {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(receiverContext: Context?, intent: Intent?) {
                remoteState = remoteStore.load()
            }
        }
        ContextCompat.registerReceiver(
            context,
            receiver,
            IntentFilter(PulseWearListenerService.ACTION_REMOTE_TIMER_UPDATED),
            ContextCompat.RECEIVER_NOT_EXPORTED,
        )
        onDispose {
            runCatching { context.unregisterReceiver(receiver) }
        }
    }

    LaunchedEffect(remoteState?.version) {
        val received = remoteState ?: return@LaunchedEffect
        sessionName = when (received.sessionType) {
            "short_break" -> PulseSession.SHORT_BREAK.name
            "long_break" -> PulseSession.LONG_BREAK.name
            else -> PulseSession.FOCUS.name
        }
        statusName = when (received.status) {
            "running" -> PulseTimerStatus.RUNNING.name
            "paused" -> PulseTimerStatus.PAUSED.name
            "completed" -> PulseTimerStatus.COMPLETED.name
            else -> PulseTimerStatus.IDLE.name
        }
        val receivedDuration = received.durationSeconds.coerceAtLeast(1)
        val receivedMinutes = ceil(receivedDuration / 60.0).toInt()
        when (sessionName) {
            PulseSession.SHORT_BREAK.name ->
                shortBreakDurationMinutes = receivedMinutes.coerceIn(1, 30)
            PulseSession.LONG_BREAK.name ->
                longBreakDurationMinutes = receivedMinutes.coerceIn(5, 60)
            else -> workDurationMinutes = receivedMinutes.coerceIn(5, 90)
        }
        if (received.status == "running" && received.endsAt > 0L) {
            // O relógio do sistema do celular pode estar alguns milissegundos
            // adiantado ou atrasado em relação ao Watch. Normalizamos o fim
            // da sessão na linha do tempo local usando o valor enviado.
            val normalizedRemaining = received.remainingSeconds.coerceIn(
                0,
                receivedDuration,
            )
            remainingSeconds = normalizedRemaining
            endsAtEpochMillis =
                System.currentTimeMillis() + normalizedRemaining * 1000L
        } else {
            remainingSeconds = received.remainingSeconds.coerceAtLeast(0)
            endsAtEpochMillis = 0L
        }
        remoteFocusHome = received.focusHome
        controlsVisible = received.status != "running"
        setupVisible = false
    }

    val haptics = LocalHapticFeedback.current
    val totalSeconds = durationSecondsFor(session)
    val effectiveFocusHome =
        activeFocusHome ?: FocusHomeKey.fromWireValue(remoteFocusHome)
    val identityColor = effectiveFocusHome?.color
    val accent = identityColor ?: if (session == PulseSession.FOCUS) {
        DefaultFocusGreen
    } else {
        DefaultBreakBlue
    }
    val progress = if (status == PulseTimerStatus.IDLE) {
        0f
    } else {
        (1f - remainingSeconds.toFloat() / totalSeconds).coerceIn(0f, 1f)
    }

    LaunchedEffect(
        sessionName,
        statusName,
        endsAtEpochMillis,
        completedFocusSessions,
        workDurationMinutes,
        shortBreakDurationMinutes,
        longBreakDurationMinutes,
    ) {
        persistence.save(
            PulseTimerSnapshot(
                session = session,
                status = status,
                remainingSeconds = remainingSeconds,
                endsAtEpochMillis = endsAtEpochMillis,
                completedFocusSessions = completedFocusSessions,
                workDurationMinutes = workDurationMinutes,
                shortBreakDurationMinutes = shortBreakDurationMinutes,
                longBreakDurationMinutes = longBreakDurationMinutes,
            ),
        )
    }

    LaunchedEffect(statusName, endsAtEpochMillis, sessionName) {
        if (
            statusName == PulseTimerStatus.RUNNING.name &&
            endsAtEpochMillis > System.currentTimeMillis()
        ) {
            alarmScheduler.schedule(endsAtEpochMillis, session)
            PulseTimerOngoingService.start(context, endsAtEpochMillis, session)
        } else {
            alarmScheduler.cancel()
            PulseTimerOngoingService.stop(context)
        }
    }

    LaunchedEffect(statusName, endsAtEpochMillis) {
        while (statusName == PulseTimerStatus.RUNNING.name) {
            val now = System.currentTimeMillis()
            val nextRemaining = ceil(
                (endsAtEpochMillis - now).coerceAtLeast(0L) / 1000.0,
            ).toInt()
            remainingSeconds = nextRemaining

            if (nextRemaining <= 0) {
                val nextSession = if (session == PulseSession.FOCUS) {
                    completedFocusSessions += 1
                    if (
                        completedFocusSessions %
                        settings.sessionsUntilLongBreak.coerceAtLeast(1) == 0
                    ) PulseSession.LONG_BREAK else PulseSession.SHORT_BREAK
                } else {
                    PulseSession.FOCUS
                }

                sessionName = nextSession.name
                remainingSeconds = durationSecondsFor(nextSession)
                completionPulse += 1

                val shouldAutoStart =
                    if (nextSession == PulseSession.FOCUS) settings.autoStartWork
                    else settings.autoStartBreaks

                if (shouldAutoStart) {
                    val nextEndsAt =
                        System.currentTimeMillis() + remainingSeconds * 1000L
                    endsAtEpochMillis = nextEndsAt
                    statusName = PulseTimerStatus.RUNNING.name
                    controlsVisible = false
                    wearDataLayer.publishTimer(
                        session = nextSession,
                        status = PulseTimerStatus.RUNNING,
                        durationSeconds = durationSecondsFor(nextSession),
                        remainingSeconds = remainingSeconds,
                        endsAt = nextEndsAt,
                        focusHome = effectiveFocusHome,
                    )
                } else {
                    endsAtEpochMillis = 0L
                    statusName = PulseTimerStatus.COMPLETED.name
                    controlsVisible = true
                    wearDataLayer.publishTimer(
                        session = nextSession,
                        status = PulseTimerStatus.COMPLETED,
                        durationSeconds = durationSecondsFor(nextSession),
                        remainingSeconds = remainingSeconds,
                        endsAt = 0L,
                        focusHome = effectiveFocusHome,
                    )
                }
                break
            }
            delay(250)
        }
    }

    LaunchedEffect(completionPulse) {
        if (completionPulse > 0) {
            haptics.performHapticFeedback(HapticFeedbackType.LongPress)
        }
    }

    if (setupVisible) {
        val currentMinutes = when (session) {
            PulseSession.FOCUS -> workDurationMinutes
            PulseSession.SHORT_BREAK -> shortBreakDurationMinutes
            PulseSession.LONG_BREAK -> longBreakDurationMinutes
        }
        PulseTimerSetupScreen(
            session = session,
            durationMinutes = currentMinutes,
            accent = accent,
            onSessionChange = { nextSession ->
                sessionName = nextSession.name
                statusName = PulseTimerStatus.IDLE.name
                endsAtEpochMillis = 0L
                remainingSeconds = durationSecondsFor(nextSession)
            },
            onDurationChange = { minutes ->
                when (session) {
                    PulseSession.FOCUS -> workDurationMinutes = minutes
                    PulseSession.SHORT_BREAK -> shortBreakDurationMinutes = minutes
                    PulseSession.LONG_BREAK -> longBreakDurationMinutes = minutes
                }
                remainingSeconds = minutes * 60
                statusName = PulseTimerStatus.IDLE.name
                endsAtEpochMillis = 0L
            },
            onDone = {
                remainingSeconds = durationSecondsFor(session)
                statusName = PulseTimerStatus.IDLE.name
                endsAtEpochMillis = 0L
                controlsVisible = true
                setupVisible = false
            },
        )
        return
    }

    val sessionLabel = stringResource(
        when (session) {
            PulseSession.FOCUS -> R.string.session_focus
            PulseSession.SHORT_BREAK -> R.string.session_short_break
            PulseSession.LONG_BREAK -> R.string.session_long_break
        },
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(
                        accent.copy(alpha = 0.10f),
                        Color(0xFF0B1711),
                        Ink,
                    ),
                    center = Offset.Unspecified,
                    radius = 520f,
                ),
            ),
        contentAlignment = Alignment.Center,
    ) {
        BoxWithConstraints(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            val face = min(maxWidth.value, maxHeight.value).let { value ->
                androidx.compose.ui.unit.Dp(value)
            }
            val isImmersive =
                status == PulseTimerStatus.RUNNING && !controlsVisible
            val timerSize = if (isImmersive) face * 0.98f else face * 0.92f
            val ringSize = timerSize * 0.88f

            TimerFace(
                modifier = Modifier.size(timerSize),
                ringSize = ringSize,
                progress = progress,
                accent = accent,
                focusHome = effectiveFocusHome,
                running = status == PulseTimerStatus.RUNNING,
            )

            Text(
                text = formatPulseTime(remainingSeconds),
                color = accent,
                fontSize = (face.value * 0.205f).sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.offset(y = -face * 0.055f),
            )

            Text(
                text = sessionLabel,
                color = Color.White.copy(alpha = 0.52f),
                fontSize = (face.value * 0.041f).sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 0.7.sp,
                modifier = Modifier.offset(y = face * 0.075f),
            )

            SessionDots(
                completedFocusSessions = completedFocusSessions,
                sessionsUntilLongBreak = settings.sessionsUntilLongBreak,
                accent = accent,
                modifier = Modifier.offset(y = face * 0.132f),
            )

            if (controlsVisible || status != PulseTimerStatus.RUNNING) {
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .offset(y = -face * 0.060f),
                    horizontalArrangement = Arrangement.spacedBy(face * 0.045f),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TimerControlButton(
                        glyph = TimerControlGlyph.RESET,
                        accent = accent,
                        prominent = false,
                        buttonSize = face * 0.145f,
                        onClick = {
                            statusName = PulseTimerStatus.IDLE.name
                            remainingSeconds = totalSeconds
                            endsAtEpochMillis = 0L
                            controlsVisible = true
                            wearDataLayer.publishTimer(
                                session = session,
                                status = PulseTimerStatus.IDLE,
                                durationSeconds = totalSeconds,
                                remainingSeconds = totalSeconds,
                                endsAt = 0L,
                                focusHome = effectiveFocusHome,
                            )
                        },
                    )
                    TimerControlButton(
                        glyph = if (status == PulseTimerStatus.RUNNING) {
                            TimerControlGlyph.PAUSE
                        } else {
                            TimerControlGlyph.PLAY
                        },
                        accent = accent,
                        prominent = true,
                        buttonSize = face * 0.205f,
                        onClick = {
                            if (status == PulseTimerStatus.RUNNING) {
                                val pausedRemaining = ceil(
                                    (endsAtEpochMillis - System.currentTimeMillis())
                                        .coerceAtLeast(0L) / 1000.0,
                                ).toInt()
                                remainingSeconds = pausedRemaining
                                endsAtEpochMillis = 0L
                                statusName = PulseTimerStatus.PAUSED.name
                                controlsVisible = true
                                wearDataLayer.publishTimer(
                                    session = session,
                                    status = PulseTimerStatus.PAUSED,
                                    durationSeconds = totalSeconds,
                                    remainingSeconds = pausedRemaining,
                                    endsAt = 0L,
                                    focusHome = effectiveFocusHome,
                                )
                            } else {
                                val localEndsAt =
                                    System.currentTimeMillis() + remainingSeconds * 1000L
                                endsAtEpochMillis = localEndsAt
                                statusName = PulseTimerStatus.RUNNING.name
                                controlsVisible = false
                                wearDataLayer.publishTimer(
                                    session = session,
                                    status = PulseTimerStatus.RUNNING,
                                    durationSeconds = totalSeconds,
                                    remainingSeconds = remainingSeconds,
                                    endsAt = localEndsAt,
                                    focusHome = effectiveFocusHome,
                                )
                            }
                        },
                    )
                    TimerControlButton(
                        glyph = TimerControlGlyph.SETTINGS,
                        accent = accent,
                        prominent = false,
                        buttonSize = face * 0.145f,
                        onClick = { setupVisible = true },
                    )
                }
            } else {
                RevealControlsHandle(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .offset(y = -face * 0.035f)
                        .size(face * 0.115f),
                    onClick = { controlsVisible = true },
                )
            }
        }
    }
}

private fun formatPulseTime(totalSeconds: Int): String {
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%02d:%02d".format(minutes, seconds)
}
