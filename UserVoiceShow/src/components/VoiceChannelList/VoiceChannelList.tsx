import React from 'react';
import { checkPermissions, settings } from '../../utils';
import { DiscordModules } from 'zlibrary';
import { VoiceChannelField } from '../VoiceChannelFiled';
const { ChannelStore, GuildStore, ChannelActions, UserStore } = DiscordModules;

const { getGuild } = GuildStore;
const { getChannel } = ChannelStore;

interface VoiceChannelListProps {
    channelList: string[];
}

const VoiceChannelList = ({ channelList }: VoiceChannelListProps) => {
    const handleClick = (channel) => {
        if (!channel) return;
        if (!checkPermissions(channel)) {
            return BdApi.UI.showToast('Not enough permissions to enter the channel.', {
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

                if (channel.parent_id && settings.useShowCategory) {
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
