/**
 * TypeScript definitions for Roy-AST library
 * 
 * This file provides comprehensive type definitions for all classes and methods
 * in the Roy-AST library, enabling better IDE support and type checking.
 */

// Core utility types
export interface ASTNode {
  type: string;
  start: number;
  end: number;
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  [key: string]: any;
}

export interface CodeChange {
  start: number;
  end: number;
  replacement: string;
}

export interface CacheStats {
  astCacheSize: number;
  astCacheLimit: number;
  memoizationCacheSize: number;
  astHitRate: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Store-related types
export interface StateProperty {
  name: string;
  value: string;
  loc: ASTNode['loc'];
  node: ASTNode;
}

export interface ActionMethod {
  name: string;
  value: string;
  loc: ASTNode['loc'];
  node: ASTNode;
}

export interface StoreParsedResult {
  state: StateProperty[];
  actions: ActionMethod[];
}

/**
 * Store class for manipulating Roy.js store files containing state and actions.
 */
export class Store {
  /**
   * The current source code of the store
   */
  code: string;

  /**
   * Creates a new Store instance.
   * @param code - The source code of the store file
   * @throws {Error} When code is not a valid string
   */
  constructor(code: string);

  /**
   * Parses the store code and extracts state and actions.
   * @returns Object containing state and actions arrays
   */
  parse(): StoreParsedResult;

  /**
   * Removes an action by name.
   * @param name - Name of the action to remove
   * @returns The modified code after removing the action
   * @throws {Error} When name is not provided or action is not found
   */
  remove(name: string): string;

  /**
   * Renames a state property.
   * @param oldName - Current name of the state property
   * @param newName - New name for the state property
   * @returns The modified code after renaming the state property
   * @throws {Error} When parameters are invalid or state property is not found
   */
  renameState(oldName: string, newName: string): string;

  /**
   * Modifies the value of a state property.
   * @param name - Name of the state property to modify
   * @param value - New value for the state property (as a string)
   * @returns The modified code after updating the state value
   * @throws {Error} When parameters are invalid
   */
  modifyState(name: string, value: string): string;

  /**
   * Adds a new state property.
   * @param name - Name of the new state property
   * @param value - Value of the new state property (as a string)
   * @returns The modified code after adding the state property
   * @throws {Error} When parameters are invalid
   */
  addState(name: string, value: string): string;

  /**
   * Modifies the content of an action method.
   * @param name - Name of the action to modify
   * @param content - New content for the action method
   * @returns The modified code after updating the action
   * @throws {Error} When parameters are invalid
   */
  modify(name: string, content: string): string;

  /**
   * Renames an action method.
   * @param oldName - Current name of the action
   * @param newName - New name for the action
   * @returns The modified code after renaming the action
   * @throws {Error} When parameters are invalid
   */
  rename(oldName: string, newName: string): string;

  /**
   * Adds a new action method.
   * @param name - Name of the new action
   * @returns The modified code after adding the action, or original code if action exists
   * @throws {Error} When name is invalid
   */
  add(name: string): string;

  /**
   * Modifies content based on AST node position.
   * @param node - AST node with start and end properties
   * @param content - Replacement content
   * @returns The modified code after replacement
   * @throws {Error} When parameters are invalid
   */
  modifyByStartEnd(node: { start: number; end: number }, content: string): string;

  /**
   * Validates the current store structure.
   * @returns Validation result with isValid flag and errors array
   */
  validate(): ValidationResult;
}

// View-related types
export interface JSXElement {
  name: string;
  start: number;
  end: number;
  loc: ASTNode['loc'];
  children: JSXElement[];
}

export interface ClassMethod {
  name: string;
  start: number;
  end: number;
  loc: ASTNode['loc'];
}

export interface ClassDeclaration {
  name: string;
  methods: ClassMethod[];
}

export interface ViewParsedResult {
  elements: JSXElement[];
  class: ClassDeclaration[];
}

/**
 * View class for manipulating React components and JSX elements.
 */
export class View {
  /**
   * The current source code of the view
   */
  code: string;

  /**
   * Creates a new View instance.
   * @param code - The source code of the view file
   * @throws {Error} When code is not a valid string
   */
  constructor(code: string);

  /**
   * Parses the view code and extracts elements and class information.
   * @returns Object containing elements and class arrays
   */
  parse(): ViewParsedResult;

  /**
   * Sets an attribute on a JSX element.
   * @param node - JSX node or element name
   * @param name - Attribute name
   * @param value - Attribute value
   * @returns The modified code
   */
  attrs(node: ASTNode | string, name: string, value: string): string;

  /**
   * Removes an attribute from a JSX element.
   * @param node - JSX node or element name
   * @param name - Attribute name to remove
   * @returns The modified code
   */
  removeAttr(node: ASTNode | string, name: string): string;

  /**
   * Removes a JSX element by name.
   * @param name - Name of the element to remove
   * @returns The modified code
   */
  remove(name: string): string;

  /**
   * Removes a JSX element by its start position.
   * @param start - Start position of the element
   * @returns The modified code
   */
  removeByStart(start: number | string): string;

  /**
   * Clones a JSX element by its start position.
   * @param start - Start position of the element
   * @returns The modified code
   */
  cloneByStart(start: number | string): string;

  /**
   * Finds JSX elements by name.
   * @param name - Element name to search for
   * @param isPath - Whether to return path objects
   * @param start - Optional start position filter
   * @returns Array of matching elements or paths
   */
  find(name: string, isPath?: boolean, start?: number): ASTNode[];

  /**
   * Finds an element by its start position.
   * @param start - Start position
   * @param isPath - Whether to return path object
   * @returns Element or path object
   */
  findByStart(start: number | string, isPath?: boolean): ASTNode | undefined;

  /**
   * Finds an element by its ID attribute.
   * @param id - ID to search for
   * @param isPath - Whether to return path object
   * @returns Element or path object
   */
  findById(id: string, isPath?: boolean): ASTNode | undefined;

  /**
   * Finds elements using a custom callback function.
   * @param callback - Function to test elements
   * @param isPath - Whether to return path objects
   * @returns Array of matching elements or paths
   */
  findBy(callback: (node: ASTNode, parent: ASTNode) => boolean, isPath?: boolean): ASTNode[];

  /**
   * Adds a child element to a parent node.
   * @param node - Parent node or element name
   * @param child - Child element code
   * @returns The modified code
   */
  add(node: ASTNode | string, child: string): string;

  /**
   * Renames a JSX element.
   * @param oldName - Current element name
   * @param newName - New element name
   * @returns The modified code
   */
  rename(oldName: string, newName: string): string;

  /**
   * Adds state binding to a JSX element.
   * @param start - Element start position
   * @param name - Attribute name
   * @param value - State value expression
   * @returns The modified code
   */
  addState(start: number, name: string, value: string): string;

  /**
   * Removes state binding from a JSX element.
   * @param start - Element start position
   * @param name - Attribute name
   * @param value - State value expression
   * @returns The modified code
   */
  removeState(start: number, name: string, value: string): string;

  /**
   * Edits state binding on a JSX element.
   * @param start - Element start position
   * @param name - Attribute name
   * @param oldValue - Old state value expression
   * @param newValue - New state value expression
   * @returns The modified code
   */
  editState(start: number, name: string, oldValue: string, newValue: string): string;

  /**
   * Adds an event handler to a JSX element.
   * @param start - Element start position
   * @param name - Event name
   * @param value - Handler method name
   * @param body - Handler method body
   * @returns The modified code
   */
  addHandler(start: number, name: string, value: string, body: string): string;

  /**
   * Removes an event handler from a JSX element.
   * @param start - Element start position
   * @param name - Event name
   * @param value - Handler method name
   * @returns The modified code
   */
  removeHandler(start: number, name: string, value: string): string;

  /**
   * Edits an event handler on a JSX element.
   * @param start - Element start position
   * @param name - Event name
   * @param value - Handler method name
   * @param body - New handler method body
   * @returns The modified code
   */
  editHandler(start: number, name: string, value: string, body: string): string;

  /**
   * Adds a package import for a component.
   * @param component - Component name
   * @param pkgName - Package name
   * @param returnCode - Whether to return modified code
   * @returns The modified code or empty string
   */
  addPkgName(component: string, pkgName: string, returnCode?: boolean): string;

  /**
   * Inserts code before an element.
   * @param start - Element start position
   * @param code - Code to insert
   * @param component - Component name for import
   * @param pkgName - Package name for import
   * @returns The modified code
   */
  beforeByStart(start: number, code: string, component?: string, pkgName?: string): string;

  /**
   * Inserts code after an element.
   * @param start - Element start position
   * @param code - Code to insert
   * @param component - Component name for import
   * @param pkgName - Package name for import
   * @returns The modified code
   */
  afterByStart(start: number, code: string, component?: string, pkgName?: string): string;

  /**
   * Adds code to an element.
   * @param start - Element start position
   * @param code - Code to add
   * @param component - Component name for import
   * @param pkgName - Package name for import
   * @param override - Whether to override existing content
   * @returns The modified code
   */
  addByStart(start: number, code: string, component?: string, pkgName?: string, override?: boolean): string;

  /**
   * Finds text nodes by start position.
   * @param start - Start position
   * @param isPath - Whether to return path object
   * @returns Text node or path object
   */
  findTextByStart(start: number, isPath?: boolean): ASTNode | undefined;

  /**
   * Modifies text content of a text node.
   * @param start - Start position of text node
   * @param value - New text value
   * @returns The modified code
   */
  attrText(start: number, value: string): string;
}

// Service-related types
export interface ServiceDefinition {
  name: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

/**
 * Service class for manipulating Roy.js service configurations.
 */
export class Service {
  /**
   * The current source code of the service
   */
  code: string;

  /**
   * Creates a new Service instance.
   * @param code - The source code of the service file
   * @throws {Error} When code is not a valid string
   */
  constructor(code: string);

  /**
   * Parses the service code and extracts service definitions.
   * @returns Array of service objects with properties
   */
  parse(): ServiceDefinition[];

  /**
   * Removes a service definition by name.
   * @param name - Name of the service to remove
   * @returns The modified code
   */
  remove(name: string): string;

  /**
   * Renames a service definition.
   * @param oldName - Current service name
   * @param newName - New service name
   * @returns The modified code
   */
  rename(oldName: string, newName: string): string;

  /**
   * Creates or updates a service definition.
   * @param name - Service name
   * @param object - Service configuration object
   * @returns The modified code
   */
  modify(name: string, object: string): string;
}

// Utility functions
export interface ParseOptions {
  sourceType?: 'module' | 'script';
  allowImportExportEverywhere?: boolean;
  allowReturnOutsideFunction?: boolean;
  strictMode?: boolean;
  plugins?: string[];
}

export interface GenerateOptions {
  jsonCompatibleStrings?: boolean;
  jsescOption?: {
    minimal?: boolean;
  };
  compact?: boolean;
  comments?: boolean;
}

export interface FormatOptions {
  arrowParens?: 'avoid' | 'always';
  bracketSpacing?: boolean;
  htmlWhitespaceSensitivity?: 'css' | 'strict' | 'ignore';
  insertPragma?: boolean;
  jsxBracketSameLine?: boolean;
  jsxSingleQuote?: boolean;
  printWidth?: number;
  proseWrap?: 'always' | 'never' | 'preserve';
  requirePragma?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
  tabWidth?: number;
  trailingComma?: 'none' | 'es5' | 'all';
  useTabs?: boolean;
  parser?: () => ASTNode;
}

/**
 * Parses JavaScript/JSX code into an AST.
 * @param code - The source code to parse
 * @param useCache - Whether to use caching (default: true)
 * @returns Parsed AST
 * @throws {Error} When code is invalid
 */
export function parse(code: string, useCache?: boolean): ASTNode;

/**
 * Parses a JavaScript expression into an AST.
 * @param code - The expression code to parse
 * @param useCache - Whether to use caching (default: true)
 * @returns Parsed expression AST
 * @throws {Error} When code is invalid
 */
export function parseExpression(code: string, useCache?: boolean): ASTNode;

/**
 * Updates code by applying multiple changes.
 * @param code - Original code
 * @param changes - Array of changes to apply
 * @returns Updated code
 */
export function updateCode(code: string, changes: CodeChange[]): string;

/**
 * Decodes Unicode escape sequences in a string.
 * @param str - String to decode
 * @returns Decoded string
 */
export function decodeUnicode(str: string): string;

/**
 * Formats code using Prettier.
 * @param text - Text to format
 * @param ast - AST object
 * @param customConfig - Custom formatting configuration
 * @returns Formatted text
 */
export function formatter(text: string, ast: ASTNode, customConfig?: FormatOptions): string;

/**
 * Generates code from an AST.
 * @param ast - AST to generate code from
 * @param options - Generation options
 * @returns Generated code object
 * @throws {Error} When AST is invalid
 */
export function generate(ast: ASTNode, options?: GenerateOptions): { code: string; map?: any };

/**
 * Clears all caches.
 */
export function clearCaches(): void;

/**
 * Gets cache statistics for monitoring.
 * @returns Cache statistics
 */
export function getCacheStats(): CacheStats;

/**
 * Validates AST structure.
 * @param ast - AST to validate
 * @returns Whether AST is valid
 */
export function validateAST(ast: ASTNode): boolean;

/**
 * Batch parses multiple code strings.
 * @param codeStrings - Array of code strings to parse
 * @param useCache - Whether to use caching
 * @returns Array of parsed ASTs
 */
export function batchParse(codeStrings: string[], useCache?: boolean): (ASTNode | null)[];

// Legacy exports for backward compatibility
export const Action: typeof Store;
export const Element: typeof View;

// Default export
declare const _default: {
  Store: typeof Store;
  View: typeof View;
  Service: typeof Service;
};

export default _default;