const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const execa = require("execa");

const bodySizeLimit = Number(process.env.REQ_MB_LIMIT || '1');
const bodParserOptions = {
    type: req => !req.is('multipart/*'),
    limit: `${bodySizeLimit}mb`,
};
app.use(bodyParser.raw(bodParserOptions));
app.use(bodyParser.json({limit: `${bodySizeLimit}mb`}));
app.use(bodyParser.urlencoded({limit: `${bodySizeLimit}mb`, extended: true}));
app.use(cors())

const TailingReadableStream = require("tailing-stream");

app.get('/logs', async (req, res) => {

    res.set({
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
    });
    res.flushHeaders();
    const stream = TailingReadableStream.createReadStream("functions.log", {timeout: 0, start: 0});
    res.write(`\n\n`);
    stream.on('data', (data) => {
        const ligns = data.toString().split(/(%s|%f|%o|%d)|\r?\n/).filter((l)=>l);
        ligns.forEach((l) => {
            if (l.toString().trim()) {
                const message = 'data:' + l.toString().trim()
                console.log("messsage:[", message, "]")
                res.write(message);
                res.write(`\n\n`);
            }
        })
        res.write(`\n\n`);
    })

});
routeUpdateFunction(app);
routeUpdatePackage(app);
const server = app.listen(8084, () => console.log('logs', 8084));


function routeUpdateFunction(expressApp) {
    expressApp.post('/updateFunction',  (req, res) => {
        const modName = process.env.MOD_NAME;
        const modRootPath = path.join( '/functions');
        console.log(modRootPath)
        const modPath = path.join(modRootPath, `${modName}.js`);
        fs.writeFile(modPath, req.body,(err)=>{
            console.error(err)
        })
        res.status(200).send('OK');
    });
}
function routeUpdatePackage(expressApp) {
    expressApp.post('/updatePackage',  (req, res) => {
        const modRootPath = path.join( '/functions');
        (async () => {
            fs.writeFile(`${modRootPath}/package.json`, req.body,(err)=>{
                console.error(err)
                execa('./npm-install.sh', {cwd: '../', shell: true}).then((out)=>{
                    console.log(out.stdout)
                });
            })

        })();
        res.status(200).send('OK');
    });
}
