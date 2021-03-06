// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDVLoR7EItZV3ZeHqVEzFinF4PVPF6j9VI",
    authDomain: "mexicovid-19.firebaseapp.com",
    databaseURL: "https://mexicovid-19.firebaseio.com",
    projectId: "mexicovid-19",
    storageBucket: "mexicovid-19.appspot.com",
    messagingSenderId: "120285866166",
    appId: "1:120285866166:web:2e30922e8033cbe2b3de17",
    measurementId: "G-DE9Q3D7K8L"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//fecha de inicio 15 de marzo son 2 por dia
function days_passed() {
    var start =new Date(2020, 2, 15) //Month is 0-11 in JavaScript
    today=new Date()
    //Get 1 day start
    var one_day=1000*60*60*24;
    
    //Calculate difference btw the two dates, and convert to days
    return 2*(Math.ceil((today.getTime()-start.getTime())/(one_day)));
}

//diccionario donde se guardan todos los casos por estado como valor es un array con los casos
estado ={"AGS":[],
        "BC":[],"BCS":[],"CAMP":[],"CHIS":[],"CHIH":[],"CDMX":[],
        "COAH":[],"COL":[],"DGO":[],"GTO":[],"GRO":[],"HGO":[],"JAL":[],
        "MEX":[],"MICH":[],"MOR":[],"NAY":[],"NL":[],"OAX":[],"PUE":[],
        "QRO":[],"QROO":[],"SLP":[],"SIN":[],"SON":[],"TAB":[],"TAMP":[],
        "TLAX":[],"VER":[],"YUC":[],"ZAC":[]
    };

//comienza la llamada asincrona a firebase
//se hace lectura al indice masterSheet creado a partir del google sheet
firebase.database().ref('masterSheet').once('value', function(datos){
    //lectura con jQuery del GeoJSON, se cambio a .json para poder manipularse
    $.getJSON('Mexico_Estados.json', function(data) { 
    
    var geojson = data;
    console.log(geojson)

    contagios=datos.val();
    //console.log(contagios[0]);

    names = [];//variable para guardar los nombres de los estados como array
    for (var key in estado) {
        if (estado.hasOwnProperty(key)) {
            names.push(key);
        }
    }

    //console.log(names)
    
    //este for guarda los contagios en cada key
    for(i=0;i<=32;i++){
        var state_name=contagios[i][0];
        var cases =[];
        if(i!=0){
            for(j=0;j<=days_passed();j++){
                if(j==0){
                    //console.log("Estado:"+contagios[i][j]);
                }
                else{
                    if(j%2!=0){
                        cases.push(contagios[i][j]);
                    }
                    else{
                        cases.push(contagios[i][j]);
                    }
                }
            }
            estado[state_name] = cases;
        }
        else{
            for(j=0;j<=days_passed();j++){
            }
        }
    }

    //funcion para ordenar la tabla de mayor a menor por orden de contagios
    function sortTable() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("tabla-estados");
        switching = true;
        /* Make a loop that will continue until
        no switching has been done: */
        while (switching) {
            // Start by saying: no switching is done:
            switching = false;
            rows = table.rows;
            /* Loop through all table rows (except the
            first, which contains table headers): */
            for (i = 0; i < (rows.length - 1); i++) {
                // Start by saying there should be no switching:
                shouldSwitch = false;
                /* Get the two elements you want to compare,
                one from current row and one from the next: */
                x = rows[i].getElementsByTagName("td")[2];
                y = rows[i + 1].getElementsByTagName("td")[2];
                // Check if the two rows should switch place:
                if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                /* If a switch has been marked, make the switch
                and mark that a switch has been done: */
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    
        rows = table.rows;
        
        for (i = 0; i < rows.length; i++) {
            rows[i].getElementsByTagName("td")[0].innerText = i + 1;
        }
    }
    
    var lineData = []; //la division de colores se hace por cuantiles
    //lo ordena, hace saltos por cuantiles en 6
    var stepsList;
    var day;
    var days_list = [];
    var nameCol;
    var today_p;
    var today_s;
    var lt;
    var size_slider;
    var casos = 'p';
    var estado_posa;
    var overlay = document.getElementById('map-overlay');
    var total_positivos;
    var total_sospechosos;
    var array_positivos;
    var array_sospechosos;
    var quantile_pos;
    var quantile_sos;
    var thresholdsNum;
    var label_holder = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6']
    var quant_n = 7;
    var toggle_positivo = true;
    var aColl = document.getElementsByClassName('tupla');
    var sos_keys = [];
    var pos_keys = [];
    var month;
    var label_fecha;
    var popup_mes = new mapboxgl.Popup({
        closeButton: false
    });
    var element_touched_a = 'AGS'
    var element_touched_b = 'AGS'
    
    //esto solo es mapbox, configuracion del mapa
    mapboxgl.accessToken = 'pk.eyJ1IjoibWlsZHJlZGciLCJhIjoiY2s4eHc2cGpiMWJsbzNscXEzcTE5dzhtMiJ9.MPadSAVs6Jr1gOs7hfYVpQ';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        /*style: 'mapbox://styles/roponmx/ck8gg4lk807en1ipfsdw472u6', // stylesheet locationdssss
        style: 'mapbox://styles/mildredg/ck8xwex5j19ei1iqkha7x2sko',*/
        style: 'mapbox://styles/mildredg/ck8xwex5j19ei1iqkha7x2sko',
        center: [-105.33083597801148, 25.192387333218626], // starting position [lng, lat]
        zoom: 3.8 // starting zoom
    });
    
    
    //Promise.all(loadFiles).then(function(data) {
        //lt = data[1].columns.length;
        lt = contagios[0].length;
        nameCol = contagios[0];
        today_p = nameCol[(lt - 2)]; // en el orden de columnas siempre van primero los positivos y luego los sospechosos
        //Esto esta tomando el ultimo dia
        today_s = nameCol[(lt - 1)]; 
        size_slider = (lt - 1) / 2; // size of slider, considerando que una columna es positivos y otra negativos, son pares, y la primera es de estados.
        console.log(size_slider);
        //console.log(lt)
        document.getElementById('slider').setAttribute("max", (size_slider-1));
        document.getElementById('slider').setAttribute("value", (size_slider-1));
    
        day = (size_slider-1);
        for (var i = 1; i < nameCol.length; i++){ //toma todos los valores de dias positivos(se toman los valores impares de la tabla)
            if(i%2==0){
                days_list.push(nameCol[i].slice(1,-1));
            }
            pos_keys.push(nameCol[i]); //se guardan en los positivos
            sos_keys.push(nameCol[i+1]); //se guardan en los sospechosos
        }
    
        //console.log(pos_keys)
        //console.log(pos_keys)

        //esto es para poner el formato de fecha con meses
        if (today_p.substr(0, 1)=='m'){
            label_fecha = today_p.substr(1,(today_p.search("p")-1)) + ' de ' + 'Marzo';
    
        }else if(today_p.substr(0, 1)=='a'){
            label_fecha = today_p.substr(1,(today_p.search("p")-1)) + ' de ' + 'Abril';
            
        }else{
            label_fecha = today_p.substr(1,(today_p.search("p")-1)) + ' de ' + 'Mayo';
        }
    
        //Toma los labels, fecha de derecha e izquierda pone el dia mas reciente
        //console.log(label_fecha);
        document.getElementById('fechacorte_l').innerText = label_fecha;
        document.getElementById('fechacorte_r').innerText = label_fecha;
        
    
        //es el json 
        //hace un map de los features
        //esta asignando para cada uno del csv
        //
        //Aqui lo que se tiene que hacer es añadir features a partir del geojson

        
        //console.log(geojson.features);
        //console.log(estado)

        /*
        for(var i = 0;i<names.length;i++){
            geojson[names.length]
            for(var key in geojson.features){
                var name = geojson.features[key].properties.ABREV
                //console.log(name)
            }
        }
        */
        //console.log(geojson.features)

        //Aqui se añaden las nuevas propiedades al geojson, donde se añaden como keys los nombres de columna y valores numericos como value
        var length_d  = nameCol.length;
        for(var key in geojson.features){
            //console.log(estado[key].ABREV)
            for(var i=1;i<(length_d-1);i++){
                var name = geojson.features[key].properties.ABREV
                //console.log(nameCol[i]+":"+estado[name][i])
                //console.log(geojson.features[key].properties.ABREV)
                geojson.features[key].properties[nameCol[i]] = estado[name][i];
                
            }
            //console.log("\n")
        }
        console.log(geojson.features)
        
        
        //calcula el el total de cada columnas de hoy
        var today_n = nameCol.indexOf(today_p);

        total_positivos = 0;
        total_sospechosos = 0;
        array_positivos=[];
        array_sospechosos=[];
        //console.log(estado)

        //for para ir añadiendo los casos en los arrays y las sumatorias del dia de hoy
        for (var key in estado){
            total_positivos+=(estado[key][today_n]);
            //console.log(key+" :"+estado[key][today_n])
            total_sospechosos+=(estado[key][today_n-1]);
            //calcula todos los totales por día por cada columna
            array_positivos.push(estado[key][today_n]);
            array_sospechosos.push(estado[key][today_n-1]);
        }

        //se ordenan de mayor a menor las listas
        array_positivos_s=[];
        array_sospechosos_s=[];

        for(i of array_positivos){
            array_positivos_s.push(i)
        }
        for(i of array_sospechosos){
            array_sospechosos_s.push(i)
        }

        array_positivos_s.sort(function(a, b) {
            return a - b;
        });
        array_sospechosos_s.sort(function(a, b) { // Ordena los datos para sacar cuantiles.
            return a - b;
        });
        //console.log(array_positivos_s)
        //console.log(array_sospechosos_s)
        
        // Seis categorías y partición por cuantiles
    
        //ya ordenados los datos, se toma hasta el 5 y se calcula cuantiles
        var quantile_pos = [array_positivos_s[5], array_positivos_s[10], array_positivos_s[15], array_positivos_s[20], array_positivos_s[25], array_positivos_s[29]]
        for (i = 0; i < label_holder.length; i++) {
            if(i == 0){
                document.getElementById(label_holder[i]).innerHTML = quantile_pos[i] + '-'
            }else if (i >0 && i < (label_holder.length - 1)) {
                document.getElementById(label_holder[i]).innerHTML = quantile_pos[i];
            } else {
                document.getElementById(label_holder[i]).innerHTML = quantile_pos[i] + '+'
            }
        }
        document.getElementById('tot_lab_pos').innerText = numberWithCommas(total_positivos);
        document.getElementById('tot_lab_sos').innerText = numberWithCommas(total_sospechosos);
        thresholdsNum = [array_positivos_s[5], array_positivos_s[10], array_positivos_s[15], array_positivos_s[20], array_positivos_s[25], array_positivos_s[29]];
        var thresholdsColor = ['#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'];
        stepsList = thresholdsNum.map((num, i) => {
            return [num, thresholdsColor[i]];
        });
        var selectedValue, selectedABREV;
        
        // Big and large function to load the layer onto the map
        map.on('load', function() {
            map.addSource('pref', {
                type: 'geojson',
                data: geojson //margedGeoJSON
                
            });
            
            map.addLayer({
                'id': 'pref',
                'type': 'fill',
                'source': 'pref',
                'paint': {
                    'fill-color': '#088',
                    'fill-opacity': 0.8
                },
                'paint': {
                    'fill-color': {
                        property: today_p,//se ponen los datos de hoy
                        stops: stepsList //las particiones
                    },
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        1,
                        1,
                    ],
                    'fill-outline-color': '#bdbdbd'
                }
                //"filter": ['>=', ['number', ['get', 'm24p']], 25]
                // "filter": ['all', [ '==', 'ABREV', 'NONE' ]] // start with a filter that doesn't select anything
    
            });

            //aqui hace el mapa normal no es interactivo
            //console.log(array_positivos)
            var counter =0;
            //se llena las tablas con los datos
            for (var key in estado) {
                document.getElementById(key + '_p').innerHTML = parseInt(array_positivos[counter]);
                //console.log(key+" :"+array_positivos[counter])
                document.getElementById(key + '_s').innerHTML = parseInt(array_sospechosos[counter]);
                counter++;
            };

            //se hace un sort a la tabla en html
            sortTable();


            //Event listener para el slider
            document.getElementById('slider').addEventListener('input', function(e) {
                day = parseInt(e.target.value);
                console.log(day)
                // update the map
                today_p = pos_keys[day];
                today_s = sos_keys[day];
    
                month=today_p.substr(0,1);
                
                total_positivos = 0;
                total_sospechosos =0;

                //console.log(estado)

                //se establecen los valores de total positivo y sospechosos
                for (var key in estado){
                    total_positivos+=(estado[key][today_p]);
                    //console.log(key+" :"+estado[key][today_n])
                    total_sospechosos+=(estado[key][today_s]);
                }
                
                //
                /*
                total_positivos = d3.sum(data[1], function(d) {
                    return +d[today_p];
                });
                total_sospechosos = d3.sum(data[1], function(d) {
                    return +d[today_s];
                });
                */

                //si se activa el boton de positivo 
                if (toggle_positivo) {
                    array_positivos=[];
                    array_sospechosos=[];
                    //console.log(estado)

                    //se establecen los valores de total positivos
                    for (var key in estado){
                        array_positivos.push(estado[key][today_n]);
                    }

                    //se ordenan de mayor a menor
                    array_positivos_s=[];

                    for(i of array_positivos){
                        array_positivos_s.push(i)
                    }

                    array_positivos_s.sort(function(a, b) {
                        return a - b;
                    });

                    /*
                    array_positivos = data[1].map(function(d) {
                        return +d[today_p];
                    });
    
                    array_positivos.sort(function(a, b) {
                        return a - b;
                    });
                    */
                    var quantile_pos = [array_positivos_s[5], array_positivos_s[10], array_positivos_s[15], array_positivos_s[20], array_positivos_s[25], array_positivos_s[29]]
                    for (i = 0; i < label_holder.length; i++) {
                        if(i == 0){
                        document.getElementById(label_holder[i]).innerHTML = quantile_pos[i] + '-'
                    }else if (i >0 && i < (label_holder.length - 1)) {
                        document.getElementById(label_holder[i]).innerHTML = quantile_pos[i];
                    } else {
                        document.getElementById(label_holder[i]).innerHTML = quantile_pos[i] + '+'
                    }
                    }
                    thresholdsNum = [array_positivos_s[5], array_positivos_s[10], array_positivos_s[15], array_positivos_s[20], array_positivos_s[25], array_positivos[29]];
    
                    stepsList = thresholdsNum.map((num, i) => {
                        return [num, thresholdsColor[i]];
                    });

                //esto es para cuando seleccionan sospechosos
                } else {
                    array_sospechosos=[];
                    //console.log(estado)
                    for (var key in estado){
                        array_sospechosos.push(estado[key][today_s]);
                    }

                    //se ordenan de mayor a menor
                    array_sospechosos_s=[];

                    //se establecen los valores de total positivos
                    for(i of array_sospechosos){
                        array_sospechosos_s.push(i)
                    }

                    array_sospechosos_s.sort(function(a, b) { // Ordena los datos para sacar cuantiles.
                        return a - b;
                    });

                    /*
                    array_sospechosos = data[1].map(function(d) {
                        return +d[today_s];
                    });
                    array_sospechosos.sort(function(a, b) {
                        return a - b;
                    });
                    */
                    var quantile_sos = [array_sospechosos_s[5], array_sospechosos_s[10], array_sospechosos_s[15], array_sospechosos_s[20], array_sospechosos_s[25], array_sospechosos_s[29]]
                    for (i = 0; i < label_holder.length; i++) {
                    if(i == 0){
                        document.getElementById(label_holder[i]).innerHTML = quantile_sos[i] + '-'
                    }else if (i >0 && i < (label_holder.length - 1)) {
                        document.getElementById(label_holder[i]).innerHTML = quantile_sos[i];
                    } else {
                        document.getElementById(label_holder[i]).innerHTML = quantile_sos[i] + '+'
                    }
                    }
                    thresholdsNum = [array_sospechosos_s[5], array_sospechosos_s[10], array_sospechosos_s[15], array_sospechosos_s[20], array_sospechosos_s[25], array_sospechosos_s[29]];
                     stepsList = thresholdsNum.map((num, i) => {
                        return [num, thresholdsColor[i]];
                    });
                }
                var rep_edo = {
                    property: month + days_list[day] + casos,
                    stops: stepsList
                };
                map.setPaintProperty('pref', 'fill-color', rep_edo);
                // update text in the UI
                document.getElementById('tot_lab_pos').innerText = numberWithCommas(total_positivos);
                document.getElementById('tot_lab_sos').innerText = numberWithCommas(total_sospechosos);
                
                desired_d = 0;

                 if (today_p.substr(0, 1)=='m'){
                    label_fecha = today_p.substr(1,(today_p.search("p")-1)) + ' de ' + 'Marzo';
    
                }else if(today_p.substr(0, 1)=='a'){
                    label_fecha = today_p.substr(1,(today_p.search("p")-1)) + ' de ' + 'Abril';
                    
                }else{
                    label_fecha = today_p.substr(1,(today_p.search("p")-1)) + ' de ' + 'Mayo';
                }
    
                document.getElementById('fechacorte_l').innerText = label_fecha;
                document.getElementById('fechacorte_r').innerText = label_fecha;
                
                //console.log(array_positivos)
                console.log(estado);
                console.log(today_p);
                for (var key in estado) {
                    document.getElementById(key + '_p').innerHTML = parseInt(estado[key][nameCol.indexOf(today_s)-2]);
                    console.log(estado[key][today_p])
                    //console.log(key+" :"+array_positivos[counter])
                    document.getElementById(key + '_s').innerHTML = parseInt(estado[key][nameCol.indexOf(today_p)]);
                };
                /*
                for (var i = 0; i < data[1].length; i++) {
                    document.getElementById(data[1][i]["ESTADO"] + '_p').innerHTML = parseInt(data[1][i][today_p]);
                    document.getElementById(data[1][i]["ESTADO"] + '_s').innerHTML = parseInt(data[1][i][today_s]);
                };
                */
                sortTable();
            });
    
            btn_g = document.querySelector(".btn-group");
        
            btn_g.addEventListener("click", function(e) {
                if(e.target.matches('.buttonboxp')) {
                    console.log("positivos");
                    toggle_positivo = true;
                    // pos_sos is checked..
                    console.log(day);
                    casos = 'p'
                    today_p = pos_keys[day];


                    array_positivos=[];
                    //console.log(estado)
                    for (var key in estado){
                        array_positivos.push(estado[key][today_p]);
                    }

                    //se ordenan de mayor a menor
                    array_positivos_s=[];

                    for(i of array_positivos){
                        array_positivos_s.push(i)
                    }

                    array_positivos_s.sort(function(a, b) {
                        return a - b;
                    });

                    /*
                    array_positivos = data[1].map(function(d) {
                        return +d[today_p];
                    });
                    array_positivos.sort(function(a, b) {
                        return a - b;
                    });
                    */
                    var i;
                    var quantile_pos = [array_positivos_s[5], array_positivos_s[10], array_positivos_s[15], array_positivos_s[20], array_positivos_s[25], array_positivos_s[29]]
                    for (i = 0; i < label_holder.length; i++) {
                         if(i == 0){
                        document.getElementById(label_holder[i]).innerHTML = quantile_pos[i] + '-'
                    }else if (i >0 && i < (label_holder.length - 1)) {
                        document.getElementById(label_holder[i]).innerHTML = quantile_pos[i];
                    } else {
                        document.getElementById(label_holder[i]).innerHTML = quantile_pos[i] + '+'
                    }
                    }
                    thresholdsNum = [array_positivos_s[5], array_positivos_s[10], array_positivos_s[15], array_positivos_s[20], array_positivos_s[25], array_positivos_s[29]];
                    stepsList = thresholdsNum.map((num, i) => {
                        return [num, thresholdsColor[i]];
                    });
                    var rep_edo = {
                        property: month + days_list[day] + casos,//concatena texto a partir del slider
                        stops: stepsList
                    };
                    map.setPaintProperty('pref', 'fill-color', rep_edo);//funcion de mapbox, responde al slider y redefine
                } else {
                    // pos_sos is not checked..
                    toggle_positivo = false;
                    casos = 's'
                    today_s = sos_keys[day];

                    //se establecen los valores de sospechosos
                    array_sospechosos=[];
                    //console.log(estado)
                    for (var key in estado){
                        array_sospechosos.push(estado[key][today_s]);
                    }

                    //se ordenan de mayor a menor
                    array_sospechosos_s=[];

                    for(i of array_sospechosos){
                        array_sospechosos_s.push(i)
                    }

                    array_sospechosos_s.sort(function(a, b) { // Ordena los datos para sacar cuantiles.
                        return a - b;
                    });

                    /*
                    array_sospechosos = data[1].map(function(d) {
                        return +d[today_s];
                    });
                    array_sospechosos.sort(function(a, b) {
                        return a - b;
                    });
                    */
                    var i;
                    var quantile_sos = [array_sospechosos_s[5], array_sospechosos_s[10], array_sospechosos_s[15], array_sospechosos_s[20], array_sospechosos_s[25], array_sospechosos_s[29]]
                    for (i = 0; i < label_holder.length; i++) {
                         if(i == 0){
                        document.getElementById(label_holder[i]).innerHTML = quantile_sos[i] + '-'
                    }else if (i >0 && i < (label_holder.length - 1)) {
                        document.getElementById(label_holder[i]).innerHTML = quantile_sos[i];
                    } else {
                        document.getElementById(label_holder[i]).innerHTML = quantile_sos[i] + '+'
                    }
                    }
                    thresholdsNum = [array_sospechosos_s[5], array_sospechosos_s[10], array_sospechosos_s[15], array_sospechosos_s[20], array_sospechosos_s[25], array_sospechosos_s[29]];
                     stepsList = thresholdsNum.map((num, i) => {
                        return [num, thresholdsColor[i]];
                    });
                    var rep_edo = {
                        property: month + days_list[day] + casos,
                        stops: stepsList
                    };
                    map.setPaintProperty('pref', 'fill-color', rep_edo);
                }
            });

            //hace efectos del hover

            
            map.addLayer({
                "id": "attribution-layer",
                "type": "circle",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "Feature",
                        "properties": {},
                        "geometry": null
                    }
                }
            });
            map.addLayer({
                'id': 'edo_boundary',
                'type': 'fill',
                'source': 'pref',
                'paint': {
                    "fill-outline-color": "#efedf5",
                    "fill-color": "#bcbddc",
                    "fill-opacity": 0.75
                },
                "filter": ["==", "ABREV", ""]
            });

            
    
            //"filter": ['>=', ['number', ['get', 'm24p']], 25]
            // "filter": ['all', [ '==', 'ABREV', 'NONE' ]] // start with a filter that doesn't select anything
    
            
            map.style.sourceCaches['attribution-layer']._source.attribution = "&copy; <a href='https://escueladegobierno.itesm.mx/'> Estudiantes del Tecnológico de Monterrey </a>";
            /*;-->*/
            
            map.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                        trackUserLocation: true
                })
            );
            map.addControl(new mapboxgl.NavigationControl())
    
            // When the user moves their mouse over the state-fill layer, we'll update the
            // feature state for the feature under the mouse.

            
            map.on("mousemove", function(e) {
                var features = map.queryRenderedFeatures(e.point, {
                    layers: ["pref"]
                });
                if (features.length) {
                    map.setFilter("edo_boundary", ["==", "ABREV", features[0].properties.ABREV]);
                    //document.getElementById(features[0].properties.ABREV).style.background = '#bcbddc';
                    estado_posa = features[0].properties.ABREV;
                } else if (!features.length) {
                    popup_mes.remove();
                    map.setFilter('edo_boundary', ['in', 'ABREV', '']);
                    overlay.style.display = 'none';
                    return;
                } else {
                    map.setFilter("edo_boundary", ["==", "ABREV", ""]);
                } // Remove things if no feature was found.
    
                // Single out the first found feature on mouseove.
                var feature = features[0];
                // Render found features in an overlay.
                overlay.innerHTML = '';
    
                popup_mes.setLngLat(e.lngLat)
                    .setHTML(feature.properties.ABREV + "<br/> <circle r='4' fill='#ff4747'></circle>Confirmados: " + feature.properties[today_p] +"<br/><circle r='4' fill='#ffe73e'></circle>Sospechosos: "+ feature.properties[today_s])
                    .addTo(map);
                document.getElementById(feature.properties.ABREV).style.background = '#393a54';
                var element_touched_c = feature.properties.ABREV
                if (element_touched_c !== element_touched_a) {
                    document.getElementById(element_touched_a).style.background = '#222';
                    element_touched_a = element_touched_c;
                }
            });
            
    //});
    
    //FALTA EDITAR ESTO, ES LA GRAFICA QUE MUESTRA LOS CASOS

    // Empieza parte de D3, el gráfico de la parte izquierda
        /*
       //console.log(nameCol);
        today_p = nameCol[(lt - 2)]; // en el orden de columnas siempre van primero los positivos y luego los sospechosos
        today_s = nameCol[(lt - 1)];
        
    
        var total_cases;
        var month;
        var day_tot;
        var p_str;
        var dias;
    
        for (i = 1; i < lt; i+=2) {
            total_cases = d3.sum(data[1], function(d) {
                   return +d[nameCol[i]];
               });
            month = nameCol[i].substr(0,1);
            p_str = nameCol[i].search("p");
            dias = parseInt(nameCol[i].substr(1,(p_str-1)));
            if (month=="m"){
                lineData.push({date:new Date(2020, 02, dias), nps:total_cases, column:nameCol[i]});
            }else{
                lineData.push({date:new Date(2020, 03, dias), nps:total_cases, column:nameCol[i]});
            }        
          }
    
            lineData.sort(function(a,b){
                return new Date(b.date) - new Date(a.date);
            });
            graphic();
            graphicmovile();
        */
    });
        

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    function graphic() {
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    
        var height  = 0.45*vh;
        var width   = 0.40*vw;;
        var margin = {top: 10, right: 20, bottom: 40, left: 30};
    
        width =     width - margin.left - margin.right;
        height =    height - margin.top - margin.bottom;
    
        var svg = d3.select('#grafico').append("svg")
            .attr("width",  width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");//lo mueve a la izquierda abajo el 0,0 cartesiano
        // set the ranges
        var x = d3.scaleTime().range([0, width]);//proyectar a nuevo rango, del 0 al ancho
        var y = d3.scaleLinear().range([height, 0]); //rango va de la altura a 0
        x.domain(d3.extent(lineData, function(d) { return d.date;}));
    
    
        var yMax = d3.max(lineData, function(d) { return d.nps; }) * 1.05;
        var yMin = d3.min(lineData, function(d) { return d.nps; })* 0.95;
        y.domain([yMin, yMax]);
    
        // Define the div for the tooltip
        var div = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0)
            .style("top", 0);
    
        var valueline = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.nps);  })
            .curve(d3.curveCatmullRom);
    
        svg.append("path")
            .data([lineData]) 
            .attr("class", "line")  
            .attr("d", valueline);
        var label_axis = lineData.map(d=>d.nps);
    
        // Select labels, the last three days, first and middle
        var test = [label_axis[0],label_axis[1], label_axis[2], label_axis[Math.ceil((label_axis.length/2))], label_axis[(label_axis.length-1)]];
    
        //var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("Week %V")).tickValues(lineData.map(d=>d.date));
        var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%m")).ticks(d3.timeDay.every(3));
        var yAxis = d3.axisLeft(y).tickValues(test);
        var formatDate = d3.timeFormat("%d-%m");
    
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)");
    
        //  Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(yAxis);
                
        svg.selectAll(".dot")
            .data(lineData)
            .enter()
            .append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d) { return x(d.date) })
            .attr("cy", function(d) { return y(d.nps) })
            .style('fill', 'darkOrange')
            .attr("r", 8)
            .on("mouseover", function(d) {    
                div.transition()        
                    .duration(200)   
                    .attr("r", 10)   
                    .style("opacity", .9);      
                div.html(formatDate(d.date) + "<br/>"  + d.nps)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");  
                    d3.select(this).attr("r", 12); 
            })                 
            .on("mouseout", function(d) {       
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);
                    d3.select(this).attr("r", 8)
            });
    
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0)
            .attr("text-anchor", "middle")  
            .style("font-size", "14px")
            .style("fill", "white");
    }
    
    
    function graphicmovile() {
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    
        var height  = 0.45*vh;
        var width   = 0.70*vw;
        var margin = {top: 10, right: 10, bottom: 40, left: 40};
    
        //width =     width - margin.left - margin.right;
        //height =    height - margin.top - margin.bottom;
    
        width =    width - margin.right;
        height =   height - margin.bottom;
    
        var svg = d3.select('#graficomov')
            .append("svg")
            .attr("width",  width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        // set the ranges
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);
        x.domain(d3.extent(lineData, function(d) { return d.date;}));
    
        var yMax = d3.max(lineData, function(d) { return d.nps; }) * 1.05;
        var yMin = d3.min(lineData, function(d) { return d.nps; })* 0.95;
        y.domain([yMin, yMax]);
    
        // Define the div for the tooltip
        var div = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0)
            .style("top", 0);
    
        var valueline = d3.line() //cuanto van a valer las lineas, convierte en minimos maximos rangos, tamaño svg
            .x(function(d) { return x(d.date); }) //x es el dominio en d.date
            .y(function(d) { return y(d.nps);  }) //y hace el rango
            .curve(d3.curveCatmullRom);
    
        svg.append("path")
            .data([lineData]) //se le añaden las lineas. cuando esta el punto data toma los datos
            .attr("class", "line")  
            .attr("d", valueline);
        var label_axis = lineData.map(d=>d.nps); //hace los ejes
    
        // Select labels, the last three days, first and middle
        var test = [label_axis[0],label_axis[1], label_axis[2], label_axis[Math.ceil((label_axis.length/2))], label_axis[(label_axis.length-1)]];
    
        //var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("Week %V")).tickValues(lineData.map(d=>d.date));
        var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%m")).ticks(d3.timeDay.every(3));
        var yAxis = d3.axisLeft(y).tickValues(test);
        var formatDate = d3.timeFormat("%d-%m");
    
        svg.append("g") //hace el dibujo
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)");
    
        //  Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(yAxis);
                
        svg.selectAll(".dotm")
            .data(lineData)
            .enter()
            .append("circle") // Uses the enter().append() method
            .attr("class", "dotm") // Assign a class for styling
            .attr("cx", function(d) { return x(d.date) })
            .attr("cy", function(d) { return y(d.nps) })
            .style('fill', 'darkOrange')
            .attr("r", 8)
            .on("mouseover", function(d) {  //add event listener  
                div.transition()  //transicion con duracion      
                    .duration(200)   
                    .attr("r", 10)   
                    .style("opacity", .9);      
                div.html(formatDate(d.date) + "<br/>"  + d.nps)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");  
                    d3.select(this).attr("r", 12); 
            })                 
            .on("mouseout", function(d) {       
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);
                    d3.select(this).attr("r", 8)
            });
    
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0)
            .attr("text-anchor", "middle")  
            .style("font-size", "14px")
            .style("fill", "white");
    }
    });    
},function(objetoError){
    console.log('Error de lectura:'+objetoError.code);
});
