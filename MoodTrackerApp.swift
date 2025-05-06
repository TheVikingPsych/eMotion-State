import SwiftUI

@main
struct MoodTrackerApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(EntryStore())
                .frame(minWidth: 800, minHeight: 600)
        }
    }
}
