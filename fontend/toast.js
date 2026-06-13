/* creation du conteneur au chargement de la page */
if (!document.getElementById('toastContainer')) {
    var conteneur = document.createElement('div');
    conteneur.id = 'toastContainer';
    document.body.appendChild(conteneur);
}

/* fonction principale pour afficher un toast
   type peut etre : succes, erreur, info */
function afficherToast(message, type) {
    type = type || 'info';

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;

    document.getElementById('toastContainer').appendChild(toast);

    /* le toast disparait apres 3.5 secondes */
    setTimeout(function() {
        toast.classList.add('disparait');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3500);
}