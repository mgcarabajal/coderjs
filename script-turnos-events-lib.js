let opcion = 0;
let seguirAgregandoTurnos;
let turnoAgendado;
// LOCAL STORAGE Array de turnos
function obtener_localstorage(clave) {
    return JSON.parse(localStorage.getItem(clave));
};
function guardar_localstorage(clave, valor) {
    return localStorage.setItem(clave, JSON.stringify(valor));
};
function crearTabla(turnosDeSede) {
    let divresultados = document.getElementById('resultados');
    let myTbl = document.createElement("table");
    myTbl.setAttribute('id', 'tabla-turnos-disponibles');
    divresultados.appendChild(myTbl);
    let trHead = document.createElement("tr");
    trHead.innerHTML = (`<th>Dia</th><th>Horario</th><th>Sede</th><th></th>`)
    myTbl.appendChild(trHead);

    turnosDeSede.forEach(element => {
        //desestructurado..
        let { dia, horario, sede, id } = element;
        let myTr = document.createElement("tr");
    
        myTr.innerHTML = (`<td>${dia}</td><td>${horario}</td><td>${sede}</td><td><button id=${id} class="agendar">Agendar</button></td>`);
        myTbl.appendChild(myTr);
    
    });
    comprobarBtns(turnosDeSede);
}

// DESHABILITANDO EL BOTON EN EL DOM SI EL TURNO ESTA FALSE
function comprobarBtns(turnosDeSede) {
    let turnosArray = obtener_localstorage("turnosAsignadosUsuario");
    let turnosfalse = turnosArray?.filter(turno => turno.disponible == false);
    console.log(turnosfalse);

    let diasfalsos = turnosfalse?.map(elemento => elemento.id);
    console.log(diasfalsos);
    
    let opciones = document.querySelectorAll(".agendar");

    console.log(opciones);

    opciones.forEach(element => {
        if (diasfalsos?.includes(element.id)) {
            element.setAttribute("disabled", '');
        }
    })
};
function mostrarTurnos(turnosDeSede) {

    let existeTabla = document.getElementById('tabla-turnos-disponibles');
    if (!existeTabla) {
        crearTabla(turnosDeSede);

    } else {
        existeTabla.remove();
        crearTabla(turnosDeSede);
    }
}
function getData(sede) {
    // traemos el array de json
    fetch("/turnos.json")
        .then(response => response.json())
        .then(turnos => {
            const turnosDisponibles = turnos.filter(item => item.disponible);
            const turnosDeSede = sede === 0 ? turnosDisponibles : turnosDisponibles.filter(item => item.sede === sede);
            mostrarTurnos(turnosDeSede)//aca muestra los turnos disponibles (todos)
            // elegirTurno(turnosDeSede);// aca muestra los turnos por sede
            let botones = document.querySelectorAll(".agendar");
            botones.forEach(element => {
              
                element.addEventListener('click', (event) => {
                    let finalizar = document.getElementById("finalizar"); 
                    finalizar.style.display = "block";
                    let turnoClickeado = event.target.id;
                    element.setAttribute('disabled', ' ');
                    // console.log(turnoClickeado);
                    const teste2 = obtener_localstorage("turnosAsignadosUsuario");
                    console.log(teste2);

                    let turnoElegido = turnosDeSede.find(turno => turno.id === turnoClickeado);
                    const isFound = teste2 && teste2.length >= 0 && teste2.some(element => {
                        if (element.id === turnoClickeado) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (turnoElegido.disponible && !isFound) {
                        turnoElegido.disponible = false;
                        turnoElegido.timestamp = DateTime.now().toISO();
                        turnosAsignadosUsuario.push(turnoElegido);
                        guardar_localstorage('turnosAsignadosUsuario', turnosAsignadosUsuario);
                        Toastify(turnoConfirmadoToast).showToast();

                    } else {
                        Toastify(turnoNoDisponibleToast).showToast();
                    }

                })
            
            }
            );
        });
}
function changeFunc() {
    const selectBox = document.getElementById("sedes");
    const sedeSeleccionada = selectBox.options.selectedIndex - 1;
    getData(sedeSeleccionada);
}
let turnosAsignadosUsuario = obtener_localstorage("turnosAsignadosUsuario") || [];

if (turnosAsignadosUsuario.length > 0 ){
    let finalizar = document.getElementById("finalizar"); 
    finalizar.style.display = "block";
}

// defino el constructor
class Turno {
    constructor(id, dia, horario, disponible, sede, timestamp) {
        this.id = id;
        this.dia = dia;
        this.horario = horario;
        this.disponible = disponible;
        this.sede = sede;
        this.timestamp = timestamp;
    }
};
let DateTime = luxon.DateTime;
let dt = DateTime.now();
let f = { month: 'long', day: 'numeric', year: 'numeric' };
let now = dt.setLocale('es').toLocaleString(f);
let currentDate = document.getElementById('current-date').innerHTML = `Hoy es  ${now}`;
//transformamos la fecha a un modo mas amigable para el dom
const cuteDate = (e) => DateTime.fromISO(e).toLocaleString(DateTime.DATETIME_MED);

const botonTurnos = document.getElementById("finalizar");
botonTurnos.addEventListener("click", () => {
    const turnos = obtener_localstorage("turnosAsignadosUsuario");
    mostrarTurnosFinalesModal(turnos);
});

function mostrarTurnosFinalesModal(arrayDeTurnos) {
    turnosAsignadosUsuario = arrayDeTurnos.filter(item => item.disponible === false);
    let modal = document.getElementById('modal-content');
    if (turnosAsignadosUsuario.length === 0) {
        let borrarTitulo = document.querySelector(".h3-title");
    
        borrarTitulo.remove();
        

        let myh3 = document.createElement("h3");
        myh3.innerText = "Usted no solicitó turnos hasta el momento.";
        modal.appendChild(myh3);
    } else {

        let existeh3 = document.querySelector('.h3-title');

        if (existeh3 === "") {
            let myh3 = document.createElement("h3");
            myh3.setAttribute('class', 'h3-title');
            myh3.innerText = "Estos son los turnos que usted solicitó";
            document.body.appendChild(myh3);
            modal.appendChild(myh3);
        }

        let existetabla = document.querySelector('#tabla-turnos-asignados');

        if (existetabla) {
            existetabla.remove();
        }

        let myTbl = document.createElement("table");
        myTbl.setAttribute('id', 'tabla-turnos-asignados');
        modal.appendChild(myTbl);

        let turnosNoDisponibles = arrayDeTurnos.filter(item => item.disponible === false);
        turnosNoDisponibles.forEach(element => {

            //desestructurado..
            let { dia, horario, sede, timestamp, id } = element;
            let myTr = document.createElement("tr");
            myTr.innerHTML = (`<td style="padding-top: 20px"><p>${dia} a las ${horario}, en la sede ${sede} turno asignado el  ${cuteDate(timestamp)}</p></td><td><i class="fa-solid fa-trash-can"  onclick="borrarElemento('${id}')"></i>
            </td>`);
            myTbl.appendChild(myTr);
        }
        );
        let modalsito = document.getElementById('exampleModal');
        modalsito.classList.add("show");
        modalsito.style.display = "block";
    }
}

// funcion para que se cierre el modal,
document.getElementById("genial").addEventListener('click', () => {

    location.reload();
   })

function borrarElemento(id) {
    let tablaTurnos = document.getElementById("tabla-turnos-asignados");
    let turnoBorrado = turnosAsignadosUsuario.find(turno => turno.id == id);
    turnoBorrado.disponible = true;
    

    turnosAsignadosUsuario = turnosAsignadosUsuario.filter(item => item.disponible === false);
    guardar_localstorage('turnosAsignadosUsuario', turnosAsignadosUsuario);
    tablaTurnos.remove();
    obtener_localstorage("turnosAsignadosUsuario");
    mostrarTurnosFinalesModal(turnosAsignadosUsuario);
}

let dias = [];
let diaUsuario = document.getElementById("sedes");
diaUsuario.addEventListener('click', function (event) {
    let diaElegido = event.target.id;
});

let dropdown = document.getElementById('sedes');
dropdown.length = 0;

let defaultOption = document.createElement('option');
defaultOption.text = 'Elige una sede:';


dropdown.add(defaultOption);

let allSedesOption = document.createElement('option');
allSedesOption.text = 'Todas las sedes';

dropdown.add(allSedesOption);
dropdown.selectedIndex = 0;

const url = '/turnos.json';

fetch(url)  
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.warn('Error 200! ' + 
          response.status);  
        return;  
      }

      // response..
      response.json().then(function(data) {  
        let option;
        console.log(data);
        const sedes = data.map((element)=>element.sede);
        console.log(sedes);
        // array sin duplicados
        const bren = [...new Set(sedes)];
       
        
    	for (let i = 0; i < bren.length; i++) {
            console.log(bren[i]);
          option = document.createElement('option');
      	  option.text = "Sede " + bren[i];
            console.log(bren[i]);
      	  dropdown.add(option);
    	}    
      });  
    }  
  )  
  .catch(function(err) {  
    console.error('Fetch Error -', err);  
  });

