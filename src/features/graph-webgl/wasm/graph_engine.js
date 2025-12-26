import * as wasm from "./graph_engine_bg.wasm";
export * from "./graph_engine_bg.js";
import { __wbg_set_wasm } from "./graph_engine_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
