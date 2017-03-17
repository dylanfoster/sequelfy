"use strict";

import { ok as assert } from "assert";
import includeAll from "include-all";
import inflect from "inflect";

const LOOKUP_MAP = {
  module: __dirname
};

/**
 * Registry
 *
 * @class
 * @constructor
 */
export default class Registry {
  constructor() {
    this._registry = new Map();
  }

  /**
   * inject
   *
   *     registry.inject(object, "service:store");
   *     // object.store
   *
   *     registry.inject(object, "service:model-manager", "modelManager");
   *     // object.modelManager
   *
   * @param context
   * @param lookup
   * @param propertyName
   *
   * @returns {undefined}
   */
  inject(context, lookup, propertyName) {
    const hasBeenInjected = this._registry.has(lookup);

    assert(hasBeenInjected, `Attempted to inject unknown object '${lookup}'`);

    const obj = this.lookup(lookup);
    const [prop] = lookup.split(":");
    const property = propertyName || prop;

    if (Object.prototype.hasOwnProperty.call(context, property)) { return; }

    if (obj) {
      Object.defineProperty(context, property, {
        enumerable: false,
        configurable: false,
        get() { return obj; },
        set() {}
      });
    }

    return context;
  }

  /**
   * lookup
   *
   * @param name
   *
   * @returns {undefined}
   */
  lookup(name) {
    const [moduleLookup, moduleName] = name.split(":");
    let obj = this._registry.get(name);

    if (obj) { return obj.instance; }

    obj = this._loadModule(moduleLookup, moduleName);

    this.register(name, obj);

    return obj;
  }

  /**
   * register
   *
   * @param name
   * @param Obj
   * @param options={}
   * @todo: guard against overwrites with singleton option
   *
   * @returns {undefined}
   */
  register(name, Obj, options = {}) {
    const { instantiate, singleton } = options;
    let obj = this._registry.get(name);

    if (obj && obj.singleton) {
      throw new Error("Cannot re-register singleton object");
    }

    obj = {};

    if (instantiate) {
      obj.instance = new Obj();
      obj.singleton = singleton;

      this._registry.set(name, obj);

      return obj;
    }

    obj.instance = Obj;
    obj.singleton = singleton;

    this._registry.set(name, obj);

    return obj;
  }

  /**
   * _getLookupDirectory
   *
   * @param lookup
   *
   * @returns {undefined}
   */
  _getLookupDirectory(lookup) {
    return LOOKUP_MAP[lookup];
  }

  /**
   * _loadModule
   *
   * @param lookup
   * @param name
   *
   * @returns {undefined}
   */
  _loadModule(lookup, name) {
    const modules = includeAll({
      dirname: this._getLookupDirectory(lookup)
    });

    // TODO: this will need to be configurable somehow (or better regex)
    const key = `${inflect.underscore(name)}.js`;

    return modules[key];
  }
}