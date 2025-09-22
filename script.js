const timers = {
    totalPrestation: {
        time: 0,
        interval: null,
        isRunning: false,
        display: document.getElementById('totalPrestation')
    },
    tempsOpposition: {
        time: 0,
        interval: null,
        isRunning: false,
        display: document.getElementById('tempsOpposition')
    },
    tempsBataille: {
        time: 0,
        interval: null,
        isRunning: false,
        display: document.getElementById('tempsBataille')
    }
};

// Fonction pour formater le temps en MM:SS:ms
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(Math.floor(milliseconds / 10)).padStart(2, '0')}`;
}

// Fonction pour mettre à jour l'affichage du temps
function updateDisplay(timerName) {
    const timer = timers[timerName];
    timer.display.textContent = formatTime(timer.time);
}

// Fonction pour arrêter tous les autres chronos
function stopOtherTimers(exceptTimerName) {
    for (const name in timers) {
        if (name !== exceptTimerName && timers[name].isRunning) {
            clearInterval(timers[name].interval);
            timers[name].isRunning = false;
            // Met à jour l'icône de pause vers play pour chaque chrono arrêté
            const buttonIcon = document.querySelector(`.play-pause[data-target="${name}"] i`);
            if (buttonIcon) {
                buttonIcon.classList.remove('fa-pause');
                buttonIcon.classList.add('fa-play');
            }
        }
    }
}


// Fonction pour démarrer ou mettre en pause un chronomètre
function toggleTimer(timerName) {
    const timer = timers[timerName];
    const buttonIcon = document.querySelector(`.play-pause[data-target="${timerName}"] i`);

    if (timer.isRunning) {
        clearInterval(timer.interval);
        if (buttonIcon) {
            buttonIcon.classList.remove('fa-pause');
            buttonIcon.classList.add('fa-play');
        }
        if (timerName === 'totalPrestation') {
            stopOtherTimers('totalPrestation');
        }
    } else {
        const startTime = Date.now() - timer.time;
        timer.interval = setInterval(() => {
            timer.time = Date.now() - startTime;
            updateDisplay(timerName);
            updatePercentages();
        }, 10);
        if (buttonIcon) {
            buttonIcon.classList.remove('fa-play');
            buttonIcon.classList.add('fa-pause');
        }
    }
    timer.isRunning = !timer.isRunning;
}

// Fonction pour remettre à zéro un chronomètre
function resetTimer(timerName) {
    const timer = timers[timerName];
    // Assure d'arrêter le chrono avant de le reset
    if (timer.isRunning) {
        toggleTimer(timerName);
    }
    timer.time = 0;
    updateDisplay(timerName);
    updatePercentages();
}

// Fonction pour réinitialiser tous les chronos
function resetAllTimers() {
    for (const timerName in timers) {
        resetTimer(timerName);
    }
}

// Fonction pour mettre à jour les pourcentages
function updatePercentages() {
    const totalPrestation = timers.totalPrestation.time;
    const tempsOpposition = timers.tempsOpposition.time;
    const tempsBataille = timers.tempsBataille.time;

    // Pourcentage d'opposition par rapport au total
    if (totalPrestation > 0) {
        const percentageOpposition = ((tempsOpposition / totalPrestation) * 100).toFixed(2);
        document.getElementById('pourcentageOpposition').textContent = `(${percentageOpposition} % d'oposition)`;
    } else {
        document.getElementById('pourcentageOpposition').textContent = '';
    }

    // Pourcentage de bataille par rapport à l'opposition
    if (tempsOpposition > 0) {
        const percentageBataille = ((tempsBataille / tempsOpposition) * 100).toFixed(2);
        document.getElementById('pourcentageBataille').textContent = `(${percentageBataille} % de bataille)`;
    } else {
        document.getElementById('pourcentageBataille').textContent = '';
    }
}

// Fonction pour la saisie manuelle
function setManualTime(timerName, inputId) {
    const input = document.getElementById(inputId).value;
    const parts = input.split(':');
    let ms = 0;

    if (parts.length === 3) {
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        const milliseconds = parseInt(parts[2], 10) || 0;
        ms = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds * 10;
    } else if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        ms = (minutes * 60 * 1000) + (seconds * 1000);
    } else {
        alert("Format invalide. Utilisez MM:SS:ms ou MM:SS.");
        return;
    }

    const timer = timers[timerName];
    if (timer.isRunning) {
        toggleTimer(timerName);
    }
    timer.time = ms;
    updateDisplay(timerName);
    updatePercentages();
}

// Écouteurs d'événements pour les boutons individuels
document.querySelectorAll('.play-pause, .reset').forEach(button => {
    button.addEventListener('click', (e) => {
        // e.currentTarget est l'élément sur lequel l'écouteur est attaché (le bouton)
        const target = e.currentTarget.dataset.target;
        if (e.currentTarget.classList.contains('play-pause')) {
            toggleTimer(target);
        } else if (e.currentTarget.classList.contains('reset')) {
            resetTimer(target);
        }
    });
});

document.querySelectorAll('.set-time').forEach(button => {
    button.addEventListener('click', (e) => {
        const target = e.target.dataset.target;
        const inputId = 'input' + target.charAt(0).toUpperCase() + target.slice(1);
        setManualTime(target, inputId);
    });
});

// Écouteur d'événement pour le bouton de réinitialisation globale
document.getElementById('resetAll').addEventListener('click', resetAllTimers);

// Écouteur d'événement pour le bouton de basculement de la saisie manuelle
document.getElementById('toggleManualInput').addEventListener('click', () => {
    const cards = document.querySelectorAll('.chrono-card');
    cards.forEach(card => {
        card.classList.toggle('show-manual-input');
    });
});