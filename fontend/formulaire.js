/* ============================================
   SECUREPOST - Script Formulaire Nouvel Acte
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

/* date actuelle par defaut dans le champ date */
var maintenant = new Date();
maintenant.setMinutes(maintenant.getMinutes() - maintenant.getTimezoneOffset());
document.getElementById('dateFaits').value = maintenant.toISOString().slice(0, 16);

/* soumission du formulaire */
async function soumettre() {
    var alerteErr = document.getElementById('alertErreur');
    var alerteOk = document.getElementById('alertSucces');
    alerteErr.style.display = 'none';
    alerteOk.style.display = 'none';

    var typeActe = document.getElementById('typeActe').value;
    var gravite = document.getElementById('gravite').value;
    var dateFaits = document.getElementById('dateFaits').value;
    var quartier = document.getElementById('quartier').value;
    var contenu = document.getElementById('contenu').value;

    /* verification des champs obligatoires */
    if (!typeActe || !dateFaits || !quartier || !contenu) {
        alerteErr.style.display = 'block';
        alerteErr.textContent = 'Veuillez remplir tous les champs obligatoires (*)';
        return;
    }

    var btn = document.getElementById('btnSoumettre');
    btn.textContent = 'Enregistrement...';
    btn.disabled = true;

    try {
        /* envoi des donnees vers l'API */
        var reponse = await fetch('http://localhost:3000/api/acts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                type_acte: typeActe,
                gravite: gravite,
                date_faits: dateFaits,
                quartier: quartier,
                contenu: contenu,
                declarant_nom: document.getElementById('declarantNom').value,
                declarant_prenom: document.getElementById('declarantPrenom').value,
                victime_nom: document.getElementById('victimeNom').value,
                victime_prenom: document.getElementById('victimePrenom').value,
                suspect_nom: document.getElementById('suspectNom').value,
                suspect_prenom: document.getElementById('suspectPrenom').value,
                workspace_id: user.workspace_id || 1
            })
        });

        var data = await reponse.json();

        if (reponse.ok) {
            alerteOk.style.display = 'block';
            alerteOk.textContent = 'Acte ' + data.acte.numero_acte + ' enregistre avec succes !';
            /* redirection apres 2 secondes */
            setTimeout(function() {
                window.location.href = 'actes.html';
            }, 2000);
        } else {
            alerteErr.style.display = 'block';
            alerteErr.textContent = data.message || 'Erreur lors de l\'enregistrement';
            btn.textContent = 'Enregistrer l\'Acte';
            btn.disabled = false;
        }

    } catch(e) {
        alerteErr.style.display = 'block';
        alerteErr.textContent = 'Impossible de contacter le serveur';
        btn.textContent = 'Enregistrer l\'Acte';
        btn.disabled = false;
    }
}

/* deconnexion */
function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}