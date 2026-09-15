package com.mateusgomes.focusapp.pulse.timer

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
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

enum class TimerControlGlyph { PLAY, PAUSE, RESET, SOUND }

@Composable
fun TimerFace(
    modifier: Modifier,
    ringSize: Dp,
    progress: Float,
    accent: Color,
    focusHome: FocusHomeKey?,
    running: Boolean,
) {
    val transition = rememberInfiniteTransition(label = "focus-home-breath")
    val breath by transition.animateFloat(
        initialValue = 0.96f,
        targetValue = 1.045f,
        animationSpec = infiniteRepeatable(
            animation = tween(2600),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "focus-home-scale",
    )
    val breathOpacity by transition.animateFloat(
        initialValue = 0.13f,
        targetValue = 0.24f,
        animationSpec = infiniteRepeatable(
            animation = tween(2600),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "focus-home-opacity",
    )

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val edge = size.minDimension
            drawCircle(
                color = Color.White.copy(alpha = 0.075f),
                radius = edge * 0.49f,
                style = Stroke(edge * 0.006f),
            )
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.075f),
                        Color(0xFF07100B).copy(alpha = 0.88f),
                    ),
                    center = Offset(size.width * 0.42f, size.height * 0.30f),
                    radius = edge * 0.66f,
                ),
                radius = edge * 0.445f,
            )
            drawCircle(
                color = Color.White.copy(alpha = 0.052f),
                radius = edge * 0.445f,
                style = Stroke(edge * 0.004f),
            )
        }

        FocusHomeEmblem(
            focusHome = focusHome,
            color = accent,
            modifier = Modifier
                .size(ringSize * 0.88f)
                .alpha(if (running) breathOpacity else 0.16f)
                .graphicsLayer {
                    scaleX = if (running) breath else 1f
                    scaleY = if (running) breath else 1f
                },
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
                style = Stroke(stroke, cap = StrokeCap.Round),
            )
            if (progress > 0f) {
                drawArc(
                    brush = Brush.sweepGradient(
                        listOf(
                            accent.copy(alpha = 0.55f),
                            accent,
                            accent.copy(alpha = 0.82f),
                        ),
                    ),
                    startAngle = -90f,
                    sweepAngle = 360f * progress,
                    useCenter = false,
                    topLeft = Offset(inset, inset),
                    size = arcSize,
                    style = Stroke(stroke, cap = StrokeCap.Round),
                )
            }
        }
    }
}

@Composable
fun SessionDots(
    completedFocusSessions: Int,
    sessionsUntilLongBreak: Int,
    accent: Color,
    modifier: Modifier = Modifier,
) {
    val total = sessionsUntilLongBreak.coerceAtLeast(1)
    val completed = completedFocusSessions % total
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(5.dp),
    ) {
        repeat(total) { index ->
            Box(
                Modifier
                    .size(4.dp)
                    .clip(CircleShape)
                    .background(
                        if (index < completed) accent
                        else Color.White.copy(alpha = 0.14f),
                    ),
            )
        }
    }
}

@Composable
fun TimerControlButton(
    glyph: TimerControlGlyph,
    accent: Color,
    prominent: Boolean,
    buttonSize: Dp,
    enabled: Boolean = true,
    onClick: () -> Unit,
) {
    val shape = if (prominent) RoundedCornerShape(buttonSize * 0.28f) else CircleShape
    val background = if (prominent) {
        Brush.linearGradient(listOf(accent, accent.copy(alpha = 0.72f)))
    } else {
        Brush.radialGradient(
            listOf(
                Color.White.copy(alpha = 0.09f),
                Color.White.copy(alpha = 0.035f),
            ),
        )
    }

    Box(
        modifier = Modifier
            .size(buttonSize)
            .clip(shape)
            .background(background)
            .clickable(
                role = Role.Button,
                onClick = onClick,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(
            Modifier.size(
                if (prominent) buttonSize * 0.40f
                else buttonSize * 0.43f,
            ),
        ) {
            val glyphColor =
                if (prominent) Color(0xFF020604).copy(alpha = 0.92f)
                else Color.White.copy(alpha = if (enabled) 0.78f else 0.28f)

            when (glyph) {
                TimerControlGlyph.PLAY -> {
                    val path = Path().apply {
                        moveTo(size.width * 0.31f, size.height * 0.18f)
                        lineTo(size.width * 0.78f, size.height * 0.50f)
                        lineTo(size.width * 0.31f, size.height * 0.82f)
                        close()
                    }
                    drawPath(path, glyphColor)
                }
                TimerControlGlyph.PAUSE -> {
                    drawRoundRect(
                        color = glyphColor,
                        topLeft = Offset(size.width * 0.22f, size.height * 0.16f),
                        size = Size(size.width * 0.19f, size.height * 0.68f),
                    )
                    drawRoundRect(
                        color = glyphColor,
                        topLeft = Offset(size.width * 0.59f, size.height * 0.16f),
                        size = Size(size.width * 0.19f, size.height * 0.68f),
                    )
                }
                TimerControlGlyph.RESET -> {
                    drawArc(
                        color = glyphColor,
                        startAngle = 35f,
                        sweepAngle = 285f,
                        useCenter = false,
                        style = Stroke(size.width * 0.10f, cap = StrokeCap.Round),
                    )
                    val path = Path().apply {
                        moveTo(size.width * 0.17f, size.height * 0.15f)
                        lineTo(size.width * 0.18f, size.height * 0.43f)
                        lineTo(size.width * 0.42f, size.height * 0.27f)
                        close()
                    }
                    drawPath(path, glyphColor)
                }
                TimerControlGlyph.SOUND -> {
                    val path = Path().apply {
                        moveTo(size.width * 0.14f, size.height * 0.40f)
                        lineTo(size.width * 0.34f, size.height * 0.40f)
                        lineTo(size.width * 0.57f, size.height * 0.20f)
                        lineTo(size.width * 0.57f, size.height * 0.80f)
                        lineTo(size.width * 0.34f, size.height * 0.60f)
                        lineTo(size.width * 0.14f, size.height * 0.60f)
                        close()
                    }
                    drawPath(path, glyphColor)
                    if (enabled) {
                        drawArc(
                            color = glyphColor,
                            startAngle = -48f,
                            sweepAngle = 96f,
                            useCenter = false,
                            topLeft = Offset(size.width * 0.46f, size.height * 0.28f),
                            size = Size(size.width * 0.40f, size.height * 0.44f),
                            style = Stroke(size.width * 0.08f, cap = StrokeCap.Round),
                        )
                    } else {
                        drawLine(
                            color = glyphColor,
                            start = Offset(size.width * 0.68f, size.height * 0.30f),
                            end = Offset(size.width * 0.90f, size.height * 0.70f),
                            strokeWidth = size.width * 0.08f,
                            cap = StrokeCap.Round,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun RevealControlsHandle(
    modifier: Modifier,
    onClick: () -> Unit,
) {
    Box(
        modifier = modifier
            .clip(CircleShape)
            .clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.size(14.dp)) {
            val stroke = size.width * 0.10f
            drawLine(
                color = Color.White.copy(alpha = 0.22f),
                start = Offset(size.width * 0.22f, size.height * 0.62f),
                end = Offset(size.width * 0.50f, size.height * 0.36f),
                strokeWidth = stroke,
                cap = StrokeCap.Round,
            )
            drawLine(
                color = Color.White.copy(alpha = 0.22f),
                start = Offset(size.width * 0.50f, size.height * 0.36f),
                end = Offset(size.width * 0.78f, size.height * 0.62f),
                strokeWidth = stroke,
                cap = StrokeCap.Round,
            )
        }
    }
}
