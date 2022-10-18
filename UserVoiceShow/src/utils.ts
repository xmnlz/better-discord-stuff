import { DiscordModules, WebpackModules } from 'zlibrary';

const { Permissions, DiscordPermissions, UserStore } = DiscordModules;

const checkPermissions = (channel) => {
    const hasPermissions = Permissions.can({
        permission: DiscordPermissions.CONNECT,
        user: UserStore.getCurrentUser(),
        context: channel,
    });

    return hasPermissions;
};

const getLazyModule = (filter) => {
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

const withProps = (filter: (m: any) => boolean) => {
    return (m) => Object.values(m).some(filter);
};

export { checkPermissions, getLazyModule, withProps };
