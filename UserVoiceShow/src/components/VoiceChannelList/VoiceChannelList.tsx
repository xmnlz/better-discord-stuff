import React from 'react';
import { checkPermissions } from '../../utils';
import { DiscordModules } from 'zlibrary';
import { VoiceChannelField } from '../VoiceChannelFiled';
import { settings } from '../../main';
const { ChannelStore, GuildStore, ChannelActions, UserStore } = DiscordModules;

const { getGuild } = GuildStore;
const { getChannel } = ChannelStore;

interface VoiceChannelListProps {
    channelList: Array<string>;
}

const VoiceChannelList = (props: VoiceChannelListProps) => {
    const { channelList } = props;

    const handleClick = (channel) => {
        if (channel === undefined) return;
        if (!checkPermissions(channel)) {
            return BdApi.showToast('Not enough permissions to enter the channel.', {
                type: 'warning',
                icon: true,
            });
        } else {
            ChannelActions.selectVoiceChannel(channel.id);
        }
    };

    return (
        <div className="voiceChannelList">
            {channelList.map((channelId) => {
                const channel = getChannel(channelId);
                if (!channel) return;

                const guild = getGuild(channel.guild_id);
                let channelName = '';

                if (guild) {
                    channelName += guild.name + ' | ';
                }

                channelName += channel.name;

                if (channel.parent_id && settings.showCategory) {
                    channelName += '\n| ' + getChannel(channel.parent_id).name + ' |';
                }

                if (channel.name === '') return;

                return (
                    <VoiceChannelField
                        name={channelName}
                        onClick={() => handleClick(channel)}
                    ></VoiceChannelField>
                );
            })}
        </div>
    );
};

export { VoiceChannelList };
