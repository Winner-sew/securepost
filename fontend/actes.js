/* ============================================
   SECUREPOST - Script Registre des Actes
   Auteur : Erwin Christopher Siassia
   Date : Juin 2026
   ============================================ */

var token = localStorage.getItem('token');
var user = {};
try { user = JSON.parse(localStorage.getItem('user')) || {}; } catch(e) {}

if (!token) { window.location.href = 'index.html'; }

if (user.prenom && user.nom) {
    document.getElementById('userInitiales').textContent = user.prenom[0] + user.nom[0];
    document.getElementById('userName').textContent = user.prenom + ' ' + user.nom;
    document.getElementById('userRole').textContent = user.role;
}

var tousLesActes = [];

var badgesStatut = {
    'en_cours': '<span class="badge badge-bleu">En cours</span>',
    'transmis_procureur': '<span class="badge badge-orange">Transmis</span>',
    'classe_sans_suite': '<span class="badge badge-gris">Classe</span>'
};

var badgesGravite = {
    'faible': '<span class="badge badge-gris">Faible</span>',
    'moyen': '<span class="badge badge-orange">Moyen</span>',
    'critique': '<span class="badge badge-rouge">Critique</span>'
};

var labelsType = {
    'main_courante': 'Main Courante',
    'plainte': 'Plainte',
    'pv_audition': 'PV Audition'
};

/* chargement des actes depuis l'API */
async function chargerActes() {
    try {
        var reponse = await fetch('http://localhost:3000/api/acts', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();
        tousLesActes = data.actes;
        afficherActes(tousLesActes);
    } catch(e) {
        document.getElementById('tableauActes').innerHTML = '<tr><td colspan="8">Erreur de chargement</td></tr>';
    }
}

/* affichage des actes dans le tableau */
function afficherActes(actes) {
    if (actes.length === 0) {
        document.getElementById('tableauActes').innerHTML = '<tr><td colspan="8">Aucun acte trouve</td></tr>';
        return;
    }

    var html = '';
    actes.forEach(function(a) {
        var date = new Date(a.date_creation).toLocaleDateString('fr-FR');
        var declarant = a.declarant_prenom ? a.declarant_prenom + ' ' + a.declarant_nom : '-';
        html += '<tr>';
        html += '<td><strong>' + a.numero_acte + '</strong></td>';
        html += '<td>' + (labelsType[a.type_acte] || a.type_acte) + '</td>';
        html += '<td>' + a.quartier + '</td>';
        html += '<td>' + declarant + '</td>';
        html += '<td>' + (badgesGravite[a.gravite] || a.gravite) + '</td>';
        html += '<td>' + (badgesStatut[a.statut] || a.statut) + '</td>';
        html += '<td>' + date + '</td>';
        html += '<td class="actions-cell">';
        html += '<button class="btn-voir" onclick="voirDetail(' + a.id + ')">Voir</button>';
        html += '<button class="btn-epingler" onclick="epingler(' + a.id + ')">Epingler</button>';
        html += '</td>';
        html += '</tr>';
    });
    document.getElementById('tableauActes').innerHTML = html;
}

/* filtrage des actes */
function filtrer() {
    var recherche = document.getElementById('recherche').value.toLowerCase();
    var type = document.getElementById('filtreType').value;
    var statut = document.getElementById('filtreStatut').value;
    var gravite = document.getElementById('filtreGravite').value;

    var resultats = tousLesActes.filter(function(a) {
        var matchRecherche = !recherche ||
            a.numero_acte.toLowerCase().includes(recherche) ||
            (a.declarant_nom && a.declarant_nom.toLowerCase().includes(recherche)) ||
            (a.victime_nom && a.victime_nom.toLowerCase().includes(recherche)) ||
            (a.suspect_nom && a.suspect_nom.toLowerCase().includes(recherche)) ||
            a.quartier.toLowerCase().includes(recherche);
        var matchType = !type || a.type_acte === type;
        var matchStatut = !statut || a.statut === statut;
        var matchGravite = !gravite || a.gravite === gravite;
        return matchRecherche && matchType && matchStatut && matchGravite;
    });

    afficherActes(resultats);
}

/* reinitialisation des filtres */
function reinitialiser() {
    document.getElementById('recherche').value = '';
    document.getElementById('filtreType').value = '';
    document.getElementById('filtreStatut').value = '';
    document.getElementById('filtreGravite').value = '';
    afficherActes(tousLesActes);
}

/* affichage du detail d'un acte dans le modal */
function voirDetail(id) {
    var acte = tousLesActes.find(function(a) { return a.id === id; });
    if (!acte) return;

    document.getElementById('modalTitre').textContent = acte.numero_acte;
    document.getElementById('modalContenu').innerHTML =
        '<div class="modal-grille">' +
            '<div class="modal-champ"><strong>Type :</strong> ' + (labelsType[acte.type_acte] || acte.type_acte) + '</div>' +
            '<div class="modal-champ"><strong>Quartier :</strong> ' + acte.quartier + '</div>' +
            '<div class="modal-champ"><strong>Gravite :</strong> ' + (badgesGravite[acte.gravite] || acte.gravite) + '</div>' +
            '<div class="modal-champ"><strong>Statut :</strong> ' + (badgesStatut[acte.statut] || acte.statut) + '</div>' +
            '<div class="modal-champ"><strong>Date des faits :</strong> ' + new Date(acte.date_faits).toLocaleDateString('fr-FR') + '</div>' +
            '<div class="modal-champ"><strong>Brigade :</strong> ' + (acte.brigade_nom || '-') + '</div>' +
        '</div>' +
        '<hr class="modal-separateur">' +
        '<div class="modal-champ"><strong>Declarant :</strong> ' + (acte.declarant_prenom || '') + ' ' + (acte.declarant_nom || '-') + '</div>' +
        (acte.victime_nom ? '<div class="modal-champ"><strong>Victime :</strong> ' + acte.victime_prenom + ' ' + acte.victime_nom + '</div>' : '') +
        (acte.suspect_nom ? '<div class="modal-champ"><strong>Suspect :</strong> ' + acte.suspect_prenom + ' ' + acte.suspect_nom + '</div>' : '') +
        '<hr class="modal-separateur">' +
        '<div class="modal-champ"><strong>Contenu :</strong><p class="modal-contenu">' + acte.contenu + '</p></div>';

    document.getElementById('modal').classList.add('actif');
}

/* fermeture du modal */
function fermerModal() {
    document.getElementById('modal').classList.remove('actif');
}

/* epingler un acte dans les prioritaires */
function epingler(id) {
    var prioritaires = JSON.parse(localStorage.getItem('prioritaires') || '[]');
    var acte = tousLesActes.find(function(a) { return a.id === id; });
    var dejaPinned = prioritaires.find(function(p) { return p.id === id; });

    if (dejaPinned) {
        alert('Cet acte est deja dans vos affaires prioritaires !');
        return;
    }

    prioritaires.push(acte);
    localStorage.setItem('prioritaires', JSON.stringify(prioritaires));
    alert('Acte ' + acte.numero_acte + ' epingle !');
}

/* deconnexion */
function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

chargerActes();