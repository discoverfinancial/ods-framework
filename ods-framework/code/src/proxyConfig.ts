/**
 * Copyright (c) 2025 Capital One
*/

import { URL } from 'node:url';
import { getGlobalDispatcher, setGlobalDispatcher, Dispatcher, ProxyAgent } from 'undici';
import { bootstrap } from 'global-agent';


export function setupProxy() {
    const httpProxy = process.env.GLOBAL_AGENT_HTTP_PROXY || '';
    const httpsProxy = process.env.GLOBAL_AGENT_HTTPS_PROXY || '';
  
    if (!httpProxy && !httpsProxy) {
      console.log('No proxy configuration provided, using default settings.');
      return;
    }
    //bootstrap();

    const httpProxyAgent = new ProxyAgent(process.env.GLOBAL_AGENT_HTTP_PROXY || '');
    const httpsProxyAgent = new ProxyAgent(process.env.GLOBAL_AGENT_HTTPS_PROXY || '');

    const noProxyRules = (process.env.GLOBAL_AGENT_NO_PROXY || '').split(',').map(rule => rule.trim());
    const defaultDispatcher = getGlobalDispatcher();

    setGlobalDispatcher(new class extends Dispatcher {
    dispatch(options: Dispatcher.DispatchOptions, handler: Dispatcher.DispatchHandlers) {
        if (options.origin) {
        const { host, protocol } = typeof options.origin === 'string' ? new URL(options.origin) : options.origin;
        const proxyAgent = protocol === 'https:' ? httpsProxyAgent : httpProxyAgent;
        if (proxyAgent && !noProxyRules.some(rule => rule.startsWith('.') ? host.endsWith(rule) : host === rule)) {
            return proxyAgent.dispatch(options, handler);
        }
        }
        return defaultDispatcher.dispatch(options, handler);
    }
    });

    console.log(`HTTP Proxy: ${process.env.GLOBAL_AGENT_HTTP_PROXY}`);
    console.log(`HTTPS Proxy: ${process.env.GLOBAL_AGENT_HTTPS_PROXY}`);
    console.log(`NO_PROXY: ${process.env.GLOBAL_AGENT_NO_PROXY}`);
}