export default {
	package: `{
    "name": "functions",
    "version": "1.0.0",
    "description": " functions",
    "dependencies": {
    
    }
}`,
	javascript: `module.exports = {
					index(data,req, res) {
						return 'a simple code editor';
					}
				};
`,
	environment: {
		production: false,
		apiUrl: window["env"]["apiUrl"] ,
		endpoint: window["env"]["endpoint"]
	}

};
