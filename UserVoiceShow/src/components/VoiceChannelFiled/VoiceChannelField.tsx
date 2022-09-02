import React from 'react';

interface VoiceChannelFieldProps {
    name: string;
    onClick: (e: any) => void;
}

const VoiceChannelField = (props: VoiceChannelFieldProps) => {
    const { name, onClick } = props;
    return (
        <div className="voiceChannelField" onClick={onClick}>
            {name}
        </div>
    );
};

export { VoiceChannelField };
