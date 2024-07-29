// Array dei piloti
const drivers = [
    { name: 'Max Verstappen', team: 'Red Bull Racing', color: '#1e41ff' },
    { name: 'Sergio Perez', team: 'Red Bull Racing', color: '#1e41ff' },
    { name: 'Lewis Hamilton', team: 'Mercedes', color: '#00d2be' },
    { name: 'George Russell', team: 'Mercedes', color: '#00d2be' },
    { name: 'Charles Leclerc', team: 'Ferrari', color: '#dc0000' },
    { name: 'Carlos Sainz', team: 'Ferrari', color: '#dc0000' },
    { name: 'Lando Norris', team: 'McLaren', color: '#ff8700' },
    { name: 'Oscar Piastri', team: 'McLaren', color: '#ff8700' },
    { name: 'Fernando Alonso', team: 'Aston Martin', color: '#006f62' },
    { name: 'Lance Stroll', team: 'Aston Martin', color: '#006f62' },
    { name: 'Esteban Ocon', team: 'Alpine', color: '#0090ff' },
    { name: 'Pierre Gasly', team: 'Alpine', color: '#0090ff' },
    { name: 'Yuki Tsunoda', team: 'AlphaTauri', color: '#2b4562' },
    { name: 'Nyck de Vries', team: 'AlphaTauri', color: '#2b4562' },
    { name: 'Kevin Magnussen', team: 'Haas', color: '#757575' },
    { name: 'Nico Hulkenberg', team: 'Haas', color: '#757575' },
    { name: 'Valtteri Bottas', team: 'Alfa Romeo', color: '#900000' },
    { name: 'Zhou Guanyu', team: 'Alfa Romeo', color: '#900000' },
    { name: 'Alexander Albon', team: 'Williams', color: '#005aff' },
    { name: 'Logan Sargeant', team: 'Williams', color: '#005aff' },
];

let selectedDrivers = [];

// Attendi che il DOM sia completamente caricato
document.addEventListener('DOMContentLoaded', () => {
    // Crea griglia delle posizioni
    const gridContainer = document.getElementById('grid');
    if (gridContainer) {
        for (let i = 1; i <= 20; i++) {
            const positionElement = document.createElement('div');
            positionElement.classList.add('position');
            positionElement.innerText = `Posizione ${i}`;
            positionElement.addEventListener('click', () => selectDriver(i));
            gridContainer.appendChild(positionElement);
        }
    } else {
        console.error("L'elemento con ID 'grid' non è stato trovato.");
    }

    // Gestione modali e autenticazione
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const userInfo = document.getElementById('user-info');
    const logoutButton = document.getElementById('logout');
    const closeLogin = document.getElementById('close-login');
    const closeRegister = document.getElementById('close-register');
    const userNameDisplay = document.createElement('span');
    const registerError = document.getElementById('register-error');
    const confirmationMessage = document.getElementById('confirmation-message');

    userInfo.appendChild(userNameDisplay);

    loginButton?.addEventListener('click', () => {
        if (loginModal) loginModal.style.display = 'block';
    });

    registerButton?.addEventListener('click', () => {
        if (registerModal) {
            registerError.classList.remove('show');
            registerModal.style.display = 'block';
        }
    });

    closeLogin?.addEventListener('click', () => {
        if (loginModal) loginModal.style.display = 'none';
    });

    closeRegister?.addEventListener('click', () => {
        if (registerModal) registerModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === loginModal) loginModal.style.display = 'none';
        if (event.target === registerModal) registerModal.style.display = 'none';
    });

    logoutButton?.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        updateAuthDisplay();
    });

    // Gestione form registrazione
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const userData = {
                name: document.getElementById('register-name').value,
                surname: document.getElementById('register-surname').value,
                email: document.getElementById('register-email').value,
                birthdate: document.getElementById('register-dob').value,
                password: document.getElementById('register-password').value
            };
            console.log('Dati utente:', userData);
            saveUserData(userData);
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const loginData = {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            };
            console.log('Dati di login:', loginData);
            loginUser(loginData);
        });
    }

    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            if (selectedDrivers.length === 20 && !selectedDrivers.includes(undefined)) {
                const userId = localStorage.getItem('userId');
                submitSelection(userId, selectedDrivers);
            } else {
                console.log('Non hai inserito tutti i piloti');
            }
        });
    }
    
    document.addEventListener('click', (event) => {
        const dropdown = document.querySelector('.dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
            dropdown.remove();
        }
    });
    // Funzione per aggiornare l'interfaccia utente basata sull'autenticazione
    function updateAuthDisplay() {
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        if (userId) {
            if (loginButton) loginButton.style.display = 'none';
            if (registerButton) registerButton.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.innerText = userName;
        } else {
            if (loginButton) loginButton.style.display = 'block';
            if (registerButton) registerButton.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
            if (userNameDisplay) userNameDisplay.innerText = '';
        }
    }

    updateAuthDisplay();
});

// Funzione per selezionare un pilota
function selectDriver(position) {
    clearPreviousSelections();
    const positionElement = document.querySelector(`#grid .position:nth-child(${position})`);
    if (positionElement) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Seleziona un pilota';
        input.addEventListener('input', () => filterDrivers(input, position));
        positionElement.appendChild(input);
        input.style.display = 'block';
        input.focus();
    }
}

function clearPreviousSelections() {
    const inputs = document.querySelectorAll('.position input');
    inputs.forEach(input => input.remove());
    const dropdowns = document.querySelectorAll('.position .dropdown');
    dropdowns.forEach(dropdown => dropdown.remove());
}

function filterDrivers(input, position) {
    const value = input.value.toLowerCase();
    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');
    dropdown.innerHTML = '';

    drivers
        .filter(driver => driver.name.toLowerCase().includes(value) && !selectedDrivers.includes(driver.name))
        .forEach(driver => {
            const driverElement = document.createElement('div');
            driverElement.innerText = driver.name;
            driverElement.style.color = driver.color;
            driverElement.addEventListener('click', () => {
                selectDriverForPosition(position, driver.name, driver.color);
                clearPreviousSelections();
            });
            dropdown.appendChild(driverElement);
        });

    const positionElement = document.querySelector(`#grid .position:nth-child(${position})`);
    if (positionElement) {
        const existingDropdown = positionElement.querySelector('.dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        positionElement.appendChild(dropdown);
    }
}

function selectDriverForPosition(position, driverName, driverColor) {
    const positionElement = document.querySelector(`#grid .position:nth-child(${position})`);
    if (positionElement) {
        positionElement.innerHTML = driverName;
        positionElement.style.color = driverColor;
        selectedDrivers[position - 1] = driverName;
        updateSubmitButtonState();
    }
}

function updateSubmitButtonState() {
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        if (selectedDrivers.length === 20 && !selectedDrivers.includes(undefined)) {
            submitButton.disabled = false;
            submitButton.style.cursor = 'pointer';
        } else {
            submitButton.disabled = true;
            submitButton.style.cursor = 'not-allowed';
        }
    }
}

// Funzioni per la gestione del login, registrazione e invio dei dati
function saveUserData(userData) {
    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Risposta dal server:', data);
        if (data.success) {
            console.log(`Registrazione completata con successo! Il tuo ID è ${data.userId}`);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', `${userData.name} ${userData.surname}`);
            document.getElementById('register-modal').style.display = 'none';
            updateAuthDisplay();
        } else {
            console.log('Errore durante la registrazione: ' + data.message);
            const registerError = document.getElementById('register-error');
            if (registerError) {
                registerError.textContent = data.message;
                registerError.classList.add('show');
            }
        }
    })
    .catch(error => {
        console.error('Errore:', error);
        const registerError = document.getElementById('register-error');
        if (registerError) {
            registerError.textContent = 'Errore durante la registrazione.';
            registerError.classList.add('show');
        }
    });
}

function loginUser(loginData) {
    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Risposta dal server:', data);
        if (data.success) {
            console.log(`Login effettuato con successo! Il tuo ID è ${data.userId}`);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', `${data.name} ${data.surname}`);
            document.getElementById('login-modal').style.display = 'none';
            updateAuthDisplay();
        } else {
            console.log('Errore durante il login: ' + data.message);
            // Aggiungi un elemento per mostrare il messaggio di errore nel modulo di login
        }
    })
    .catch(error => {
        console.error('Errore:', error);
        // Aggiungi un elemento per mostrare il messaggio di errore nel modulo di login
    });
}

function submitSelection(userId, selections) {
    fetch('http://localhost:3000/api/submit-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, selections })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Risposta dal server:', data);
        if (data.success) {
            console.log('Pronostico salvato con successo');
            showConfirmationMessage('Il tuo pronostico è stato inviato con successo.');
        } else {
            console.log('Errore durante il salvataggio del pronostico: ' + data.message);
            showConfirmationMessage('Errore durante il salvataggio del pronostico.');
        }
    })
    .catch(error => {
        console.error('Errore:', error);
        showConfirmationMessage('Errore durante il salvataggio del pronostico.');
    });
}

function showConfirmationMessage(message) {
    const confirmationMessage = document.getElementById('confirmation-message');
    if (confirmationMessage) {
        confirmationMessage.textContent = message;
        confirmationMessage.classList.add('show');
        setTimeout(() => {
            confirmationMessage.classList.remove('show');
        }, 3000);
    }
}
