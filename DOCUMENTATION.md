# Roy-AST Documentation

A comprehensive static analysis tool for Roy.js applications, providing powerful AST manipulation capabilities for Store, View, and Service components.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Core Concepts](#core-concepts)
4. [API Reference](#api-reference)
5. [Usage Examples](#usage-examples)
6. [Performance Considerations](#performance-considerations)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

Roy-AST is a powerful static analysis library that provides AST (Abstract Syntax Tree) manipulation capabilities for Roy.js applications. It enables developers to programmatically analyze, modify, and generate code for three main components:

- **Store**: Manages application state and actions
- **View**: Handles React components and JSX elements
- **Service**: Manages API service configurations

### Key Features

- **AST Parsing**: Parse JavaScript/JSX code into manipulable AST structures
- **Code Generation**: Generate formatted code from AST modifications
- **State Management**: CRUD operations for application state
- **Component Manipulation**: Add, remove, and modify React components
- **Service Configuration**: Manage API service definitions
- **Code Formatting**: Automatic code formatting with Prettier integration

## Installation

```bash
npm install @royjs/ast --save
```

## Core Concepts

### AST (Abstract Syntax Tree)
Roy-AST uses Babel's parser to convert source code into AST nodes that can be programmatically manipulated. This allows for precise code modifications while maintaining proper syntax and formatting.

### Code Lifecycle
1. **Parse**: Convert source code to AST
2. **Traverse**: Navigate and modify AST nodes
3. **Generate**: Convert modified AST back to code
4. **Format**: Apply consistent formatting

## API Reference

### Store Class

The Store class provides methods to manipulate Roy.js store files containing state and actions.

#### Constructor

```javascript
import { Store } from '@royjs/ast';
const store = new Store(code);
```

**Parameters:**
- `code` (String): The source code of the store file

#### Methods

##### `parse()`
Parses the store code and extracts state and actions.

**Returns:** Object containing:
- `state` (Array): Array of state properties with name, value, and location
- `actions` (Array): Array of action methods with name, value, and location

**Example:**
```javascript
const store = new Store(`
export default {
  state: {
    count: 0,
    user: null
  },
  actions: {
    increment(state) {
      state.count++;
    }
  }
}
`);

const parsed = store.parse();
// Returns: { state: [...], actions: [...] }
```

##### `remove(name)`
Removes an action by name.

**Parameters:**
- `name` (String): Name of the action to remove

**Returns:** String - Modified code

##### `renameState(oldName, newName)`
Renames a state property.

**Parameters:**
- `oldName` (String): Current name of the state property
- `newName` (String): New name for the state property

**Returns:** String - Modified code

##### `modifyState(name, value)`
Modifies the value of a state property.

**Parameters:**
- `name` (String): Name of the state property
- `value` (String): New value for the state property

**Returns:** String - Modified code

##### `addState(name, value)`
Adds a new state property.

**Parameters:**
- `name` (String): Name of the new state property
- `value` (String): Value of the new state property

**Returns:** String - Modified code

##### `modify(name, content)`
Modifies the content of an action.

**Parameters:**
- `name` (String): Name of the action
- `content` (String): New content for the action

**Returns:** String - Modified code

##### `rename(oldName, newName)`
Renames an action.

**Parameters:**
- `oldName` (String): Current name of the action
- `newName` (String): New name for the action

**Returns:** String - Modified code

##### `add(name)`
Adds a new action. If an action with the same name exists, it will not be added.

**Parameters:**
- `name` (String): Name of the new action

**Returns:** String - Modified code

##### `modifyByStartEnd(node, content)`
Modifies content based on AST node position.

**Parameters:**
- `node` (Object): AST node with start and end properties
- `content` (String): Replacement content

**Returns:** String - Modified code

### View Class

The View class provides methods to manipulate React components and JSX elements.

#### Constructor

```javascript
import { View } from '@royjs/ast';
const view = new View(code);
```

**Parameters:**
- `code` (String): The source code of the view file

#### Methods

##### `parse()`
Parses the view code and extracts elements and class information.

**Returns:** Object containing:
- `elements` (Array): Array of JSX elements with hierarchy
- `class` (Array): Array of class declarations with methods

##### `attrs(node, name, value)`
Sets an attribute on a JSX element.

**Parameters:**
- `node` (Node|String): JSX node or element name
- `name` (String): Attribute name
- `value` (String): Attribute value

**Returns:** String - Modified code

##### `removeAttr(node, name)`
Removes an attribute from a JSX element.

**Parameters:**
- `node` (Node|String): JSX node or element name
- `name` (String): Attribute name to remove

**Returns:** String - Modified code

##### `remove(name)`
Removes a JSX element by name.

**Parameters:**
- `name` (String): Name of the element to remove

**Returns:** String - Modified code

##### `find(name, isPath, start)`
Finds JSX elements by name.

**Parameters:**
- `name` (String): Element name to search for
- `isPath` (Boolean): Whether to return path objects
- `start` (Number): Optional start position filter

**Returns:** Array - Array of matching elements or paths

##### `findByStart(start, isPath)`
Finds an element by its start position.

**Parameters:**
- `start` (Number|String): Start position
- `isPath` (Boolean): Whether to return path object

**Returns:** Element or path object

##### `add(node, child)`
Adds a child element to a parent node.

**Parameters:**
- `node` (Node|String): Parent node or element name
- `child` (String): Child element code

**Returns:** String - Modified code

##### `rename(oldName, newName)`
Renames a JSX element.

**Parameters:**
- `oldName` (String): Current element name
- `newName` (String): New element name

**Returns:** String - Modified code

##### `addState(start, name, value)`
Adds state binding to a JSX element.

**Parameters:**
- `start` (Number): Element start position
- `name` (String): Attribute name
- `value` (String): State value expression

**Returns:** String - Modified code

##### `removeState(start, name, value)`
Removes state binding from a JSX element.

**Parameters:**
- `start` (Number): Element start position
- `name` (String): Attribute name
- `value` (String): State value expression

**Returns:** String - Modified code

##### `addHandler(start, name, value, body)`
Adds an event handler to a JSX element.

**Parameters:**
- `start` (Number): Element start position
- `name` (String): Event name
- `value` (String): Handler method name
- `body` (String): Handler method body

**Returns:** String - Modified code

##### `removeHandler(start, name, value)`
Removes an event handler from a JSX element.

**Parameters:**
- `start` (Number): Element start position
- `name` (String): Event name
- `value` (String): Handler method name

**Returns:** String - Modified code

### Service Class

The Service class provides methods to manipulate service configurations.

#### Constructor

```javascript
import { Service } from '@royjs/ast';
const service = new Service(code);
```

**Parameters:**
- `code` (String): The source code of the service file

#### Methods

##### `parse()`
Parses the service code and extracts service definitions.

**Returns:** Array - Array of service objects with properties

##### `remove(name)`
Removes a service definition by name.

**Parameters:**
- `name` (String): Name of the service to remove

**Returns:** String - Modified code

##### `rename(oldName, newName)`
Renames a service definition.

**Parameters:**
- `oldName` (String): Current service name
- `newName` (String): New service name

**Returns:** String - Modified code

##### `modify(name, object)`
Creates or updates a service definition.

**Parameters:**
- `name` (String): Service name
- `object` (String): Service configuration object

**Returns:** String - Modified code

## Usage Examples

### Working with Store

```javascript
import { Store } from '@royjs/ast';

const storeCode = `
export default {
  state: {
    count: 0,
    user: null
  },
  actions: {
    increment(state) {
      state.count++;
    },
    setUser(state, user) {
      state.user = user;
    }
  }
}
`;

const store = new Store(storeCode);

// Parse existing store
const parsed = store.parse();
console.log(parsed.state); // [{ name: 'count', value: '0', loc: {...} }, ...]

// Add new state
store.addState('loading', 'false');

// Modify existing state
store.modifyState('count', '10');

// Add new action
store.add('decrement');

// Rename action
store.rename('increment', 'incrementCount');

// Get modified code
console.log(store.code);
```

### Working with View

```javascript
import { View } from '@royjs/ast';

const viewCode = `
import React from 'react';

@connect(state => state)
class UserList extends React.Component {
  render() {
    return (
      <div className="user-list">
        <h1>Users</h1>
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}
`;

const view = new View(viewCode);

// Parse view
const parsed = view.parse();
console.log(parsed.elements); // JSX element hierarchy

// Find elements
const divs = view.find('div');
console.log(divs.length); // Number of div elements

// Add attribute
view.attrs('div', 'data-testid', '"user-list"');

// Add state binding
const listStart = view.find('ul')[0].start;
view.addState(listStart, 'className', 'loading ? "loading" : ""');

// Add event handler
view.addHandler(listStart, 'onClick', 'handleClick', '() => { console.log("clicked"); }');

console.log(view.code);
```

### Working with Service

```javascript
import { Service } from '@royjs/ast';

const serviceCode = `
batchCreateServices({
  userService: {
    url: '/api/users',
    method: 'GET'
  },
  postService: {
    url: '/api/posts',
    method: 'POST'
  }
});
`;

const service = new Service(serviceCode);

// Parse services
const services = service.parse();
console.log(services); // [{ name: 'userService', url: '/api/users', ... }, ...]

// Add new service
service.modify('commentService', `{
  url: '/api/comments',
  method: 'GET'
}`);

// Rename service
service.rename('userService', 'userApiService');

// Remove service
service.remove('postService');

console.log(service.code);
```

## Performance Considerations

### AST Caching
- AST parsing is expensive; consider caching parsed ASTs when possible
- The library includes commented-out caching logic in `util.js` that can be enabled

### Batch Operations
- When making multiple modifications, batch them together to avoid multiple parse/format cycles
- Use `modifyByStartEnd` for direct position-based modifications when possible

### Memory Management
- Large ASTs can consume significant memory
- Consider processing files in chunks for large codebases
- Clean up references to AST nodes when done

### Code Formatting
- Formatting is applied after each modification, which can be expensive
- Consider deferring formatting until all modifications are complete

## Best Practices

### Error Handling
Always wrap AST operations in try-catch blocks:

```javascript
try {
  const store = new Store(code);
  const result = store.parse();
  // Process result
} catch (error) {
  console.error('AST parsing failed:', error);
}
```

### Code Validation
Validate generated code before using it:

```javascript
import { parse } from '@royjs/ast/util';

function validateCode(code) {
  try {
    parse(code);
    return true;
  } catch (error) {
    return false;
  }
}
```

### Performance Monitoring
Monitor performance for large files:

```javascript
console.time('AST Operation');
const result = store.parse();
console.timeEnd('AST Operation');
```

## Troubleshooting

### Common Issues

#### Parse Errors
- **Issue**: Code fails to parse
- **Solution**: Ensure code is valid JavaScript/JSX and uses supported syntax

#### Missing Nodes
- **Issue**: `find` methods return empty arrays
- **Solution**: Check element names and ensure AST is properly parsed

#### Formatting Issues
- **Issue**: Generated code has incorrect formatting
- **Solution**: Update Prettier configuration in `util.js`

#### Performance Problems
- **Issue**: Slow operations on large files
- **Solution**: Enable AST caching and batch operations

### Debug Mode
Enable debug logging by setting environment variable:

```bash
DEBUG=roy-ast npm start
```

### Getting Help
- Check the test files for usage examples
- Review the source code for detailed implementation
- File issues on the GitHub repository

## Contributing

When contributing to Roy-AST:

1. Add comprehensive JSDoc comments
2. Include performance benchmarks for new features
3. Write tests for all new functionality
4. Update this documentation for API changes
5. Follow the existing code style and patterns

## License

MIT License - see LICENSE file for details