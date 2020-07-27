const { Transform } = require("assemblyscript/cli/transform")
const { ExportsWalker, Parser } = require("assemblyscript")
// const

class Walker extends ExportsWalker {
  visitFunction(name, element) {}

  visitGlobal(name, element) { }

  visitEnum(name, element) { }

  visitClass(name, element) {
    const decorator = getDeriveDecorator(element);
    if (decorator) {
      decorator.arguments.forEach(arg => expandMacro(element, arg));
    }
  }

  visitInterface(name, element) { }

  visitField(name, element) { }

  visitNamespace(name, element) { }

  visitAlias(name, element, originalName) { }
}

function expandMacro(element, arg) {
  // console.log(element);
  // console.log(arg);
}

function quote(source) {

}

function getDeriveDecorator(element) {
  return element.declaration.decorators &&
    element.declaration.decorators.find(d => d.name.text === "derive");
}

class Codegen extends Transform {
  afterParse(parser) {}

  afterInitialize(program) {
    this.program = program
  }

  afterCompile(module) {
    console.log(module)
    let walker = new Walker(this.program, false);
    walker.walk();
  }
}
module.exports = Codegen
