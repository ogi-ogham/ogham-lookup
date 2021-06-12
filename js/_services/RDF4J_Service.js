let RDF4J = {};

RDF4J.PREFIXES =
    "PREFIX oghamonto: <http://ontology.ogham.link/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX ogham: <http://lod.ogham.link/data/> PREFIX geosparql: <http://www.opengis.net/ont/geosparql#>";

RDF4J.query2 = (sparql, callback) => {
    setTimeout(function() {
        console.log(RDF4J.PREFIXES + sparql);
        $.ajax({
            url: "https://java-dev.rgzm.de/rdf4j-server/repositories/og",
            type: 'POST',
            data: {
                queryLn: 'SPARQL',
                query: RDF4J.PREFIXES + sparql,
                Accept: 'application/json'
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            },
            success: function(response) {
                try {
                    response = JSON.parse(response);
                } catch (e) {}
                var vars = response.head.vars;
                var bindings = response.results.bindings;
                const bindings_copy = Object.assign({}, bindings);
                for (var item in bindings) {
                    for (var varstr in vars) {
                        var tblTxt = "";
                        if (bindings[item][vars[varstr]].type === "uri") {
                            var val = bindings[item][vars[varstr]].value;
                            val = val.replace("http://ontology.ogham.link/", "oghamonto:");
                            val = val.replace("http://lod.ogham.link/data/", "ogham:");
                            val = val.replace("http://www.w3.org/2000/01/rdf-schema#", "rdfs:");
                            val = val.replace("http://purl.org/dc/elements/1.1/", "dc:");
                            bindings_copy[item][vars[varstr]].value = val;
                        } else if (bindings[item][vars[varstr]]["xml:lang"]) {
                            bindings_copy[item][vars[varstr]].value = bindings[item][vars[varstr]].value + "@" + bindings[item][vars[varstr]]["xml:lang"];
                        } else if (bindings[item][vars[varstr]].type === "bnode") {
                            bindings_copy[item][vars[varstr]].value = "_:" + bindings[item][vars[varstr]].value;
                        } else {
                            bindings_copy[item][vars[varstr]].value = bindings[item][vars[varstr]].value
                        }
                    }
                }
                response.results.bindings = bindings_copy;
                if (typeof callback === 'function') {
                    callback(response);
                } else {
                    return response;
                }
            }
        });
    }, 100);
};