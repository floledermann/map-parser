const fs = require('fs');

const esprima = require('esprima');
const estraverse = require('estraverse');
const escope = require('escope');

const FILENAME = 'testcases/test1.js';

fs.readFile(FILENAME, 'utf8', (err, data) => {
    if (err) throw err;
    analyze(data);
});

// ESTree spec:
// https://github.com/estree/estree/blob/master/es5.md
// http://esprima.org/demo/parse.html

// EScope reference:
// http://estools.github.io/escope/Scope.html 

function analyze(program) {
    
    var identifiers = [];
    var dependencies = new Map();
    
    try {
        var ast = esprima.parse(program, {
            loc: true,
            range: true,
            //tokens: true,
            comment: true,
            tolerant: true
            //attachComment: true 
        });
    } catch (e) {
        console.log("Parsing Error in " + FILENAME + ": " + e.message);
        process.exit();
    }
    
    const scopeManager = escope.analyze(ast);
    // global scope
    var currentScope = scopeManager.acquire(ast);
    
    // TODO: warn if "with" or "eval()" is found (scope analysis may not work accurately)
    // http://estools.github.io/escope/Scope.html
    
    estraverse.traverse(ast, {
        enter: (node, parent) => {
            if (/Function/.test(node.type)) {
                // update scope
                currentScope = scopeManager.acquire(node);
            }
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
                        let scoped = getScopeID(currentScope) + dep;
                        if (dep != name) entry.add(scoped);
                    }
                }
                    
                
            }
            if (/Function/.test(node.type)) {
                // set to parent scope
                currentScope = currentScope.upper;  
            }
        }
    });
    //console.log(JSON.stringify(ast,null,2));
    console.log(underline("\nIdentifiers"));
    console.log(identifiers.join('\n'));
    console.log(underline("\nDependencies"));
    for (let [name, value] of dependencies) console.log(name + ": " + [...value].join(","));

}

function getScopeID(scope) {
    // global scope
    if (!scope.upper) return "";
    
    var upper = getScopeID(scope.upper);
    return upper + "<" + scope.type + ">" + scope.block.name + ":";
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

