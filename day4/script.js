const note = document.getElementById("note-text");
const character = document.getElementById("char-count");
const word = document.getElementById("word-count");
const button = document.getElementById("clear-btn");
const theme = document.getElementById("theme-toggle");

function updateCounts() {
    const text = note.value;
    const characterCount = text.length;
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    character.textContent = `${characterCount} / 200 characters`;
    word.textContent = `${wordCount} words`;

    character.classList.remove("warning", "over");

    if (characterCount > 200) {
        character.classList.add("over");
    } else if (characterCount > 180) {
        character.classList.add("warning");
    }
}

note.addEventListener("input", () => {
    updateCounts();
    localStorage.setItem("noteDraft", note.value);
});

const savedDraft = localStorage.getItem("noteDraft");

if (savedDraft !== null) {
    note.value = savedDraft;
};

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    theme.textContent = "Light mode";
} else {
    theme.textContent = "Dark mode";
}

updateCounts();

function clearNote() {
    note.value = "";
    updateCounts();
    localStorage.removeItem("noteDraft");
};

button.addEventListener("click", () => {
    clearNote();
});

note.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearNote();
    }
});

theme.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    theme.textContent = isDark ? "Light mode" : "Dark mode";

    localStorage.setItem("theme", isDark ? "dark" : "light");
});


