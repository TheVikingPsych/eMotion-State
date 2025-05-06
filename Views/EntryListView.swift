import SwiftUI

struct EntryListView: View {
    @EnvironmentObject var entryStore: EntryStore
    
    var body: some View {
        List {
            ForEach(entryStore.entries.sorted(by: { $0.timestamp > $1.timestamp })) { entry in
                EntryRow(entry: entry)
            }
        }
        .listStyle(InsetListStyle())
        .navigationTitle("Mood Entries")
    }
}

struct EntryRow: View {
    let entry: Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Level: \(entry.functionLevel)")
                    .font(.headline)
                
                Spacer()
                
                Text(entry.timestamp, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            HStack {
                Text("Feeling:")
                    .fontWeight(.medium)
                
                if entry.feeling == .other, let custom = entry.customFeeling {
                    Text(custom)
                        .foregroundColor(getFeelingColor(entry.feeling))
                } else {
                    Text(entry.feeling.rawValue)
                        .foregroundColor(getFeelingColor(entry.feeling))
                }
                
                Spacer()
                
                Text(entry.timestamp, style: .time)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(entry.reason)
                .font(.body)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
    
    func getFeelingColor(_ feeling: Entry.Feeling) -> Color {
        switch feeling {
        case .afraid: return .purple
        case .sad: return .blue
        case .bland: return .gray
        case .angry: return .red
        case .happy: return .green
        case .other: return .orange
        }
    }
}
