import SwiftUI
import WidgetKit

struct WeeklyActivityDay: Identifiable {
    let id: String
    let label: String
    let focusMinutes: Int
    let isToday: Bool

    var isActive: Bool {
        focusMinutes > 0
    }
}

struct WeeklyActivityEntry: TimelineEntry {
    let date: Date
    let currentStreak: Int
    let totalFocusMinutes: Int
    let days: [WeeklyActivityDay]
}

struct WeeklyActivityProvider: TimelineProvider {
    private let sampleEntry = WeeklyActivityEntry(
        date: .now,
        currentStreak: 4,
        totalFocusMinutes: 135,
        days: [
            WeeklyActivityDay(
                id: "monday",
                label: "M",
                focusMinutes: 25,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "tuesday",
                label: "T",
                focusMinutes: 50,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "wednesday",
                label: "W",
                focusMinutes: 0,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "thursday",
                label: "T",
                focusMinutes: 35,
                isToday: true
            ),
            WeeklyActivityDay(
                id: "friday",
                label: "F",
                focusMinutes: 25,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "saturday",
                label: "S",
                focusMinutes: 0,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "sunday",
                label: "S",
                focusMinutes: 0,
                isToday: false
            )
        ]
    )

    func placeholder(
        in context: Context
    ) -> WeeklyActivityEntry {
        sampleEntry
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (WeeklyActivityEntry) -> Void
    ) {
        completion(sampleEntry)
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (
            Timeline<WeeklyActivityEntry>
        ) -> Void
    ) {
        let nextUpdate =
            Calendar.current.date(
                byAdding: .hour,
                value: 1,
                to: .now
            ) ?? .now.addingTimeInterval(3600)

        completion(
            Timeline(
                entries: [sampleEntry],
                policy: .after(nextUpdate)
            )
        )
    }
}

struct WeeklyActivityView: View {
    let entry: WeeklyActivityEntry

    private let accentColor = Color(
        red: 0.45,
        green: 0.95,
        blue: 0.64
    )

    private var activeDays: Int {
        entry.days.filter(\.isActive).count
    }

    private var formattedFocusTime: String {
        let hours = entry.totalFocusMinutes / 60
        let minutes = entry.totalFocusMinutes % 60

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
                            Color.white.opacity(0.35)
                        )

                    Text("\(activeDays) active days")
                        .font(
                            .system(
                                size: 17,
                                weight: .semibold,
                                design: .rounded
                            )
                        )
                        .foregroundStyle(.white)
                }

                Spacer()

                HStack(spacing: 5) {
                    Image(systemName: "flame.fill")

                    Text("\(entry.currentStreak)")
                }
                .font(
                    .system(
                        size: 13,
                        weight: .bold,
                        design: .rounded
                    )
                )
                .foregroundStyle(accentColor)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(
                    accentColor.opacity(0.1),
                    in: Capsule()
                )
            }

            Spacer(minLength: 12)

            HStack(spacing: 0) {
                ForEach(entry.days) { day in
                    VStack(spacing: 7) {
                        Text(day.label)
                            .font(
                                .system(
                                    size: 10,
                                    weight: .semibold,
                                    design: .rounded
                                )
                            )
                            .foregroundStyle(
                                day.isToday
                                    ? .white
                                    : Color.white.opacity(0.35)
                            )

                        ZStack {
                            Circle()
                                .fill(
                                    day.isActive
                                        ? accentColor.opacity(0.16)
                                        : Color.white.opacity(0.045)
                                )

                            Circle()
                                .stroke(
                                    day.isToday
                                        ? accentColor
                                        : Color.white.opacity(0.08),
                                    lineWidth: day.isToday ? 2 : 1
                                )

                            if day.isActive {
                                Circle()
                                    .fill(accentColor)
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
                                ? Color.white.opacity(0.55)
                                : Color.white.opacity(0.18)
                        )
                    }
                    .frame(maxWidth: .infinity)
                }
            }

            Spacer(minLength: 12)

            HStack {
                Text(formattedFocusTime)
                    .font(
                        .system(
                            size: 13,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(.white)

                Text("focused this week")
                    .font(
                        .system(
                            size: 11,
                            weight: .medium
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(0.35)
                    )

                Spacer()

                Image(systemName: "chart.bar.fill")
                    .font(.system(size: 11))
                    .foregroundStyle(
                        accentColor.opacity(0.75)
                    )
            }
        }
        .padding(16)
    }
}

struct WeeklyActivityWidget: Widget {
    let kind = "WeeklyActivityWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: WeeklyActivityProvider()
        ) { entry in
            WeeklyActivityView(entry: entry)
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
    WeeklyActivityEntry(
        date: .now,
        currentStreak: 4,
        totalFocusMinutes: 135,
        days: [
            WeeklyActivityDay(
                id: "monday",
                label: "M",
                focusMinutes: 25,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "tuesday",
                label: "T",
                focusMinutes: 50,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "wednesday",
                label: "W",
                focusMinutes: 0,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "thursday",
                label: "T",
                focusMinutes: 35,
                isToday: true
            ),
            WeeklyActivityDay(
                id: "friday",
                label: "F",
                focusMinutes: 25,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "saturday",
                label: "S",
                focusMinutes: 0,
                isToday: false
            ),
            WeeklyActivityDay(
                id: "sunday",
                label: "S",
                focusMinutes: 0,
                isToday: false
            )
        ]
    )
}
