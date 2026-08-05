//
//  FocusActivityAttributes.swift
//  Focus
//

import ActivityKit
import Foundation

@available(iOS 16.1, *)
struct FocusActivityAttributes: ActivityAttributes {
    enum SessionType: String, Codable, Hashable {
        case work
        case shortBreak
        case longBreak
    }

    enum TimerStatus: String, Codable, Hashable {
        case running
        case paused
    }

    struct ContentState: Codable, Hashable {
        let sessionType: SessionType
        let status: TimerStatus
        let endDate: Date?
        let remainingSeconds: Int
        let projectName: String?
        let taskName: String?
    }

    let sessionId: String
}
