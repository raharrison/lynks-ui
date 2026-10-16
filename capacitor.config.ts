import type {CapacitorConfig} from '@capacitor/cli';

// server.url would make the WebView same-origin with the API and so hide whether CORS is right. Test bundled first.
const config: CapacitorConfig = {
    appId: 'net.ryanh.lynks',
    appName: 'Lynks',
    webDir: 'dist',
    android: {
        // https://localhost is a secure context, so the WebView blocks XHR to a plain-HTTP API.
        // network_security_config.xml is a layer below and does not.
        allowMixedContent: true,
    },
};

export default config;
