const fs = require('fs');

let content = fs.readFileSync('src/validator/genuine.ts', 'utf8');
content = content.replace("uiAlias.replace(/^[@~]//, '')", "uiAlias.replace(/^[@~]\//, '')");

fs.writeFileSync('src/validator/genuine.ts', content);
