const jsdoc2md = require('jsdoc-to-markdown');
const path = require('path');
const fs = require('fs');

const files = path.join(__dirname, '../src/*.js');
const readme = path.join(__dirname, '../README.md');
const content = jsdoc2md.renderSync({
    files
});
let readmeContent = fs.readFileSync(readme, 'utf-8');

readmeContent = readmeContent.replace(/##\s*API(.*)/, `
## API
${content}
`);

fs.writeFileSync(readme, readmeContent, 'utf-8');
