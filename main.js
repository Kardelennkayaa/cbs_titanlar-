// Custom variables
var clickedCoord = []
var clickedCoord_lineString = []
var clickedCoord_json = []

var jsonSource = new ol.source.Vector();

var points = [],
    msg_el = document.getElementById('msg'),
    url_osrm_nearest = '//router.project-osrm.org/nearest/v1/driving/',
    url_osrm_route = '//router.project-osrm.org/route/v1/driving/',
    icon_url = '//cdn-icons-png.flaticon.com/512/1042/1042263.png',
    vectorSource = new ol.source.Vector(),
    vectorLayer = new ol.layer.Vector({
      source: vectorSource
    }),
    styles = {
      route: new ol.style.Style({
        stroke: new ol.style.Stroke({
          width: 6, color: [40, 40, 40, 0.8]
        })
      }),
      icon: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          scale: 0.1,
          src: icon_url
        })
      })
    };

//console.clear();

var view =  new ol.View({
  center: [3649496.1897048946, 4855228.631013796],
  zoom: 10.5
    })


// Basemap layer
var basemapLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
        layer:'terrain'
    })
  })
// Layers Array
var layerArray = [basemapLayer]
// Initiating Map


var map = new ol.Map({
    target : 'mymap',
    view :view,
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
    }), vectorLayer]
});



var draw_route = function(pixel){
  map.on('click', function (evt) { 
    utils.getNearest(evt.coordinate).then(function(coord_street){
      var last_point = points[points.length - 1];
      var points_length = points.push(coord_street);

      utils.createFeature(coord_street);

      if (points_length < 2) {
        msg_el.innerHTML = 'Click to add another point';
        return;
      }

      //get the route
      var point1 = last_point.join();
      var point2 = coord_street.join();
      
      fetch(url_osrm_route + point1 + ';' + point2).then(function(r) { 
        return r.json();
      }).then(function(json) {
        if(json.code !== 'Ok') {
          msg_el.innerHTML = 'No route found.';
          return;
        }
        msg_el.innerHTML = 'Use the "Add Route" button to save your route to the database';
        //points.length = 0;
        utils.createRoute(json.routes[0].geometry);
      });
    });
  });
};

var utils = {
  getNearest: function(coord){
    var coord4326 = utils.to4326(coord);    
    return new Promise(function(resolve, reject) {
      //make sure the coord is on street
      fetch(url_osrm_nearest + coord4326.join()).then(function(response) { 
        // Convert to JSON
        return response.json();
      }).then(function(json) {
        if (json.code === 'Ok') resolve(json.waypoints[0].location);
        else reject();
      });
    });
  },
  createFeature: function(coord) {
    var feature = new ol.Feature({
      type: 'place',
      geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
    });
    feature.setStyle(styles.icon);
    jsonSource.addFeature(feature);
  },
  createRoute: function(polyline) {
    // route is ol.geom.LineString
    var route = new ol.format.Polyline({
      factor: 1e5
    }).readGeometry(polyline, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    var feature = new ol.Feature({
      type: 'route',
      geometry: route
    });
    feature.setStyle(styles.route);
    vectorSource.addFeature(feature);
  },
  to4326: function(coord) {
    return ol.proj.transform([
      parseFloat(coord[0]), parseFloat(coord[1])
    ], 'EPSG:3857', 'EPSG:4326');
  }
};


const highlightStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: '#EEE',
  }),
  stroke: new ol.style.Stroke({
    color: '#3399CC',
    width: 2,
  }),
});

var jsonSource = new ol.source.Vector();
var vector = new ol.layer.Vector({
  source: jsonSource,
  background: 'white',
});
map.addLayer(vector)


var jsonSource_ank = new ol.source.Vector({
  url: 'https://raw.githubusercontent.com/Kardelennkayaa/heroku_app/main/ankara_road.json',
  format: new ol.format.GeoJSON(),
});

var vector_ank = new ol.layer.Vector({
  source: jsonSource_ank,
  background: 'white',
});
map.addLayer(vector_ank)

map.addInteraction(
  new ol.interaction.Snap({
    source: jsonSource_ank,
    //pixelTolerance: 50,
  })
);

let select = null; // ref to currently selected interaction

const selected_slc = new ol.style.Style({
  fill: new ol.style.Fill({
    color: '#eeeeee',
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});


const selected = new ol.style.Style({
  fill: new ol.style.Fill({
    color: '#eeeeee',
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});




var modify_ank = new ol.interaction.Modify({
  source: jsonSource_ank
});
map.addInteraction(modify_ank);


//  1. To define a source
var drawSource = new ol.source.Vector()



var drawLayer = new ol.layer.Vector({
    source:drawSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
          color: '#F61D1D',
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 4,
          fill: new ol.style.Fill({
            color: '#F61D1D',
          }),
        }),
    })      
})


// 4. Adding on map
map.addLayer(drawLayer)





// Initiate a draw interaction
var draw = new ol.interaction.Draw({
    type : 'Point',
    source:drawSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
          color: '#F61D1D',
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 4,
          fill: new ol.style.Fill({
            color: '#F61D1D',
          }),
        }),
    })
})
draw.on('drawstart', function(evt){
    drawSource.clear()
})
draw.on('drawend',function(evt){
    clickedCoord = evt.feature.getGeometry().getCoordinates() 
    $('#pointadding').modal('show');
    console.log('clicked at', evt.feature.getGeometry().getCoordinates() )
    map.removeInteraction(draw)
})

// Function that enables draw interaction

function startDrawing(){
// add interaction to the map
map.addInteraction(draw)
}

const clear = document.getElementById('clear');
clear.addEventListener('click', function() {
  drawSource.clear();
  vectorSource.clear();
  jsonSource.clear();
}); 

const format = new ol.format.GeoJSON({featureProjection: 'EPSG:3857'});
const download = document.getElementById('download');

drawSource.on('change', function() {
  const features = drawSource.getFeatures();
  const json = format.writeFeatures(features);
  download.href = 'data:text/json;charset=utf-8,' + json;
});

vectorSource.on('change', function() {
  const features_route = vectorSource.getFeatures();
  const json_route = format.writeFeatures(features_route);
  download.href = 'data:text/json;charset=utf-8,' + json_route;
});

function visualize() {
  location.replace("https://visualizeminibusroutes.herokuapp.com/")
}




function SaveDatatodb(){
    var location = document.getElementById('location').value;
    var recorder = document.getElementById('recorder').value;
    var clickedCoord_lonlat = ol.proj.toLonLat(clickedCoord)
    var long = clickedCoord_lonlat[0];
    var lat = clickedCoord_lonlat[1];
    var minibus_name = document.getElementById('minibus_name').value;
    if (location != '' && recorder != '' && long != '' && lat != '' && minibus_name != '' ){
      $('#pointadding').modal('hide');
        $.ajax({
            url:'save.php',
            type:'POST',
            data :{
                userloc : location,
                userrecorder : recorder,
                userlong : long,
                userlat : lat,
                userminibus_name : minibus_name
            },
            success : function(dataResult){
                var dataResult = JSON.stringify(dataResult);
                if (dataResult.statusCode == 200){
                    
                    //$('#pointadding').modal('hide');
                } else {
                    
                }
            }
        })
        alert('New Station is added!')
    } else {
        alert('Please fill in the blank fields!')
    }


}


function startDrawing_route(){
  // add interaction to the map
  map.on('click', function (evt) {
    draw_route(evt.pixel);
    window.addEventListener('contextmenu', (event) => {
      $('#route_adding').modal('show')
    })
  });
  };

function SaveDatatodb_route(){

  var feature = vectorSource.getFeatures();
  //var geometry = feature[0].getGeometry();
  //var distance = ol.sphere.getLength(geometry);
  var format = new ol.format.GeoJSON();
  var featureArray = vectorSource.getFeatures()
  var json = format.writeFeaturesObject(featureArray);
  var geojsonFeatureArray = json.features
  //var distance = ol.sphere.getLength(polyline);
  var distance = 0;
  var geom_list = [];
  //alert(feature.length)
  for (let i = 0; i < feature.length; i++) {
    var geometry = feature[i].getGeometry();
    var total_distance = ol.sphere.getLength(geometry);
    distance += total_distance;
  };
  var geom ='';
  //var geom_json = [];
  for (let j = 0; j < geojsonFeatureArray.length; j++) {
    var geom_str = JSON.stringify(geojsonFeatureArray[j].geometry)
    geom_list.push(geom_str);
    geom += geom_list[j]

  };
  var geom = geom.replaceAll(']}{"type":"LineString","coordinates":[', ',');
  var location = document.getElementById('location_route').value;
  var recorder = document.getElementById('recorder_route').value;
  var minibus_name = document.getElementById('minibus_name_route').value;
  if (location != '' && recorder != '' && geom != '' &&  minibus_name != '' &&  distance != '')   {
    $('#route_adding').modal('hide')
        $.ajax({
            url:'save_ls.php',
            type:'POST',
            data :{
                userloc : location,
                userrecorder : recorder,
                user_distance : distance,
                user_json : geom,
                userminibus_name : minibus_name,
            },
            success : function(dataResult3){
                var dataResult3 = JSON.stringify(dataResult3);
                if (dataResult3.statusCode == 200){
                } else {  
                }
            }
        })
        alert('New Route is added!')
    } else {
        alert('Please fill in the blanks!')
    }
}

function creatingGeojson(arrayofdata){
  var format = new ol.format.WKT();
  var color_list = ['#FF69B4','#000000','#A52A2A','#8A2BE2','#DEB887','#D2691E','#6495ED','#008B8B','#00008B','#B8860B','#8B008B',
  '#FF8C00','#9932CC','#E9967A','#8B0000','#BDB76B','#2F4F4F','#FF1493','#B22222','#FF00FF','#1E90FF','#008000','#FFD700','#4B0082','#F08080',
  '#191970'];
  var list_location = [];
  for (let j = 0; j < arrayofdata.length; j++) {
    var geom_object = arrayofdata[j].geom_text;
    //alert(geom_object)
    var wkt_line = geom_object;
    feature = format.readFeature(wkt_line, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
    feature.setStyle(
        new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: color_list[j],
                width: 5
            })
        })
    );
    var route_source = new ol.source.Vector();
    var vectorLayer_route = new ol.layer.Vector({
      source: route_source,
      });
    map.addLayer(vectorLayer_route)
    route_source.addFeature(feature);
    var coords = feature.getGeometry().getCoordinates();
    var markerGeometry = new ol.geom.Point(ol.proj.transform([coords[0][0], coords[0][1]], 'EPSG:4326','EPSG:4326'));
    var markerFeature = new ol.Feature({
        geometry: markerGeometry,
    });

    var markerStyle = new ol.style.Icon(({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        scale: 0.1,
        //imgSize: [32, 48],
        src: 'https://cdn-icons-png.flaticon.com/512/1042/1042263.png',
    }));
    markerFeature.setStyle(new ol.style.Style({
        image: markerStyle,
    }));
    route_source.addFeature(markerFeature)
    var markerLayer = new ol.layer.Vector({
        title: "RoutePoint",
        visible: true,
        source: route_source
    });

    map.addLayer(markerLayer);

    var location=arrayofdata[j].location;
    list_location.push(location);
  };

  var unique_location = [];
  unique_location.push("Choose Route Name");
  $.each(list_location, function(i, el){
    if($.inArray(el, unique_location) === -1) unique_location.push(el);
    });
  select_loc = document.getElementById("location_options");
  for(index in unique_location) {
    select_loc.options[select_loc.options.length] = new Option(unique_location[index], unique_location[index]);
  }
  $('.dropdown-menu').on('click', function(e) {
    e.stopPropagation();
  });
};

function delete_path(){
  var location_name = document.getElementById('location_options').value
  if (location_name != '')   {
        $.ajax({
            url:'delete_ls.php',
            type:'POST',
            data :{
              delete_ls: location_name
            },
            success : function(dataResult3){
                var dataResult3 = JSON.stringify(dataResult3);
                if (dataResult3.statusCode == 200){
                    
                    //$('#route_adding').modal('hide');
                } else {
                    
                }
            }
        })
        alert('Güzergah silme işlemi başarılı!')
    } else {
        alert('Güzergah silme işlemi başarısız!')
    }

}


