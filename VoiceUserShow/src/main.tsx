import React from 'react';
import BasePlugin from '@zlibrary/plugin';
import { DiscordModules, Patcher, WebpackModules, PluginUpdater } from '@zlibrary';
import { VoiceChannelList } from './components/VoiceChannelList';
import { SettingsPanel } from './components/SettingsPanel';
import { getLazyModule } from './utils';
import styles from './styles/index.css';

const { __getLocalVars } = WebpackModules.getByProps('getVoiceStateForUser');
const { UserStore } = DiscordModules;

const settings: { useProfileModal: boolean } = { useProfileModal: false };

export default class VoiceUserShow extends BasePlugin {
    constructor() {
        super();
    }

    onStart() {
        this.preLoadSetting();

        BdApi.injectCSS('global-styles-vus', styles);

        this.patchUserPopoutBody();
        this.pathUserProfileModalHeader();
    }

    onStop() {
        Patcher.unpatchAll();
        BdApi.clearCSS('global-styles-vus');
    }

    patchUserPopoutBody() {
        const UserPopoutBody = WebpackModules.find(
            (m) =>
                m?.default?.displayName === 'UserPopoutBody' &&
                m.default.toString().indexOf('ROLES_LIST') > -1
        );

        Patcher.after(UserPopoutBody, 'default', (_, [props], ret) => {
            const channelList = [];
            const { user } = props;

            const isCurrentUser = user.id === UserStore.getCurrentUser().id;

            if (isCurrentUser) return ret;

            const voiceState = __getLocalVars().users[user.id];

            if (voiceState === {}) return ret;

            for (const [_, voice] of Object.entries(voiceState)) {
                const { channelId } = voice as any;
                channelList.push(channelId);
            }

            ret?.props.children.splice(4, 0, <VoiceChannelList channelList={channelList} />);
        });
    }

    async pathUserProfileModalHeader() {
        const UserProfileModalHeader = await getLazyModule(
            (m) => m && m.default && m.default.displayName === 'UserProfileModalHeader'
        );

        Patcher.after(UserProfileModalHeader, 'default', (_, [props], ret) => {
            if (!settings.useProfileModal) return ret;

            const channelList = [];
            const { user } = props;

            const voiceState = __getLocalVars().users[user.id];

            if (voiceState === {}) return ret;

            for (const [_, voice] of Object.entries(voiceState)) {
                const { channelId } = voice as any;
                channelList.push(channelId);
            }

            ret?.props.children.splice(4, 0, <VoiceChannelList channelList={channelList} />);
        });
    }

    preLoadSetting() {
        const loadData = BdApi.getData('vus', 'useProfileModal');
        settings.useProfileModal = loadData ? loadData : false;
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}

export { settings };
