var a = 0;
var b = 1;
const c = 2;

b = b+1;

var z = a;

function pure(a,b) {
    return a + b;
}

function leaking(a) {
    z = z + a;
}


pure(z,b);
leaking(c);

console.log(z);
