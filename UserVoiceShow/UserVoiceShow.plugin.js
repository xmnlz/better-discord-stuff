/**
 * @name UserVoiceShow
 * @author xmnlz
 * @description The UserVoiceShow plugin allows you to find out the voice channel where the user is sitting.
 * @version 1.1.4
 * @authorLink https://github.com/xmlnz
 * @source https://github.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js
 * @updateUrl https://raw.githubusercontent.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

const config = {
	info: {
		name: "UserVoiceShow",
		authors: [{
			name: "xmnlz",
		}],
		version: "1.1.4",
		description: "The UserVoiceShow plugin allows you to find out the voice channel where the user is sitting.",
		github: "https://github.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js",
		github_raw: "https://raw.githubusercontent.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js"
	}
};

if (!global.ZeresPluginLibrary) {
	BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
		confirmText: "Download Now",
		cancelText: "Cancel",
		onConfirm: () => {
			require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
				if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
				await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
			});
		}
	});
}

function buildPlugin([BasePlugin, Library]) {
	let Plugin;

	(() => {
		var __webpack_modules__ = {
			783: (module, __webpack_exports__, __webpack_require__) => {
				"use strict";
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(703);
				var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(882);
				var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(268);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
				var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default());
				___CSS_LOADER_EXPORT___.push([module.id, ".voiceChannelField {\r\n    margin: 5px 0px;\r\n    text-align: center;\r\n    padding: 5px;\r\n    color: #fff !important;\r\n    font-size: 16px !important;\r\n    border-radius: 7px;\r\n    white-space: pre-wrap;\r\n}\r\n\r\n.voiceChannelField:hover {\r\n    background: #06c;\r\n    cursor: pointer;\r\n}\r\n\r\n.voiceChannelList {\r\n    padding: 5px;\r\n}\r\n", ""]);
				(0, styles__WEBPACK_IMPORTED_MODULE_2__.z)("index.css", ___CSS_LOADER_EXPORT___.toString());
				const __WEBPACK_DEFAULT_EXPORT__ = ___CSS_LOADER_EXPORT___.toString()
			},
			703: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
				"use strict";
				__webpack_require__.d(__webpack_exports__, {
					z: () => load
				});
				let _styles = "";

				function load(path, css) {
					_styles += `/* ${path} */\n${css}\n`
				}

				function styles() {
					return _styles
				}
			},
			268: module => {
				"use strict";
				module.exports = function(cssWithMappingToString) {
					var list = [];
					list.toString = function toString() {
						return this.map((function(item) {
							var content = "";
							var needLayer = "undefined" !== typeof item[5];
							if (item[4]) content += "@supports (".concat(item[4], ") {");
							if (item[2]) content += "@media ".concat(item[2], " {");
							if (needLayer) content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
							content += cssWithMappingToString(item);
							if (needLayer) content += "}";
							if (item[2]) content += "}";
							if (item[4]) content += "}";
							return content
						})).join("")
					};
					list.i = function i(modules, media, dedupe, supports, layer) {
						if ("string" === typeof modules) modules = [
							[null, modules, void 0]
						];
						var alreadyImportedModules = {};
						if (dedupe)
							for (var k = 0; k < this.length; k++) {
								var id = this[k][0];
								if (null != id) alreadyImportedModules[id] = true
							}
						for (var _k = 0; _k < modules.length; _k++) {
							var item = [].concat(modules[_k]);
							if (dedupe && alreadyImportedModules[item[0]]) continue;
							if ("undefined" !== typeof layer)
								if ("undefined" === typeof item[5]) item[5] = layer;
								else {
									item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
									item[5] = layer
								} if (media)
								if (!item[2]) item[2] = media;
								else {
									item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
									item[2] = media
								} if (supports)
								if (!item[4]) item[4] = "".concat(supports);
								else {
									item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
									item[4] = supports
								} list.push(item)
						}
					};
					return list
				}
			},
			882: module => {
				"use strict";
				module.exports = function(i) {
					return i[1]
				}
			},
			113: module => {
				"use strict";
				module.exports = BdApi.React
			}
		};
		var __webpack_module_cache__ = {};

		function __webpack_require__(moduleId) {
			var cachedModule = __webpack_module_cache__[moduleId];
			if (void 0 !== cachedModule) return cachedModule.exports;
			var module = __webpack_module_cache__[moduleId] = {
				id: moduleId,
				exports: {}
			};
			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
			return module.exports
		}(() => {
			__webpack_require__.n = module => {
				var getter = module && module.__esModule ? () => module["default"] : () => module;
				__webpack_require__.d(getter, {
					a: getter
				});
				return getter
			}
		})();
		(() => {
			__webpack_require__.d = (exports, definition) => {
				for (var key in definition)
					if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
						enumerable: true,
						get: definition[key]
					})
			}
		})();
		(() => {
			__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
		})();
		(() => {
			__webpack_require__.r = exports => {
				if ("undefined" !== typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports, Symbol.toStringTag, {
					value: "Module"
				});
				Object.defineProperty(exports, "__esModule", {
					value: true
				})
			}
		})();
		var __webpack_exports__ = {};
		(() => {
			"use strict";
			__webpack_require__.r(__webpack_exports__);
			__webpack_require__.d(__webpack_exports__, {
				default: () => VoiceUserShow,
				settings: () => settings
			});
			var external_BdApi_React_ = __webpack_require__(113);
			var external_BdApi_React_default = __webpack_require__.n(external_BdApi_React_);
			const external_BasePlugin_namespaceObject = BasePlugin;
			var external_BasePlugin_default = __webpack_require__.n(external_BasePlugin_namespaceObject);
			const external_BdApi_namespaceObject = BdApi;
			const external_Library_namespaceObject = Library;
			const {
				Permissions,
				DiscordPermissions,
				UserStore
			} = external_Library_namespaceObject.DiscordModules;
			const checkPermissions = channel => {
				const hasPermissions = Permissions.can({
					permission: DiscordPermissions.CONNECT,
					user: UserStore.getCurrentUser(),
					context: channel
				});
				return hasPermissions
			};
			const getLazyModule = filter => {
				const cached = WebpackModules.getModule(filter);
				if (cached) return Promise.resolve(cached);
				return new Promise((resolve => {
					const removeListener = WebpackModules.addListener((m => {
						if (filter(m)) {
							resolve(m);
							removeListener()
						}
					}))
				}))
			};
			const withProps = filter => m => Object.values(m).some(filter);
			const VoiceChannelField = props => {
				const {
					name,
					onClick
				} = props;
				return external_BdApi_React_default().createElement("div", {
					className: "voiceChannelField",
					onClick
				}, name)
			};
			const {
				ChannelStore,
				GuildStore,
				ChannelActions,
				UserStore: VoiceChannelList_UserStore
			} = external_Library_namespaceObject.DiscordModules;
			const {
				getGuild
			} = GuildStore;
			const {
				getChannel
			} = ChannelStore;
			const VoiceChannelList = props => {
				const {
					channelList
				} = props;
				const handleClick = channel => {
					if (void 0 === channel) return;
					if (!checkPermissions(channel)) return BdApi.showToast("Not enough permissions to enter the channel.", {
						type: "warning",
						icon: true
					});
					else ChannelActions.selectVoiceChannel(channel.id)
				};
				return external_BdApi_React_default().createElement("div", {
					className: "voiceChannelList"
				}, channelList.map((channelId => {
					const channel = getChannel(channelId);
					if (!channel) return;
					const guild = getGuild(channel.guild_id);
					let channelName = "";
					if (guild) channelName += guild.name + " | ";
					channelName += channel.name;
					if (channel.parent_id && settings.showCategory) channelName += "\n| " + getChannel(channel.parent_id).name + " |";
					if ("" === channel.name) return;
					return external_BdApi_React_default().createElement(VoiceChannelField, {
						name: channelName,
						onClick: () => handleClick(channel)
					})
				})))
			};
			var React = __webpack_require__(113);
			const {
				getModule
			} = external_BdApi_namespaceObject.Webpack;
			const SwitchItem = getModule((m => m.toString().includes("helpdeskArticleId")));
			const SettingsPanel = props => {
				const [profileModal, setProfileModal] = (0, external_BdApi_React_.useState)(settings.useProfileModal);
				const [showCategory, setShowCategory] = (0, external_BdApi_React_.useState)(settings.showCategory);
				return React.createElement(React.Fragment, null, React.createElement(SwitchItem, {
					children: "Display in profile",
					note: "When enabled, the channel will also be visible in the user profile.",
					value: profileModal,
					onChange: val => {
						setProfileModal(val);
						settings.useProfileModal = val;
						BdApi.setData("vus", "useProfileModal", val)
					}
				}), React.createElement(SwitchItem, {
					children: "Display category",
					note: "When enabled, show voice channel with category.",
					value: showCategory,
					onChange: val => {
						setShowCategory(val);
						settings.showCategory = val;
						BdApi.setData("vus", "showCategory", val)
					}
				}))
			};
			var styles = __webpack_require__(783);
			const {
				__getLocalVars
			} = external_Library_namespaceObject.WebpackModules.getByProps("getVoiceStateForUser");
			const {
				UserStore: main_UserStore
			} = external_Library_namespaceObject.DiscordModules;
			const {
				Filters: {
					byProps,
					byStrings
				},
				getModule: main_getModule
			} = external_BdApi_namespaceObject.Webpack;
			const settings = {
				useProfileModal: false,
				showCategory: false
			};
			class VoiceUserShow extends(external_BasePlugin_default()) {
				constructor() {
					super()
				}
				onStart() {
					this.preLoadSetting();
					external_Library_namespaceObject.PluginUpdater.checkForUpdate(config.info.name, config.info.version, "https://raw.githubusercontent.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js");
					BdApi.injectCSS("global-styles-vus", styles.Z);
					this.patchUserPopoutBodyOld();
					this.pathUserProfileModalHeader();
					this.patchUserPopoutBody()
				}
				onStop() {
					external_Library_namespaceObject.Patcher.unpatchAll();
					BdApi.clearCSS("global-styles-vus")
				}
				patchUserPopoutBodyOld() {
					const patchUserPopoutBodyOld = main_getModule(withProps(byStrings(".displayProfile", "autoFocus")));
					external_Library_namespaceObject.Patcher.after(patchUserPopoutBodyOld, "Z", ((_, [props], ret) => {
						const channelList = [];
						const {
							user
						} = props.user;
						if (!user?.id) return ret;
						const isCurrentUser = user.id === main_UserStore.getCurrentUser().id;
						if (isCurrentUser) return ret;
						const voiceState = __getLocalVars().users[user.id];
						if (voiceState === {}) return ret;
						for (const [_2, voice] of Object.entries(voiceState)) {
							const {
								channelId
							} = voice;
							channelList.push(channelId)
						}
						ret?.props.children.splice(1, 0, external_BdApi_React_default().createElement(VoiceChannelList, {
							channelList
						}))
					}))
				}
				patchUserPopoutBody() {
					const UserPopoutBody = main_getModule(withProps(byStrings("forceShowPremium")));
					external_Library_namespaceObject.Patcher.after(UserPopoutBody, "Z", ((_, [props], ret) => {
						const {
							user,
							profileType
						} = props;
						if (1 === profileType) return ret;
						if (!props?.user?.id) return ret;
						const channelList = [];
						const isCurrentUser = user.id === main_UserStore.getCurrentUser().id;
						if (isCurrentUser) return ret;
						const voiceState = __getLocalVars().users[user.id];
						if (voiceState === {}) return ret;
						for (const [_2, voice] of Object.entries(voiceState)) {
							const {
								channelId
							} = voice;
							channelList.push(channelId)
						}
						const main = ret.props.children.props.children.props.children[2].props.children;
						ret.props.children.props.children.props.children[2].props.children = [main];
						ret.props.children.props.children.props.children[2].props.children.push(external_BdApi_React_default().createElement(VoiceChannelList, {
							channelList
						}))
					}))
				}
				async pathUserProfileModalHeader() {
					const UserProfileModalHeader = main_getModule(withProps(byStrings("forceShowPremium")));
					external_Library_namespaceObject.Patcher.after(UserProfileModalHeader, "Z", ((_, [props], ret) => {
						if (!settings.useProfileModal) return ret;
						const {
							user,
							profileType
						} = props;
						if (0 === profileType) return ret;
						const channelList = [];
						const voiceState = __getLocalVars().users[user.id];
						if (voiceState === {}) return ret;
						for (const [_2, voice] of Object.entries(voiceState)) {
							const {
								channelId
							} = voice;
							channelList.push(channelId)
						}
						ret.props.children.props.children.props.children.splice(1, 0, external_BdApi_React_default().createElement(VoiceChannelList, {
							channelList
						}))
					}))
				}
				preLoadSetting() {
					const useProfileModal = BdApi.getData("vus", "useProfileModal");
					const showCategory = BdApi.getData("vus", "showCategory");
					settings.useProfileModal = useProfileModal ? useProfileModal : false;
					settings.showCategory = showCategory ? showCategory : false
				}
				getSettingsPanel() {
					return external_BdApi_React_default().createElement(SettingsPanel, null)
				}
			}
		})();
		Plugin = __webpack_exports__
	})();

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class {
	start() {};
	stop() {}
};

/*@end@*/