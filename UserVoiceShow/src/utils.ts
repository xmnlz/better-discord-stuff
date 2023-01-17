import { createSettings } from 'bundlebd';
import { DiscordModules, WebpackModules } from 'zlibrary';

const { Permissions, DiscordPermissions, UserStore } = DiscordModules;

export const settings = createSettings({
    useProfileModal: false,
    useShowCategory: false,
});

export const checkPermissions = (channel) => {
    const hasPermissions = Permissions.can({
        permission: DiscordPermissions.CONNECT,
        user: UserStore.getCurrentUser(),
        context: channel,
    });

    return hasPermissions;
};

export const getLazyModule = (filter) => {
    const cached = WebpackModules.getModule(filter);
    if (cached) return Promise.resolve(cached);

    return new Promise((resolve) => {
        const removeListener = WebpackModules.addListener((m) => {
            if (filter(m)) {
                resolve(m);
                removeListener();
            }
        });
    });
};

export const isEmpty = (obj: Object) => {
    return Object.keys(obj).length === 0;
};
