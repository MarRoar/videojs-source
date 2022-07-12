import Component from "./src/component.js";

var oC = new Component();

// oC.on('blur', function () {
//   console.log('hello ~~');
// })

// oC.trigger('blur');

oC.trigger('dispose')

console.log("test = ", oC);
