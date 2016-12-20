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

function analyze(program) {
    
    var identifiers = [];
    var dependencies = {};
    
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
                console.log(node.left.type);
                if (node.left.type != 'Identifier') {
                    console.log("Warning: left side too complex: " + node);
                }
                else {
                    if (!dependencies.containsKey(node.left.name))
                        dependencies[node.left.name] = [];
                    }
                    
                }
                    
                
            }
        }
    });
    
    console.log(underline("Identifiers"));
    console.log(identifiers.join('\n'));

}

function extractDependencies(expr) {
    var deps = [];
    if (expr.name) deps.push(expr.name);
    if (expr.left) deps.append(extractDependencies(expr.left));
    if (expr.right) deps.append(extractDependencies(expr.right));
    if (expr.argument) deps.append(extractDependencies(expr.argument);
    return deps;
}

function underline(str, c) {
    c = c || "=";
    return str + "\n" + c.repeat(str.length);
}

