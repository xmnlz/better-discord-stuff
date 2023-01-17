import React from 'react';
import BasePlugin from 'zlibrary/plugin';
import { Webpack, DOM } from 'betterdiscord';
import { DiscordModules, WebpackModules, PluginUpdater, Patcher } from 'zlibrary';
import { VoiceChannelList } from './components/VoiceChannelList';
import { SettingsPanel } from './components/SettingsPanel';
import { isEmpty, settings } from './utils';
import styles from './styles/index.css';
import { WebpackUtils } from 'bundlebd';

const { __getLocalVars } = WebpackModules.getByProps('getVoiceStateForUser');

const { UserStore } = DiscordModules;
const { getModuleWithKey } = WebpackUtils;

const {
    Filters: { byStrings },
} = Webpack;

interface displayProfileType {
    displayProfile: { userId: string };
}

export default class UserVoiceShow extends BasePlugin {
    constructor() {
        super();
    }

    onStart() {
        PluginUpdater.checkForUpdate(
            config.info.name,
            config.info.version,
            'https://raw.githubusercontent.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js'
        );

        this.patchUserPopoutBody();
        this.pathUserProfileModalHeader();
        DOM.addStyle(styles);
    }

    onStop() {
        Patcher.unpatchAll();
        DOM.removeStyle();
    }

    patchUserPopoutBody() {
        const [UserPopoutBody, key] = getModuleWithKey(byStrings('.showCopiableUsername'));

        Patcher.after(UserPopoutBody, key, (_, [{ displayProfile }]: [displayProfileType], ret) => {
            const channelList = [];

            const { userId } = displayProfile;

            if (!userId) return ret;

            const isCurrentUser = userId === UserStore.getCurrentUser().id;
            if (isCurrentUser) return ret;

            const voiceState = __getLocalVars().users[userId];

            if (!voiceState || isEmpty(voiceState)) return ret;

            for (const [_, voice] of Object.entries(voiceState)) {
                const { channelId } = voice as any;
                channelList.push(channelId);
            }

            ret.props.children.push(<VoiceChannelList channelList={channelList} />);
        });
    }

    async pathUserProfileModalHeader() {
        const [UserProfileModalHeader, key] = getModuleWithKey(byStrings('forceShowPremium'));

        Patcher.after(UserProfileModalHeader, key, (_, [{ user, profileType }], ret) => {
            const { useProfileModal } = settings.useSettingsState();
            if (!useProfileModal) return ret;

            if (profileType === 0) return ret;

            const channelList = [];

            const voiceState = __getLocalVars().users[user.id];

            if (!voiceState || isEmpty(voiceState)) return ret;

            for (const [_, voice] of Object.entries(voiceState)) {
                const { channelId } = voice as any;
                channelList.push(channelId);
            }

            ret.props
                .children()
                .props.children.props.children.props.children.splice(
                    1,
                    0,
                    <VoiceChannelList channelList={channelList} />
                );
        });
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}
