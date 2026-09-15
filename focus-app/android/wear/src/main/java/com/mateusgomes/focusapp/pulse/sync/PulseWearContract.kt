package com.mateusgomes.focusapp.pulse.sync

object PulseWearContract {
    const val TIMER_STATE_PATH = "/focus/timer/state"
    const val TIMER_COMMAND_PATH = "/focus/timer/command"
    const val TIMER_ACK_PATH = "/focus/timer/ack"
    const val CAPABILITY_PHONE = "focus_phone"
    const val CAPABILITY_WATCH = "focus_watch"

    const val KEY_SESSION_ID = "session_id"
    const val KEY_STATUS = "status"
    const val KEY_SESSION_TYPE = "session_type"
    const val KEY_STARTED_AT = "started_at"
    const val KEY_ENDS_AT = "ends_at"
    const val KEY_DURATION_SECONDS = "duration_seconds"
    const val KEY_REMAINING_SECONDS = "remaining_seconds"
    const val KEY_TASK_ID = "task_id"
    const val KEY_TASK_NAME = "task_name"
    const val KEY_PROJECT_ID = "project_id"
    const val KEY_PROJECT_NAME = "project_name"
    const val KEY_FOCUS_HOME = "focus_home"
    const val KEY_SOURCE_DEVICE = "source_device"
    const val KEY_VERSION = "version"
    const val KEY_UPDATED_AT = "updated_at"
    const val KEY_ACK_VERSION = "ack_version"
    const val KEY_ACK_STATUS = "ack_status"

    const val SOURCE_PHONE = "phone"
    const val SOURCE_WATCH = "watch"
}
