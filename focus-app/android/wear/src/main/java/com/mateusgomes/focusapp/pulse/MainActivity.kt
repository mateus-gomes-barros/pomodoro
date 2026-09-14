package com.mateusgomes.focusapp.pulse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import kotlinx.coroutines.delay
import kotlin.math.ceil
import kotlin.math.min

private val FocusGreen = Color(0xFF34D399)
private val BreakBlue = Color(0xFF60A5FA)
private val Ink = Color(0xFF020604)

private enum class Session(val label: String, val minutes: Int) {
    FOCUS("FOCO", 25),
    SHORT_BREAK("PAUSA CURTA", 5),
    LONG_BREAK("PAUSA LONGA", 15)
}

private enum class TimerStatus { IDLE, RUNNING, PAUSED }
private enum class Glyph { PLAY, PAUSE, RESET, SOUND }

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                FocusPulseTimer()
            }
        }
    }
}

@Composable
private fun FocusPulseTimer() {
    var sessionName by rememberSaveable { mutableStateOf(Session.FOCUS.name) }
    val session = Session.valueOf(sessionName)
    var statusName by rememberSaveable { mutableStateOf(TimerStatus.IDLE.name) }
    val status = TimerStatus.valueOf(statusName)
    var remaining by rememberSaveable { mutableIntStateOf(session.minutes * 60) }
    var endsAt by rememberSaveable { mutableLongStateOf(0L) }
    var focusCount by rememberSaveable { mutableIntStateOf(0) }
    var completionPulse by rememberSaveable { mutableIntStateOf(0) }
    var soundOn by rememberSaveable { mutableStateOf(true) }
    var controlsVisible by rememberSaveable { mutableStateOf(true) }
    val haptics = LocalHapticFeedback.current
    val total = session.minutes * 60
    val accent = if (session == Session.FOCUS) FocusGreen else BreakBlue
    val progress = if (status == TimerStatus.IDLE) 0f else (1f - remaining.toFloat() / total).coerceIn(0f, 1f)

    LaunchedEffect(statusName, endsAt) {
        while (status == TimerStatus.RUNNING) {
            val next = ceil((endsAt - System.currentTimeMillis()).coerceAtLeast(0L) / 1000.0).toInt()
            remaining = next
            if (next <= 0) {
                if (session == Session.FOCUS) {
                    focusCount += 1
                    sessionName = if (focusCount % 4 == 0) Session.LONG_BREAK.name else Session.SHORT_BREAK.name
                } else {
                    sessionName = Session.FOCUS.name
                }
                statusName = TimerStatus.IDLE.name
                completionPulse += 1
                break
            }
            delay(250)
        }
    }

    LaunchedEffect(completionPulse) {
        if (completionPulse > 0) haptics.performHapticFeedback(HapticFeedbackType.LongPress)
    }

    LaunchedEffect(sessionName) {
        if (statusName == TimerStatus.IDLE.name) remaining = Session.valueOf(sessionName).minutes * 60
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(Color(0xFF0B1711), Ink),
                    center = Offset.Unspecified,
                    radius = 520f
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            val face = min(maxWidth.value, maxHeight.value).dp
            val timerSize = if (status == TimerStatus.RUNNING && !controlsVisible) face * 0.98f else face * 0.92f
            val ringSize = timerSize * 0.88f

            GlassTimerFace(
                modifier = Modifier.size(timerSize),
                ringSize = ringSize,
                progress = progress,
                accent = accent,
                running = status == TimerStatus.RUNNING
            )

            Text(
                text = formatTime(remaining),
                color = accent,
                fontSize = (face.value * 0.205f).sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.offset(y = -face * 0.055f)
            )

            Text(
                text = session.label,
                color = Color.White.copy(alpha = 0.52f),
                fontSize = (face.value * 0.041f).sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 0.7.sp,
                modifier = Modifier.offset(y = face * 0.075f)
            )

            SessionDots(
                focusCount = focusCount,
                modifier = Modifier.offset(y = face * 0.132f)
            )

            if (controlsVisible || status != TimerStatus.RUNNING) {
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .offset(y = -face * 0.060f),
                    horizontalArrangement = Arrangement.spacedBy(face * 0.045f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ControlButton(
                        glyph = Glyph.RESET,
                        accent = accent,
                        prominent = false,
                        buttonSize = face * 0.145f,
                        onClick = {
                            statusName = TimerStatus.IDLE.name
                            remaining = total
                            endsAt = 0L
                            controlsVisible = true
                        }
                    )
                    ControlButton(
                        glyph = if (status == TimerStatus.RUNNING) Glyph.PAUSE else Glyph.PLAY,
                        accent = accent,
                        prominent = true,
                        buttonSize = face * 0.205f,
                        onClick = {
                            if (status == TimerStatus.RUNNING) {
                                remaining = ceil((endsAt - System.currentTimeMillis()).coerceAtLeast(0L) / 1000.0).toInt()
                                statusName = TimerStatus.PAUSED.name
                                controlsVisible = true
                            } else {
                                endsAt = System.currentTimeMillis() + remaining * 1000L
                                statusName = TimerStatus.RUNNING.name
                                controlsVisible = false
                            }
                        }
                    )
                    ControlButton(
                        glyph = Glyph.SOUND,
                        accent = accent,
                        prominent = false,
                        buttonSize = face * 0.145f,
                        enabled = soundOn,
                        onClick = { soundOn = !soundOn }
                    )
                }
            } else {
                RevealControlsChevron(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .offset(y = -face * 0.035f)
                        .size(face * 0.115f),
                    onClick = { controlsVisible = true }
                )
            }
        }
    }
}

@Composable
private fun GlassTimerFace(
    modifier: Modifier,
    ringSize: androidx.compose.ui.unit.Dp,
    progress: Float,
    accent: Color,
    running: Boolean
) {
    val transition = rememberInfiniteTransition(label = "focus-breath")
    val breath by transition.animateFloat(
        initialValue = 0.97f,
        targetValue = 1.035f,
        animationSpec = infiniteRepeatable(tween(2600), RepeatMode.Reverse),
        label = "identity-breath"
    )

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val edge = size.minDimension
            drawCircle(Color.White.copy(alpha = 0.075f), radius = edge * 0.49f, style = Stroke(edge * 0.006f))
            drawCircle(
                Brush.radialGradient(
                    colors = listOf(Color.White.copy(alpha = 0.075f), Color(0xFF07100B).copy(alpha = 0.88f)),
                    center = Offset(size.width * 0.42f, size.height * 0.30f),
                    radius = edge * 0.66f
                ),
                radius = edge * 0.445f
            )
            drawCircle(Color.White.copy(alpha = 0.052f), radius = edge * 0.445f, style = Stroke(edge * 0.004f))
        }

        FocusIdentity(
            color = accent,
            modifier = Modifier
                .size(ringSize * 0.79f)
                .alpha(if (running) 0.20f else 0.15f)
                .graphicsLayer {
                    scaleX = if (running) breath else 1f
                    scaleY = if (running) breath else 1f
                }
        )

        Canvas(modifier = Modifier.size(ringSize)) {
            val stroke = size.minDimension * 0.019f
            val inset = stroke / 2f
            val arcSize = Size(size.width - stroke, size.height - stroke)
            drawArc(
                color = Color.White.copy(alpha = 0.105f),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = Offset(inset, inset),
                size = arcSize,
                style = Stroke(stroke, cap = StrokeCap.Round)
            )
            if (progress > 0f) {
                drawArc(
                    brush = Brush.sweepGradient(
                        listOf(accent.copy(alpha = 0.55f), accent, accent.copy(alpha = 0.82f))
                    ),
                    startAngle = -90f,
                    sweepAngle = 360f * progress,
                    useCenter = false,
                    topLeft = Offset(inset, inset),
                    size = arcSize,
                    style = Stroke(stroke, cap = StrokeCap.Round)
                )
            }
        }
    }
}

@Composable
private fun FocusIdentity(color: Color, modifier: Modifier = Modifier) {
    val paths = remember {
        listOf(
            PathParser().parsePathString("M13 10.5C5.5 17.4 2.8 27.8 4.9 38.2C7.5 51.2 18.6 59.2 31.4 60.5C44.9 61.9 56.9 54.1 60.2 41.5C61.1 38.1 61.4 34.8 61 31.6").toPath(),
            PathParser().parsePathString("M8.5 34.6C7.4 22.4 14.5 11 25.9 7.1C38.6 2.8 52.3 8.4 58.2 20.4C64.1 32.4 60.2 47 49.8 55C39.4 63 24.7 61.5 15.5 53.2").toPath(),
            PathParser().parsePathString("M9.5 39.2C6.1 27.6 10.8 15 21 8.8C31.4 2.5 45.1 4.7 53.7 13.7C62.5 22.8 63.7 36.8 56.8 47.2C50.1 57.5 37.2 62.2 25.3 58.5").toPath()
        )
    }
    Canvas(modifier = modifier) {
        val scale = size.minDimension / 64f
        withTransform({ scale(scale, scale) }) {
            drawPath(paths[0], color, style = Stroke(2.2f, cap = StrokeCap.Round))
            drawPath(paths[1], color.copy(alpha = 0.82f), style = Stroke(1.8f, cap = StrokeCap.Round))
            drawPath(paths[2], color.copy(alpha = 0.58f), style = Stroke(1.7f, cap = StrokeCap.Round))
        }
    }
}

@Composable
private fun RevealControlsChevron(modifier: Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .clip(CircleShape)
            .clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Canvas(Modifier.size(14.dp)) {
            val stroke = size.width * 0.10f
            drawLine(
                color = Color.White.copy(alpha = 0.22f),
                start = Offset(size.width * 0.22f, size.height * 0.62f),
                end = Offset(size.width * 0.50f, size.height * 0.36f),
                strokeWidth = stroke,
                cap = StrokeCap.Round
            )
            drawLine(
                color = Color.White.copy(alpha = 0.22f),
                start = Offset(size.width * 0.50f, size.height * 0.36f),
                end = Offset(size.width * 0.78f, size.height * 0.62f),
                strokeWidth = stroke,
                cap = StrokeCap.Round
            )
        }
    }
}

@Composable
private fun SessionDots(focusCount: Int, modifier: Modifier = Modifier) {
    Row(modifier = modifier, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
        repeat(4) { index ->
            Box(
                Modifier
                    .size(4.dp)
                    .clip(CircleShape)
                    .background(if (index < focusCount % 4) FocusGreen else Color.White.copy(alpha = 0.14f))
            )
        }
    }
}

@Composable
private fun ControlButton(
    glyph: Glyph,
    accent: Color,
    prominent: Boolean,
    buttonSize: androidx.compose.ui.unit.Dp,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    val shape = if (prominent) RoundedCornerShape(buttonSize * 0.28f) else CircleShape
    val background = if (prominent) {
        Brush.linearGradient(listOf(accent, accent.copy(alpha = 0.72f)))
    } else {
        Brush.radialGradient(listOf(Color.White.copy(alpha = 0.09f), Color.White.copy(alpha = 0.035f)))
    }
    Box(
        modifier = Modifier
            .size(buttonSize)
            .clip(shape)
            .background(background)
            .clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Canvas(Modifier.size(if (prominent) buttonSize * 0.40f else buttonSize * 0.43f)) {
            val c = if (prominent) Ink.copy(alpha = 0.92f) else Color.White.copy(alpha = if (enabled) 0.78f else 0.28f)
            when (glyph) {
                Glyph.PLAY -> {
                    val p = Path().apply {
                        moveTo(size.width * 0.31f, size.height * 0.18f)
                        lineTo(size.width * 0.78f, size.height * 0.50f)
                        lineTo(size.width * 0.31f, size.height * 0.82f)
                        close()
                    }
                    drawPath(p, c)
                }
                Glyph.PAUSE -> {
                    drawRoundRect(c, Offset(size.width * 0.22f, size.height * 0.16f), Size(size.width * 0.19f, size.height * 0.68f))
                    drawRoundRect(c, Offset(size.width * 0.59f, size.height * 0.16f), Size(size.width * 0.19f, size.height * 0.68f))
                }
                Glyph.RESET -> {
                    drawArc(c, 35f, 285f, false, style = Stroke(size.width * 0.10f, cap = StrokeCap.Round))
                    val p = Path().apply {
                        moveTo(size.width * 0.17f, size.height * 0.15f)
                        lineTo(size.width * 0.18f, size.height * 0.43f)
                        lineTo(size.width * 0.42f, size.height * 0.27f)
                        close()
                    }
                    drawPath(p, c)
                }
                Glyph.SOUND -> {
                    val p = Path().apply {
                        moveTo(size.width * 0.14f, size.height * 0.40f)
                        lineTo(size.width * 0.34f, size.height * 0.40f)
                        lineTo(size.width * 0.57f, size.height * 0.20f)
                        lineTo(size.width * 0.57f, size.height * 0.80f)
                        lineTo(size.width * 0.34f, size.height * 0.60f)
                        lineTo(size.width * 0.14f, size.height * 0.60f)
                        close()
                    }
                    drawPath(p, c)
                    if (enabled) {
                        drawArc(c, -48f, 96f, false, Offset(size.width * 0.46f, size.height * 0.28f), Size(size.width * 0.40f, size.height * 0.44f), style = Stroke(size.width * 0.08f, cap = StrokeCap.Round))
                    } else {
                        drawLine(c, Offset(size.width * 0.68f, size.height * 0.30f), Offset(size.width * 0.90f, size.height * 0.70f), strokeWidth = size.width * 0.08f, cap = StrokeCap.Round)
                    }
                }
            }
        }
    }
}

private fun formatTime(totalSeconds: Int): String {
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%02d:%02d".format(minutes, seconds)
}
