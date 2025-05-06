import SwiftUI

struct ContentView: View {
    @EnvironmentObject var entryStore: EntryStore
    @State private var showingAddEntry = false
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            List {
                NavigationLink(destination: EntryListView(), tag: 0, selection: $selectedTab) {
                    Label("Entries", systemImage: "list.bullet")
                }
                
                NavigationLink(destination: ChartView(), tag: 1, selection: $selectedTab) {
                    Label("Chart", systemImage: "chart.line.uptrend.xyaxis")
                }
            }
            .listStyle(SidebarListStyle())
            .frame(minWidth: 200)
            
            EntryListView()
        }
        .toolbar {
            ToolbarItem {
                Button(action: {
                    showingAddEntry = true
                }) {
                    Label("Add Entry", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showingAddEntry) {
            AddEntryView()
        }
    }
}
