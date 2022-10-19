import React from 'react';
import BasePlugin from 'zlibrary/plugin';
import { Webpack } from 'betterdiscord';
import { DiscordModules, WebpackModules, PluginUpdater, Patcher } from 'zlibrary';
import { VoiceChannelList } from './components/VoiceChannelList';
import { SettingsPanel } from './components/SettingsPanel';
import { getLazyModule, withProps } from './utils';
import styles from './styles/index.css';

const { __getLocalVars } = WebpackModules.getByProps('getVoiceStateForUser');
const { UserStore } = DiscordModules;

const {
    Filters: { byProps, byStrings },
    getModule,
} = Webpack;

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

        this.patchUserPopoutBodyOld();
        this.pathUserProfileModalHeader();
        this.patchUserPopoutBody();
    }

    onStop() {
        Patcher.unpatchAll();
        BdApi.clearCSS('global-styles-vus');
    }

    patchUserPopoutBodyOld() {
        const patchUserPopoutBodyOld = getModule(
            withProps(byStrings('.displayProfile', 'autoFocus'))
        );

        Patcher.after(patchUserPopoutBodyOld, 'Z', (_, [props], ret) => {
            const channelList = [];

            const { user } = props.user;
            if (!user?.id) return ret;

            const isCurrentUser = user.id === UserStore.getCurrentUser().id;

            if (isCurrentUser) return ret;

            const voiceState = __getLocalVars().users[user.id];

            if (voiceState === {}) return ret;

            for (const [_, voice] of Object.entries(voiceState)) {
                const { channelId } = voice as any;
                channelList.push(channelId);
            }

            ret?.props.children.splice(1, 0, <VoiceChannelList channelList={channelList} />);
        });
    }

    patchUserPopoutBody() {
        const UserPopoutBody = getModule(withProps(byStrings('forceShowPremium')));

        Patcher.after(UserPopoutBody, 'Z', (_, [props], ret) => {
            const { user, profileType } = props;
            if (profileType === 1) return ret;

            if (!props?.user?.id) return ret;

            const channelList = [];

            const isCurrentUser = user.id === UserStore.getCurrentUser().id;

            if (isCurrentUser) return ret;

            const voiceState = __getLocalVars().users[user.id];

            if (voiceState === {}) return ret;

            for (const [_, voice] of Object.entries(voiceState)) {
                const { channelId } = voice as any;
                channelList.push(channelId);
            }

            const main = ret.props.children.props.children.props.children[2].props.children;
            ret.props.children.props.children.props.children[2].props.children = [main];

            ret.props.children.props.children.props.children[2].props.children.push(
                <VoiceChannelList channelList={channelList} />
            );
        });
    }

    async pathUserProfileModalHeader() {
        const UserProfileModalHeader = getModule(withProps(byStrings('forceShowPremium')));

        Patcher.after(UserProfileModalHeader, 'Z', (_, [props], ret) => {
            if (!settings.useProfileModal) return ret;

            const { user, profileType } = props;
            if (profileType === 0) return ret;

            const channelList = [];

            const voiceState = __getLocalVars().users[user.id];

            if (voiceState === {}) return ret;

            for (const [_, voice] of Object.entries(voiceState)) {
                const { channelId } = voice as any;
                channelList.push(channelId);
            }

            ret.props.children.props.children.props.children.splice(
                1,
                0,
                <VoiceChannelList channelList={channelList} />
            );
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
