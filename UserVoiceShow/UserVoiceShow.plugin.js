/**
 * @name UserVoiceShow
 * @author xmnlz
 * @description The UserVoiceShow plugin allows you to find out the voice channel where the user is sitting.
 * @version 1.1.6
 * @authorLink https://github.com/xmlnz
 * @source https://github.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js
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
		authors: [
			{
				name: "xmnlz"
			}
		],
		version: "1.1.6",
		description: "The UserVoiceShow plugin allows you to find out the voice channel where the user is sitting.",
		github: "https://github.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js",
		github_raw: "https://github.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js"
	}
};

if (!global.ZeresPluginLibrary) {
    BdApi.UI.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
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
    var Plugin = (function (BasePlugin, betterdiscord, zlibrary, react) {
		'use strict';
	
		// bundlebd
		function createSettings(defaultSettings) {
			let settings = betterdiscord.Data.load("settings");
			const listeners = new Set();
			if (!settings) {
				betterdiscord.Data.save("settings", defaultSettings);
				settings = defaultSettings;
			}
			if (Object.keys(settings) !== Object.keys(defaultSettings)) {
				settings = { ...defaultSettings, ...settings };
			}
			let changed = false;
			for (const key in settings) {
				if (!(key in defaultSettings)) {
					delete settings[key];
					changed = true;
				}
			}
			if (changed) betterdiscord.Data.save("settings", settings);
			const settingsManager = {
				addListener(listener) {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				clearListeners() {
					listeners.clear();
				},
				useSettingsState() {
					const [state, setState] = react.useState(settings);
					react.useEffect(() => {
						return settingsManager.addListener((key, value) => {
							setState((state2) => ({ ...state2, [key]: value }));
						});
					}, []);
					return state;
				}
			};
			for (const key in settings) {
				Object.defineProperty(settingsManager, key, {
					get() {
						return settings[key];
					},
					set(value) {
						settings[key] = value;
						betterdiscord.Data.save("settings", settings);
						for (const listener of listeners) listener(key, value);
					},
					enumerable: true,
					configurable: false
				});
			}
			return settingsManager;
		}
		var WebpackUtils = {
			store(name) {
				return (m) => m.getName?.() === name;
			},
			byId(id) {
				return (_e, _m, i) => i === id;
			},
			byValues(...filters) {
				return (e, m, i) => {
					let match = true;
					for (const filter of filters) {
						if (!Object.values(e).some((v) => filter(v, m, i))) {
							match = false;
							break;
						}
					}
					return match;
				};
			},
			getModuleWithKey(filter) {
				let target;
				let id;
				let key;
				betterdiscord.Webpack.getModule(
					(e, m, i) => {
						if (filter(e, m, i)) {
							target = m;
							id = i;
							return true;
						}
						return false;
					},
					{ searchExports: true }
				);
				for (const k in target.exports) {
					if (filter(target.exports[k], target, id)) {
						key = k;
						break;
					}
				}
				return [target.exports, key];
			}
		};
	
		// utils.ts
		const { Permissions, DiscordPermissions, UserStore: UserStore$2 } = zlibrary.DiscordModules;
		const settings = createSettings({
			useProfileModal: false,
			useShowCategory: false
		});
		const checkPermissions = (channel) => {
			const hasPermissions = Permissions.can({
				permission: DiscordPermissions.CONNECT,
				user: UserStore$2.getCurrentUser(),
				context: channel
			});
			return hasPermissions;
		};
		const isEmpty = (obj) => {
			return Object.keys(obj).length === 0;
		};
	
		// components/VoiceChannelFiled/VoiceChannelField.tsx
		const VoiceChannelField = (props) => {
			const { name, onClick } = props;
			return BdApi.React.createElement("div", { className: "voiceChannelField", onClick }, name);
		};
	
		// components/VoiceChannelList/VoiceChannelList.tsx
		const { ChannelStore, GuildStore, ChannelActions, UserStore: UserStore$1 } = zlibrary.DiscordModules;
		const { getGuild } = GuildStore;
		const { getChannel } = ChannelStore;
		const VoiceChannelList = ({ channelList }) => {
			const handleClick = (channel) => {
				if (!channel)
					return;
				if (!checkPermissions(channel)) {
					return BdApi.UI.showToast("Not enough permissions to enter the channel.", {
						type: "warning",
						icon: true
					});
				} else {
					ChannelActions.selectVoiceChannel(channel.id);
				}
			};
			return BdApi.React.createElement("div", { className: "voiceChannelList" }, channelList.map((channelId) => {
				const channel = getChannel(channelId);
				if (!channel)
					return;
				const guild = getGuild(channel.guild_id);
				let channelName = "";
				if (guild) {
					channelName += guild.name + " | ";
				}
				channelName += channel.name;
				if (channel.parent_id && settings.useShowCategory) {
					channelName += "\n| " + getChannel(channel.parent_id).name + " |";
				}
				if (channel.name === "")
					return;
				return BdApi.React.createElement(
					VoiceChannelField,
					{
						name: channelName,
						onClick: () => handleClick(channel)
					}
				);
			}));
		};
	
		// components/SettingsPanel/SettingsPanel.tsx
		const { getModule } = betterdiscord.Webpack;
		const SwitchItem = getModule((m) => m.toString().includes("helpdeskArticleId"));
		const SettingsPanel = () => {
			const [profileModal, setProfileModal] = react.useState(settings.useProfileModal);
			const [showCategory, setShowCategory] = react.useState(settings.useShowCategory);
			return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
				SwitchItem,
				{
					children: "Display in profile",
					note: "When enabled, the channel will also be visible in the user profile.",
					value: profileModal,
					onChange: (value) => {
						setProfileModal(value);
						settings.useProfileModal = value;
					}
				}
			), BdApi.React.createElement(
				SwitchItem,
				{
					children: "Display category",
					note: "When enabled, show voice channel with category.",
					value: showCategory,
					onChange: (value) => {
						setShowCategory(value);
						settings.useShowCategory = value;
					}
				}
			));
		};
	
		// styles/index.css
		var css = ".voiceChannelField {\r\n  	margin: 5px 0px;\r\n  	text-align: center;\r\n  	padding: 5px;\r\n  	color: #fff !important;\r\n  	font-size: 16px !important;\r\n  	border-radius: 7px;\r\n  	/* Fix \\n */\r\n  	white-space: pre-wrap;\r\n  	/* Fix colors in light profile */\r\n  	mix-blend-mode: screen;\r\n}\r\n\r\n.voiceChannelField:hover {\r\n  	background: #06c;\r\n  	cursor: pointer;\r\n}\r\n\r\n.voiceChannelList {\r\n  	padding: 5px;\r\n}\r\n";
	
		// main.tsx
		const { __getLocalVars } = zlibrary.WebpackModules.getByProps("getVoiceStateForUser");
		const { UserStore } = zlibrary.DiscordModules;
		const { getModuleWithKey } = WebpackUtils;
		const {
			Filters: { byStrings }
		} = betterdiscord.Webpack;
		class UserVoiceShow extends BasePlugin {
			constructor() {
				super();
			}
			onStart() {
				zlibrary.PluginUpdater.checkForUpdate(
					config.info.name,
					config.info.version,
					"https://raw.githubusercontent.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js"
				);
				this.patchUserPopoutBody();
				this.pathUserProfileModalHeader();
				betterdiscord.DOM.addStyle(css);
			}
			onStop() {
				zlibrary.Patcher.unpatchAll();
				betterdiscord.DOM.removeStyle();
			}
			patchUserPopoutBody() {
				const [UserPopoutBody, key] = getModuleWithKey(byStrings(".showCopiableUsername"));
				zlibrary.Patcher.after(UserPopoutBody, key, (_, [{ displayProfile }], ret) => {
					const channelList = [];
					const { userId } = displayProfile;
					if (!userId)
						return ret;
					const isCurrentUser = userId === UserStore.getCurrentUser().id;
					if (isCurrentUser)
						return ret;
					const voiceState = __getLocalVars().users[userId];
					if (!voiceState || isEmpty(voiceState))
						return ret;
					for (const [_2, voice] of Object.entries(voiceState)) {
						const { channelId } = voice;
						channelList.push(channelId);
					}
					ret.props.children.push(BdApi.React.createElement(VoiceChannelList, { channelList }));
				});
			}
			async pathUserProfileModalHeader() {
				const [UserProfileModalHeader, key] = getModuleWithKey(byStrings("forceShowPremium"));
				zlibrary.Patcher.after(UserProfileModalHeader, key, (_, [{ user, profileType }], ret) => {
					const { useProfileModal } = settings.useSettingsState();
					if (!useProfileModal)
						return ret;
					if (profileType === 0)
						return ret;
					const channelList = [];
					const voiceState = __getLocalVars().users[user.id];
					if (!voiceState || isEmpty(voiceState))
						return ret;
					for (const [_2, voice] of Object.entries(voiceState)) {
						const { channelId } = voice;
						channelList.push(channelId);
					}
					ret.props.children().props.children.props.children.props.children.splice(
						1,
						0,
						BdApi.React.createElement(VoiceChannelList, { channelList })
					);
				});
			}
			getSettingsPanel() {
				return BdApi.React.createElement(SettingsPanel, null);
			}
		}
	
		return UserVoiceShow;
	
	})(BasePlugin, new BdApi("UserVoiceShow"), Library, BdApi.React);

	return Plugin;
}

module.exports = global.ZeresPluginLibrary ? buildPlugin(global.ZeresPluginLibrary.buildPlugin(config)) : class { start() {}; stop() {} };

/*@end@*/