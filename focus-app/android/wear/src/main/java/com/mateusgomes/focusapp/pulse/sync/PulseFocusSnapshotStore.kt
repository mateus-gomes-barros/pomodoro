package com.mateusgomes.focusapp.pulse.sync

import android.content.Context
import org.json.JSONObject

data class PulseTask(
    val id: String,
    val title: String,
    val projectId: String?,
    val projectName: String?,
    val category: String,
    val priority: String,
    val plannedDate: String?,
    val dailyPriority: Int?,
    val estimatedPomodoros: Int,
    val completedPomodoros: Int,
)

data class PulseGoal(
    val id: String,
    val title: String,
    val completed: Boolean,
)

data class PulseProject(
    val id: String,
    val name: String,
    val color: String?,
)

data class PulseFocusSnapshot(
    val updatedAt: Long,
    val today: String,
    val focusHome: String?,
    val streak: Int,
    val badgeLevel: Int,
    val badgeName: String,
    val focusMinutes: Int,
    val sessions: Int,
    val goalMinutes: Int,
    val projects: List<PulseProject>,
    val todayTaskIds: Set<String>,
    val tasks: List<PulseTask>,
    val goals: List<PulseGoal>,
) {
    val todayTasks: List<PulseTask>
        get() = tasks.filter { it.id in todayTaskIds }
}

class PulseFocusSnapshotStore(context: Context) {
    private val preferences = context.getSharedPreferences(
        "focus_pulse_v6_snapshot",
        Context.MODE_PRIVATE,
    )

    fun save(json: String) {
        JSONObject(json)
        preferences.edit()
            .putString(KEY_JSON, json)
            .putLong(KEY_SAVED_AT, System.currentTimeMillis())
            .apply()
    }

    fun load(): PulseFocusSnapshot? {
        val raw = preferences.getString(KEY_JSON, null) ?: return null
        return runCatching { parse(JSONObject(raw)) }.getOrNull()
    }

    fun savedAt(): Long = preferences.getLong(KEY_SAVED_AT, 0L)

    private fun parse(root: JSONObject): PulseFocusSnapshot {
        val progress = root.optJSONObject("progress") ?: JSONObject()
        val badge = root.optJSONObject("badge") ?: JSONObject()
        val taskIds = buildSet {
            val values = root.optJSONArray("todayTaskIds")
            if (values != null) {
                for (index in 0 until values.length()) {
                    add(values.optString(index))
                }
            }
        }
        val tasks = buildList {
            val values = root.optJSONArray("tasks")
            if (values != null) {
                for (index in 0 until values.length()) {
                    val item = values.optJSONObject(index) ?: continue
                    add(
                        PulseTask(
                            id = item.optString("id"),
                            title = item.optString("title"),
                            projectId = item.optString("projectId")
                                .takeIf { it.isNotBlank() && it != "null" },
                            projectName = item.optString("projectName")
                                .takeIf { it.isNotBlank() && it != "null" },
                            category = item.optString("category", "planned"),
                            priority = item.optString("priority", "medium"),
                            plannedDate = item.optString("plannedDate")
                                .takeIf { it.isNotBlank() && it != "null" },
                            dailyPriority = item.optInt("dailyPriority", 0)
                                .takeIf { it in 1..3 },
                            estimatedPomodoros = item.optInt("estimatedPomodoros", 0),
                            completedPomodoros = item.optInt("completedPomodoros", 0),
                        ),
                    )
                }
            }
        }
        val projects = buildList {
            val values = root.optJSONArray("projects")
            if (values != null) {
                for (index in 0 until values.length()) {
                    val item = values.optJSONObject(index) ?: continue
                    add(
                        PulseProject(
                            id = item.optString("id"),
                            name = item.optString("name"),
                            color = item.optString("color")
                                .takeIf { it.isNotBlank() && it != "null" },
                        ),
                    )
                }
            }
        }
        val goals = buildList {
            val values = root.optJSONArray("goals")
            if (values != null) {
                for (index in 0 until values.length()) {
                    val item = values.optJSONObject(index) ?: continue
                    add(
                        PulseGoal(
                            id = item.optString("id"),
                            title = item.optString("title"),
                            completed = item.optBoolean("completed"),
                        ),
                    )
                }
            }
        }
        return PulseFocusSnapshot(
            updatedAt = root.optLong("updatedAt"),
            today = root.optString("today"),
            focusHome = root.optString("focusHome")
                .takeIf { it.isNotBlank() && it != "null" },
            streak = root.optInt("streak"),
            badgeLevel = badge.optInt("level"),
            badgeName = badge.optString("name", "First Drop"),
            focusMinutes = progress.optInt("focusMinutes"),
            sessions = progress.optInt("sessions"),
            goalMinutes = progress.optInt("goalMinutes", 120),
            projects = projects,
            todayTaskIds = taskIds,
            tasks = tasks,
            goals = goals,
        )
    }

    private companion object {
        const val KEY_JSON = "snapshot_json"
        const val KEY_SAVED_AT = "saved_at"
    }
}

class PulseProjectSelectionStore(context: Context) {
    private val preferences = context.getSharedPreferences(
        "focus_pulse_project_selection",
        Context.MODE_PRIVATE,
    )

    fun save(project: PulseProject?) {
        preferences.edit()
            .putString(KEY_ID, project?.id.orEmpty())
            .putString(KEY_NAME, project?.name.orEmpty())
            .apply()
    }

    fun id(): String = preferences.getString(KEY_ID, "").orEmpty()

    fun name(): String = preferences.getString(KEY_NAME, "").orEmpty()

    private companion object {
        const val KEY_ID = "project_id"
        const val KEY_NAME = "project_name"
    }
}
