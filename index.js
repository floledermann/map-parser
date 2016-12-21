const fs = require('fs');

const esprima = require('esprima');
const estraverse = require('estraverse');


var FILENAME = 'testcases/test1.js';

fs.readFile(FILENAME, 'utf8', (err, data) => {
    if (err) throw err;
    analyze(data);
});

// ESTree spec:
// https://github.com/estree/estree/blob/master/es5.md
// http://esprima.org/demo/parse.html

function analyze(program) {
    
    var identifiers = [];
    var dependencies = new Map();
    
    var parsed = esprima.parse(program, {
        loc: true,
        range: true,
        //tokens: true,
        comment: true,
        tolerant: true,
        //attachComment: true 
    });
    
    estraverse.traverse(parsed, {
        enter: (node, parent) => {
        },
        leave: (node, parent) => {
            if (node.type == 'VariableDeclaration') {
                node.declarations.forEach(d=>identifiers.push(node.kind + " " + d.id.name));
            }
            if (node.type == 'AssignmentExpression') {
                //console.log(node.left.type);
                if (node.left.type != 'Identifier') {
                    console.log("Warning: left side too complex: " + node);
                }
                else {
                    let name = node.left.name;
                    if (! (dependencies.has(name))) {
                        dependencies.set(name, new Set());
                    }
                    let entry = dependencies.get(name);
                    let deps = extractDependencies(node.right);
                    for (let dep of deps) {
                        if (dep != name) entry.add(dep);
                    }
                }
                    
                
            }
        }
    });
    //console.log(JSON.stringify(parsed,null,2));
    console.log(underline("\nIdentifiers"));
    console.log(identifiers.join('\n'));
    console.log(underline("\nDependencies"));
    for (let [name, value] of dependencies) console.log(name + ": " + [...value].join(","));

}

function extractDependencies(expr) {
    //console.log(expr.type);
    var deps = [];
    // variables
    if (expr.name) deps.push(expr.name);
    // literals
    if (expr.value) deps.push(JSON.stringify(expr.value));
    
    // expressions
    if (expr.left) deps = deps.concat(extractDependencies(expr.left));
    if (expr.right) deps = deps.concat(extractDependencies(expr.right));
    if (expr.argument) deps = deps.concat(extractDependencies(expr.argument));
    //console.log(deps);
    return deps;
}

function underline(str, c) {
    c = c || "=";
    return str + "\n" + c.repeat(str.length);
}

