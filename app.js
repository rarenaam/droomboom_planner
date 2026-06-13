// app.js - Logica voor de startpagina
console.log("Droomboom Planner startpagina succesvol geladen!");

const themeButton = document.getElementById('theme-button');

// Check bij het laden of de gebruiker al eerder donkere modus heeft gekozen
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeButton.innerText = "☀️ Licht";
}

// Luister naar klikken op de knop
themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        themeButton.innerText = "☀️ Licht";
        localStorage.setItem('theme', 'dark'); // Opslaan in de browser
    } else {
        themeButton.innerText = "🌙 Donker";
        localStorage.setItem('theme', 'light'); // Opslaan in de browser
    }
});
