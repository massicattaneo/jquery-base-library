/// <reference path="base2.js" />
/// <reference path="core.js" />

// PACKAGE MIDI
new function (_) { // create the closure
    // create the package object
    var Pmidi = new base2.Package(this, {
        name: "Pmidi",
        version: "1.0",
        imports: "",
        exports: ""
    });

    // evaluate the imported namespace
    eval(this.imports);

    

    // evaluate the exported namespace (this initialises the Package)
    eval(this.exports);
};
