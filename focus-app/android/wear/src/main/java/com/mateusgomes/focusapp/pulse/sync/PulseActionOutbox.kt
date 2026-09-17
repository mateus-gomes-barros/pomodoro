package com.mateusgomes.focusapp.pulse.sync

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class PulseActionOutbox(context: Context) {
    private val preferences = context.getSharedPreferences(
        "focus_pulse_action_outbox",
        Context.MODE_PRIVATE,
    )

    @Synchronized
    fun enqueue(payload: JSONObject) {
        val items = load().toMutableList()
        if (items.none { it.optString("id") == payload.optString("id") }) {
            items += payload
        }
        save(items.takeLast(MAX_ACTIONS))
    }

    @Synchronized
    fun acknowledge(actionId: String) {
        save(load().filterNot { it.optString("id") == actionId })
    }

    fun pending(): List<JSONObject> = load()

    fun count(): Int = load().size

    private fun load(): List<JSONObject> = runCatching {
        val array = JSONArray(preferences.getString(KEY_ACTIONS, "[]"))
        buildList {
            for (index in 0 until array.length()) {
                array.optJSONObject(index)?.let(::add)
            }
        }
    }.getOrDefault(emptyList())

    private fun save(items: List<JSONObject>) {
        val array = JSONArray()
        items.forEach(array::put)
        preferences.edit().putString(KEY_ACTIONS, array.toString()).apply()
    }

    private companion object {
        const val KEY_ACTIONS = "actions"
        const val MAX_ACTIONS = 100
    }
}
