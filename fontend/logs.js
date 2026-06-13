/* ============================================
   SECUREPOST - Script Logs de Traçabilité
   Auteur : Erwin Christopher Siassia
   Date : Juin 2026
   ============================================ */

var token = localStorage.getItem('token');
var user = {};
try { user = JSON.parse(localStorage.getItem('user')) || {}; } catch(e) {}

/* seul le commissaire peut voir les logs */
if (!token) { window.location.href = 'index.html'; }
if (user.role !== 'commissaire') { window.location.href = 'dashboard.html'; }

if (user.prenom && user.nom) {
    document.getElementById('userInitiales').textContent = user.prenom[0] + user.nom[0];
    document.getElementById('userName').textContent = user.prenom + ' ' + user.nom;
    document.getElementById('userRole').textContent = user.role;
}

/* chargement des logs depuis l'API */
async function chargerLogs() {
    try {
        var reponse = await fetch('https://securepost-api.onrender.com/api/stats/logs', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();
        afficherLogs(data);
    } catch(e) {
        document.getElementById('listeLogs').innerHTML = '<p class="logs-vide">Erreur de chargement</p>';
    }
}

/* affichage des logs */
function afficherLogs(logs) {
    if (logs.length === 0) {
        document.getElementById('listeLogs').innerHTML = '<p class="logs-vide">Aucun log disponible</p>';
        return;
    }

    var html = '';
    logs.forEach(function(log) {
        var date = new Date(log.date_action).toLocaleString('fr-FR');
        var agent = log.prenom ? log.prenom + ' ' + log.nom : 'Inconnu';

        html += '<div class="log-item ' + log.action + '">';
        html += '<span class="log-badge ' + log.action + '">' + log.action + '</span>';
        html += '<div class="log-details">';
        html += '<strong>' + agent + ' — ' + (log.role || '') + '</strong>';
        html += '<p>' + (log.details || '-') + '</p>';
        html += '</div>';
        html += '<span class="log-date">' + date + '</span>';
        html += '</div>';
    });

    document.getElementById('listeLogs').innerHTML = html;
}

/* deconnexion */
function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

chargerLogs();