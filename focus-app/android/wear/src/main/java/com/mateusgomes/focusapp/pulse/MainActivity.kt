package com.mateusgomes.focusapp.pulse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

private const val INITIAL_SECONDS = 25 * 60
private val PulseGreen = Color(0xFF6EE7B7)
private val PulseSurface = Color(0xFF10231C)
private val PulseMuted = Color(0xFF94A39D)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FocusPulseApp()
        }
    }
}

@Composable
private fun FocusPulseApp() {
    var remainingSeconds by rememberSaveable { mutableIntStateOf(INITIAL_SECONDS) }
    var isRunning by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(isRunning) {
        while (isRunning && remainingSeconds > 0) {
            delay(1_000)
            remainingSeconds -= 1
        }
        if (remainingSeconds == 0) {
            isRunning = false
        }
    }

    val progress = remainingSeconds.toFloat() / INITIAL_SECONDS.toFloat()
    val minutes = remainingSeconds / 60
    val seconds = remainingSeconds % 60

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val stroke = 7.dp.toPx()
            val inset = stroke / 2
            drawCircle(
                color = PulseSurface,
                radius = size.minDimension / 2 - inset,
                center = Offset(size.width / 2, size.height / 2),
                style = Stroke(width = stroke)
            )
            drawArc(
                color = PulseGreen,
                startAngle = -90f,
                sweepAngle = 360f * progress,
                useCenter = false,
                topLeft = Offset(inset, inset),
                size = androidx.compose.ui.geometry.Size(
                    size.width - stroke,
                    size.height - stroke
                ),
                style = Stroke(width = stroke, cap = StrokeCap.Round)
            )
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            BasicText(
                text = stringResource(R.string.app_name),
                style = TextStyle(
                    color = PulseMuted,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.sp
                )
            )
            BasicText(
                text = "%02d:%02d".format(minutes, seconds),
                modifier = Modifier.padding(top = 5.dp, bottom = 12.dp),
                style = TextStyle(
                    color = Color.White,
                    fontSize = 38.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
            )
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(PulseGreen)
                    .clickable {
                        if (remainingSeconds == 0) {
                            remainingSeconds = INITIAL_SECONDS
                        }
                        isRunning = !isRunning
                    },
                contentAlignment = Alignment.Center
            ) {
                BasicText(
                    text = if (isRunning) "Ⅱ" else "▶",
                    style = TextStyle(
                        color = Color.Black,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
            BasicText(
                text = stringResource(
                    if (isRunning) R.string.timer_running else R.string.timer_ready
                ),
                modifier = Modifier.padding(top = 8.dp),
                style = TextStyle(
                    color = PulseMuted,
                    fontSize = 10.sp,
                    textAlign = TextAlign.Center
                )
            )
        }
    }
}
