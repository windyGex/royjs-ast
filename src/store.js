/* eslint-disable no-use-before-define, consistent-return*/
import traverse from '@babel/traverse';
import { parse, updateCode, formatter, generate, validateAST } from './util';

/**
 * Store class for manipulating Roy.js store files containing state and actions.
 * 
 * This class provides comprehensive methods to analyze, modify, and generate
 * Roy.js store code. It supports CRUD operations on state properties and actions,
 * with automatic code formatting and validation.
 * 
 * @class Store
 * @example
 * const store = new Store(`
 *   export default {
 *     state: { count: 0 },
 *     actions: {
 *       increment(state) { state.count++; }
 *     }
 *   }
 * `);
 * 
 * const parsed = store.parse();
 * store.addState('loading', 'false');
 * console.log(store.code);
 */
class Store {
    /**
     * Creates a new Store instance.
     * 
     * @param {string} code - The source code of the store file
     * @throws {Error} When code is not a valid string
     * @example
     * const store = new Store(storeCode);
     */
    constructor(code) {
        if (typeof code !== 'string') {
            throw new Error('Store code must be a string');
        }
        this.code = code;
        this._ast = null; // Cache AST to avoid re-parsing
        this._parsed = null; // Cache parsed result
    }

    /**
     * Gets or creates the AST for the current code.
     * 
     * @private
     * @returns {Object} The parsed AST
     */
    _getAST() {
        if (!this._ast) {
            this._ast = parse(this.code);
            if (!validateAST(this._ast)) {
                throw new Error('Invalid AST generated from store code');
            }
        }
        return this._ast;
    }

    /**
     * Invalidates the cached AST and parsed result.
     * 
     * @private
     */
    _invalidateCache() {
        this._ast = null;
        this._parsed = null;
    }

    /**
     * Parses the store code and extracts state and actions.
     * 
     * This method analyzes the store structure and returns organized data
     * about state properties and action methods, including their locations
     * in the source code for precise modifications.
     * 
     * @returns {Object} Object containing state and actions arrays
     * @returns {Array} returns.state - Array of state properties with name, value, and location
     * @returns {Array} returns.actions - Array of action methods with name, value, and location
     * 
     * @example
     * const parsed = store.parse();
     * console.log(parsed.state);   // [{ name: 'count', value: '0', loc: {...} }]
     * console.log(parsed.actions); // [{ name: 'increment', value: '...', loc: {...} }]
     */
    parse() {
        if (this._parsed) {
            return this._parsed;
        }

        const ast = this._getAST();
        const code = this.code;
        const ret = {
            state: [],
            actions: []
        };

        try {
            traverse(ast, {
                ObjectProperty(path) {
                    const { node } = path;
                    if (node.key.name === 'state') {
                        node.value.properties.forEach(prop => {
                            ret.state.push({
                                name: prop.key.name,
                                value: code.substring(prop.value.start, prop.value.end),
                                loc: prop.loc,
                                node: prop
                            });
                        });
                    }
                    if (node.key.name === 'actions' && node.value.type === 'ObjectExpression') {
                        node.value.properties.forEach(prop => {
                            ret.actions.push({
                                name: prop.key.name,
                                value: code.substring(prop.start, prop.end),
                                loc: prop.loc,
                                node: prop
                            });
                        });
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to parse store: ${error.message}`);
        }

        this._parsed = ret;
        return ret;
    }

    /**
     * Removes an action by name.
     * 
     * This method searches for an action with the specified name and removes it
     * from the actions object. The code is automatically formatted after removal.
     * 
     * @param {string} name - Name of the action to remove
     * @returns {string} The modified code after removing the action
     * @throws {Error} When name is not provided or action is not found
     * 
     * @example
     * store.remove('increment');
     * console.log(store.code); // Action 'increment' is removed
     */
    remove(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Action name must be a non-empty string');
        }

        const ast = parse(this.code);
        let actionFound = false;

        traverse(ast, {
            ObjectMethod(path) {
                const { node } = path;
                if (assertName(path, name)) {
                    const index = path.parent.properties.indexOf(node);
                    path.parent.properties.splice(index, 1);
                    actionFound = true;
                }
            }
        });

        if (!actionFound) {
            console.warn(`Action '${name}' not found in store`);
            return this.code;
        }

        this.code = formatter(this.code, ast);
        this._invalidateCache();
        return this.code;
    }

    /**
     * Renames a state property.
     * 
     * This method finds a state property with the old name and changes it to
     * the new name. The operation maintains the property's value and position.
     * 
     * @param {string} oldName - Current name of the state property
     * @param {string} newName - New name for the state property
     * @returns {string} The modified code after renaming the state property
     * @throws {Error} When parameters are invalid or state property is not found
     * 
     * @example
     * store.renameState('count', 'counter');
     * // Changes: state: { count: 0 } -> state: { counter: 0 }
     */
    renameState(oldName, newName) {
        if (!oldName || !newName || typeof oldName !== 'string' || typeof newName !== 'string') {
            throw new Error('Both oldName and newName must be non-empty strings');
        }

        const ast = parse(this.code);
        let stateFound = false;

        traverse(ast, {
            ObjectProperty(path) {
                const { node } = path;
                if (assertStateName(path, oldName)) {
                    node.key.name = newName;
                    stateFound = true;
                }
            }
        });

        if (!stateFound) {
            console.warn(`State property '${oldName}' not found in store`);
            return this.code;
        }

        this.code = formatter(this.code, ast);
        this._invalidateCache();
        return this.code;
    }

    /**
     * Modifies the value of a state property.
     * 
     * This method finds a state property by name and updates its value.
     * The new value can be any valid JavaScript expression.
     * 
     * @param {string} name - Name of the state property to modify
     * @param {string} value - New value for the state property (as a string)
     * @returns {string} The modified code after updating the state value
     * @throws {Error} When parameters are invalid
     * 
     * @example
     * store.modifyState('count', '10');
     * store.modifyState('user', '{ name: "John", age: 30 }');
     * store.modifyState('items', '[]');
     */
    modifyState(name, value) {
        if (!name || typeof name !== 'string') {
            throw new Error('State name must be a non-empty string');
        }
        if (value === undefined || value === null) {
            throw new Error('State value cannot be undefined or null');
        }

        const ast = parse(this.code);
        const changes = [];
        let stateFound = false;

        traverse(ast, {
            ObjectProperty(path) {
                const { node } = path;
                if (assertStateName(path, name)) {
                    changes.push({
                        start: node.value.start,
                        end: node.value.end,
                        replacement: String(value)
                    });
                    stateFound = true;
                }
            }
        });

        if (!stateFound) {
            console.warn(`State property '${name}' not found in store`);
            return this.code;
        }

        this.code = updateCode(this.code, changes);
        this._invalidateCache();
        return this.code;
    }

    /**
     * Adds a new state property.
     * 
     * This method adds a new property to the state object. If a property
     * with the same name already exists, it will be overwritten.
     * 
     * @param {string} name - Name of the new state property
     * @param {string} value - Value of the new state property (as a string)
     * @returns {string} The modified code after adding the state property
     * @throws {Error} When parameters are invalid
     * 
     * @example
     * store.addState('loading', 'false');
     * store.addState('user', 'null');
     * store.addState('config', '{ theme: "dark" }');
     */
    addState(name, value) {
        if (!name || typeof name !== 'string') {
            throw new Error('State name must be a non-empty string');
        }
        if (value === undefined || value === null) {
            throw new Error('State value cannot be undefined or null');
        }

        const ast = parse(this.code);
        let stateObjectFound = false;

        traverse(ast, {
            ObjectProperty(path) {
                const { node } = path;
                if (node.key.name === 'state') {
                    const tpl = `var a = {
                        ${name}: ${value}
                    }`;
                    const ret = parse(tpl);
                    let newNode;
                    traverse(ret, {
                        ObjectProperty: path => {
                            newNode = path.node;
                        }
                    });
                    if (newNode) {
                        node.value.properties.push(newNode);
                        stateObjectFound = true;
                    }
                }
            }
        });

        if (!stateObjectFound) {
            throw new Error('State object not found in store');
        }

        this.code = generate(ast).code;
        this.code = formatter(this.code, parse(this.code));
        this._invalidateCache();
        return this.code;
    }

    /**
     * Modifies the content of an action method.
     * 
     * This method finds an action by name and replaces its entire content
     * with the provided new content. The content should be a valid method definition.
     * 
     * @param {string} name - Name of the action to modify
     * @param {string} content - New content for the action method
     * @returns {string} The modified code after updating the action
     * @throws {Error} When parameters are invalid
     * 
     * @example
     * store.modify('increment', 'increment(state, payload) { state.count += payload || 1; }');
     */
    modify(name, content) {
        if (!name || typeof name !== 'string') {
            throw new Error('Action name must be a non-empty string');
        }
        if (!content || typeof content !== 'string') {
            throw new Error('Action content must be a non-empty string');
        }

        const ast = parse(this.code);
        const changes = [];
        let actionFound = false;

        traverse(ast, {
            ObjectMethod(path) {
                const { node } = path;
                if (assertName(path, name)) {
                    changes.push({
                        start: node.start,
                        end: node.end,
                        replacement: content
                    });
                    actionFound = true;
                }
            }
        });

        if (!actionFound) {
            console.warn(`Action '${name}' not found in store`);
            return this.code;
        }

        this.code = updateCode(this.code, changes);
        this._invalidateCache();
        return this.code;
    }

    /**
     * Renames an action method.
     * 
     * This method finds an action with the old name and changes its name to
     * the new name while preserving its implementation.
     * 
     * @param {string} oldName - Current name of the action
     * @param {string} newName - New name for the action
     * @returns {string} The modified code after renaming the action
     * @throws {Error} When parameters are invalid
     * 
     * @example
     * store.rename('increment', 'incrementCounter');
     */
    rename(oldName, newName) {
        if (!oldName || !newName || typeof oldName !== 'string' || typeof newName !== 'string') {
            throw new Error('Both oldName and newName must be non-empty strings');
        }

        const ast = parse(this.code);
        const changes = [];
        let actionFound = false;

        traverse(ast, {
            ObjectMethod(path) {
                const { node } = path;
                if (assertName(path, oldName)) {
                    changes.push({
                        start: node.key.start,
                        end: node.key.end,
                        replacement: newName
                    });
                    actionFound = true;
                }
            }
        });

        if (!actionFound) {
            console.warn(`Action '${oldName}' not found in store`);
            return this.code;
        }

        this.code = updateCode(this.code, changes);
        this._invalidateCache();
        return this.code;
    }

    /**
     * Adds a new action method.
     * 
     * This method creates a new action in the actions object. If an action
     * with the same name already exists, a warning is logged and the action
     * is not added.
     * 
     * @param {string} name - Name of the new action
     * @returns {string} The modified code after adding the action, or original code if action exists
     * @throws {Error} When name is invalid
     * 
     * @example
     * store.add('decrement');
     * // Creates: decrement(state, payload) {}
     */
    add(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Action name must be a non-empty string');
        }

        const ret = this.parse();
        const list = ret.actions.map(item => item.name);
        
        if (list.indexOf(name) > -1) {
            console.warn(`Action '${name}' already exists in store`);
            return this.code;
        }

        const tpl = `var a = {${name}(state, payload) {}}`;
        const ast = parse(this.code);
        const ret2 = parse(tpl);
        let newNode;
        
        traverse(ret2, {
            ObjectMethod: path => {
                newNode = path.node;
            }
        });

        if (!newNode) {
            throw new Error('Failed to create new action node');
        }

        const lastAction = list[list.length - 1];
        let actionAdded = false;

        if (lastAction) {
            traverse(ast, {
                ObjectMethod: path => {
                    if (assertName(path, lastAction)) {
                        path.parent.properties.push(newNode);
                        actionAdded = true;
                    }
                }
            });
        } else {
            // If no actions exist, find the actions object and add the first action
            traverse(ast, {
                ObjectProperty(path) {
                    const { node } = path;
                    if (node.key.name === 'actions' && node.value.type === 'ObjectExpression') {
                        node.value.properties.push(newNode);
                        actionAdded = true;
                    }
                }
            });
        }

        if (!actionAdded) {
            throw new Error('Failed to add action to store');
        }

        this.code = generate(ast).code;
        this.code = formatter(this.code, parse(this.code));
        this._invalidateCache();
        return this.code;
    }

    /**
     * Modifies content based on AST node position.
     * 
     * This method provides low-level access to modify any part of the store
     * code by specifying the exact start and end positions from an AST node.
     * 
     * @param {Object} node - AST node with start and end properties
     * @param {number} node.start - Start position in the source code
     * @param {number} node.end - End position in the source code
     * @param {string} content - Replacement content
     * @returns {string} The modified code after replacement
     * @throws {Error} When parameters are invalid
     * 
     * @example
     * const parsed = store.parse();
     * const stateNode = parsed.state[0].node;
     * store.modifyByStartEnd(stateNode, 'newValue');
     */
    modifyByStartEnd(node, content) {
        if (!node || typeof node.start !== 'number' || typeof node.end !== 'number') {
            throw new Error('Node must have valid start and end properties');
        }
        if (content === undefined || content === null) {
            throw new Error('Content cannot be undefined or null');
        }

        const changes = [
            {
                start: node.start,
                end: node.end,
                replacement: String(content)
            }
        ];
        
        this.code = updateCode(this.code, changes);
        this.code = formatter(this.code, parse(this.code));
        this._invalidateCache();
        return this.code;
    }

    /**
     * Validates the current store structure.
     * 
     * @returns {Object} Validation result with isValid flag and errors array
     * @example
     * const validation = store.validate();
     * if (!validation.isValid) {
     *   console.error('Store validation errors:', validation.errors);
     * }
     */
    validate() {
        const errors = [];
        
        try {
            const parsed = this.parse();
            
            if (!parsed.state || !Array.isArray(parsed.state)) {
                errors.push('Store must have a state object');
            }
            
            if (!parsed.actions || !Array.isArray(parsed.actions)) {
                errors.push('Store must have an actions object');
            }
            
            // Check for duplicate state names
            const stateNames = parsed.state.map(s => s.name);
            const duplicateStates = stateNames.filter((name, index) => stateNames.indexOf(name) !== index);
            if (duplicateStates.length > 0) {
                errors.push(`Duplicate state properties: ${duplicateStates.join(', ')}`);
            }
            
            // Check for duplicate action names
            const actionNames = parsed.actions.map(a => a.name);
            const duplicateActions = actionNames.filter((name, index) => actionNames.indexOf(name) !== index);
            if (duplicateActions.length > 0) {
                errors.push(`Duplicate action methods: ${duplicateActions.join(', ')}`);
            }
            
        } catch (error) {
            errors.push(`Parse error: ${error.message}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Helper function to check if a path represents an action method with the given name.
 * 
 * @private
 * @param {Object} path - Babel traverse path
 * @param {string} name - Action name to check
 * @returns {boolean} True if the path represents the named action
 */
function assertName(path, name) {
    const node = path.node;
    return node.key.name === name && path.parentPath.parent.key.name === 'actions';
}

/**
 * Helper function to check if a path represents a state property with the given name.
 * 
 * @private
 * @param {Object} path - Babel traverse path
 * @param {string} name - State property name to check
 * @returns {boolean} True if the path represents the named state property
 */
function assertStateName(path, name) {
    const node = path.node;
    return node.key.name === name && path.parentPath.parent.key && path.parentPath.parent.key.name === 'state';
}

export default Store;
