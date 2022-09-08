import React from 'react';
import BasePlugin from '@zlibrary/plugin';
import { DiscordModules, Patcher, WebpackModules, PluginUpdater } from '@zlibrary';
import { VoiceChannelList } from './components/VoiceChannelList';
import { SettingsPanel } from './components/SettingsPanel';
import { getLazyModule } from './utils';
import styles from './styles/index.css';

const { __getLocalVars } = WebpackModules.getByProps('getVoiceStateForUser');
const { UserStore } = DiscordModules;

interface ISettings {
    useProfileModal: boolean;
    showCategory: boolean;
}

const settings: ISettings = { useProfileModal: false, showCategory: false };

export default class VoiceUserShow extends BasePlugin {
    constructor() {
        super();
    }

    onStart() {
        this.preLoadSetting();

        PluginUpdater.checkForUpdate(
            config.info.name,
            config.info.version,
            'https://raw.githubusercontent.com/xmlnz/better-discord-stuff/main/UserVoiceShow/UserVoiceShow.plugin.js'
        );

        BdApi.injectCSS('global-styles-vus', styles);

        this.patchUserPopoutSection();
        this.pathUserProfileModalHeader();
        this.patchUserPopoutBody();
    }

    onStop() {
        Patcher.unpatchAll();
        BdApi.clearCSS('global-styles-vus');
    }

    patchUserPopoutSection() {
        const UserPopoutSection = WebpackModules.find(
            (m) => m?.default?.displayName === 'UserPopoutSection'
        );

        Patcher.after(UserPopoutSection, 'default', (_, [props], ret) => {
            const channelList = [];

            if (!ret.props.children[0]) return ret;

            const { user } = ret?.props.children[1].props;
            if (!user?.id) return ret;

            const isCurrentUser = user.id === UserStore.getCurrentUser().id;

            if (isCurrentUser) return ret;

            const voiceState = __getLocalVars().users[user.id];

            if (voiceState === {}) return ret;

            for (const [_, voice] of Object.entries(voiceState)) {
                const { channelId } = voice as any;
                channelList.push(channelId);
            }

            ret?.props.children.splice(2, 0, <VoiceChannelList channelList={channelList} />);
        });
    }

    patchUserPopoutBody() {
        const UserPopoutBody = WebpackModules.find(
            (m) =>
                m?.default?.displayName === 'UserPopoutBody' &&
                m.default.toString().indexOf('ROLES_LIST') > -1
        );

        Patcher.after(UserPopoutBody, 'default', (_, [props], ret) => {
            if (!props?.user?.id) return ret;

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
        const useProfileModal = BdApi.getData('vus', 'useProfileModal');
        const showCategory = BdApi.getData('vus', 'showCategory');
        settings.useProfileModal = useProfileModal ? useProfileModal : false;
        settings.showCategory = showCategory ? showCategory : false;
    }

    getSettingsPanel() {
        return <SettingsPanel />;
    }
}

export { settings };
