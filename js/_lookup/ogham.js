let initLoad = () => {
    let query =
        "SELECT DISTINCT ?stone ?label ?comment ?id ?siteLabel ?wd ?townland ?county ?country ?barony ?province WHERE { ?stone a oghamonto:OghamStone . ?stone rdfs:label ?label. ?stone rdfs:comment ?comment. ?stone oghamonto:exactMatch ?wd. ?stone dc:identifier ?id. ?stone oghamonto:disclosedAt ?site. ?site rdfs:label ?siteLabel. ?site oghamonto:label_townland ?townland. ?site oghamonto:label_county ?county. ?site oghamonto:label_county ?county. ?site oghamonto:label_province ?province. ?site oghamonto:label_barony ?barony. ?site oghamonto:label_country ?country. } ORDER BY ASC(?label)";
    jump("header");
    $("#span-count").html("loading...");
    $("#span-loading").html("loading...");
    RDF4J.query2(query, showTiles);
};

let showTiles = (data) => {
    bindings = data.results.bindings;
    $("#content").html("");
    let searchResultsDiv = "";
    let i = 0;
    objectidlist = [];
    for (item in bindings) {
        clickedKachel = bindings[item].stone.value;
        searchResultsDiv += "<div class='box-resultkacheln box-object' id='" + bindings[item].stone.value + "' onclick='openDetail(\"" + bindings[item].wd.value + "\")'>";
        let name = "";
        let nameLength = 250;
        if (bindings[item].label.value.length > nameLength) {
            name = bindings[item].label.value.replace("@en", "").substring(0, nameLength) + " ...";
        } else {
            name = bindings[item].label.value.replace("@en", "");
        }
        searchResultsDiv += "<div class='box-header-div' style='text-align:center;'>";
        searchResultsDiv += "<span style='width:100%;margin-bottom:10px;float:left;'><b>" + name + "</b></span>";
        searchResultsDiv += "<span style='width:100%;margin-bottom:10px;float:left;'><i style='font-size:13px;'>" + bindings[item].comment.value.replace("@en", "") + "</i></span>";
        searchResultsDiv += "<span style='width:100%;margin-bottom:10px;float:left;'><i style='font-size:13px;'>Identifier: " + bindings[item].id.value + " | Wikidata ID: " + bindings[item].wd.value.replace("http://www.wikidata.org/entity/", "") + "</i></span>";
        searchResultsDiv += "<span style='width:100%;margin-bottom:10px;float:left;'><b>disclosed at</b></span>";
        searchResultsDiv += "<span style='width:100%;margin-bottom:10px;float:left;'><i style='font-size:13px;'>" + bindings[item].siteLabel.value.replace("@en", "") + "</i></span>";
        searchResultsDiv += "<span style='width:100%;margin-bottom:10px;float:left;'><i style='font-size:13px;'>" + bindings[item].townland.value.replace("@en", "") + ", Barony " + bindings[item].barony.value.replace("@en", "") + ", Co. " + bindings[item].county.value.replace("@en", "") + "</i></span>";
        searchResultsDiv += "<span style='width:100%;margin-bottom:10px;float:left;'><i style='font-size:13px;'>" + bindings[item].province.value.replace("@en", "") + ", " + bindings[item].country.value.replace("@en", "") + "</i></span>";
        searchResultsDiv += "</div>";
        searchResultsDiv += "</div>";
        objectidlist.push(bindings[item].stone.value.replace("http://lod.ogham.link/data/", "ogham:"));
        i++;
    }
    $("#span-count").html("Total <b style='color:#621e4b;'>" + i + "</b> Ogham Stones");
    $("#span-loading").html("loading...");
    $("#content").append(searchResultsDiv);
    loadCategory1();
};

// load categories

let loadCategory1 = (response) => {
    stonelist = objectidlist.toString();
    let query = "SELECT DISTINCT (count(distinct ?stone) as ?count) ?id ?label WHERE { FILTER (?stone IN (" + stonelist + ")) ?id rdfs:subClassOf oghamonto:OghamStone. ?id rdfs:label ?label. ?stone a ?id . } GROUP BY ?id ?label HAVING (count(distinct ?stone) > 0) ORDER BY DESC(?count) ASC(?label)";
    RDF4J.query2(query, loadCategory2);
};

let loadCategory2 = (response) => {
    $("#panel-type").empty();
    data = response.results.bindings;
    for (item in data) {
        $("#panel-type").append("<ul class='list-group panel-item2' id='" + data[item].id.value + "' onclick='selectKey(\"" + data[item].id.value + "\",\"" + data[item].label.value.replace("@en", "") + "\",\"" +
            "stone-type" +
            "\");'><li class='list-group-item panel-item'><span class='badge'>" + data[item].count.value + "</span>" + data[item].label.value.replace("@en", "") + "</li></ul>");
    }
    let query = "SELECT DISTINCT (count(distinct ?stone) as ?count) ?id ?label WHERE { FILTER (?stone IN (" + stonelist + ")) ?id a oghamonto:OghamSite. ?id rdfs:label ?label. ?stone oghamonto:disclosedAt ?id. } GROUP BY ?id ?label HAVING (count(distinct ?stone) > 0) ORDER BY DESC(?count) ASC(?label)";
    RDF4J.query2(query, loadCategory3);
};

let loadCategory3 = (response) => {
    $("#panel-site").empty();
    data = response.results.bindings;
    for (item in data) {
        $("#panel-site").append("<ul class='list-group panel-item2' id='" + data[item].id.value + "' onclick='selectKey(\"" + data[item].id.value + "\",\"" + data[item].label.value.replace("@en", "") + "\",\"" +
            "stone-site" +
            "\");'><li class='list-group-item panel-item'><span class='badge'>" + data[item].count.value + "</span>" + data[item].label.value.replace("@en", "") + "</li></ul>");
    }
    // end
    $("#span-loading").html("loaded!");
};

let labelclass = "";

let selectKey = (key, label, attribute) => {
    let multiple = false;
    for (attr in keylist) {
        if (keylist[attr][0] === key) {
            multiple = true;
        }
    }
    if (multiple === false) {
        if (attribute !== "substr") {
            keylist.push([key, label, attribute]);
            //console.log("keylist", keylist);
            labelclass = "label-green";
        }
        $("#div-keys").append("<div class='" + labelclass + " deletekey' style='clear:both;width:100%;font-size:11px;margin-bottom:5px;' onclick='deleteKey(\"" + key + "\");' id='k-" + key +
            "'><div style='float:left;width:100%;font-style: italic;color:white;text-align:center;padding-top:7px;padding-bottom:7px;'>" + attribute.replace("-", " ") +
            "</div><div style='width:100%;font-weight:600;color:white;text-align:center;padding-top:7px;padding-bottom:7px;'>" + label.replace("@en", "") + "</span></div>");
    }
    let query =
        "SELECT DISTINCT ?stone ?label ?comment ?id ?siteLabel ?wd ?townland ?county ?country ?barony ?province WHERE { ?stone a oghamonto:OghamStone . ?stone rdfs:label ?label. ?stone rdfs:comment ?comment. ?stone oghamonto:exactMatch ?wd. ?stone dc:identifier ?id. ?stone oghamonto:disclosedAt ?site. ?site rdfs:label ?siteLabel. ?site oghamonto:label_townland ?townland. ?site oghamonto:label_county ?county. ?site oghamonto:label_county ?county. ?site oghamonto:label_province ?province. ?site oghamonto:label_barony ?barony. ?site oghamonto:label_country ?country. ##value## } ORDER BY ASC(?label)";
    let attributes = "";
    let stone_type = false;
    let stone_site = false;
    let keyindex = -1;
    for (attr in keylist) {
        keyindex++;
        if (keylist[attr][2] === "stone-type" && stone_type == false) {
            stone_type = true;
            attributes += "?stone a " + keylist[attr][0] + ". ";
        } else if (keylist[attr][2] === "stone-type" && stone_type == true) {
            attributes += "FILTER EXISTS { ?stone a" + keylist[attr][0] + ". } ";
        }
        if (keylist[attr][2] === "stone-site" && stone_site == false) {
            stone_site = true;
            attributes += "?stone oghamonto:disclosedAt " + keylist[attr][0] + ". ";
        } else if (keylist[attr][2] === "feature-obsitem" && stone_site == true) {
            attributes += "FILTER EXISTS { ?stone oghamonto:disclosedAt" + keylist[attr][0] + ". } ";
        }
    }
    query = query.replace("##value##", attributes);
    jump("header");
    $("#span-count").html("loading...");
    $("#span-loading").html("loading...");
    console.log("query", query);
    RDF4J.query2(query, showTiles);
};

let deleteKey = (key) => {
    //console.log("sort", SORT);
    let index = -1;
    let i = 0;
    for (attr in keylist) {
        if (keylist[attr][0] === key) {
            index = i;
        }
        i++;
    }
    keylist.splice(index, 1);
    //console.log("keylist", keylist);
    let el = document.getElementById("k-" + key);
    el.remove();
    let query =
        "SELECT DISTINCT ?stone ?label ?comment ?id ?siteLabel ?wd ?townland ?county ?country ?barony ?province WHERE { ?stone a oghamonto:OghamStone . ?stone rdfs:label ?label. ?stone rdfs:comment ?comment. ?stone oghamonto:exactMatch ?wd. ?stone dc:identifier ?id. ?stone oghamonto:disclosedAt ?site. ?site rdfs:label ?siteLabel. ?site oghamonto:label_townland ?townland. ?site oghamonto:label_county ?county. ?site oghamonto:label_county ?county. ?site oghamonto:label_province ?province. ?site oghamonto:label_barony ?barony. ?site oghamonto:label_country ?country. ##value## } ORDER BY ASC(?label)";
    let attributes = "";
    let stone_type = false;
    let stone_site = false;
    let keyindex = -1;
    for (attr in keylist) {
        keyindex++;
        if (keylist[attr][2] === "stone-type" && stone_type == false) {
            stone_type = true;
            attributes += "?stone a " + keylist[attr][0] + ". ";
        } else if (keylist[attr][2] === "stone-type" && stone_type == true) {
            attributes += "FILTER EXISTS { ?stone a" + keylist[attr][0] + ". } ";
        }
        if (keylist[attr][2] === "stone-site" && stone_site == false) {
            stone_site = true;
            attributes += "?stone oghamonto:disclosedAt " + keylist[attr][0] + ". ";
        } else if (keylist[attr][2] === "feature-obsitem" && stone_site == true) {
            attributes += "FILTER EXISTS { ?stone oghamonto:disclosedAt" + keylist[attr][0] + ". } ";
        }
    }
    query = query.replace("##value##", attributes);
    jump("header");
    $("#span-count").html("loading...");
    $("#span-loading").html("loading...");
    RDF4J.query2(query, showTiles);
};

/* map things */

var mymap;

let loadMap = () => {
    $("#content").html("");
    $("#content").html("<div id='mapid'></div>");
    mymap = L.map('mapid').setView([53.423889, -7.942222], 6);
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 1,
        maxZoom: 16,
        ext: 'jpg'
    }).addTo(mymap);
    let query = "SELECT DISTINCT ?stone ?label ?site ?geom ?sitelabel ?county WHERE { ?stone a oghamonto:OghamStone. ?stone rdfs:label ?label. ?stone oghamonto:disclosedAt ?site. ?site oghamonto:representativePoint ?_geom. ?_geom geosparql:asWKT ?geom. ?site rdfs:label ?sitelabel. ?site oghamonto:label_county ?county. } ORDER BY ASC(?label)";
    RDF4J.query2(query, setMarker);
};

let setMarker = (data) => {
    let bindings = data.results.bindings;
    var markers = L.markerClusterGroup();
    for (item in bindings) {
        let geom = bindings[item].geom.value;
        geom = geom.replace("POINT(", "").replace(")", "");
        if (!geom.includes(" ")) {
            console.log(bindings[item].label.value);
        } else {
            let splitgeom = geom.split(" ");
            let marker;
            if (bindings[item].label.value.includes("CIIC")) {
                marker = L.marker([splitgeom[1], splitgeom[0]], {
                    icon: greenIcon
                });
            } else if (bindings[item].label.value.includes("CISP")) {
                marker = L.marker([splitgeom[1], splitgeom[0]], {
                    icon: orangeIcon
                });
            } else if (bindings[item].label.value.includes("3D")) {
                marker = L.marker([splitgeom[1], splitgeom[0]], {
                    icon: violetIcon
                });
            } else if (bindings[item].label.value.includes("Squirrel")) {
                marker = L.marker([splitgeom[1], splitgeom[0]], {
                    icon: goldIcon
                });
            } else {
                marker = L.marker([splitgeom[1], splitgeom[0]], {
                    icon: blackIcon
                });
            }
            marker.bindPopup("<b>" + bindings[item].label.value.replace("@en", "") + "</b><br>" + bindings[item].sitelabel.value.replace("@en", "") + "</b><br><i>County " + bindings[item].county.value.replace("@en", "") + "</i>");
            markers.addLayer(marker);
        }
    }
    mymap.addLayer(markers);
};