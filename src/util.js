import * as babylon from '@babel/parser';
import prettier from 'prettier/standalone';
import babelGenerate from '@babel/generator';

// Enhanced AST caching with LRU eviction
const CACHE_SIZE = 100;
const AST_CACHE = new Map();
const CACHE_ORDER = [];

// Memoization cache for frequently used operations
const MEMOIZATION_CACHE = new Map();

// Optimized parser configuration
const config = {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    strictMode: false,
    plugins: [
        'jsx',
        'flow',
        'doExpressions',
        'objectRestSpread',
        'decorators-legacy',
        'classProperties',
        'exportExtensions',
        'asyncGenerators',
        'functionBind',
        'functionSent',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
        'topLevelAwait'
    ]
};

/**
 * Enhanced parse function with caching and performance optimization
 * @param {string} code - The source code to parse
 * @param {boolean} useCache - Whether to use caching (default: true)
 * @returns {Object} - Parsed AST
 */
export const parse = function parse(code, useCache = true) {
    if (!code || typeof code !== 'string') {
        throw new Error('Invalid code provided to parse function');
    }

    // Create cache key based on code content
    const cacheKey = hashCode(code);
    
    // Check cache first
    if (useCache && AST_CACHE.has(cacheKey)) {
        // Move to end of cache order (LRU)
        const index = CACHE_ORDER.indexOf(cacheKey);
        if (index > -1) {
            CACHE_ORDER.splice(index, 1);
        }
        CACHE_ORDER.push(cacheKey);
        return AST_CACHE.get(cacheKey);
    }

    try {
        // Parse with error handling
        const ast = babylon.parse(code, config);
        
        // Cache the result if caching is enabled
        if (useCache) {
            // Implement LRU eviction
            if (AST_CACHE.size >= CACHE_SIZE) {
                const oldestKey = CACHE_ORDER.shift();
                AST_CACHE.delete(oldestKey);
            }
            
            AST_CACHE.set(cacheKey, ast);
            CACHE_ORDER.push(cacheKey);
        }
        
        return ast;
    } catch (error) {
        throw new Error(`Parse error: ${error.message}`);
    }
};

/**
 * Enhanced parseExpression with caching
 * @param {string} code - The expression code to parse
 * @param {boolean} useCache - Whether to use caching (default: true)
 * @returns {Object} - Parsed expression AST
 */
export const parseExpression = function parseExpression(code, useCache = true) {
    if (!code || typeof code !== 'string') {
        throw new Error('Invalid code provided to parseExpression function');
    }

    const cacheKey = `expr_${hashCode(code)}`;
    
    if (useCache && AST_CACHE.has(cacheKey)) {
        return AST_CACHE.get(cacheKey);
    }

    try {
        const ast = babylon.parseExpression(code, config);
        
        if (useCache) {
            if (AST_CACHE.size >= CACHE_SIZE) {
                const oldestKey = CACHE_ORDER.shift();
                AST_CACHE.delete(oldestKey);
            }
            AST_CACHE.set(cacheKey, ast);
            CACHE_ORDER.push(cacheKey);
        }
        
        return ast;
    } catch (error) {
        throw new Error(`Parse expression error: ${error.message}`);
    }
};

/**
 * Optimized updateCode function with batch processing
 * @param {string} code - Original code
 * @param {Array} changes - Array of changes to apply
 * @returns {string} - Updated code
 */
export const updateCode = function updateCode(code, changes) {
    if (!code || !Array.isArray(changes) || changes.length === 0) {
        return code;
    }

    // Sort changes by start position in descending order for efficient processing
    const sortedChanges = [...changes].sort((a, b) => b.start - a.start);
    
    // Convert to array for efficient splicing
    let codeArray = code.split('');
    
    // Apply changes in reverse order to maintain correct positions
    for (const change of sortedChanges) {
        if (typeof change.start === 'number' && typeof change.end === 'number') {
            const length = change.end - change.start;
            codeArray.splice(change.start, length, change.replacement || '');
        }
    }
    
    return codeArray.join('');
};

/**
 * Enhanced decodeUnicode function with memoization
 * @param {string} str - String to decode
 * @returns {string} - Decoded string
 */
export const decodeUnicode = function decodeUnicode(str) {
    if (!str || typeof str !== 'string') {
        return str;
    }

    const cacheKey = `unicode_${str}`;
    
    if (MEMOIZATION_CACHE.has(cacheKey)) {
        return MEMOIZATION_CACHE.get(cacheKey);
    }

    const decoded = unescape(str.replace(/\\u/g, '%u'));
    
    // Cache the result
    MEMOIZATION_CACHE.set(cacheKey, decoded);
    
    // Clean cache if it gets too large
    if (MEMOIZATION_CACHE.size > 1000) {
        const keysToDelete = Array.from(MEMOIZATION_CACHE.keys()).slice(0, 500);
        keysToDelete.forEach(key => MEMOIZATION_CACHE.delete(key));
    }
    
    return decoded;
};

/**
 * Enhanced formatter with performance optimizations
 * @param {string} text - Text to format
 * @param {Object} ast - AST object
 * @param {Object} customConfig - Custom formatting configuration
 * @returns {string} - Formatted text
 */
export const formatter = function formatter(text, ast, customConfig = {}) {
    if (!text || !ast) {
        return text;
    }

    // Create cache key for formatting
    const cacheKey = `format_${hashCode(text)}`;
    
    if (MEMOIZATION_CACHE.has(cacheKey)) {
        return MEMOIZATION_CACHE.get(cacheKey);
    }

    const defaultConfig = {
        'arrowParens': 'avoid',
        'bracketSpacing': true,
        'htmlWhitespaceSensitivity': 'css',
        'insertPragma': false,
        'jsxBracketSameLine': true,
        'jsxSingleQuote': false,
        'printWidth': 160,
        'proseWrap': 'preserve',
        'requirePragma': false,
        'semi': true,
        'singleQuote': true,
        'tabWidth': 2,
        'trailingComma': 'none',
        'useTabs': false,
        'parser': () => ast
    };

    const config = { ...defaultConfig, ...customConfig };

    try {
        const formatted = prettier.format(text, config);
        
        // Cache the result
        MEMOIZATION_CACHE.set(cacheKey, formatted);
        
        return formatted;
    } catch (error) {
        console.warn('Formatting failed, returning original text:', error.message);
        return text;
    }
};

/**
 * Enhanced generate function with performance optimizations
 * @param {Object} ast - AST to generate code from
 * @param {Object} options - Generation options
 * @returns {Object} - Generated code object
 */
export const generate = function generate(ast, options = {}) {
    if (!ast) {
        throw new Error('AST is required for code generation');
    }

    const defaultOptions = {
        jsonCompatibleStrings: true,
        jsescOption: {
            minimal: true
        },
        compact: false,
        comments: true
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        const ret = babelGenerate(ast, mergedOptions);
        ret.code = decodeUnicode(ret.code);
        return ret;
    } catch (error) {
        throw new Error(`Code generation failed: ${error.message}`);
    }
};

/**
 * Simple hash function for cache keys
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function hashCode(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash;
}

/**
 * Clear all caches - useful for testing or memory management
 */
export const clearCaches = function clearCaches() {
    AST_CACHE.clear();
    CACHE_ORDER.length = 0;
    MEMOIZATION_CACHE.clear();
};

/**
 * Get cache statistics for monitoring
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = function getCacheStats() {
    return {
        astCacheSize: AST_CACHE.size,
        astCacheLimit: CACHE_SIZE,
        memoizationCacheSize: MEMOIZATION_CACHE.size,
        astHitRate: AST_CACHE.size > 0 ? (AST_CACHE.size / CACHE_ORDER.length) : 0
    };
};

/**
 * Validate AST structure
 * @param {Object} ast - AST to validate
 * @returns {boolean} - Whether AST is valid
 */
export const validateAST = function validateAST(ast) {
    return ast && typeof ast === 'object' && ast.type && ast.type === 'File';
};

/**
 * Batch parse multiple code strings
 * @param {Array} codeStrings - Array of code strings to parse
 * @param {boolean} useCache - Whether to use caching
 * @returns {Array} - Array of parsed ASTs
 */
export const batchParse = function batchParse(codeStrings, useCache = true) {
    if (!Array.isArray(codeStrings)) {
        throw new Error('Code strings must be an array');
    }

    return codeStrings.map(code => {
        try {
            return parse(code, useCache);
        } catch (error) {
            console.error(`Failed to parse code: ${error.message}`);
            return null;
        }
    }).filter(ast => ast !== null);
};
