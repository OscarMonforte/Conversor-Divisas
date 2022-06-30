/**
 * Conversor de monedas online
 * 
 * Conversor de divisas
 * API: https://exchangerate.host/#/
 * 
 * Banderas
 * API: https://flagcdn.com/es.svg
 * 
 * @author Oscar Monforte Prades
 * @version 1.0
 */
const MONEDA_1 = document.getElementById("txtMoneda1");
const MONEDA_2 = document.getElementById("txtMoneda2");
const LISTA_MONEDA_1 = document.getElementById("slcMoneda1");
const LISTA_MONEDA_2 = document.getElementById("slcMoneda2");
const DESC_MONEDA_1 = document.getElementById("descMoneda1");
const DESC_MONEDA_2 = document.getElementById("descMoneda2");
const CONV_ACTUAL = document.getElementById("conversionActual");
const CONT_MONEDA_1 = document.getElementById("contMoneda1");
const CONT_MONEDA_2 = document.getElementById("contMoneda2");
const CONT_BANDERAS = document.getElementById("contenedorBanderas");
const FECHA_ACTUAL = new Date();
var monedaActual = 1;
window.onload = inicializacion();
LISTA_MONEDA_1.addEventListener("click", addTexto);
LISTA_MONEDA_2.addEventListener("click", addTexto);
MONEDA_1.addEventListener("keyup", function () { iniciarConversor(1) });
MONEDA_1.addEventListener("click", function () { addSombra(1) });
MONEDA_2.addEventListener("keyup", function () { iniciarConversor(2) });
MONEDA_2.addEventListener("click", function () { addSombra(2) });

/**
 * Función que se utiliza para inicializar
 */
function inicializacion() {
    leerJSON();
    simbolosMonedas();
}

/**
 * Función para leer el fichero local JSON con los codigos ISO de los paises y sus monedas
 */
function leerJSON() {
    fetch("public/data/country-codes_json.json")
        .then(response => {
            return response.json();
        })
        .then(jsondata => {
            for (let dato of jsondata) {
                let bandera = dato["ISO3166-1-Alpha-2"];
                let moneda = dato["ISO4217-currency_alphabetic_code"];
                let pais = dato["CLDR display name"];
                let textoMoneda = dato["ISO4217-currency_name"];

                if (moneda != null) {
                    agregarBanderaHTML(CONT_BANDERAS, bandera, moneda, pais, textoMoneda);
                }
            }
            addTexto();
        });
}

/**
 * Función para descargar todos los simbolos de las monedas
 */
function simbolosMonedas() {
    let almacen = JSON.parse(localStorage.getItem("symbols"));
    var requestURL = "https://api.exchangerate.host/symbols";
    var request = new XMLHttpRequest();

    if (almacen == null) {
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();

        request.onload = function () {
            var response = request.response;
            localStorage.setItem("symbols", JSON.stringify(response));
            console.log("CONSULTO API SIMBOLOS");
            for (let clave in response.symbols) {
                let monedaCode = response.symbols[clave].code;
                let monedaDescription = response.symbols[clave].description;
                agregarMonedaSelectHTML(LISTA_MONEDA_1, monedaCode, monedaDescription);
                agregarMonedaSelectHTML(LISTA_MONEDA_2, monedaCode, monedaDescription);
            }
            addTexto();
        }
    } else {
        console.log("CONSULTO DATOS ALMACENADOS SIMBOLOS");
        for (let clave in almacen.symbols) {
            let monedaCode = almacen.symbols[clave].code;
            let monedaDescription = almacen.symbols[clave].description;
            agregarMonedaSelectHTML(LISTA_MONEDA_1, monedaCode, monedaDescription);
            agregarMonedaSelectHTML(LISTA_MONEDA_2, monedaCode, monedaDescription);
        }
        addTexto();
    }
}

/**
 * Función para poner el texto de los optGroup
 */
function addTexto() {
    DESC_MONEDA_1.innerText = LISTA_MONEDA_1.selectedOptions[0].parentElement.label;
    DESC_MONEDA_2.innerText = LISTA_MONEDA_2.selectedOptions[0].parentElement.label;
    iniciarConversor(monedaActual);
}

/**
 * Función para agregar las banderas y las monedas de cada uno de los paises
 * 
 * @param {HTMLDivElement} div div donde se va a añadir la bandera y moneda
 * @param {String} bandera codigo ISO3166 de la bandera
 * @param {String} moneda codigo ISO4217 de la moneda
 * @param {String} pais nombre del pais
 * @param {String} textoMoneda moneda
 */
function agregarBanderaHTML(div, bandera, moneda, pais, textoMoneda) {
    let banderaURL = (bandera == null) ? "" : ("https://flagcdn.com/" + bandera.toLowerCase() + ".svg");
    let img = document.createElement("img");
    let p = document.createElement("p");
    let h6 = document.createElement("h6");
    let divHijo = document.createElement("div");
    p.innerHTML = moneda;
    h6.innerHTML = pais + " (" + textoMoneda + ")";
    img.setAttribute("height", "20");
    img.setAttribute("src", banderaURL);
    img.setAttribute("alt", pais);
    divHijo.appendChild(h6);
    divHijo.appendChild(img);
    divHijo.appendChild(p);
    div.appendChild(divHijo);
}

/**
 * Funcion para agregar al select una moneda como option
 * 
 * @param {HTMLSelectElement} select select donde se va a añadir el option
 * @param {String} monedaCode codigo de la moneda
 * @param {String} monedaDescription descripcion de la moneda
 */
function agregarMonedaSelectHTML(select, monedaCode, monedaDescription) {
    let option = document.createElement("option");
    option.setAttribute("value", monedaCode);
    let optionTexto = document.createTextNode(monedaCode);
    option.appendChild(optionTexto);
    let optionGroup = document.createElement("optgroup");
    optionGroup.setAttribute("label", monedaDescription);
    optionGroup.appendChild(option);
    select.appendChild(optionGroup);
}

/**
 * Función que realiza la conversión
 * 
 * @param {String} monedaFrom codigo de la moneda de origen
 * @param {String} monedaTo codigo de la moneda de la conversión
 * @param {Number} cantidad cantidad que se desea convertir
 * @param {HTMLInputElement} resultado input donde se va a escribir el resultado
 */
function conversorMonedas(monedaFrom, monedaTo, cantidad, resultado) {
    var hoy = FECHA_ACTUAL.getFullYear() + "-" + (FECHA_ACTUAL.getMonth() + 1) + "-" + FECHA_ACTUAL.getDate();
    let almacen = JSON.parse(localStorage.getItem(monedaFrom));
    var requestURL = "https://api.exchangerate.host/latest?base=" + monedaFrom;
    var request = new XMLHttpRequest();

    if (almacen == null || almacen.date != hoy) {
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();

        request.onload = function () {
            var response = request.response;
            let calculo = cantidad * response.rates[monedaTo];
            response.date = hoy;
            localStorage.setItem(response.base, JSON.stringify(response));
            CONV_ACTUAL.innerHTML = "1 " + monedaFrom + " = " + response.rates[monedaTo] + " " + monedaTo;
            console.log("CONSULTO API MONEDAS");
            resultado.value = calculo.toFixed(3);
            actualizarBanderas(monedaFrom);
        }
    } else {
        let calculo = cantidad * almacen.rates[monedaTo];
        CONV_ACTUAL.innerHTML = "1 " + monedaFrom + " = " + almacen.rates[monedaTo] + " " + monedaTo;
        console.log("CONSULTO DATOS ALMACENADOS MONEDAS");
        resultado.value = calculo.toFixed(3);
        actualizarBanderas(monedaFrom);
    }
}

/**
 * Función para actualizar la conversión en todos los paises
 * 
 * @param {String} monedaFrom moneda
 */
function actualizarBanderas(monedaFrom) {
    let almacen = JSON.parse(localStorage.getItem(monedaFrom));
    let hijos = CONT_BANDERAS.querySelectorAll("div > p");
    for (let dato in almacen.rates) {
        for (let p of hijos) {
            if (p.innerHTML.includes(dato)) {
                p.innerHTML = almacen.rates[dato].toFixed(3) + " " + dato;
            }
        }
    }
}

/**
 * Función que recoge los datos para enviarselos a la función de conversorMonedas
 * 
 * @param {Number} opcion selecciona de donde coger los datos
 */
function iniciarConversor(opcion) {
    let moneda1 = LISTA_MONEDA_1.value;
    let moneda2 = LISTA_MONEDA_2.value;
    let monedaCantidad;
    if (opcion == 1) {
        monedaCantidad = MONEDA_1.value.replace(",", ".");
        monedaActual = 1;
        if (monedaCantidad != "") {
            conversorMonedas(moneda1, moneda2, monedaCantidad, MONEDA_2);
        } else {
            MONEDA_2.value = monedaCantidad;
        }
    } else if (opcion == 2) {
        monedaCantidad = MONEDA_2.value.replace(",", ".");
        monedaActual = 2;
        if (monedaCantidad != "") {
            conversorMonedas(moneda2, moneda1, monedaCantidad, MONEDA_1);
        } else {
            MONEDA_1.value = monedaCantidad;
        }
    }
}

/**
 * Función para añadir la clase sombra
 * 
 * @param {Number} opcion selecciono el numero del elemento que quiero poner la sombra
 */
function addSombra(opcion) {
    if (opcion == 1) {
        CONT_MONEDA_1.classList.add("sombra");
        CONT_MONEDA_2.classList.remove("sombra");
        if (monedaActual == 2) {
            MONEDA_1.value = "";
            iniciarConversor(opcion);
        }
    } else if (opcion == 2) {
        CONT_MONEDA_2.classList.add("sombra");
        CONT_MONEDA_1.classList.remove("sombra");
        if (monedaActual == 1) {
            MONEDA_2.value = "";
            iniciarConversor(opcion);
        }
    }
}