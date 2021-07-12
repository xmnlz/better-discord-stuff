/**
 * @name UserVoiceShow
 * @version 0.0.2
 * @authorLink https://github.com/eternal-hatred
 * @website https://eternal-hatred.github.io/eternal
 * @updateUrl https://raw.githubusercontent.com/eternal-hatred/BetterDiscordStuff/main/UserVoiceShow/UserVoiceShow.plugin.js
 * @source https://github.com/eternal-hatred/BetterDiscordStuff/tree/main/UserVoiceShow
 */

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
        version: "0.0.2",
        description: "The UserVoiceShow plugin allows you to find out the voice channel where the user is sitting.",
    }
};

module.exports = global.ZeresPluginLibrary ? (([Plugin, Library]) => {
    const { DiscordModules, Patcher, WebpackModules, PluginUtilities, Settings } = Library;
    const { React, ChannelActions, ChannelStore, GuildStore, UserStore } = DiscordModules;
    const modules = {
        UserProfileModalHeader: WebpackModules.find(m => m?.default?.displayName === "UserProfileModalHeader"),
        UserPopoutFooter : WebpackModules.find(m => m?.default?.displayName === "UserPopoutFooter"),
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
            this.patchUserPopoutFooter();
            this.pathUserProfileModalHeader();
            PluginUtilities.addStyle("VoiceChannelField", `
            .VoiceChannelField{margin:5px 0px;text-align:center;padding:5px;color:#fff!important;font-size:16px!important;border-radius:7px;}
            .VoiceChannelField:hover{background:#06c;}`);
        }

        pathUserProfileModalHeader(){
            Patcher.after(modules.UserProfileModalHeader, "default", (_, [props], ret) => {
                if (!this.settings.useProfileModal) return;
                if (UserStore.getCurrentUser().id === props.user.id) return ret; 
                let channel = modules.getVoiceStates.getVoiceStateForUser(props.user.id);
                if (channel === undefined) return ret;
                let channelObj = ChannelStore.getChannel(channel.channelId);
                if (channelObj.name === ""){ channelObj.name = 'Channel has no name' } // This happens when the user is in a voice call.
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

        patchUserPopoutFooter() {
            Patcher.after(modules.UserPopoutFooter, "default", (_, [props], ret) => {
                let channel = modules.getVoiceStates.getVoiceStateForUser(props.user.id);
                if (UserStore.getCurrentUser().id === props.user.id) return ret;
                if (channel === undefined) return ret;
                let channelObj = ChannelStore.getChannel(channel.channelId);
                if (channelObj.name === ""){ channelObj.name = 'Channel has no name' } // This happens when the user is in a voice call.
                try {
                    channelName = `${GuildStore.getGuild(channelObj.guild_id).name} | ${channelObj.name}`;
                } catch (error) {
                    channelName = channelObj.name;
                }
                ret.props.children = [
                    React.createElement(VoiceChannelField, { onClick: (e) => {
                            ChannelActions.selectVoiceChannel(channel.channelId);
                        }}),
                    ret.props.children,
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
