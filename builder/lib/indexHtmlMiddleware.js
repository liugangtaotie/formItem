

const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

module.exports = function (basedir) {
    console.log('indexhtml middleware', basedir, path.join(__dirname, 'index.html'));
    const tplContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const template = nunjucks.compile(tplContent);

    return function (req, res, next) {
        if (req.path === '/' || req.path === '/index.html') {
            const pkg = require(path.join(basedir, 'package.json'));
            const docsDir = path.join(basedir, 'docs');
            const docs = fs.readdirSync(docsDir).map(doc => ({
                name: doc,
                url: `/docs/${doc.replace(/\.md$/, '.html')}`,
            }));

            const content = template.render({
                title: `index of ${pkg.name}`,
                docs,
            });
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.end(content);
        } else {
            next();
        }
    };
};
