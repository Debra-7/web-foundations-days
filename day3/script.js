let notes = [
    {id: 1, text: "Buy milk and bread", category: "personal"},
    {id: 2, text: "Finish the Day 3 assignment", category: "study"},
    {id: 3, text: "Email the project report to Grace", category: "work"},
    {id: 4, text: "Revise JavaScript arrays", category: "study"},
    {id: 5, text: "Call mum", category: "personal"},
];

function searchNotes(word) {
    return notes.filter(note => note.text.toLowerCase().includes(word.toLowerCase()));
}

console.log(searchNotes("milk")); // Should return the note with id 1
console.log(searchNotes("pizza")); // Expected output: [] (no notes found)

function longestNote() {
    if (notes.length === 0) {
        return null; // Return null if there are no notes
    }
    let longest = notes[0];
    for (let i = 1; i < notes.length; i++) {
        if (notes[i].text.length > longest.text.length) {
            longest = notes[i];
        }
    }
    return longest;
}

console.log(longestNote()); // Should return the note with the longest text

let savedNotesForLongest = notes;
notes = []; // Clear the original notes array
console.log(longestNote()); // Should return null since notes array is empty
notes = savedNotesForLongest;


function countByCategory() {
    let counts = {};
    for (let note of notes) {
        if (counts[note.category]) {
            counts[note.category]++;
        }
        else {
            counts[note.category] = 1;
        }
    }
    return counts;
}

console.log(countByCategory()); // Expected output: { personal: 2, study: 2, work: 1 }

let savedNotes = notes;
notes = []; // Clear the original notes array
console.log(countByCategory()); // Expected output: {}
notes = savedNotes;

function getSummary() {
    let counts = countByCategory();
    let word = notes.length === 1 ? "note" : "notes";
    return `${notes.length} ${word}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

console.log(getSummary()); // Expected output: "5 notes: 2 personal, 1 work, 2 study"

let savedNotesForSummary = notes;
notes = [notes[0]]; // Keep only the first note for testing
console.log(getSummary()); // Expected output: "1 note: 1 personal, 0 work, 0 study"
notes = savedNotesForSummary;


function isDuplicate(text) {
    return notes.some(note =>
        note.text.trim().toLowerCase() === text.trim().toLowerCase()
    );
}

console.log(isDuplicate("buy milk and bread")); // Expected output: true
console.log(isDuplicate("Buy eggs")); // Expected output: false
console.log(isDuplicate(" BUY MILK AND BREAD ")); // Expected output: true (case and whitespace insensitive)

function addNote(text, category) {
    if (text.length < 1 || text.length > 200) {
        console.log("Invalid note length.");
        return false;
}
if (isDuplicate(text)) {
    console.log("Note already exists.");
    return false;
}

if (category !== "personal" && category !== "work" && category !== "study") {
    console.log("Invalid category");
    return false;
}

let newNote = {
    id: notes.length + 1,
    text: text,
    category: category
};

notes.push(newNote);
return true;
}

console.log(addNote("Read about JavaScript functions", "study")); // Expected output: true
console.log(addNote("Buy milk and bread", "personal")); // Expected output: false (duplicate)