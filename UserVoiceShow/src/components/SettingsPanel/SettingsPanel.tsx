import { WebpackModules } from '@zlibrary';
import { useState } from 'react';
import { settings } from '../../main';

const SwitchItem = WebpackModules.getByDisplayName('SwitchItem');

const SettingsPanel = (props) => {
    const [value, setValue] = useState(settings.useProfileModal);

    return (
        <SwitchItem
            children={'Display in profile'}
            note="When enabled, the channel will also be visible in the user profile."
            value={value}
            onChange={(val) => {
                setValue(val);
                settings.useProfileModal = val;
                BdApi.setData('vus', 'useProfileModal', val);
            }}
        />
    );
};

export { SettingsPanel };
