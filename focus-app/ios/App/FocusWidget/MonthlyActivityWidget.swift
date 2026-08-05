//
//  MonthlyActivityWidget.swift
//  FocusWidget
//

import Foundation
import SwiftUI
import WidgetKit

struct MonthlyActivityDay:
    Identifiable
{
    let id: Int
    let dayNumber: Int?
    let focusMinutes: Int
    let isToday: Bool

    var isActive: Bool {
        dayNumber != nil &&
        focusMinutes > 0
    }
}

private struct MonthlyActivityDaySnapshot:
    Codable
{
    let date: String
    let focusMinutes: Int
}

private struct MonthlyActivityWidgetSnapshot:
    Codable
{
    let year: Int
    let month: Int
    let monthTitle: String
    let longestStreak: Int
    let days: [
        MonthlyActivityDaySnapshot
    ]
}

struct MonthlyActivityEntry:
    TimelineEntry
{
    let date: Date
    let monthTitle: String
    let longestStreak: Int
    let days: [
        MonthlyActivityDay
    ]
}

private func makeCalendarDays(
    year: Int,
    month: Int,
    focusMinutesByDate: [
        String: Int
    ]
) -> [MonthlyActivityDay] {
    var calendar =
        Calendar(
            identifier: .gregorian
        )

    calendar.firstWeekday = 2

    guard
        let firstDay =
            calendar.date(
                from: DateComponents(
                    year: year,
                    month: month,
                    day: 1
                )
            ),
        let dayRange =
            calendar.range(
                of: .day,
                in: .month,
                for: firstDay
            )
    else {
        return []
    }

    let firstWeekday =
        calendar.component(
            .weekday,
            from: firstDay
        )

    let leadingEmptyDays =
        (firstWeekday + 5) % 7

    let todayComponents =
        calendar.dateComponents(
            [
                .year,
                .month,
                .day
            ],
            from: .now
        )

    return (0..<42).map {
        index in

        let dayNumber =
            index -
            leadingEmptyDays +
            1

        guard
            dayRange.contains(
                dayNumber
            )
        else {
            return MonthlyActivityDay(
                id: index,
                dayNumber: nil,
                focusMinutes: 0,
                isToday: false
            )
        }

        let dateKey =
            String(
                format:
                    "%04d-%02d-%02d",
                year,
                month,
                dayNumber
            )

        let isToday =
            todayComponents.year ==
                year &&
            todayComponents.month ==
                month &&
            todayComponents.day ==
                dayNumber

        return MonthlyActivityDay(
            id: index,
            dayNumber: dayNumber,
            focusMinutes:
                focusMinutesByDate[
                    dateKey
                ] ?? 0,
            isToday: isToday
        )
    }
}

private func makeMonthTitle(
    year: Int,
    month: Int
) -> String {
    let formatter =
        DateFormatter()

    formatter.locale =
        Locale(
            identifier: "en_US"
        )

    formatter.dateFormat =
        "MMMM yyyy"

    let calendar =
        Calendar(
            identifier: .gregorian
        )

    guard
        let date =
            calendar.date(
                from: DateComponents(
                    year: year,
                    month: month,
                    day: 1
                )
            )
    else {
        return "\(month)/\(year)"
    }

    return formatter.string(
        from: date
    )
}

private let monthlySampleEntry =
    MonthlyActivityEntry(
        date: .now,
        monthTitle:
            "August 2026",
        longestStreak: 7,
        days: makeCalendarDays(
            year: 2026,
            month: 8,
            focusMinutesByDate: [
                "2026-08-01": 25,
                "2026-08-02": 50,
                "2026-08-03": 35,
                "2026-08-05": 70,
                "2026-08-06": 25,
                "2026-08-08": 40,
                "2026-08-10": 80,
                "2026-08-11": 45,
                "2026-08-14": 30,
                "2026-08-15": 55,
                "2026-08-18": 40,
                "2026-08-19": 65,
                "2026-08-21": 90,
                "2026-08-22": 30,
                "2026-08-24": 50,
                "2026-08-25": 25,
                "2026-08-26": 75,
                "2026-08-28": 40,
                "2026-08-29": 60,
                "2026-08-30": 25
            ]
        )
    )

struct MonthlyActivityProvider:
    TimelineProvider
{
    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "monthly_activity_widget_snapshot"

    func placeholder(
        in context: Context
    ) -> MonthlyActivityEntry {
        monthlySampleEntry
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (
            MonthlyActivityEntry
        ) -> Void
    ) {
        if context.isPreview {
            completion(
                monthlySampleEntry
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
                MonthlyActivityEntry
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
        -> MonthlyActivityEntry
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
                        MonthlyActivityWidgetSnapshot
                            .self,
                        from: data
                    )
        else {
            return makeEmptyEntry()
        }

        let focusMinutesByDate =
            Dictionary(
                uniqueKeysWithValues:
                    snapshot.days.map {
                        (
                            $0.date,
                            $0.focusMinutes
                        )
                    }
            )

        return MonthlyActivityEntry(
            date: .now,
            monthTitle:
                snapshot.monthTitle,
            longestStreak:
                snapshot.longestStreak,
            days: makeCalendarDays(
                year: snapshot.year,
                month: snapshot.month,
                focusMinutesByDate:
                    focusMinutesByDate
            )
        )
    }

    private func makeEmptyEntry()
        -> MonthlyActivityEntry
    {
        let calendar =
            Calendar.current

        let year =
            calendar.component(
                .year,
                from: .now
            )

        let month =
            calendar.component(
                .month,
                from: .now
            )

        return MonthlyActivityEntry(
            date: .now,
            monthTitle:
                makeMonthTitle(
                    year: year,
                    month: month
                ),
            longestStreak: 0,
            days: makeCalendarDays(
                year: year,
                month: month,
                focusMinutesByDate: [:]
            )
        )
    }
}

struct MonthlyActivityView:
    View
{
    let entry:
        MonthlyActivityEntry

    private let accentColor =
        Color(
            red: 0.45,
            green: 0.95,
            blue: 0.64
        )

    private let weekdayLabels = [
        "M",
        "T",
        "W",
        "T",
        "F",
        "S",
        "S"
    ]

    private let columns =
        Array(
            repeating:
                GridItem(
                    .flexible(),
                    spacing: 6
                ),
            count: 7
        )

    private var activeDays: Int {
        entry.days.filter(
            \.isActive
        ).count
    }

    private var totalFocusMinutes:
        Int
    {
        entry.days.reduce(0) {
            $0 +
            $1.focusMinutes
        }
    }

    private var formattedFocusTime:
        String
    {
        let hours =
            totalFocusMinutes / 60

        let minutes =
            totalFocusMinutes % 60

        if hours == 0 {
            return "\(minutes)m"
        }

        return "\(hours)h \(minutes)m"
    }

    private func activityColor(
        for minutes: Int
    ) -> Color {
        switch minutes {
        case 1...25:
            return accentColor
                .opacity(0.22)

        case 26...50:
            return accentColor
                .opacity(0.42)

        case 51...75:
            return accentColor
                .opacity(0.68)

        case 76...:
            return accentColor

        default:
            return Color.white
                .opacity(0.045)
        }
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
            HStack {
                Text(
                    entry.monthTitle
                )
                .font(
                    .system(
                        size: 21,
                        weight: .bold,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    .white
                )

                Spacer()

                HStack(spacing: 5) {
                    Image(
                        systemName:
                            "flame.fill"
                    )

                    Text(
                        "\(entry.longestStreak)"
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
                    11
                )
                .padding(
                    .vertical,
                    7
                )
                .background(
                    accentColor
                        .opacity(0.1),
                    in: Capsule()
                )
            }

            HStack(spacing: 0) {
                ForEach(
                    Array(
                        weekdayLabels
                            .enumerated()
                    ),
                    id: \.offset
                ) {
                    _,
                    weekday in

                    Text(weekday)
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
                            Color.white
                                .opacity(
                                    0.3
                                )
                        )
                        .frame(
                            maxWidth:
                                .infinity
                        )
                }
            }
            .padding(.top, 14)
            .padding(.bottom, 7)

            LazyVGrid(
                columns: columns,
                spacing: 6
            ) {
                ForEach(
                    entry.days
                ) { day in
                    ZStack {
                        if
                            day.dayNumber !=
                                nil
                        {
                            RoundedRectangle(
                                cornerRadius: 7,
                                style:
                                    .continuous
                            )
                            .fill(
                                activityColor(
                                    for:
                                        day.focusMinutes
                                )
                            )

                            RoundedRectangle(
                                cornerRadius: 7,
                                style:
                                    .continuous
                            )
                            .stroke(
                                day.isToday
                                    ? accentColor
                                    : Color
                                        .white
                                        .opacity(
                                            0.06
                                        ),
                                lineWidth:
                                    day.isToday
                                        ? 2
                                        : 1
                            )
                        }

                        if
                            let dayNumber =
                                day.dayNumber
                        {
                            Text(
                                "\(dayNumber)"
                            )
                            .font(
                                .system(
                                    size: 11,
                                    weight:
                                        day.isToday
                                            ? .bold
                                            : .medium,
                                    design:
                                        .rounded
                                )
                            )
                            .foregroundStyle(
                                day.focusMinutes >=
                                    76
                                    ? Color
                                        .black
                                        .opacity(
                                            0.75
                                        )
                                    : day.isActive
                                        ? Color
                                            .white
                                            .opacity(
                                                0.9
                                            )
                                        : Color
                                            .white
                                            .opacity(
                                                0.3
                                            )
                            )
                        }
                    }
                    .frame(height: 34)
                }
            }

            Spacer(
                minLength: 12
            )

            HStack(spacing: 24) {
                HStack(spacing: 7) {
                    Image(
                        systemName:
                            "calendar"
                    )
                    .foregroundStyle(
                        accentColor
                            .opacity(
                                0.75
                            )
                    )

                    Text(
                        "\(activeDays) active days"
                    )
                    .foregroundStyle(
                        .white
                    )
                }

                HStack(spacing: 7) {
                    Image(
                        systemName:
                            "timer"
                    )
                    .foregroundStyle(
                        accentColor
                            .opacity(
                                0.75
                            )
                    )

                    Text(
                        formattedFocusTime
                    )
                    .foregroundStyle(
                        .white
                    )
                }

                Spacer()
            }
            .font(
                .system(
                    size: 12,
                    weight: .semibold,
                    design: .rounded
                )
            )
        }
        .padding(16)
    }
}

struct MonthlyActivityWidget:
    Widget
{
    let kind =
        "MonthlyActivityWidget"

    var body:
        some WidgetConfiguration
    {
        StaticConfiguration(
            kind: kind,
            provider:
                MonthlyActivityProvider()
        ) { entry in
            MonthlyActivityView(
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
            "Monthly Activity"
        )
        .description(
            "Mostra sua atividade de foco durante o mês."
        )
        .supportedFamilies([
            .systemLarge
        ])
    }
}

#Preview(
    as: .systemLarge
) {
    MonthlyActivityWidget()
} timeline: {
    monthlySampleEntry
}