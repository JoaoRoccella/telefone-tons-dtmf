let phoneScreen = document.querySelector('#phone-screen');
let phoneButtons = document.querySelector('#phone-buttons');
let conectado = false;
let intervalo;
let seconds = '00';
let minutes = '00';
let divContador = '<div><span id="minutes">00</span>:<span id="seconds">00</span></div>';

// registra os números digitados
phoneButtons.addEventListener('click', e => {
    if (e.target.classList.contains('dial-number') && !conectado) {
        phoneScreen.classList.remove('phone-status');
        phoneScreen.innerHTML += e.target.getAttribute('data-key');
    }
});


// alterna o mute do microfone
document.querySelector('#btMicrofone').addEventListener('click', () => {
    document.querySelector('#btMicrofone .bi').classList.toggle('bi-mic-fill');
    document.querySelector('#btMicrofone .bi').classList.toggle('bi-mic-mute-fill');
})


// limpa os números digitados no visor, a não ser que o visor esteja exibindo algum status
document.querySelector('#phoneScreenReset').addEventListener('click', () => {
    if (!conectado && !phoneScreen.classList.contains('phone-status')) {
        phoneScreen.innerHTML = '';
    }
});


// Realiza uma chamada, somente se: não estiver conetado 
// E se houver algo digitado na tela E se o que estiver 
// digitado não for um phone-status, ou seja, um número.
function call() {
    if (!conectado && phoneScreen.innerHTML && !phoneScreen.classList.contains('phone-status')) {

        phoneScreen.innerHTML = 'Chamando';
        phoneScreen.classList.add('phone-status');

        toggleRingtone();

        setTimeout(function () {

            toggleRingtone();

            phoneScreen.innerHTML = 'Conectado';
            phoneScreen.insertAdjacentHTML('beforeend', divContador);

            clearInterval(intervalo);
            intervalo = setInterval(startTimer, 1000);
            conectado = true;
            
        }, 4000);
    }
}

// Contador de tempo da chamada
function startTimer() {
    let appendMinutes = document.querySelector('#minutes');
    let appendSeconds = document.querySelector('#seconds');

    seconds++;

    if (seconds <= 9) {
        appendSeconds.innerHTML = "0" + seconds;
    }

    if (seconds > 9) {
        appendSeconds.innerHTML = seconds;
    }

    if (seconds > 59) {
        minutes++;
        appendMinutes.innerHTML = "0" + minutes;
        seconds = 0;
        appendSeconds.innerHTML = "0" + 0;
    }
    if (minutes > 9) {
        appendMinutes.innerHTML = minutes;
    }

}

// encerra a chamada ativa 
function endCall() {
    if (conectado) {
        phoneScreen.innerHTML = 'Chamada encerrada';
        setTimeout(() => {
            phoneScreen.innerHTML = '';
        }, 1500);
        conectado = !conectado;
        clearInterval(intervalo);
        seconds = '00';
        minutes = '00';
    }
}

