// module pattern (taken from d3)

!function() {
    var d3 = {};
    var d3_document = this.document;
    if (d3_document) {
        d3_document.createElement("DIV").style.setProperty("opacity", 0, "");
        d3.draw = function(color) {
            var el = d3_document.createElement("DIV");
            el.style.backgroundColor = color;
            d3.foo = "bar";
        }
    }
    this.d3 = d3;
}();

d3.draw('#ffffff');

document.createElement("DIV");

foo = "bar";