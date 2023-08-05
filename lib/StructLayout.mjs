import StructView from "./StructView.mjs";
import StructProxyHandle from "./StructProxyHandle.mjs";
import { CStructs } from "./Utils.mjs";

//
export default class StructLayout {
    #typed = {};
    #name = "";

    //
    constructor(name, typed = {}) {
        this.#name = name;
        this.#typed = typed;

        //
        if (this.#name) { CStructs[this.#name] = this; };
    }

    //
    get $typed() { return this.#typed; }
    get $name() { return this.#name; }

    //
    $view(target, byteOffset = 0) { return new StructView(this, target, byteOffset); }

    //
    $get($name) {
        const $mT = "";
        $mT = $mT.trim(), $name = $name.trim();
        if ($name.indexOf(":") >= 0) { [$name, $mT ] = $name.vsplit(":"); };
        $mT = $mT.trim(), $name = $name.trim();
        return ($mT ||= this.#typed[$name]);
    }

    //
    #wrap(buffer, byteOffset = 0) {
        return new Proxy(new DataView(buffer, byteOffset), new StructProxyHandle(this));
    }

    //
    wrap(buffer, byteOffset = 0) {
        if (buffer instanceof ArrayBuffer || buffer instanceof SharedArrayBuffer) {
            return this.#wrap(buffer, byteOffset);
        } else 
        if (buffer instanceof DataView) {
            return this.#wrap(buffer.buffer, buffer.byteOffset + byteOffset);
        } else
        if (buffer?.buffer && buffer.BYTES_PER_ELEMENT) {
            return this.#wrap(buffer.buffer, buffer.byteOffset + byteOffset);
        }
    }
};
