import * as B from "../index.js";

const Test = B.StructWrap(new B.StructLayout("Test", {
    field0: "uint8(0)",
    field1: "uint8[2](1)"
}, 4));

const I = new Test({
    field0: 1,
    field1: [2, 3]
});

console.log(I);
console.log(I.field0);
console.log(I.field1[0], I.field1[1]);