import StructView from "./StructView.mjs";
import StructProxyHandle from "./StructProxyHandle.mjs";

//
export default class StructLayout {
    #typed = {};
    #name = "";

    //
    constructor(name, typed = {}) {
        this.#name = name;
        this.#typed = typed;
    }

    //
    get $typed() {
        return this.#typed;
    }

    //
    get $name() {
        return this.#name;
    }

    //
    $view(target, byteOffset = 0) {
        return new StructView(this, target, byteOffset);
    }

    //
    $get(name) {
        return this.#typed[name];
    }

    //
    $wrap(buffer, byteOffset) {
        return new Proxy(new DataView(buffer, byteOffset), new StructProxyHandle(this));
    }
}