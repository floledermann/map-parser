// this vs. global

// parse trees for different ways of calling a function:
// http://esprima.org/demo/parse.html?code=%2F%2F%20Different%20ways%20of%20calling%20a%20function%0A%0A!function()%7B%0A%7D()%3B%0A%0Avar%20foo%20%3D%20function()%20%7B%7D%3B%0Afoo()%3B%0A%0Afunction%20bar()%20%7B%7D%3B%0Abar()%3B%0A%0Avar%20obj%20%3D%20%7B%0A%09foo%3A%20function()%7B%7D%0A%7D%0Aobj.foo()%3B%0Aobj%5B%22foo%22%5D()%3B%0A

// global function, no tricks
function f1() {
    var global1 = this.document;
    var global2 = window.document;
    var global3 = document;
};
foo();

// anonymous invocation
!function() {
    var global1 = this.document;
    var global2 = window.document;
    var global3 = document;
}();

// global variables overridden by local ones
function f2() {
    var window = {document: {}};
    var document = {};
    var global1 = this.document;
    var local1 = window.document;
    var local2 = document;
}
f2();

// global function invoked through "call" to establish a this context
function f3() {
    var local1 = this.document;
}
f3.call({document: {}});

// object method
var obj1 = {
    document: {},
    func: function() {
        var local1 = this.document;
        var global1 = window.document;
        var global2 = document;
    }
}
obj1.func();

// ambiguous: global function called both in gloabl and object context
function f5() {
    var globalOrLocal = this.document;
}
var obj2 = {
    document: {},
    func: f5
}
obj2.func();
f5();

// ambiguous: object method called globally

var obj3 = {
    document: {},
    func: function() {
        var globalOrLocal = this.document;
    }
}
obj3.func();
var f6 = obj3.func;
f6();

// TODO: constructor, prototype method

