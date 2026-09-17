package com.mateusgomes.focusapp.wear;

public final class FocusWearContract {
    private FocusWearContract() {}

    public static final String TIMER_STATE_PATH = "/focus/timer/state";
    public static final String TIMER_COMMAND_PATH = "/focus/timer/command";
    public static final String TIMER_ACK_PATH = "/focus/timer/ack";
    public static final String SNAPSHOT_PATH = "/focus/v6/snapshot";
    public static final String ACTION_PATH = "/focus/v6/action";
    public static final String ACTION_ACK_PATH = "/focus/v6/action_ack";
    public static final String CAPABILITY_PHONE = "focus_phone";
    public static final String CAPABILITY_WATCH = "focus_watch";

    public static final String KEY_SESSION_ID = "session_id";
    public static final String KEY_STATUS = "status";
    public static final String KEY_SESSION_TYPE = "session_type";
    public static final String KEY_STARTED_AT = "started_at";
    public static final String KEY_ENDS_AT = "ends_at";
    public static final String KEY_DURATION_SECONDS = "duration_seconds";
    public static final String KEY_REMAINING_SECONDS = "remaining_seconds";
    public static final String KEY_TASK_ID = "task_id";
    public static final String KEY_TASK_NAME = "task_name";
    public static final String KEY_PROJECT_ID = "project_id";
    public static final String KEY_PROJECT_NAME = "project_name";
    public static final String KEY_FOCUS_HOME = "focus_home";
    public static final String KEY_SOURCE_DEVICE = "source_device";
    public static final String KEY_VERSION = "version";
    public static final String KEY_UPDATED_AT = "updated_at";
    public static final String KEY_ACK_VERSION = "ack_version";
    public static final String KEY_ACK_STATUS = "ack_status";
    public static final String KEY_SNAPSHOT_JSON = "snapshot_json";
    public static final String KEY_ACTION_JSON = "action_json";
    public static final String KEY_ACTION_ID = "action_id";

    public static final String SOURCE_PHONE = "phone";
    public static final String SOURCE_WATCH = "watch";
}
