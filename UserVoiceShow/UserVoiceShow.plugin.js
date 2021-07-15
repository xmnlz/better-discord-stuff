/**
 * @name UserVoiceShow
 * @version 0.0.1
 * @authorLink https://github.com/eternal-hatred
 * @website https://eternal-hatred.github.io/eternal
 * @source https://github.com/eternal-hatred/BetterDiscordStuff/tree/main/UserVoiceShow
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

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "UserVoiceShow",
        authors: [
            {
                name: "eternalz",
                discord_id: "3713360440224645238",
            }
        ],
        version: "0.0.1",
        description: "The UserVoiceShow plugin allows you to find out the voice channel where the user is sitting.",
    }
};

module.exports = global.ZeresPluginLibrary ? (([Plugin, Library]) => {
    const { DiscordModules, Patcher, WebpackModules, PluginUtilities, Settings, PluginUpdater } = Library;
    const { React, ChannelActions, ChannelStore, GuildStore, UserStore } = DiscordModules;
    const modules = {
        UserProfileModalHeader: WebpackModules.find(m => m?.default?.displayName === "UserProfileModalHeader"),
        UserPopoutBody : WebpackModules.find(m => m?.default?.displayName === "UserPopoutBody"),
        getVoiceStates : WebpackModules.getByProps('getVoiceStates'),
    }
    let channelName;

    class VoiceChannelField extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                channelName: ''
            };
        }
        render() {
            return React.createElement("div", { className: "VoiceChannelField", onClick: this.props.onClick}, channelName);
        }
    }
    class plugin extends Plugin {
        constructor() {
            super();
            this.settings = {
                useProfileModal: false,
            }
        };

        onStart() {
            this.initialize();
        };

        onStop() {
            Patcher.unpatchAll();
            PluginUtilities.removeStyle("VoiceChannelField");
        };

        initialize(){
            PluginUpdater.checkForUpdate(config.info.name, config.info.version, 'https://raw.githubusercontent.com/eternal-hatred/BetterDiscordStuff/main/UserVoiceShow/UserVoiceShow.plugin.js')
            this.patchUserPopoutBody();
            this.pathUserProfileModalHeader();
            PluginUtilities.addStyle("VoiceChannelField", `
            .VoiceChannelField{margin:5px 0px;text-align:center;padding:5px;color:#fff!important;font-size:16px!important;border-radius:7px;}
            .VoiceChannelField:hover{background:#06c;cursor: pointer;}`);
        }

        pathUserProfileModalHeader(){
            Patcher.after(modules.UserProfileModalHeader, "default", (_, [props], ret) => {
                if (!this.settings.useProfileModal) return;
                if (UserStore.getCurrentUser().id === props.user.id) return ret;
                let channel = modules.getVoiceStates.getVoiceStateForUser(props.user.id);
                if (channel === undefined) return ret;
                let channelObj = ChannelStore.getChannel(channel.channelId);
                if (channelObj.name === "") return  ret; // This happens when the user is in a voice call.
                try {
                    channelName = `${GuildStore.getGuild(channelObj.guild_id).name} | ${channelObj.name}`;
                } catch (error) {
                    channelName = channelObj.name;
                }
                ret.props.children = [
                    ret.props.children,
                    React.createElement(VoiceChannelField, { onClick: (e) => {
                            ChannelActions.selectVoiceChannel(channel.channelId);
                        }}),
                ]
            });
        }

        patchUserPopoutBody() {
            Patcher.after(modules.UserPopoutBody, "default", (_, [props], ret) => {
                let channel = modules.getVoiceStates.getVoiceStateForUser(props.user.id);
                if (UserStore.getCurrentUser().id === props.user.id) return ret;
                if (channel === undefined) return ret;
                let channelObj = ChannelStore.getChannel(channel.channelId);
                if (channelObj.name === "") return  ret; // This happens when the user is in a voice call.
                try {
                    channelName = `${GuildStore.getGuild(channelObj.guild_id).name} | ${channelObj.name}`;
                } catch (error) {
                    channelName = channelObj.name;
                }
                ret.props.children = [
                    ret.props.children,
                    React.createElement(VoiceChannelField, { onClick: (e) => {
                            ChannelActions.selectVoiceChannel(channel.channelId);
                        }}),
                ]
            });
        };
        getSettingsPanel() {
            return new Settings.Switch('Display in profile', 'When enabled, the channel will also be visible in the user profile.', this.settings.useProfileModal,
                (val => {
                    this.setAllSettings(val);
                })).getElement();
        };

        setAllSettings(statement) {
            this.settings.useProfileModal = statement;
            BdApi.setData(config.info.name, 'useProfileModal', statement);
        };

        preLoadSetting() {
            const loadData = BdApi.getData(config.info.name, 'useProfileModal');
            this.settings.useProfileModal = (loadData ? loadData : false);
        };
    }

    return plugin;
})(global.ZeresPluginLibrary.buildPlugin(config)) : class {
    constructor() {
        this._config = config;
    }

    load() {
        BdApi.showConfirmationModal("Library plugin is needed",
            `The library plugin needed for PluginBuilder is missing. Please click Download Now to install it.`, {
                confirmText: "Download",
                cancelText: "Cancel",
                onConfirm: () => {
                    request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                        if (error)
                            return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");

                        fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                    });
                }
            });
    }

    start() {
    }

    stop() {
    }
};
/*@end@*/
