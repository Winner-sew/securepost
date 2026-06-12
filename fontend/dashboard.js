var token = localStorage.getItem('token');
var user = {};
try { user = JSON.parse(localStorage.getItem('user')) || {}; } catch(e) {}

/* si pas connecte on redirige vers la connexion */
if (!token) { window.location.href = 'index.html'; }

/* affichage des infos de l'agent connecte */
if (user.prenom && user.nom) {
    document.getElementById('userInitiales').textContent = user.prenom[0] + user.nom[0];
    document.getElementById('userName').textContent = user.prenom + ' ' + user.nom;
    document.getElementById('userRole').textContent = user.role;
}

/* affichage menu commissaire seulement */
if (user.role === 'commissaire') {
    document.getElementById('menuCommissaire').style.display = 'block';
}

/* chargement des statistiques depuis l'API */
async function chargerStats() {
    try {
        var reponse = await fetch('http://localhost:3000/api/stats/criminality', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();

        document.getElementById('statMois').textContent = data.ce_mois;
        document.getElementById('statCritiques').textContent = data.critiques_en_cours;

        var enCours = data.par_statut.find(function(s) { return s.statut === 'en_cours'; });
        var transmis = data.par_statut.find(function(s) { return s.statut === 'transmis_procureur'; });
        document.getElementById('statEnCours').textContent = enCours ? enCours.total : 0;
        document.getElementById('statTransmis').textContent = transmis ? transmis.total : 0;

        /* affichage top quartiers */
        var htmlQ = '';
        data.par_quartier.forEach(function(q) {
            htmlQ += '<tr><td>' + q.quartier + '</td><td><strong>' + q.total + '</strong></td></tr>';
        });
        document.getElementById('tableauQuartiers').innerHTML = htmlQ;

        /* affichage par type avec vraies icones */
        var labels = {
            main_courante: '<img src="./Images/main-courante.png" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"> Main Courante',
            plainte: '<img src="./Images/plainte.png" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"> Plainte',
            pv_audition: '<img src="./Images/pv.png" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"> PV Audition'
        };
        var htmlT = '';
        data.par_type.forEach(function(t) {
            htmlT += '<tr><td>' + (labels[t.type_acte] || t.type_acte) + '</td><td><strong>' + t.total + '</strong></td></tr>';
        });
        document.getElementById('tableauTypes').innerHTML = htmlT;

    } catch(e) { console.error('Erreur stats:', e); }
}

/* chargement des derniers actes */
async function chargerActes() {
    try {
        var reponse = await fetch('http://localhost:3000/api/acts', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();
        var actes = data.actes.slice(0, 8);

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

        var html = '';
        actes.forEach(function(a) {
            var date = new Date(a.date_creation).toLocaleDateString('fr-FR');
            html += '<tr>';
            html += '<td><strong>' + a.numero_acte + '</strong></td>';
            html += '<td>' + a.type_acte.replace(/_/g, ' ') + '</td>';
            html += '<td>' + a.quartier + '</td>';
            html += '<td>' + (badgesGravite[a.gravite] || a.gravite) + '</td>';
            html += '<td>' + (badgesStatut[a.statut] || a.statut) + '</td>';
            html += '<td>' + date + '</td>';
            html += '</tr>';
        });
        document.getElementById('tableauActes').innerHTML = html;

    } catch(e) { console.error('Erreur actes:', e); }
}

/* deconnexion */
function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/* on lance les deux fonctions au chargement */
chargerStats();
chargerActes();