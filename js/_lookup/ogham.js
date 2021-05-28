let initLoad = () => {
    //console.log("sort", SORT);
    let query =
        "SELECT DISTINCT ?stone ?label ?comment ?id ?siteLabel ?townland ?county WHERE { ?stone a oghamonto:OghamStone . ?stone rdfs:label ?label. ?stone rdfs:comment ?comment. ?stone oghamonto:exactMatch ?wd. ?stone dc:identifier ?id. ?stone oghamonto:disclosedAt ?site. ?site rdfs:label ?siteLabel. ?site oghamonto:label_townland ?townland. ?site oghamonto:label_county ?county. } ORDER BY ASC(?label)";
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
        searchResultsDiv += "<div class='box-resultkacheln box-object' id='" + bindings[item].stone.value + "' onclick='openDetail(\"" + bindings[item].stone.value + "\")'>";
        let name = "";
        let nameLength = 250;
        if (bindings[item].label.value.length > nameLength) {
            name = bindings[item].label.value.replace("@en", "").substring(0, nameLength) + " ...";
        } else {
            name = bindings[item].label.value.replace("@en", "");
        }
        searchResultsDiv += "<div class='box-header-div' style='text-align:center;'><b>" + name + "</b><br><span><i style='font-size:13px;'>" + bindings[item].id.value.replace("@en", "") + "</i> [" + bindings[item].comment.value.replace("@en",
            "") + "]</span></div>";
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
        "SELECT DISTINCT ?stone ?label ?comment ?id ?siteLabel ?townland ?county WHERE { ?stone a oghamonto:OghamStone . ?stone rdfs:label ?label. ?stone rdfs:comment ?comment. ?stone oghamonto:exactMatch ?wd. ?stone dc:identifier ?id. ?stone oghamonto:disclosedAt ?site. ?site rdfs:label ?siteLabel. ?site oghamonto:label_townland ?townland. ?site oghamonto:label_county ?county. ##value## } ORDER BY ASC(?label)";
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
    if ($("#inp-search").val().length > -1) {
        attributes += "FILTER(regex(?id, '" + $("#inp-search").val() + "', 'i') || regex(?label, '" + $("#inp-search").val() + "', 'i')) ";
    }
    query = query.replace("##value##", attributes);
    jump("header");
    $("#span-count").html("loading...");
    $("#span-loading").html("loading...");
    console.log("query", query);
    RDF4J.query2(query, showTiles);
    if ($("#inp-search").val().length > 0) {
        $("#inp-search").focus();
    }
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
        "SELECT DISTINCT ?stone ?label ?comment ?id ?siteLabel ?townland ?county WHERE { ?stone a oghamonto:OghamStone . ?stone rdfs:label ?label. ?stone rdfs:comment ?comment. ?stone oghamonto:exactMatch ?wd. ?stone dc:identifier ?id. ?stone oghamonto:disclosedAt ?site. ?site rdfs:label ?siteLabel. ?site oghamonto:label_townland ?townland. ?site oghamonto:label_county ?county. ##value## } ORDER BY ASC(" +
        SORT + ")";
    let attributes = "";
    let featurestatement_bool = false;
    let featureobsitem_bool = false;
    let keyindex = -1;
    for (attr in keylist) {
        keyindex++;
        if (keylist[attr][2] === "feature-statement" && featurestatement_bool == false) {
            featurestatement_bool = true;
            attributes += "?interpretation crm:P67_refers_to ?argument_" + keyindex + ". ?argument_" + keyindex + " crm:P67_refers_to " + keylist[attr][0] + ". ";
        } else if (keylist[attr][2] === "feature-statement" && featurestatement_bool == true) {
            attributes += "FILTER EXISTS { ?interpretation crm:P67_refers_to ?argument_" + keyindex + ". ?argument_" + keyindex + " crm:P67_refers_to " + keylist[attr][0] + ". } ";
        }
        if (keylist[attr][2] === "feature-obsitem" && featureobsitem_bool == false) {
            featureobsitem_bool = true;
            attributes += "?interpretation crm:P67_refers_to ?argument_" + keyindex + ". ?argument_" + keyindex + " crm:P67_refers_to ?obs1_" + keyindex + ". ?obs1_" + keyindex + " sci:O8_observed ?obs2_" + keyindex + ". ?obs2_" + keyindex +
                " crm:P2:has_type " + keylist[attr][0] + ". "
        } else if (keylist[attr][2] === "feature-obsitem" && featureobsitem_bool == true) {
            attributes += "FILTER EXISTS { ?interpretation crm:P67_refers_to ?argument_" + keyindex + ". ?argument_" + keyindex + " crm:P67_refers_to ?obs1_" + keyindex + ". ?obs1_" + keyindex + " sci:O8_observed ?obs2_" + keyindex + ". ?obs2_" +
                keyindex + " crm:P2:has_type " + keylist[attr][0] + ". } ";
        }
        //console.log(attributes);
    }
    if ($("#inp-search").val().length > -1) {
        attributes += "FILTER(regex(?identifier, '" + $("#inp-search").val() + "', 'i') || regex(?label, '" + $("#inp-search").val() + "', 'i')) ";
    }
    query = query.replace("##value##", attributes);
    jump("header");
    $("#span-count").html("loading...");
    $("#span-loading").html("loading...");
    if (keylist.length === 0 && $("#inp-search").val().length == 0) {
        initLoad();
    } else {
        RDF4J.query2(query, showTiles);
    }
    if ($("#inp-search").val().length > -1) {
        document.getElementById("inp-search").focus();
        document.getElementById("inp-search").select();
    }
};