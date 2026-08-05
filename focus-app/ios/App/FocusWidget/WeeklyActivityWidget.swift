//
//  WeeklyActivityWidget.swift
//  FocusWidget
//

import Foundation
import SwiftUI
import WidgetKit

struct WeeklyActivityDay:
    Codable,
    Identifiable
{
    let date: String
    let label: String
    let focusMinutes: Int
    let isToday: Bool

    var id: String {
        date
    }

    var isActive: Bool {
        focusMinutes > 0
    }
}

private struct WeeklyActivityWidgetSnapshot:
    Codable
{
    let currentStreak: Int
    let totalFocusMinutes: Int
    let days: [WeeklyActivityDay]
}

struct WeeklyActivityEntry:
    TimelineEntry
{
    let date: Date
    let currentStreak: Int
    let totalFocusMinutes: Int
    let days: [WeeklyActivityDay]
}

private let weeklySampleEntry =
    WeeklyActivityEntry(
        date: .now,
        currentStreak: 4,
        totalFocusMinutes: 135,
        days: [
            WeeklyActivityDay(
                date: "2026-08-03",
                label: "M",
                focusMinutes: 25,
                isToday: false
            ),
            WeeklyActivityDay(
                date: "2026-08-04",
                label: "T",
                focusMinutes: 50,
                isToday: false
            ),
            WeeklyActivityDay(
                date: "2026-08-05",
                label: "W",
                focusMinutes: 35,
                isToday: true
            ),
            WeeklyActivityDay(
                date: "2026-08-06",
                label: "T",
                focusMinutes: 25,
                isToday: false
            ),
            WeeklyActivityDay(
                date: "2026-08-07",
                label: "F",
                focusMinutes: 0,
                isToday: false
            ),
            WeeklyActivityDay(
                date: "2026-08-08",
                label: "S",
                focusMinutes: 0,
                isToday: false
            ),
            WeeklyActivityDay(
                date: "2026-08-09",
                label: "S",
                focusMinutes: 0,
                isToday: false
            )
        ]
    )

struct WeeklyActivityProvider:
    TimelineProvider
{
    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "weekly_activity_widget_snapshot"

    func placeholder(
        in context: Context
    ) -> WeeklyActivityEntry {
        weeklySampleEntry
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (
            WeeklyActivityEntry
        ) -> Void
    ) {
        if context.isPreview {
            completion(
                weeklySampleEntry
            )

            return
        }

        completion(
            loadEntry()
        )
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (
            Timeline<
                WeeklyActivityEntry
            >
        ) -> Void
    ) {
        let entry =
            loadEntry()

        let nextUpdate =
            Calendar.current.date(
                byAdding: .hour,
                value: 1,
                to: .now
            ) ??
            .now.addingTimeInterval(
                3600
            )

        completion(
            Timeline(
                entries: [entry],
                policy: .after(
                    nextUpdate
                )
            )
        )
    }

    private func loadEntry()
        -> WeeklyActivityEntry
    {
        guard
            let sharedDefaults =
                UserDefaults(
                    suiteName:
                        appGroupIdentifier
                ),
            let payload =
                sharedDefaults.string(
                    forKey:
                        snapshotKey
                ),
            let data =
                payload.data(
                    using: .utf8
                ),
            let snapshot =
                try? JSONDecoder()
                    .decode(
                        WeeklyActivityWidgetSnapshot
                            .self,
                        from: data
                    )
        else {
            return makeEmptyEntry()
        }

        return WeeklyActivityEntry(
            date: .now,
            currentStreak:
                snapshot.currentStreak,
            totalFocusMinutes:
                snapshot.totalFocusMinutes,
            days: snapshot.days
        )
    }

    private func makeEmptyEntry()
        -> WeeklyActivityEntry
    {
        var calendar =
            Calendar(
                identifier: .gregorian
            )

        calendar.firstWeekday = 2

        let today = Date()

        let weekStart =
            calendar.dateInterval(
                of: .weekOfYear,
                for: today
            )?.start ?? today

        let formatter =
            DateFormatter()

        formatter.calendar = calendar
        formatter.locale =
            Locale(
                identifier: "en_US_POSIX"
            )
        formatter.dateFormat =
            "yyyy-MM-dd"

        let labels = [
            "M",
            "T",
            "W",
            "T",
            "F",
            "S",
            "S"
        ]

        let days =
            (0..<7).compactMap {
                index
                    -> WeeklyActivityDay? in

                guard
                    let date =
                        calendar.date(
                            byAdding: .day,
                            value: index,
                            to: weekStart
                        )
                else {
                    return nil
                }

                return WeeklyActivityDay(
                    date:
                        formatter.string(
                            from: date
                        ),
                    label:
                        labels[index],
                    focusMinutes: 0,
                    isToday:
                        calendar.isDateInToday(
                            date
                        )
                )
            }

        return WeeklyActivityEntry(
            date: .now,
            currentStreak: 0,
            totalFocusMinutes: 0,
            days: days
        )
    }
}

struct WeeklyActivityView:
    View
{
    let entry:
        WeeklyActivityEntry

    private let accentColor =
        Color(
            red: 0.45,
            green: 0.95,
            blue: 0.64
        )

    private var activeDays: Int {
        entry.days.filter(
            \.isActive
        ).count
    }

    private var formattedFocusTime:
        String
    {
        let hours =
            entry.totalFocusMinutes / 60

        let minutes =
            entry.totalFocusMinutes % 60

        if hours == 0 {
            return "\(minutes)m"
        }

        return "\(hours)h \(minutes)m"
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
            HStack {
                VStack(
                    alignment: .leading,
                    spacing: 3
                ) {
                    Text("YOUR WEEK")
                        .font(
                            .system(
                                size: 10,
                                weight: .bold,
                                design: .rounded
                            )
                        )
                        .tracking(1.2)
                        .foregroundStyle(
                            Color.white.opacity(
                                0.35
                            )
                        )

                    Text(
                        "\(activeDays) active days"
                    )
                    .font(
                        .system(
                            size: 17,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        .white
                    )
                }

                Spacer()

                HStack(spacing: 5) {
                    Image(
                        systemName:
                            "flame.fill"
                    )

                    Text(
                        "\(entry.currentStreak)"
                    )
                    .monospacedDigit()
                }
                .font(
                    .system(
                        size: 13,
                        weight: .bold,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    accentColor
                )
                .padding(
                    .horizontal,
                    10
                )
                .padding(
                    .vertical,
                    7
                )
                .background(
                    accentColor.opacity(
                        0.1
                    ),
                    in: Capsule()
                )
            }

            Spacer(
                minLength: 12
            )

            HStack(spacing: 0) {
                ForEach(
                    entry.days
                ) { day in
                    VStack(spacing: 7) {
                        Text(day.label)
                            .font(
                                .system(
                                    size: 10,
                                    weight:
                                        .semibold,
                                    design:
                                        .rounded
                                )
                            )
                            .foregroundStyle(
                                day.isToday
                                    ? .white
                                    : Color
                                        .white
                                        .opacity(
                                            0.35
                                        )
                            )

                        ZStack {
                            Circle()
                                .fill(
                                    day.isActive
                                        ? accentColor
                                            .opacity(
                                                0.16
                                            )
                                        : Color
                                            .white
                                            .opacity(
                                                0.045
                                            )
                                )

                            Circle()
                                .stroke(
                                    day.isToday
                                        ? accentColor
                                        : Color
                                            .white
                                            .opacity(
                                                0.08
                                            ),
                                    lineWidth:
                                        day.isToday
                                            ? 2
                                            : 1
                                )

                            if day.isActive {
                                Circle()
                                    .fill(
                                        accentColor
                                    )
                                    .frame(
                                        width: 10,
                                        height: 10
                                    )
                            }
                        }
                        .frame(
                            width: 30,
                            height: 30
                        )

                        Text(
                            day.isActive
                                ? "\(day.focusMinutes)m"
                                : "—"
                        )
                        .font(
                            .system(
                                size: 9,
                                weight: .medium,
                                design: .rounded
                            )
                        )
                        .foregroundStyle(
                            day.isActive
                                ? Color
                                    .white
                                    .opacity(
                                        0.55
                                    )
                                : Color
                                    .white
                                    .opacity(
                                        0.18
                                    )
                        )
                    }
                    .frame(
                        maxWidth:
                            .infinity
                    )
                }
            }

            Spacer(
                minLength: 12
            )

            HStack {
                Text(
                    formattedFocusTime
                )
                .font(
                    .system(
                        size: 13,
                        weight: .semibold,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    .white
                )

                Text(
                    "focused this week"
                )
                .font(
                    .system(
                        size: 11,
                        weight: .medium
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(
                        0.35
                    )
                )

                Spacer()

                Image(
                    systemName:
                        "chart.bar.fill"
                )
                .font(
                    .system(
                        size: 11
                    )
                )
                .foregroundStyle(
                    accentColor.opacity(
                        0.75
                    )
                )
            }
        }
        .padding(16)
    }
}

struct WeeklyActivityWidget:
    Widget
{
    let kind =
        "WeeklyActivityWidget"

    var body:
        some WidgetConfiguration
    {
        StaticConfiguration(
            kind: kind,
            provider:
                WeeklyActivityProvider()
        ) { entry in
            WeeklyActivityView(
                entry: entry
            )
            .containerBackground(
                for: .widget
            ) {
                Color(
                    red: 0.035,
                    green: 0.035,
                    blue: 0.04
                )
            }
        }
        .configurationDisplayName(
            "Weekly Activity"
        )
        .description(
            "Mostra os dias em que você manteve o foco durante a semana."
        )
        .supportedFamilies([
            .systemMedium
        ])
    }
}

#Preview(
    as: .systemMedium
) {
    WeeklyActivityWidget()
} timeline: {
    weeklySampleEntry
}