import { Webpack } from 'betterdiscord';
import { useState } from 'react';
import { settings } from '../../utils';
const { getModule } = Webpack;

const SwitchItem = getModule((m) => m.toString().includes('helpdeskArticleId'));

const SettingsPanel = () => {
    const [profileModal, setProfileModal] = useState<boolean>(settings.useProfileModal);
    const [showCategory, setShowCategory] = useState<boolean>(settings.useShowCategory);

    return (
        <>
            <SwitchItem
                children={'Display in profile'}
                note="When enabled, the channel will also be visible in the user profile."
                value={profileModal}
                onChange={(value) => {
                    setProfileModal(value);
                    settings.useProfileModal = value;
                    // Data.save('useProfileModal', value);
                }}
            />
            <SwitchItem
                children={'Display category'}
                note="When enabled, show voice channel with category."
                value={showCategory}
                onChange={(value) => {
                    setShowCategory(value);
                    settings.useShowCategory = value;
                    // Data.save('useShowCategory', value);
                }}
            />
        </>
    );
};

export { SettingsPanel };
