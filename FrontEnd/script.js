const URL_API = 'http://localhost:5000/api/historial';

const pantalla = document.getElementById('pantalla-texto');
const botones = document.querySelectorAll('.btn');
const listaHistorial = document.getElementById('lista-historial');
const btnLimpiar = document.getElementById('btn-limpiar');

let operacionActual = '';
let nuevoCalculo = false;

// 1. Manejo de clics en la calculadora
botones.forEach(boton => {
    boton.addEventListener('click', () => {
        const textoBoton = boton.textContent;

        if (boton.id === 'RESET') {
            operacionActual = '';
            pantalla.textContent = '0';
            return;
        }

        if (boton.id === 'DELETE') {
            operacionActual = operacionActual.slice(0, -1);
            pantalla.textContent = operacionActual || '0';
            return;
        }

        if (boton.id === 'RESULTADO') {
            calcularResultado();
            return;
        }

        if (nuevoCalculo) {
            operacionActual = '';
            nuevoCalculo = false;
        }

        operacionActual += textoBoton;
        pantalla.textContent = operacionActual;
    });
});

// 2. Realizar el cálculo y enviarlo a MongoDB
function calcularResultado() {
    if (!operacionActual) return;

    try {
        // eval() evalúa la expresión matemática escrita en pantalla
        const resultado = eval(operacionActual).toString();
        const expresion = operacionActual;

        pantalla.textContent = resultado;
        nuevoCalculo = true;

        // Guardar en MongoDB a través del Backend
        guardarEnMongoDB(expresion, resultado);

    } catch (error) {
        pantalla.textContent = 'Error';
        operacionActual = '';
    }
}

// 3. Petición POST a la API
async function guardarEnMongoDB(expresion, resultado) {
    try {
        await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expresion, resultado })
        });
        cargarHistorial(); // Refrescar el historial en vivo
    } catch (error) {
        console.error('Error al guardar en MongoDB:', error);
    }
}

// 4. Petición GET a la API
async function cargarHistorial() {
    try {
        const res = await fetch(URL_API);
        const datos = await res.json();

        listaHistorial.innerHTML = '';

        if (datos.length === 0) {
            listaHistorial.innerHTML = '<li style="border:none;">Sin operaciones guardadas</li>';
            return;
        }

        datos.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.expresion} = ${item.resultado}`;
            listaHistorial.appendChild(li);
        });
    } catch (error) {
        console.error('Error al obtener el historial:', error);
    }
}

// 5. Petición DELETE a la API
btnLimpiar.addEventListener('click', async () => {
    try {
        await fetch(URL_API, { method: 'DELETE' });
        cargarHistorial();
    } catch (error) {
        console.error('Error al borrar el historial:', error);
    }
});

const puntoEstado = document.getElementById('punto-estado');
const textoEstado = document.getElementById('texto-estado');

// Función para verificar la conexión con MongoDB Atlas
async function verificarConexionDB() {
    try {
        const res = await fetch('http://localhost:5000/api/estado');
        const data = await res.json();

        if (data.conectado) {
            puntoEstado.className = 'punto-estado conectado';
            textoEstado.textContent = 'Conectado';
        } else {
            puntoEstado.className = 'punto-estado desconectado';
            textoEstado.textContent = 'Sin BD';
        }
    } catch (error) {
        // Si el servidor Express ni siquiera responde
        puntoEstado.className = 'punto-estado desconectado';
        textoEstado.textContent = 'Offline';
    }
}

// Comprobar estado al cargar la página y repetir cada 5 segundos
verificarConexionDB();
setInterval(verificarConexionDB, 5000);

// Cargar historial al abrir la página
document.addEventListener('DOMContentLoaded', cargarHistorial);