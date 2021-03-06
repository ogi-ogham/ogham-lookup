let SORT = "?label";
let RESULT_STYLE = "box";
let tmpSelectedKey;
let stonelist = "";
let keylist = [];
let objectidlist = [];

let jump = (h) => {
    var url = location.href; //Save down the URL without hash.
    location.href = "#" + h; //Go to the target element.
    history.replaceState(null, null, url); //Don't like hashes. Changing it back.
}

let ArrNoDupe = (a) => {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
};

let openDetail = (id) => {
    window.open(id, '_blank');
}

$(".q_sty").change(function() {
    let selValue = $("input:radio[name='optstyle']:checked").val();
    RESULT_STYLE = selValue;
    if (RESULT_STYLE.includes("map")) {
        loadMap();
    } else {
        initLoad();
    }
});