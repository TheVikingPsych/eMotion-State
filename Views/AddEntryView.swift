import SwiftUI

struct AddEntryView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var entryStore: EntryStore
    
    @State private var functionLevel = 0
    @State private var selectedFeeling = Entry.Feeling.bland
    @State private var customFeeling = ""
    @State private var reason = ""
    @State private var date = Date()
    
    var body: some View {
        VStack {
            Form {
                Section(header: Text("Function Level")) {
                    VStack {
                        Text("\(functionLevel)")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity, alignment: .center)
                        
                        Slider(value: Binding(
                            get: { Double(functionLevel) },
                            set: { functionLevel = Int($0) }
                        ), in: -10...10, step: 1)
                        
                        HStack {
                            Text("-10")
                            Spacer()
                            Text("0")
                            Spacer()
                            Text("10")
                        }
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
                
                Section(header: Text("I Feel")) {
                    Picker("Feeling", selection: $selectedFeeling) {
                        ForEach(Entry.Feeling.allCases, id: \.self) { feeling in
                            Text(feeling.rawValue)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    if selectedFeeling == .other {
                        TextField("Specify feeling", text: $customFeeling)
                    }
                }
                
                Section(header: Text("Because")) {
                    TextEditor(text: $reason)
                        .frame(height: 100)
                }
                
                Section(header: Text("Date and Time")) {
                    DatePicker("", selection: $date)
                        .datePickerStyle(GraphicalDatePickerStyle())
                }
            }
            .padding()
            
            HStack {
                Button("Cancel") {
                    dismiss()
                }
                .keyboardShortcut(.escape)
                
                Spacer()
                
                Button("Save") {
                    let newEntry = Entry(
                        functionLevel: functionLevel,
                        feeling: selectedFeeling,
                        reason: reason,
                        timestamp: date,
                        customFeeling: selectedFeeling == .other ? customFeeling : nil
                    )
                    entryStore.addEntry(newEntry)
                    dismiss()
                }
                .keyboardShortcut(.return)
                .disabled(selectedFeeling == .other && customFeeling.isEmpty || reason.isEmpty)
            }
            .padding()
        }
        .frame(width: 500, height: 600)
    }
}
