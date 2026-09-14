package com.mateusgomes.focusapp.pulse.timer

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.vector.PathParser

private data class FocusHomePaths(
    val standardOuter: Path,
    val secondaryOuter: Path,
    val fallbackMiddle: Path,
    val fallbackInner: Path,
    val cores: Map<FocusHomeKey, List<Path>>,
)

@Composable
fun FocusHomeEmblem(
    focusHome: FocusHomeKey?,
    color: Color,
    modifier: Modifier = Modifier,
    compact: Boolean = false,
) {
    val paths = remember {
        FocusHomePaths(
            standardOuter = path("M13 10.5C5.5 17.4 2.8 27.8 4.9 38.2C7.5 51.2 18.6 59.2 31.4 60.5C44.9 61.9 56.9 54.1 60.2 41.5C61.1 38.1 61.4 34.8 61 31.6"),
            secondaryOuter = path("M9 35C7.5 22 15 11 26 7C39 3 52 8 58 20C64 32 60 47 50 55"),
            fallbackMiddle = path("M8.5 34.6C7.4 22.4 14.5 11 25.9 7.1C38.6 2.8 52.3 8.4 58.2 20.4C64.1 32.4 60.2 47 49.8 55C39.4 63 24.7 61.5 15.5 53.2"),
            fallbackInner = path("M9.5 39.2C6.1 27.6 10.8 15 21 8.8C31.4 2.5 45.1 4.7 53.7 13.7C62.5 22.8 63.7 36.8 56.8 47.2C50.1 57.5 37.2 62.2 25.3 58.5"),
            cores = mapOf(
                FocusHomeKey.ASTER to paths(
                    "M32 28.5C31 22 33 17 38 13",
                    "M28.8 30C23 26 18 26 13 29",
                    "M29.5 35C25 40 24 45 26 51",
                    "M35 34C40 38 45 38 51 35",
                    "M34.5 29C39 25 43 21 44 16",
                ),
                FocusHomeKey.ATLAS to paths(
                    "M14 43L24 29L32 39L40 23L51 43",
                    "M18 47H47",
                    "M21 21C28 16 38 16 45 21",
                    "M26 43V38M38 43V35",
                ),
                FocusHomeKey.FORGE to paths(
                    "M32 20L42 31L32 43L22 31Z",
                    "M12 20L24 28",
                    "M52 20L40 28",
                    "M12 43L24 35",
                    "M52 43L40 35",
                ),
                FocusHomeKey.PULSE to paths(
                    "M11 34H20L25 23L31 44L37 18L42 34H53",
                    "M15 41C22 48 42 49 49 40",
                ),
                FocusHomeKey.LOOM to paths(
                    "M18 16C18 28 46 35 46 48",
                    "M46 16C46 28 18 35 18 48",
                    "M14 24H50",
                    "M14 40H50",
                ),
                FocusHomeKey.TIDE to paths(
                    "M11 26C18 18 25 18 32 26C39 34 46 34 53 26",
                    "M11 35C18 27 25 27 32 35C39 43 46 43 53 35",
                    "M16 44C22 39 27 39 32 44C37 49 42 49 48 44",
                ),
                FocusHomeKey.EMBER to paths(
                    "M32 12C35 22 44 25 43 36C42 46 36 51 32 52C24 50 19 44 20 36C21 28 27 25 27 18C30 20 32 24 32 28C36 25 36 19 32 12Z",
                    "M23 36C27 31 37 31 41 36C37 41 27 41 23 36Z",
                ),
                FocusHomeKey.NOVA to paths(
                    "M32 11V20",
                    "M32 44V53",
                    "M11 32H20",
                    "M44 32H53",
                    "M17 17L23 23",
                    "M41 41L47 47",
                    "M47 17L41 23",
                    "M23 41L17 47",
                ),
                FocusHomeKey.PRISM to paths(
                    "M32 12L51 45H13Z",
                    "M32 12L32 45",
                    "M20 33L44 33",
                    "M32 45L43 33L32 24L20 33Z",
                ),
                FocusHomeKey.VANGUARD to paths(
                    "M17 14H47V30C47 40 41 48 32 52C23 48 17 40 17 30Z",
                    "M22 34L32 24L42 34",
                    "M32 24V44",
                ),
                FocusHomeKey.VERDANT to paths(
                    "M32 51V18",
                    "M32 29C26 23 21 22 16 24C18 30 23 33 32 33",
                    "M32 39C39 32 45 31 50 34C47 41 41 44 32 44",
                    "M32 23C35 18 38 15 43 14C44 20 40 24 32 27",
                ),
                FocusHomeKey.ORBIT to emptyList(),
            ),
        )
    }

    Canvas(modifier = modifier) {
        val factor = size.minDimension / 64f
        withTransform({ scale(factor, factor) }) {
            if (focusHome == null) {
                drawPath(paths.standardOuter, color, style = line(2.2f))
                drawPath(paths.fallbackMiddle, color.copy(alpha = 0.82f), style = line(1.8f))
                drawPath(paths.fallbackInner, color.copy(alpha = 0.58f), style = line(1.7f))
                return@withTransform
            }

            if (!compact) {
                drawPath(paths.standardOuter, color.copy(alpha = 0.72f), style = line(1.45f))
                drawPath(paths.secondaryOuter, color.copy(alpha = 0.34f), style = line(1.15f))
            }

            val stroke = if (compact) 2.2f else 1.8f
            paths.cores.getValue(focusHome).forEach {
                drawPath(it, color, style = line(stroke))
            }
            drawSpecialGeometry(focusHome, color, stroke)
        }
    }
}

private fun DrawScope.drawSpecialGeometry(
    focusHome: FocusHomeKey,
    color: Color,
    stroke: Float,
) {
    when (focusHome) {
        FocusHomeKey.ASTER -> drawCircle(color, 3.5f, Offset(32f, 32f), style = line(stroke))
        FocusHomeKey.FORGE -> drawCircle(color, 3f, Offset(32f, 31.5f), style = line(stroke))
        FocusHomeKey.LOOM -> drawCircle(color, 3f, Offset(32f, 32f), style = line(stroke))
        FocusHomeKey.ORBIT -> {
            withTransform({ rotate(-18f, Offset(32f, 32f)) }) {
                drawOval(color, Offset(12f, 23f), Size(40f, 18f), style = line(stroke))
            }
            withTransform({ rotate(28f, Offset(32f, 32f)) }) {
                drawOval(color, Offset(23f, 12f), Size(18f, 40f), style = line(stroke))
            }
            drawCircle(color, 3.5f, Offset(32f, 32f), style = line(stroke))
            drawCircle(color, 2f, Offset(48f, 24f))
        }
        FocusHomeKey.EMBER -> {
            drawCircle(color, 2.7f, Offset(32f, 36f), style = line(stroke))
            drawCircle(color, 1f, Offset(32f, 36f))
        }
        FocusHomeKey.NOVA -> drawCircle(color, 7f, Offset(32f, 32f), style = line(stroke))
        FocusHomeKey.VERDANT -> drawCircle(color, 2f, Offset(32f, 52f))
        else -> Unit
    }
}

private fun line(width: Float) = Stroke(width = width, cap = StrokeCap.Round)

private fun path(data: String): Path =
    PathParser().parsePathString(data).toPath()

private fun paths(vararg data: String): List<Path> =
    data.map(::path)
