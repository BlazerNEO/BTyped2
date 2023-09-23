import ProxyHandle from "./ProxyHandle.mjs";
import { AsBigInt, AsInt, CTypes, CStructs, AddressOf } from "../Utils/Utils.mjs";

//
export default class StructView {
    $target = null;
    #layout = null;
    #byteOffset = 0;
    #length = 1;

    //
    constructor(layout, target, byteOffset = 0, length = 1) {
        this.#layout = (typeof layout == "string") ? CStructs.get(layout) : layout;
        this.#byteOffset = byteOffset;
        this.#length = length;

        //
        Object.defineProperty(this, '$target', { get: typeof target == "function" ? target : ()=>target });
    }

    //
    get $isView() { return true; };
    get $length() { return this.#length; };
    get $byteOffset() { return this.#byteOffset; };
    get $byteLength() { return (this.$length * this.#layout.$byteLength); };
    get $ownKeys() { return [...this.#layout.$layout.keys(), ...Array.from({length: this.#length}, (_, i) => i)]; };
    get $layout() { return this.#layout; };
    get $buffer() { return (this.$target?.buffer || this.$target); };
    get $address() { return (AddressOf(this.$target) || BigInt(this.$target.byteOffset) || 0n) + BigInt(this.$byteOffset); };
    get $initial() {
        this.$ownKeys.forEach(($e)=>{
            this.$set($e, this.#layout.$typeof($e).$default);
        });
        return this;
    }

    //
    $has($name) { return (this.#layout.$layout.has($name)); };
    $get($name = "*", $ref = false) {
        const $type = this.#layout.$typeof($name);
        const $index = $type?.$index || 0;

        // getting an member type
        let $T = $type.$name;
        if ($T == "*") { return this.#layout; };
        if ((typeof $T == "string") && ((CTypes.has($T) && !$type.$array) || CStructs.has($T))) { $T = (CTypes.has($T) && !$type.$array) ? CTypes.get($T) : CStructs.get($T); };

        // an-struct or arrays
        if (typeof $T == "object") {
            const ref = new Proxy($T.$view(this.$target, (this.#layout.$byteLength * $index) + (this.#byteOffset + $type.$offset), ($type.$array || 1)), new ProxyHandle($T));
            return $ref && ($T != this.#layout) ? ref["*"] : ref;
        }

        // get primitive
        const $target = (this.$target instanceof DataView) ? this.$target : new DataView(this.$target, 0);
        const $getter = "get" + ($T.includes?.("int64") ? "Big" : "") + ($T.charAt(0).toUpperCase() + $T.slice(1));

        //
        if ($target[$getter]) { return $target[$getter](this.#byteOffset + $type.$offset, true); }

        //
        return null;
    }

    // 
    $set($name = "*", $member = 0) {
        const $type = this.#layout.$typeof($name);
        const $obj = this.$get($name, true);

        // assign members (if struct to struct, will try to recursively)
        const $T = $type.$name;

        // optimized operation for array-view
        if ((Array.isArray($member) || ArrayBuffer.isView($member)) && typeof $obj?.$select == "function") {
            $obj.$set(0, $member); return true;
        }

        //
        if (typeof $obj == "object" && typeof $member == "object") { 
            Object.assign($obj, $member); return true;
        }

        // set primitive
        if (typeof $member == "number" || typeof $member == "bigint")
        {
            if (typeof $T == "string") {
                const $target = (this.$target instanceof DataView) ? this.$target : new DataView(this.$target, 0);
                const $setter = "set" + ($T.includes("int64") ? "Big" : "") + ($T.charAt(0).toUpperCase() + $T.slice(1));

                //
                if ($T?.includes?.("int64")) { $member = AsBigInt($member); }
                if ($T?.includes?.("int32")) { $member = AsInt($member); }
                if ($target[$setter]) { $target[$setter](this.#byteOffset + $type.$offset, $member, true); }
            } else {
                $obj["*"] = $member;
            }
        };

        //
        return true;
    }
};
