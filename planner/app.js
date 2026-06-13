import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 1. Jouw Firebase configuratie (Kopieer exact dezelfde als in de tablet app.js)
const firebaseConfig = {
    apiKey: "JOUW_API_KEY",
    authDomain: "JOUW_PROJECT.firebaseapp.com",
    projectId: "JOUW_PROJECT_ID",
    storageBucket: "JOUW_PROJECT.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Datum bepalen voor de database-sleutel (YYYY-MM-DD)
const vandaag = new Date();
const datumSleutel = `${vandaag.getFullYear()}-${String(vandaag.getMonth() + 1).padStart(2, '0')}-${String(vandaag.getDate()).padStart(2, '0')}`;

const planningRef = doc(db, "planningen", datumSleutel);

// 3. DOM Elementen ophalen
const addChildForm = document.getElementById('add-child-form');
const editorGrid = document.getElementById('editor-grid');

// 4. Live de huidige verdeling inladen in de editor
onSnapshot(planningRef, (snapshot) => {
    editorGrid.innerHTML = "";

    if (snapshot.exists()) {
        const data = snapshot.data().begeleiders;

        for (const [begeleider, kinderen] of Object.entries(data)) {
            const card = document.createElement('div');
            card.className = 'begeleider-card';
            
            let kinderenHtml = '';
            
            if (kinderen.length === 0) {
                kinderenHtml = '<p style="color: #95a5a6; font-style: italic; margin: 0;">Geen kinderen</p>';
            } else {
                kinderen.forEach(kind => {
                    kinderenHtml += `
                        <div class="kind-row">
                            <span class="kind-name">👶 ${kind}</span>
                            <button class="btn-delete" data-begeleider="${begeleider}" data-kind="${kind}">🗑️</button>
                        </div>
                    `;
                });
            }

            card.innerHTML = `
                <h3>👤 ${begeleider}</h3>
                <div class="kinderen-list">${kinderenHtml}</div>
            `;
            editorGrid.appendChild(card);
        }

        // Knoppen voor verwijderen activeren
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const begeleider = e.target.getAttribute('data-begeleider');
                const kind = e.target.getAttribute('data-kind');
                verwijderKind(begeleider, kind);
            });
        });

    } else {
        // Als er nog helemaal geen planning is voor vandaag, maken we een lege basishandeling aan
        editorGrid.innerHTML = "<p>Nog geen planning voor vandaag. Voeg een kind toe om te beginnen!</p>";
    }
});

// 5. Kind Toevoegen aan Firebase
addChildForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const kindNaam = document.getElementById('child-name').value.trim();
    const geselecteerdeBegeleider = document.getElementById('select-begeleider').value;

    if (!kindNaam || !geselecteerdeBegeleider) return;

    try {
        // We gebruiken setDoc met { merge: true }. Als het document nog niet bestaat maakt hij het aan, 
        // anders voegt hij het kind toe aan de array van de gekozen begeleider.
        await setDoc(planningRef, {
            begeleiders: {
                [geselecteerdeBegeleider]: arrayUnion(kindNaam)
            }
        }, { merge: true });

        // Formulier resetten
        document.getElementById('child-name').value = "";
        document.getElementById('select-begeleider').selectedIndex = 0;
    } catch (error) {
        console.error("Fout bij toevoegen:", error);
        alert("Er ging iets mis bij het opslaan.");
    }
});

// 6. Kind Verwijderen uit Firebase
async function verwijderKind(begeleider, kindNaam) {
    try {
        await updateDoc(planningRef, {
            [`begeleiders.${begeleider}`]: arrayRemove(kindNaam)
        });
    } catch (error) {
        console.error("Fout bij verwijderen:", error);
    }
}
