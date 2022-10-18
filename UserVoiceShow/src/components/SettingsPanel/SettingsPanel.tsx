import { WebpackModules } from 'zlibrary';
import { useState } from 'react';
import { settings } from '../../main';

const SwitchItem = WebpackModules.getByDisplayName('SwitchItem');

const SettingsPanel = (props) => {
    const [profileModal, setProfileModal] = useState(settings.useProfileModal);
    const [showCategory, setShowCategory] = useState(settings.showCategory);

    return (
        <>
            <SwitchItem
                children={'Display in profile'}
                note="When enabled, the channel will also be visible in the user profile."
                value={profileModal}
                onChange={(val) => {
                    setProfileModal(val);
                    settings.useProfileModal = val;
                    BdApi.setData('vus', 'useProfileModal', val);
                }}
            />
            <SwitchItem
                children={'Display category'}
                note="When enabled, show voice channel with category."
                value={showCategory}
                onChange={(val) => {
                    setShowCategory(val);
                    settings.showCategory = val;
                    BdApi.setData('vus', 'showCategory', val);
                }}
            />
        </>
    );
};

export { SettingsPanel };
