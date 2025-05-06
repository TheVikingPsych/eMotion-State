import SwiftUI
import Charts

struct ChartView: View {
    @EnvironmentObject var entryStore: EntryStore
    @State private var timeRange: TimeRange = .week
    
    enum TimeRange: String, CaseIterable {
        case day = "Day"
        case week = "Week"
        case month = "Month"
        case all = "All"
    }
    
    var filteredEntries: [Entry] {
        let calendar = Calendar.current
        let now = Date()
        
        return entryStore.entries.filter { entry in
            switch timeRange {
            case .day:
                return calendar.isDateInToday(entry.timestamp)
            case .week:
                let weekAgo = calendar.date(byAdding: .day, value: -7, to: now)!
                return entry.timestamp >= weekAgo
            case .month:
                let monthAgo = calendar.date(byAdding: .month, value: -1, to: now)!
                return entry.timestamp >= monthAgo
            case .all:
                return true
            }
        }.sorted(by: { $0.timestamp < $1.timestamp })
    }
    
    var body: some View {
        VStack {
            Picker("Time Range", selection: $timeRange) {
                ForEach(TimeRange.allCases, id: \.self) { range in
                    Text(range.rawValue)
                }
            }
            .pickerStyle(SegmentedPickerStyle())
            .padding()
            
            if #available(macOS 13.0, *) {
                Chart {
                    ForEach(filteredEntries) { entry in
                        LineMark(
                            x: .value("Date", entry.timestamp),
                            y: .value("Function Level", entry.functionLevel)
                        )
                        .foregroundStyle(Color.blue)
                        
                        PointMark(
                            x: .value("Date", entry.timestamp),
                            y: .value("Function Level", entry.functionLevel)
                        )
                        .foregroundStyle(getFeelingColor(entry.feeling))
                    }
                }
                .chartYScale(domain: -10...10)
                .chartXAxis {
                    AxisMarks(values: .automatic) { _ in
                        AxisGridLine()
                        AxisTick()
                        AxisValueLabel(format: .dateTime.month().day())
                    }
                }
                .frame(height: 300)
                .padding()
            } else {
                // Fallback for older macOS versions
                LegacyChartView(entries: filteredEntries)
            }
            
            VStack(alignment: .leading) {
                Text("Legend:")
                    .font(.headline)
                    .padding(.bottom, 4)
                
                ForEach(Entry.Feeling.allCases, id: \.self) { feeling in
                    HStack {
                        Circle()
                            .fill(getFeelingColor(feeling))
                            .frame(width: 12, height: 12)
                        Text(feeling.rawValue)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            
            Spacer()
        }
        .navigationTitle("Mood Chart")
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

struct LegacyChartView: View {
    let entries: [Entry]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Y-axis grid lines
                VStack(spacing: 0) {
                    ForEach(0..<21) { i in
                        Divider()
                        if i < 20 {
                            Spacer()
                        }
                    }
                }
                
                // Y-axis labels
                HStack {
                    VStack(spacing: 0) {
                        ForEach((-10...10).reversed(), id: \.self) { value in
                            Text("\(value)")
                                .font(.caption)
                                .frame(width: 30, height: geometry.size.height / 21)
                        }
                    }
                    Spacer()
                }
                
                // Plot points and lines
                if !entries.isEmpty {
                    Path { path in
                        let width = geometry.size.width - 40
                        let height = geometry.size.height
                        let stepX = width / CGFloat(max(1, entries.count - 1))
                        let stepY = height / 20
                        
                        let points = entries.enumerated().map { index, entry in
                            CGPoint(
                                x: 40 + CGFloat(index) * stepX,
                                y: height / 2 - CGFloat(entry.functionLevel) * stepY
                            )
                        }
                        
                        if let firstPoint = points.first {
                            path.move(to: firstPoint)
                            for point in points.dropFirst() {
                                path.addLine(to: point)
                            }
                        }
                    }
                    .stroke(Color.blue, lineWidth: 2)
                    
                    // Points
                    ForEach(entries.indices, id: \.self) { index in
                        let entry = entries[index]
                        let width = geometry.size.width - 40
                        let height = geometry.size.height
                        let stepX = width / CGFloat(max(1, entries.count - 1))
                        let stepY = height / 20
                        
                        Circle()
                            .fill(getFeelingColor(entry.feeling))
                            .frame(width: 8, height: 8)
                            .position(
                                x: 40 + CGFloat(index) * stepX,
                                y: height / 2 - CGFloat(entry.functionLevel) * stepY
                            )
                    }
                }
            }
        }
        .padding()
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
