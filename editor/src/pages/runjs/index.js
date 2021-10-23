import React, { useEffect, useCallback, useRef, useState } from "react";
import { saveAs } from "file-saver";
import Tooltip from "react-tooltip-lite";
import init, {environment} from "./init";
import {console as htmlConsole} from "../../../static/console";
import "./bulma.min.css";
import "./index.less";

import logo from "./editor.png";

import { initCodeEditor, createNode } from "./lib";

import {IconJavascript, IconHtml, IconCss, IconSave, IconFormat, IconRun, IconJson} from "./icon";

export default () => {
	let [mode, setMode] = useState("js");
	let [isAuto, setAuto] = useState(true);

	let staticRef = useRef({
		isAuto: true,
		js: null,
		css: null,
		package: null,
		lib: [""],
	});

	const onDownload = useCallback(() => {


		var jsblob = new Blob([staticRef.current.js.getValue()], { type: "javascript; charset=utf-8" });
		var packageblob = new Blob([staticRef.current.package.getValue()], { type: "application/json; charset=utf-8" });
		saveAs(jsblob, `index.js`);
		saveAs(packageblob, `package.json`);
	}, []);

	const onFormat = useCallback((type) => {
		let editor = staticRef.current[type];
		editor.execCommand("selectAll");
		editor.autoFormatRange(editor.getCursor(true), editor.getCursor(false));
		editor.execCommand("goDocEnd");
	}, []);

	const onLoad = useCallback(() => {

		const evtSource = new EventSource("http://localhost:8084/logs");
		evtSource.addEventListener("message", function (messageEvent) {

			try {
				const message =JSON.parse(messageEvent.data);
				switch (message.level){
					case 'log':
						htmlConsole.log(message.message);
						break;
					case 'info':
						htmlConsole.info(message.message);
						break;
					case 'warn':
						htmlConsole.warn(message.message);
						break;
					case 'debug':
						htmlConsole.log(message.message);
						break;
					case 'error':
						htmlConsole.error(message.message);
						break;
					default:
						htmlConsole.log(message.message);
				}
			} catch (e) {
				console.log("not JSON");
			}
		});
	}, []);
	const onRun = useCallback(() => {
		updateJs()


	}, []);
	const updateJs= ()=>{
		const js = staticRef.current.js.getValue()

		const headers = new Headers({
			"Content-Type": "application/javascript"
		});

		const fetchData = {
			method: "POST",
			body: js,
			headers: headers,
			mode: 'cors',
			cache: 'default'
		};
		fetch(`${init.environment.apiUrl}/updateFunction`,fetchData)
			//.then(res => res.json())
			.then((data) => {
				//this.setState({ contacts: data })
			})
			.catch(console.log)
	}
	const updatePackage= ()=>{
		const packageJson = staticRef.current.package.getValue()

		const headers = new Headers({
			"Content-Type": "application/json"
		});

		const fetchData = {
			method: "POST",
			body: packageJson,
			headers: headers,
			mode: 'cors',
			cache: 'default'
		};
		fetch(`${init.environment.apiUrl}/updatePackage`,fetchData)
			.then((data) => {
			})
			.catch(console.log)
	}
	const onAutoRun = useCallback(() => {
		if (staticRef.current.isAuto) {
			onRun();
		}
	}, [isAuto]);

	useEffect(() => {

		window.addEventListener("message", function (data) {
			if (data.data && ["log", "error", "info",'warn'].includes(data.data.type)) {
				let console = document.getElementById("console");
				console.appendChild(createNode(data.data.data));
				console.scrollTop = console.scrollHeight;
			}
		});

		staticRef.current.js = initCodeEditor(document.getElementById("js"), "javascript", init.javascript, updateJs);
		staticRef.current.package = initCodeEditor(document.getElementById("package"), "application/json", init.package, updatePackage);


		onFormat("js");
		onFormat("package");

		onRun();
	}, []);

	return (
		<div className="runjs">
			<div className="runjs__header">
				<div class="nav center" style={{ paddingLeft: 20, width: 240 }}>
					<img style={{ height: 36 }} src={logo} alt="" />
					<div style={{ width: 40 }}></div>
					<Tooltip content="JS Editor">
						<div class={mode == "js" ? "tool-icon selected" : "tool-icon"} onClick={() => setMode("js")}>
							<IconJavascript></IconJavascript>
						</div>
					</Tooltip>
					<Tooltip content="Html Editor">
						<div class={mode == "package" ? "tool-icon selected" : "tool-icon"} onClick={() => setMode("package")}>
							<IconJson></IconJson>
						</div>
					</Tooltip>
				</div>
				<div class="tool center" style={{ flex: 1 }}>
				</div>
				<div class="menu" style={{ flex: 1 }}>
					<Tooltip content="Save as html file">
						<div class="tool-icon" onClick={onDownload}>
							<IconSave></IconSave>
						</div>
					</Tooltip>
					<Tooltip content="Format code">
						<div
							class="tool-icon"
							onClick={() => {
								onFormat("js");
								onFormat("package");
							}}>
							<IconFormat></IconFormat>
						</div>
					</Tooltip>
				</div>
			</div>
			<div className="runjs__editor">
				<div id="html-wrap" style={{ visibility: mode == "package" ? "visible" : "hidden" }}>
					<textarea class="form-control" id="package"></textarea>
				</div>
				<div id="js-wrap" style={{ visibility: mode == "js" ? "visible" : "hidden" }}>
					<textarea class="form-control" id="js"></textarea>
				</div>
			</div>
			<div className="runjs__preview">
				<iframe onLoad={onLoad} id="preview" src={`${init.environment.endpoint}`} seamless width="100%" height="100%"></iframe>
			</div>
			<div className="runjs__console" id="console"></div>
		</div>
	);
};
