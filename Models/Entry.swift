import Foundation

struct Entry: Identifiable, Codable {
    var id = UUID()
    var functionLevel: Int
    var feeling: Feeling
    var reason: String
    var timestamp: Date
    var customFeeling: String?
    
    enum Feeling: String, CaseIterable, Codable {
        case afraid = "Afraid"
        case sad = "Sad"
        case bland = "Bland"
        case angry = "Angry"
        case happy = "Happy"
        case other = "Other"
    }
}

class EntryStore: ObservableObject {
    @Published var entries: [Entry] = [] {
        didSet {
            saveEntries()
        }
    }
    
    init() {
        loadEntries()
    }
    
    func addEntry(_ entry: Entry) {
        entries.append(entry)
    }
    
    private func saveEntries() {
        if let encodedData = try? JSONEncoder().encode(entries) {
            UserDefaults.standard.set(encodedData, forKey: "entries")
        }
    }
    
    private func loadEntries() {
        if let data = UserDefaults.standard.data(forKey: "entries"),
           let decodedEntries = try? JSONDecoder().decode([Entry].self, from: data) {
            entries = decodedEntries
        }
    }
}
