//#region node_modules/uuid/dist/esm-browser/stringify.js
const byteToHex = [];
for (let i = 0; i < 256; ++i) byteToHex.push((i + 256).toString(16).slice(1));
function unsafeStringify(arr, offset = 0) {
	return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

//#endregion
//#region node_modules/uuid/dist/esm-browser/rng.js
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
	if (!getRandomValues) {
		if (typeof crypto === "undefined" || !crypto.getRandomValues) throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
		getRandomValues = crypto.getRandomValues.bind(crypto);
	}
	return getRandomValues(rnds8);
}

//#endregion
//#region node_modules/uuid/dist/esm-browser/native.js
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = { randomUUID };

//#endregion
//#region node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
	if (native_default.randomUUID && !buf && !options) return native_default.randomUUID();
	options = options || {};
	const rnds = options.random ?? options.rng?.() ?? rng();
	if (rnds.length < 16) throw new Error("Random bytes length must be >= 16");
	rnds[6] = rnds[6] & 15 | 64;
	rnds[8] = rnds[8] & 63 | 128;
	if (buf) {
		offset = offset || 0;
		if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
		for (let i = 0; i < 16; ++i) buf[offset + i] = rnds[i];
		return buf;
	}
	return unsafeStringify(rnds);
}
var v4_default = v4;

//#endregion
//#region src/lib/helper.ts
function uuid() {
	return v4_default();
}
function isFunction(obj) {
	return typeof obj === "function";
}
function isClass(obj) {
	if (!isFunction(obj)) return false;
	return /^class\s/.test(Function.prototype.toString.call(obj));
}
function isFragment(element) {
	return element.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
function isText(element) {
	return element.nodeType === Node.TEXT_NODE;
}
function isHTMLElement(element) {
	return element instanceof HTMLElement;
}
function cssValue(value) {
	if (typeof value === "number") return `${value}`;
	if (typeof value === "boolean") return value ? "true" : "false";
	if (!value) return "''";
	return value;
}
function cssKey(key) {
	return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
function isEventKey(key) {
	return /^on[A-Z]/.test(key);
}
function removeitemInArray(arr, item) {
	const index = arr.indexOf(item);
	if (index > -1) arr.splice(index, 1);
}

//#endregion
//#region src/jsx-runtime.ts
function jsx(arg1, arg2) {
	if (isClass(arg1)) return createNodeByClass(arg1, arg2);
	else if (typeof arg1 === "string") return createNode(arg1, arg2);
	else if (arg1 instanceof Function) return arg1(arg2);
	else throw new Error("jsx: invalid arguments");
}
function jsxs(arg1, arg2) {
	if (arg1.name === "Fragment") return createNode("fragment", arg2);
	return createNode(arg1, arg2);
}
function createNode(tag, attributes) {
	let tagName = tag;
	if (isClass(tag)) tagName = tag.name;
	else if (typeof tag === "function") tagName = tag.name;
	if (typeof attributes.children === "string") attributes.children = [{
		tag: "text",
		text: attributes.children
	}];
	let children = attributes.children || [];
	delete attributes.children;
	if (children.tag) children = [children];
	else if (Array.isArray(children)) children = children.map((child) => {
		if (typeof child === "string") return {
			tag: "text",
			text: child
		};
		return child;
	});
	else {
		console.log("children: ", children);
		throw new Error("createNode: invalid children");
	}
	const node = {
		tag: tagName,
		attributes,
		children
	};
	return node;
}
function Fragment() {}
function createNodeByClass(anyClass, props) {
	const instance = new anyClass();
	const node = instance.render(props) || {
		tag: "",
		attributes: {},
		children: []
	};
	node.props = props;
	node.component = instance;
	return node;
}

//#endregion
//#region node_modules/immer/dist/immer.mjs
var NOTHING = Symbol.for("immer-nothing");
var DRAFTABLE = Symbol.for("immer-draftable");
var DRAFT_STATE = Symbol.for("immer-state");
var errors = [
	function(plugin) {
		return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
	},
	function(thing) {
		return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
	},
	"This object has been frozen and should not be mutated",
	function(data) {
		return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
	},
	"An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
	"Immer forbids circular references",
	"The first or second argument to `produce` must be a function",
	"The third argument to `produce` must be a function or undefined",
	"First argument to `createDraft` must be a plain object, an array, or an immerable object",
	"First argument to `finishDraft` must be a draft returned by `createDraft`",
	function(thing) {
		return `'current' expects a draft, got: ${thing}`;
	},
	"Object.defineProperty() cannot be used on an Immer draft",
	"Object.setPrototypeOf() cannot be used on an Immer draft",
	"Immer only supports deleting array indices",
	"Immer only supports setting array indices and the 'length' property",
	function(thing) {
		return `'original' expects a draft, got: ${thing}`;
	}
];
function die(error, ...args) {
	{
		const e = errors[error];
		const msg = typeof e === "function" ? e.apply(null, args) : e;
		throw new Error(`[Immer] ${msg}`);
	}
}
var getPrototypeOf = Object.getPrototypeOf;
function isDraft(value) {
	return !!value && !!value[DRAFT_STATE];
}
function isDraftable(value) {
	if (!value) return false;
	return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = Object.prototype.constructor.toString();
function isPlainObject(value) {
	if (!value || typeof value !== "object") return false;
	const proto = getPrototypeOf(value);
	if (proto === null) return true;
	const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
	if (Ctor === Object) return true;
	return typeof Ctor == "function" && Function.toString.call(Ctor) === objectCtorString;
}
function each(obj, iter) {
	if (getArchtype(obj) === 0) Reflect.ownKeys(obj).forEach((key) => {
		iter(key, obj[key], obj);
	});
	else obj.forEach((entry, index) => iter(index, entry, obj));
}
function getArchtype(thing) {
	const state = thing[DRAFT_STATE];
	return state ? state.type_ : Array.isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
}
function has(thing, prop) {
	return getArchtype(thing) === 2 ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
}
function set(thing, propOrOldValue, value) {
	const t = getArchtype(thing);
	if (t === 2) thing.set(propOrOldValue, value);
	else if (t === 3) thing.add(value);
	else thing[propOrOldValue] = value;
}
function is(x, y) {
	if (x === y) return x !== 0 || 1 / x === 1 / y;
	else return x !== x && y !== y;
}
function isMap(target) {
	return target instanceof Map;
}
function isSet(target) {
	return target instanceof Set;
}
function latest(state) {
	return state.copy_ || state.base_;
}
function shallowCopy(base, strict) {
	if (isMap(base)) return new Map(base);
	if (isSet(base)) return new Set(base);
	if (Array.isArray(base)) return Array.prototype.slice.call(base);
	const isPlain = isPlainObject(base);
	if (strict === true || strict === "class_only" && !isPlain) {
		const descriptors = Object.getOwnPropertyDescriptors(base);
		delete descriptors[DRAFT_STATE];
		let keys = Reflect.ownKeys(descriptors);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const desc = descriptors[key];
			if (desc.writable === false) {
				desc.writable = true;
				desc.configurable = true;
			}
			if (desc.get || desc.set) descriptors[key] = {
				configurable: true,
				writable: true,
				enumerable: desc.enumerable,
				value: base[key]
			};
		}
		return Object.create(getPrototypeOf(base), descriptors);
	} else {
		const proto = getPrototypeOf(base);
		if (proto !== null && isPlain) return { ...base };
		const obj = Object.create(proto);
		return Object.assign(obj, base);
	}
}
function freeze(obj, deep = false) {
	if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj)) return obj;
	if (getArchtype(obj) > 1) obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
	Object.freeze(obj);
	if (deep) Object.entries(obj).forEach(([key, value]) => freeze(value, true));
	return obj;
}
function dontMutateFrozenCollections() {
	die(2);
}
function isFrozen(obj) {
	return Object.isFrozen(obj);
}
var plugins = {};
function getPlugin(pluginKey) {
	const plugin = plugins[pluginKey];
	if (!plugin) die(0, pluginKey);
	return plugin;
}
var currentScope;
function getCurrentScope() {
	return currentScope;
}
function createScope(parent_, immer_) {
	return {
		drafts_: [],
		parent_,
		immer_,
		canAutoFreeze_: true,
		unfinalizedDrafts_: 0
	};
}
function usePatchesInScope(scope, patchListener) {
	if (patchListener) {
		getPlugin("Patches");
		scope.patches_ = [];
		scope.inversePatches_ = [];
		scope.patchListener_ = patchListener;
	}
}
function revokeScope(scope) {
	leaveScope(scope);
	scope.drafts_.forEach(revokeDraft);
	scope.drafts_ = null;
}
function leaveScope(scope) {
	if (scope === currentScope) currentScope = scope.parent_;
}
function enterScope(immer2) {
	return currentScope = createScope(currentScope, immer2);
}
function revokeDraft(draft) {
	const state = draft[DRAFT_STATE];
	if (state.type_ === 0 || state.type_ === 1) state.revoke_();
	else state.revoked_ = true;
}
function processResult(result, scope) {
	scope.unfinalizedDrafts_ = scope.drafts_.length;
	const baseDraft = scope.drafts_[0];
	const isReplaced = result !== void 0 && result !== baseDraft;
	if (isReplaced) {
		if (baseDraft[DRAFT_STATE].modified_) {
			revokeScope(scope);
			die(4);
		}
		if (isDraftable(result)) {
			result = finalize(scope, result);
			if (!scope.parent_) maybeFreeze(scope, result);
		}
		if (scope.patches_) getPlugin("Patches").generateReplacementPatches_(baseDraft[DRAFT_STATE].base_, result, scope.patches_, scope.inversePatches_);
	} else result = finalize(scope, baseDraft, []);
	revokeScope(scope);
	if (scope.patches_) scope.patchListener_(scope.patches_, scope.inversePatches_);
	return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value, path) {
	if (isFrozen(value)) return value;
	const state = value[DRAFT_STATE];
	if (!state) {
		each(value, (key, childValue) => finalizeProperty(rootScope, state, value, key, childValue, path));
		return value;
	}
	if (state.scope_ !== rootScope) return value;
	if (!state.modified_) {
		maybeFreeze(rootScope, state.base_, true);
		return state.base_;
	}
	if (!state.finalized_) {
		state.finalized_ = true;
		state.scope_.unfinalizedDrafts_--;
		const result = state.copy_;
		let resultEach = result;
		let isSet2 = false;
		if (state.type_ === 3) {
			resultEach = new Set(result);
			result.clear();
			isSet2 = true;
		}
		each(resultEach, (key, childValue) => finalizeProperty(rootScope, state, result, key, childValue, path, isSet2));
		maybeFreeze(rootScope, result, false);
		if (path && rootScope.patches_) getPlugin("Patches").generatePatches_(state, path, rootScope.patches_, rootScope.inversePatches_);
	}
	return state.copy_;
}
function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
	if (childValue === targetObject) die(5);
	if (isDraft(childValue)) {
		const path = rootPath && parentState && parentState.type_ !== 3 && !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0;
		const res = finalize(rootScope, childValue, path);
		set(targetObject, prop, res);
		if (isDraft(res)) rootScope.canAutoFreeze_ = false;
		else return;
	} else if (targetIsSet) targetObject.add(childValue);
	if (isDraftable(childValue) && !isFrozen(childValue)) {
		if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) return;
		finalize(rootScope, childValue);
		if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && Object.prototype.propertyIsEnumerable.call(targetObject, prop)) maybeFreeze(rootScope, childValue);
	}
}
function maybeFreeze(scope, value, deep = false) {
	if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) freeze(value, deep);
}
function createProxyProxy(base, parent) {
	const isArray = Array.isArray(base);
	const state = {
		type_: isArray ? 1 : 0,
		scope_: parent ? parent.scope_ : getCurrentScope(),
		modified_: false,
		finalized_: false,
		assigned_: {},
		parent_: parent,
		base_: base,
		draft_: null,
		copy_: null,
		revoke_: null,
		isManual_: false
	};
	let target = state;
	let traps = objectTraps;
	if (isArray) {
		target = [state];
		traps = arrayTraps;
	}
	const { revoke, proxy } = Proxy.revocable(target, traps);
	state.draft_ = proxy;
	state.revoke_ = revoke;
	return proxy;
}
var objectTraps = {
	get(state, prop) {
		if (prop === DRAFT_STATE) return state;
		const source = latest(state);
		if (!has(source, prop)) return readPropFromProto(state, source, prop);
		const value = source[prop];
		if (state.finalized_ || !isDraftable(value)) return value;
		if (value === peek(state.base_, prop)) {
			prepareCopy(state);
			return state.copy_[prop] = createProxy(value, state);
		}
		return value;
	},
	has(state, prop) {
		return prop in latest(state);
	},
	ownKeys(state) {
		return Reflect.ownKeys(latest(state));
	},
	set(state, prop, value) {
		const desc = getDescriptorFromProto(latest(state), prop);
		if (desc?.set) {
			desc.set.call(state.draft_, value);
			return true;
		}
		if (!state.modified_) {
			const current2 = peek(latest(state), prop);
			const currentState = current2?.[DRAFT_STATE];
			if (currentState && currentState.base_ === value) {
				state.copy_[prop] = value;
				state.assigned_[prop] = false;
				return true;
			}
			if (is(value, current2) && (value !== void 0 || has(state.base_, prop))) return true;
			prepareCopy(state);
			markChanged(state);
		}
		if (state.copy_[prop] === value && (value !== void 0 || prop in state.copy_) || Number.isNaN(value) && Number.isNaN(state.copy_[prop])) return true;
		state.copy_[prop] = value;
		state.assigned_[prop] = true;
		return true;
	},
	deleteProperty(state, prop) {
		if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
			state.assigned_[prop] = false;
			prepareCopy(state);
			markChanged(state);
		} else delete state.assigned_[prop];
		if (state.copy_) delete state.copy_[prop];
		return true;
	},
	getOwnPropertyDescriptor(state, prop) {
		const owner = latest(state);
		const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
		if (!desc) return desc;
		return {
			writable: true,
			configurable: state.type_ !== 1 || prop !== "length",
			enumerable: desc.enumerable,
			value: owner[prop]
		};
	},
	defineProperty() {
		die(11);
	},
	getPrototypeOf(state) {
		return getPrototypeOf(state.base_);
	},
	setPrototypeOf() {
		die(12);
	}
};
var arrayTraps = {};
each(objectTraps, (key, fn) => {
	arrayTraps[key] = function() {
		arguments[0] = arguments[0][0];
		return fn.apply(this, arguments);
	};
});
arrayTraps.deleteProperty = function(state, prop) {
	if (isNaN(parseInt(prop))) die(13);
	return arrayTraps.set.call(this, state, prop, void 0);
};
arrayTraps.set = function(state, prop, value) {
	if (prop !== "length" && isNaN(parseInt(prop))) die(14);
	return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
function peek(draft, prop) {
	const state = draft[DRAFT_STATE];
	const source = state ? latest(state) : draft;
	return source[prop];
}
function readPropFromProto(state, source, prop) {
	const desc = getDescriptorFromProto(source, prop);
	return desc ? `value` in desc ? desc.value : desc.get?.call(state.draft_) : void 0;
}
function getDescriptorFromProto(source, prop) {
	if (!(prop in source)) return void 0;
	let proto = getPrototypeOf(source);
	while (proto) {
		const desc = Object.getOwnPropertyDescriptor(proto, prop);
		if (desc) return desc;
		proto = getPrototypeOf(proto);
	}
	return void 0;
}
function markChanged(state) {
	if (!state.modified_) {
		state.modified_ = true;
		if (state.parent_) markChanged(state.parent_);
	}
}
function prepareCopy(state) {
	if (!state.copy_) state.copy_ = shallowCopy(state.base_, state.scope_.immer_.useStrictShallowCopy_);
}
var Immer2 = class {
	constructor(config) {
		this.autoFreeze_ = true;
		this.useStrictShallowCopy_ = false;
		/**
		* The `produce` function takes a value and a "recipe function" (whose
		* return value often depends on the base state). The recipe function is
		* free to mutate its first argument however it wants. All mutations are
		* only ever applied to a __copy__ of the base state.
		*
		* Pass only a function to create a "curried producer" which relieves you
		* from passing the recipe function every time.
		*
		* Only plain objects and arrays are made mutable. All other objects are
		* considered uncopyable.
		*
		* Note: This function is __bound__ to its `Immer` instance.
		*
		* @param {any} base - the initial state
		* @param {Function} recipe - function that receives a proxy of the base state as first argument and which can be freely modified
		* @param {Function} patchListener - optional function that will be called with all the patches produced here
		* @returns {any} a new state, or the initial state if nothing was modified
		*/
		this.produce = (base, recipe, patchListener) => {
			if (typeof base === "function" && typeof recipe !== "function") {
				const defaultBase = recipe;
				recipe = base;
				const self = this;
				return function curriedProduce(base2 = defaultBase, ...args) {
					return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
				};
			}
			if (typeof recipe !== "function") die(6);
			if (patchListener !== void 0 && typeof patchListener !== "function") die(7);
			let result;
			if (isDraftable(base)) {
				const scope = enterScope(this);
				const proxy = createProxy(base, void 0);
				let hasError = true;
				try {
					result = recipe(proxy);
					hasError = false;
				} finally {
					if (hasError) revokeScope(scope);
					else leaveScope(scope);
				}
				usePatchesInScope(scope, patchListener);
				return processResult(result, scope);
			} else if (!base || typeof base !== "object") {
				result = recipe(base);
				if (result === void 0) result = base;
				if (result === NOTHING) result = void 0;
				if (this.autoFreeze_) freeze(result, true);
				if (patchListener) {
					const p = [];
					const ip = [];
					getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
					patchListener(p, ip);
				}
				return result;
			} else die(1, base);
		};
		this.produceWithPatches = (base, recipe) => {
			if (typeof base === "function") return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
			let patches, inversePatches;
			const result = this.produce(base, recipe, (p, ip) => {
				patches = p;
				inversePatches = ip;
			});
			return [
				result,
				patches,
				inversePatches
			];
		};
		if (typeof config?.autoFreeze === "boolean") this.setAutoFreeze(config.autoFreeze);
		if (typeof config?.useStrictShallowCopy === "boolean") this.setUseStrictShallowCopy(config.useStrictShallowCopy);
	}
	createDraft(base) {
		if (!isDraftable(base)) die(8);
		if (isDraft(base)) base = current(base);
		const scope = enterScope(this);
		const proxy = createProxy(base, void 0);
		proxy[DRAFT_STATE].isManual_ = true;
		leaveScope(scope);
		return proxy;
	}
	finishDraft(draft, patchListener) {
		const state = draft && draft[DRAFT_STATE];
		if (!state || !state.isManual_) die(9);
		const { scope_: scope } = state;
		usePatchesInScope(scope, patchListener);
		return processResult(void 0, scope);
	}
	/**
	* Pass true to automatically freeze all copies created by Immer.
	*
	* By default, auto-freezing is enabled.
	*/
	setAutoFreeze(value) {
		this.autoFreeze_ = value;
	}
	/**
	* Pass true to enable strict shallow copy.
	*
	* By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
	*/
	setUseStrictShallowCopy(value) {
		this.useStrictShallowCopy_ = value;
	}
	applyPatches(base, patches) {
		let i;
		for (i = patches.length - 1; i >= 0; i--) {
			const patch = patches[i];
			if (patch.path.length === 0 && patch.op === "replace") {
				base = patch.value;
				break;
			}
		}
		if (i > -1) patches = patches.slice(i + 1);
		const applyPatchesImpl = getPlugin("Patches").applyPatches_;
		if (isDraft(base)) return applyPatchesImpl(base, patches);
		return this.produce(base, (draft) => applyPatchesImpl(draft, patches));
	}
};
function createProxy(value, parent) {
	const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
	const scope = parent ? parent.scope_ : getCurrentScope();
	scope.drafts_.push(draft);
	return draft;
}
function current(value) {
	if (!isDraft(value)) die(10, value);
	return currentImpl(value);
}
function currentImpl(value) {
	if (!isDraftable(value) || isFrozen(value)) return value;
	const state = value[DRAFT_STATE];
	let copy;
	if (state) {
		if (!state.modified_) return state.base_;
		state.finalized_ = true;
		copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
	} else copy = shallowCopy(value, true);
	each(copy, (key, childValue) => {
		set(copy, key, currentImpl(childValue));
	});
	if (state) state.finalized_ = false;
	return copy;
}
var immer = new Immer2();
var produce = immer.produce;
var produceWithPatches = immer.produceWithPatches.bind(immer);
var setAutoFreeze = immer.setAutoFreeze.bind(immer);
var setUseStrictShallowCopy = immer.setUseStrictShallowCopy.bind(immer);
var applyPatches = immer.applyPatches.bind(immer);
var createDraft = immer.createDraft.bind(immer);
var finishDraft = immer.finishDraft.bind(immer);

//#endregion
//#region src/nodeTree.ts
let nodeTree;
function cacheNodeTree(tree) {
	nodeTree = tree;
}
function traverseTree(tree, callback) {
	if (callback(tree)) return;
	if (tree.children) if (Array.isArray(tree.children)) tree.children.forEach((child) => {
		traverseTree(child, callback);
	});
	else traverseTree(tree.children, callback);
}
function getNodeById(id) {
	let result;
	traverseTree(nodeTree, (node) => {
		if (node.component?._id === id) {
			result = node;
			return true;
		}
	});
	return result;
}
function queryNodeList(selector) {
	console.log("node tree: ", nodeTree);
	const elemtns = document.querySelectorAll(selector);
	return Array.from(elemtns).map((element) => {
		const id = element.getAttribute("node-id");
		if (!id) return;
		return getNodeById(id);
	}).filter((node) => !!node);
}
function queryOneNode(selector) {
	return queryNodeList(selector)[0];
}

//#endregion
//#region src/element.ts
function createElement(node) {
	if (!node) throw new Error("create element failed. invalid node");
	const tag = node.tag;
	let element;
	if (tag === "fragment") element = document.createDocumentFragment();
	else if (tag === "text") element = document.createTextNode(node.text || "");
	else element = document.createElement(tag);
	node.element = element;
	const attributes = node.attributes;
	const props = node.props;
	const combinedAttr = {
		...props,
		...attributes
	};
	if (node.component?._id) combinedAttr["node-id"] = node.component._id;
	if (!isHTMLElement(element)) return element;
	const htmlElement = node.element;
	Object.keys(combinedAttr).forEach((key) => {
		const attrValue = combinedAttr[key];
		if (/^on[A-Z]/.test(key) && typeof attrValue === "function") {
			const eventType = key.substring(2).toLowerCase();
			htmlElement.removeEventListener(eventType, node.__eventHandlers?.[eventType]);
			htmlElement.addEventListener(eventType, attrValue);
			if (!node.__eventHandlers) node.__eventHandlers = {};
			node.__eventHandlers[eventType] = attrValue;
			return;
		}
		if (htmlElement.tagName === "input" && key === "checked") {
			if (attrValue) htmlElement.setAttribute(key, "");
			return;
		}
		if (key === "className") {
			htmlElement.setAttribute("class", attrValue);
			return;
		}
		if (key === "_id") {
			htmlElement.setAttribute("id", attrValue);
			return;
		}
		if (key === "style") {
			Object.keys(attrValue).forEach((styleKey) => {
				const value = cssValue(attrValue[styleKey]);
				htmlElement.style.setProperty(cssKey(styleKey), value);
			});
			return;
		}
		htmlElement.setAttribute(key, attrValue);
	});
	return htmlElement;
}
function createElementTree(jsxNode) {
	console.log("createElementTree: ", jsxNode);
	function recursive(nextNode, parentNode) {
		if (!nextNode) throw new Error("invalid node");
		if (typeof nextNode !== "string" && nextNode.tag && parentNode) nextNode.parent = parentNode;
		let element = createElement(nextNode);
		if (nextNode.children) for (const child of nextNode.children) recursive(child, nextNode);
		if (parentNode && parentNode.element) {
			parentNode.element.appendChild(element);
			return;
		}
		return element;
	}
	return recursive(jsxNode, null);
}
function removeNodeElement(element) {
	if (isFragment(element)) {
		element.childNodes.forEach((child) => {
			removeNodeElement(child);
		});
		return;
	}
	element.remove();
}

//#endregion
//#region src/lib/nodeUpdater.ts
function updateDomAttributes(newNode, oldNode) {
	const element = oldNode.element;
	if (!element) {
		console.log("newNode element not found: ", newNode);
		throw new Error("updateDomAttributes: element not found");
	}
	if (isFragment(element) || isText(element)) return;
	if (newNode.component?._id) element.setAttribute("node-id", newNode.component._id);
	const attributes = {
		...oldNode.attributes,
		...newNode.attributes
	};
	Object.keys(attributes).forEach((key) => {
		if (!Object.prototype.hasOwnProperty.call(newNode.attributes, key)) {
			element.removeAttribute(key);
			return;
		}
		const value = attributes[key];
		if (isEventKey(key) && isFunction(value)) {
			const eventType = key.toLowerCase().substring(2);
			const newCallback = attributes[key];
			if (oldNode.__eventHandlers && oldNode.__eventHandlers[eventType]) {
				element.removeEventListener(eventType, oldNode.__eventHandlers[eventType]);
				delete oldNode.__eventHandlers[eventType];
			}
			element.addEventListener(eventType, newCallback);
			return;
		}
		if (key === "style") {
			const newStyle = newNode.attributes[key];
			const oldStyle = oldNode.attributes[key];
			const newStyleKeys = Object.keys(newStyle);
			const oldStyleKeys = Object.keys(oldStyle);
			const combinedStyleKeys = new Set([...newStyleKeys, ...oldStyleKeys]);
			combinedStyleKeys.forEach((key$1) => {
				if (!newStyleKeys.includes(key$1)) {
					element.style.removeProperty(key$1);
					return;
				}
				const value$1 = cssValue(newStyle[key$1]);
				element.style.setProperty(key$1, value$1);
			});
			return;
		}
		element.setAttribute(key, value);
	});
}
function replaceNode(newNode, oldNode) {
	const newElement = createElement(newNode);
	if (!newElement) throw new Error("updateNode: oldNode.element is null");
	if (!oldNode.element) throw new Error("updateNode: oldNode.element is null");
	const parentElement = oldNode.element.parentElement;
	if (!parentElement) throw new Error("updateNode: parentElement is null");
	parentElement.replaceChild(newElement, oldNode.element);
	oldNode.element = newElement;
}

//#endregion
//#region src/component.ts
var Component = class {
	constructor() {}
	render(props) {
		return;
	}
	state = {};
	_id = uuid();
	setState(nextState) {
		this.state = produce(this.state, (draft) => Object.assign(draft, nextState));
		this.updateNode();
	}
	updateState(updater) {
		this.state = produce(this.state, updater);
		this.updateNode();
	}
	updateNode() {
		const oldNode = getNodeById(this._id);
		console.log("state", this.state);
		console.log("updateNode", oldNode);
		if (!oldNode) throw new Error("updateNode: node not found");
		const component = this;
		const newNode = component.render(oldNode.props);
		console.log("newNode", newNode);
		newNode.props = {
			...oldNode.props,
			...newNode.props
		};
		newNode.component = component;
		function recursive(_newNode, _oldNode) {
			_oldNode.component = _newNode.component;
			_oldNode.props = _newNode.props;
			if (_newNode.tag !== _oldNode.tag) replaceNode(_newNode, _oldNode);
			else updateDomAttributes(_newNode, _oldNode);
			_oldNode.attributes = _newNode.attributes;
			const newChildren = _newNode.children || [];
			const oldChildren = _oldNode.children || [];
			const length = Math.max(newChildren.length, oldChildren.length);
			for (let i = 0; i < length; i++) {
				const newChild = newChildren[i];
				let oldChild = oldChildren[i];
				if (!newChild) {
					oldChild.element && removeNodeElement(oldChild.element);
					removeitemInArray(oldChildren, oldChild);
					continue;
				}
				if (!oldChild) {
					oldChild = {
						...newChild,
						parent: _oldNode
					};
					oldChild.element = createElement(oldChild);
					if (!_oldNode.element) throw new Error("updateNode: oldNode.element is null");
					_oldNode.element.appendChild(oldChild.element);
					oldChildren.push(oldChild);
				}
				recursive(newChild, oldChild);
			}
		}
		recursive(newNode, oldNode);
	}
};

//#endregion
//#region src/renderer.ts
function render(node, dom) {
	let jsxNode = node;
	if (isClass(node)) jsxNode = createNodeByClass(node, null);
	if (!dom) throw new Error("dom is null");
	mount(jsxNode, dom);
}
function mount(jsxNode, dom) {
	let mountPoint;
	if (typeof dom === "string") mountPoint = document.querySelector(dom);
	else mountPoint = dom;
	if (!mountPoint) throw new Error("mount point not found");
	console.log("jsxNode: ", jsxNode);
	cacheNodeTree(jsxNode);
	const elementTree = createElementTree(jsxNode);
	console.log("elementTree: ", elementTree);
	mountPoint.appendChild(elementTree);
}

//#endregion
//#region src/query.ts
function query(selector) {
	return queryNodeList(selector).map((node) => componentProxyFactory(node));
}
function queryOne(selector) {
	return query(selector)[0];
}
function componentProxyFactory(node) {
	return new Proxy({}, { get(target, prop) {
		const component = node.component;
		if (!component) return;
		if (!Reflect.has(component, prop)) throw new Error("instanceProxyFactory: invalid property");
		const p = prop;
		const value = component[p];
		if (typeof value === "function") return value.bind(component);
		return value;
	} });
}

//#endregion
export { Component, Fragment, cacheNodeTree, createNodeByClass, getNodeById, jsx, jsxs, mount, query, queryNodeList, queryOne, queryOneNode, render };