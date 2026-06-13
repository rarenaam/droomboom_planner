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

// Sidebar logica openen en sluiten
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');

// Open menu bij klik op hamburger
menuToggle.addEventListener('click', () => {
    sidebar.classList.add('open');
});

// Sluit menu bij klik op kruisje
menuClose.addEventListener('click', () => {
    sidebar.classList.remove('open');
});

// Sluit menu automatisch als je ergens buiten de sidebar klikt
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== menuToggle) {
        sidebar.classList.remove('open');
    }
});
