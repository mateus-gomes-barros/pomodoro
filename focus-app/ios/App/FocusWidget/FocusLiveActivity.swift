//
//  FocusLiveActivity.swift
//  FocusWidget
//

import ActivityKit
import Foundation
import SwiftUI
import WidgetKit

private let focusAccentColor = Color(
    red: 0.45,
    green: 0.95,
    blue: 0.64
)

private extension FocusActivityAttributes.SessionType {
    var title: String {
        switch self {
        case .work:
            return "FOCUS"

        case .shortBreak:
            return "SHORT BREAK"

        case .longBreak:
            return "LONG BREAK"
        }
    }

    var compactIcon: String {
        switch self {
        case .work:
            return "timer"

        case .shortBreak:
            return "cup.and.saucer.fill"

        case .longBreak:
            return "moon.stars.fill"
        }
    }
}

private extension FocusActivityAttributes.TimerStatus {
    var title: String {
        switch self {
        case .running:
            return "Running"

        case .paused:
            return "Paused"
        }
    }
}

private struct FocusActivityTimerText: View {
    let state: FocusActivityAttributes.ContentState
    let fontSize: CGFloat

    private var formattedRemainingTime: String {
        let safeSeconds = max(
            0,
            state.remainingSeconds
        )

        let hours = safeSeconds / 3600
        let minutes =
            (safeSeconds % 3600) / 60
        let seconds = safeSeconds % 60

        if hours > 0 {
            return String(
                format: "%d:%02d:%02d",
                hours,
                minutes,
                seconds
            )
        }

        return String(
            format: "%02d:%02d",
            minutes,
            seconds
        )
    }

    var body: some View {
        Group {
            if
                state.status == .running,
                let endDate = state.endDate
            {
                Text(
                    timerInterval:
                        Date()...max(
                            endDate,
                            Date().addingTimeInterval(1)
                        ),
                    countsDown: true
                )
            } else {
                Text(formattedRemainingTime)
            }
        }
        .font(
            .system(
                size: fontSize,
                weight: .bold,
                design: .rounded
            )
        )
        .monospacedDigit()
        .lineLimit(1)
        .minimumScaleFactor(0.65)
    }
}

private struct FocusActivityDetailsText: View {
    let state: FocusActivityAttributes.ContentState

    private var details: String {
        var values: [String] = []

        if let projectName = state.projectName,
           !projectName.isEmpty {
            values.append(projectName)
        }

        if let taskName = state.taskName,
           !taskName.isEmpty {
            values.append(taskName)
        }

        return values.joined(
            separator: "  •  "
        )
    }

    var body: some View {
        if !details.isEmpty {
            Text(details)
                .font(
                    .system(
                        size: 12,
                        weight: .semibold,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(0.8)
                )
                .lineLimit(1)
                .minimumScaleFactor(0.65)
                .truncationMode(.tail)
        }
    }
}

private struct FocusLockScreenActivityView: View {
    let context:
        ActivityViewContext<FocusActivityAttributes>

    private var state:
        FocusActivityAttributes.ContentState
    {
        context.state
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 12
        ) {
            HStack {
                HStack(spacing: 9) {
                    ZStack {
                        Circle()
                            .fill(
                                focusAccentColor.opacity(
                                    0.14
                                )
                            )

                        Image(
                            systemName:
                                state.sessionType
                                    .compactIcon
                        )
                        .font(
                            .system(
                                size: 14,
                                weight: .semibold
                            )
                        )
                        .foregroundStyle(
                            focusAccentColor
                        )
                    }
                    .frame(
                        width: 34,
                        height: 34
                    )

                    VStack(
                        alignment: .leading,
                        spacing: 2
                    ) {
                        Text(
                            state.sessionType.title
                        )
                        .font(
                            .system(
                                size: 11,
                                weight: .bold,
                                design: .rounded
                            )
                        )
                        .tracking(1)
                        .foregroundStyle(
                            focusAccentColor
                        )

                        Text(state.status.title)
                            .font(
                                .system(
                                    size: 11,
                                    weight: .medium
                                )
                            )
                            .foregroundStyle(
                                Color.white.opacity(
                                    0.45
                                )
                            )
                    }
                }

                Spacer()

                FocusActivityTimerText(
                    state: state,
                    fontSize: 28
                )
                .foregroundStyle(.white)
            }

            FocusActivityDetailsText(
                state: state
            )
        }
        .padding(16)
        .activityBackgroundTint(
            Color(
                red: 0.035,
                green: 0.035,
                blue: 0.04
            )
        )
        .activitySystemActionForegroundColor(
            .white
        )
    }
}

struct FocusLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(
            for: FocusActivityAttributes.self
        ) { context in
            FocusLockScreenActivityView(
                context: context
            )
            .widgetURL(
                URL(
                    string:
                        "com.mateusgomes.focusapp://timer"
                )
            )
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(
                    .leading
                ) {
                    ZStack {
                        Circle()
                            .fill(
                                focusAccentColor.opacity(
                                    0.14
                                )
                            )

                        Image(
                            systemName:
                                context.state
                                    .sessionType
                                    .compactIcon
                        )
                        .font(
                            .system(
                                size: 14,
                                weight: .semibold
                            )
                        )
                        .foregroundStyle(
                            focusAccentColor
                        )
                    }
                    .frame(
                        width: 34,
                        height: 34
                    )
                }

                DynamicIslandExpandedRegion(
                    .trailing
                ) {
                    FocusActivityTimerText(
                        state: context.state,
                        fontSize: 18
                    )
                    .foregroundStyle(.white)
                    .frame(
                        maxWidth: 76,
                        alignment: .trailing
                    )
                }

                DynamicIslandExpandedRegion(
                    .center
                ) {
                    Text(
                        context.state
                            .sessionType
                            .title
                    )
                    .font(
                        .system(
                            size: 10,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .tracking(1.2)
                    .foregroundStyle(
                        focusAccentColor
                    )
                    .lineLimit(1)
                }

                DynamicIslandExpandedRegion(
                    .bottom
                ) {
                    HStack(spacing: 8) {
                        FocusActivityDetailsText(
                            state: context.state
                        )

                        Spacer(minLength: 4)

                        if
                            context.state.status ==
                                .paused
                        {
                            HStack(spacing: 4) {
                                Image(
                                    systemName:
                                        "pause.fill"
                                )

                                Text("Paused")
                            }
                            .font(
                                .system(
                                    size: 10,
                                    weight: .semibold,
                                    design: .rounded
                                )
                            )
                            .foregroundStyle(
                                focusAccentColor
                            )
                        }
                    }
                    .frame(
                        maxWidth: .infinity,
                        alignment: .leading
                    )
                    .padding(.top, 2)
                    .padding(.bottom, 2)
                }
            } compactLeading: {
                Image(
                    systemName:
                        context.state
                            .sessionType
                            .compactIcon
                )
                .font(
                    .system(
                        size: 13,
                        weight: .semibold
                    )
                )
                .foregroundStyle(
                    focusAccentColor
                )
            } compactTrailing: {
                FocusActivityTimerText(
                    state: context.state,
                    fontSize: 13
                )
                .foregroundStyle(
                    focusAccentColor
                )
                .frame(maxWidth: 54)
            } minimal: {
                Image(
                    systemName:
                        context.state
                            .sessionType
                            .compactIcon
                )
                .font(
                    .system(
                        size: 12,
                        weight: .bold
                    )
                )
                .foregroundStyle(
                    focusAccentColor
                )
            }
            .widgetURL(
                URL(
                    string:
                        "com.mateusgomes.focusapp://timer"
                )
            )
            .keylineTint(focusAccentColor)
        }
    }
}
