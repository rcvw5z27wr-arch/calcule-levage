// Variables globales
let donnees = []; // Stocke toutes les lignes de charge/portée

// Éléments du DOM
const tableauEntree = document.getElementById('tableauEntree');
const ajouterLigneBtn = document.getElementById('ajouterLigneBtn');
const calculerToutBtn = document.getElementById('calculerToutBtn');
const reinitialiserBtn = document.getElementById('reinitialiserBtn');
const resultatsDiv = document.getElementById('resultatsDiv');
const tableauResultats = document.getElementById('tableauResultats');
const historiqueDiv = document.getElementById('historiqueDiv');
const exporterBtn = document.getElementById('exporterBtn');
const copierBtn = document.getElementById('copierBtn');

// Événements
ajouterLigneBtn.addEventListener('click', ajouterLigne);
calculerToutBtn.addEventListener('click', calculerTout);
reinitialiserBtn.addEventListener('click', reinitialiser);
exporterBtn.addEventListener('click', exporterResultats);
copierBtn.addEventListener('click', copierResultats);

// Initialisation
chargerHistorique();
ajouterLigne(); // Ajouter une première ligne

// ========== FONCTIONS PRINCIPALES ==========

function ajouterLigne() {
    const numero = donnees.length + 1;
    donnees.push({ id: numero, charge: '', portee: '' });
    afficherTableau();
}

function afficherTableau() {
    tableauEntree.innerHTML = '';
    
    donnees.forEach((ligne, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td>
                <input type="number" 
                       class="input-charge" 
                       value="${ligne.charge}" 
                       placeholder="Charge (kg)"
                       step="0.01"
                       data-index="${index}">
            </td>
            <td>
                <input type="number" 
                       class="input-portee" 
                       value="${ligne.portee}" 
                       placeholder="Portée (m)"
                       step="0.01"
                       data-index="${index}">
            </td>
            <td>
                <button class="btn-small btn-delete" onclick="supprimerLigne(${index})">🗑️</button>
            </td>
        `;
        tableauEntree.appendChild(tr);
    });
    
    // Ajouter les événements aux inputs
    document.querySelectorAll('.input-charge, .input-portee').forEach(input => {
        input.addEventListener('input', mettreAJourDonnees);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculerTout();
        });
    });
}

function mettreAJourDonnees(e) {
    const index = parseInt(e.target.dataset.index);
    if (e.target.classList.contains('input-charge')) {
        donnees[index].charge = e.target.value;
    } else {
        donnees[index].portee = e.target.value;
    }
}

function supprimerLigne(index) {
    if (donnees.length === 1) {
        alert('⚠️ Vous devez garder au moins une ligne !');
        return;
    }
    donnees.splice(index, 1);
    afficherTableau();
}

function calculerTout() {
    // Valider les données
    const valides = donnees.every(ligne => {
        const charge = parseFloat(ligne.charge);
        const portee = parseFloat(ligne.portee);
        return !isNaN(charge) && !isNaN(portee) && charge > 0 && portee > 0;
    });
    
    if (!valides) {
        alert('⚠️ Veuillez remplir tous les champs avec des valeurs positives !');
        return;
    }
    
    // Calculer les résultats
    const resultats = donnees.map(ligne => {
        const charge = parseFloat(ligne.charge);
        const portee = parseFloat(ligne.portee);
        
        const base = charge / portee;
        const coeff110 = (charge * 1.10) / portee;
        const coeff125 = (charge * 1.25) / portee;
        
        return {
            charge: charge,
            portee: portee,
            base: base.toFixed(2),
            coeff110: coeff110.toFixed(2),
            coeff125: coeff125.toFixed(2)
        };
    });
    
    // Afficher les résultats
    afficherResultats(resultats);
    
    // Sauvegarder dans l'historique
    sauvegarderHistorique(resultats);
}

function afficherResultats(resultats) {
    tableauResultats.innerHTML = '';
    
    resultats.forEach((res, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td>${res.charge}</td>
            <td>${res.portee}</td>
            <td><strong>${res.base}</strong></td>
            <td><strong>${res.coeff110}</strong></td>
            <td><strong>${res.coeff125}</strong></td>
        `;
        tableauResultats.appendChild(tr);
    });
    
    resultatsDiv.style.display = 'block';
    resultatsDiv.scrollIntoView({ behavior: 'smooth' });
}

function reinitialiser() {
    donnees = [];
    ajouterLigne();
    resultatsDiv.style.display = 'none';
    tableauEntree.focus();
}

// ========== EXPORT ET COPIE ==========

function exporterResultats() {
    if (tableauResultats.children.length === 0) {
        alert('⚠️ Aucun résultat à exporter !');
        return;
    }
    
    // Créer le contenu CSV
    let csv = 'N°,Charge (kg),Portée (m),100% (kg/m),110% (kg/m),125% (kg/m)\n';
    
    let index = 1;
    tableauResultats.querySelectorAll('tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        const ligne = [
            index,
            cells[1].textContent,
            cells[2].textContent,
            cells[3].textContent,
            cells[4].textContent,
            cells[5].textContent
        ].join(',');
        csv += ligne + '\n';
        index++;
    });
    
    // Télécharger le fichier
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const lien = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    lien.setAttribute('href', url);
    lien.setAttribute('download', 'calcule-levage-' + new Date().toISOString().split('T')[0] + '.csv');
    lien.style.visibility = 'hidden';
    
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    
    // Feedback visuel
    const btn = exporterBtn;
    const originalText = btn.textContent;
    btn.textContent = '✅ Exporté !';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

function copierResultats() {
    if (tableauResultats.children.length === 0) {
        alert('⚠️ Aucun résultat à copier !');
        return;
    }
    
    // Créer le texte à copier
    let texte = 'Résultats Calcule Levage\n';
    texte += '=========================\n\n';
    
    let index = 1;
    tableauResultats.querySelectorAll('tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        texte += `Ligne ${index}:\n`;
        texte += `  Charge: ${cells[1].textContent} kg\n`;
        texte += `  Portée: ${cells[2].textContent} m\n`;
        texte += `  100%: ${cells[3].textContent} kg/m\n`;
        texte += `  110%: ${cells[4].textContent} kg/m\n`;
        texte += `  125%: ${cells[5].textContent} kg/m\n\n`;
        index++;
    });
    
    navigator.clipboard.writeText(texte).then(() => {
        // Feedback visuel
        const btn = copierBtn;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copié !';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// ========== HISTORIQUE ==========

function sauvegarderHistorique(resultats) {
    let historique = JSON.parse(localStorage.getItem('calculeHistorique')) || [];
    
    const entree = {
        resultats: resultats,
        date: new Date().toLocaleString('fr-FR'),
        nombre_lignes: resultats.length
    };
    
    historique.unshift(entree);
    
    // Garder seulement les 10 derniers
    if (historique.length > 10) {
        historique.pop();
    }
    
    localStorage.setItem('calculeHistorique', JSON.stringify(historique));
    chargerHistorique();
}

function chargerHistorique() {
    const historique = JSON.parse(localStorage.getItem('calculeHistorique')) || [];
    
    if (historique.length === 0) {
        historiqueDiv.style.display = 'none';
        return;
    }
    
    historiqueDiv.style.display = 'block';
    const listeHistorique = document.getElementById('listeHistorique');
    listeHistorique.innerHTML = '';
    
    historique.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-historique';
        
        let resumeResultats = item.resultats.map(r => 
            `${r.charge}kg/${r.portee}m`
        ).join(' | ');
        
        div.innerHTML = `
            <strong>#${index + 1}</strong> (${item.nombre_lignes} ligne(s)) | 
            ${resumeResultats}
            <br><small>${item.date}</small>
        `;
        listeHistorique.appendChild(div);
    });
}