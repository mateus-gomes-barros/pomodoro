//
//  MonthlyActivityWidget.swift
//  FocusWidget
//

import SwiftUI
import WidgetKit

struct MonthlyActivityDay: Identifiable {
    let id: Int
    let dayNumber: Int?
    let focusMinutes: Int
    let isToday: Bool

    var isActive: Bool {
        dayNumber != nil && focusMinutes > 0
    }
}

struct MonthlyActivityEntry: TimelineEntry {
    let date: Date
    let monthTitle: String
    let longestStreak: Int
    let days: [MonthlyActivityDay]
}

private func makeMonthlySampleDays() -> [MonthlyActivityDay] {
    let focusMinutesByDay: [Int: Int] = [
        1: 0,
        2: 25,
        3: 50,
        4: 35,
        5: 0,
        6: 70,
        7: 25,
        8: 40,
        9: 0,
        10: 25,
        11: 80,
        12: 45,
        13: 0,
        14: 30,
        15: 55,
        16: 0,
        17: 25,
        18: 40,
        19: 65,
        20: 0,
        21: 90,
        22: 30,
        23: 0,
        24: 50,
        25: 25,
        26: 75,
        27: 0,
        28: 40,
        29: 60,
        30: 25,
        31: 0
    ]

    var calendarDays: [MonthlyActivityDay] = []

    for index in 0..<42 {
        let calculatedDay = index - 4

        if calculatedDay >= 1 && calculatedDay <= 31 {
            calendarDays.append(
                MonthlyActivityDay(
                    id: index,
                    dayNumber: calculatedDay,
                    focusMinutes:
                        focusMinutesByDay[calculatedDay] ?? 0,
                    isToday: calculatedDay == 4
                )
            )
        } else {
            calendarDays.append(
                MonthlyActivityDay(
                    id: index,
                    dayNumber: nil,
                    focusMinutes: 0,
                    isToday: false
                )
            )
        }
    }

    return calendarDays
}

private let monthlySampleEntry = MonthlyActivityEntry(
    date: .now,
    monthTitle: "August 2026",
    longestStreak: 7,
    days: makeMonthlySampleDays()
)

struct MonthlyActivityProvider: TimelineProvider {
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
        completion(monthlySampleEntry)
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (
            Timeline<MonthlyActivityEntry>
        ) -> Void
    ) {
        let nextUpdate =
            Calendar.current.date(
                byAdding: .hour,
                value: 1,
                to: .now
            ) ?? .now.addingTimeInterval(3600)

        let timeline = Timeline(
            entries: [monthlySampleEntry],
            policy: .after(nextUpdate)
        )

        completion(timeline)
    }
}

struct MonthlyActivityView: View {
    let entry: MonthlyActivityEntry

    private let accentColor = Color(
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

    private let columns = Array(
        repeating: GridItem(
            .flexible(),
            spacing: 6
        ),
        count: 7
    )

    private var activeDays: Int {
        entry.days.filter(\.isActive).count
    }

    private var totalFocusMinutes: Int {
        entry.days.reduce(0) {
            $0 + $1.focusMinutes
        }
    }

    private var formattedFocusTime: String {
        let hours = totalFocusMinutes / 60
        let minutes = totalFocusMinutes % 60

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
            return accentColor.opacity(0.22)

        case 26...50:
            return accentColor.opacity(0.42)

        case 51...75:
            return accentColor.opacity(0.68)

        case 76...:
            return accentColor

        default:
            return Color.white.opacity(0.045)
        }
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
            HStack {
                Text(entry.monthTitle)
                    .font(
                        .system(
                            size: 21,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(.white)

                Spacer()

                HStack(spacing: 5) {
                    Image(
                        systemName: "flame.fill"
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
                .foregroundStyle(accentColor)
                .padding(.horizontal, 11)
                .padding(.vertical, 7)
                .background(
                    accentColor.opacity(0.1),
                    in: Capsule()
                )
            }

            HStack(spacing: 0) {
                ForEach(
                    Array(
                        weekdayLabels.enumerated()
                    ),
                    id: \.offset
                ) { _, weekday in
                    Text(weekday)
                        .font(
                            .system(
                                size: 10,
                                weight: .semibold,
                                design: .rounded
                            )
                        )
                        .foregroundStyle(
                            Color.white.opacity(0.3)
                        )
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.top, 14)
            .padding(.bottom, 7)

            LazyVGrid(
                columns: columns,
                spacing: 6
            ) {
                ForEach(entry.days) { day in
                    ZStack {
                        if day.dayNumber != nil {
                            RoundedRectangle(
                                cornerRadius: 7,
                                style: .continuous
                            )
                            .fill(
                                activityColor(
                                    for: day.focusMinutes
                                )
                            )

                            RoundedRectangle(
                                cornerRadius: 7,
                                style: .continuous
                            )
                            .stroke(
                                day.isToday
                                    ? accentColor
                                    : Color.white.opacity(0.06),
                                lineWidth:
                                    day.isToday ? 2 : 1
                            )
                        }

                        if let dayNumber = day.dayNumber {
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
                                    design: .rounded
                                )
                            )
                            .foregroundStyle(
                                day.focusMinutes >= 76
                                    ? Color.black.opacity(0.75)
                                    : day.isActive
                                        ? Color.white.opacity(0.9)
                                        : Color.white.opacity(0.3)
                            )
                        }
                    }
                    .frame(height: 34)
                }
            }

            Spacer(minLength: 12)

            HStack(spacing: 24) {
                HStack(spacing: 7) {
                    Image(
                        systemName: "calendar"
                    )
                    .foregroundStyle(
                        accentColor.opacity(0.75)
                    )

                    Text(
                        "\(activeDays) active days"
                    )
                    .foregroundStyle(.white)
                }

                HStack(spacing: 7) {
                    Image(
                        systemName: "timer"
                    )
                    .foregroundStyle(
                        accentColor.opacity(0.75)
                    )

                    Text(formattedFocusTime)
                        .foregroundStyle(.white)
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

struct MonthlyActivityWidget: Widget {
    let kind = "MonthlyActivityWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: MonthlyActivityProvider()
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
