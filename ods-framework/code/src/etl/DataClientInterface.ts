/**
 * Copyright (c) 2025 Capital One
*/

import { UserContext } from "dlms-base";

/**
 * Interface for a client that supports refreshing cached data.
 */
export interface CacheDataClient {
    /**
     * Refreshes the cache for the data client.
     * 
     * @param ctx The user context.
     * @param doRefresh Whether to force a full refresh.
     * @param processItems Optional list of items to process.
     * @returns A promise resolving to the refresh result.
     */
    refreshCache(ctx: UserContext, doRefresh: boolean, processItems?: string[]): Promise<any>;
}

/**
 * Interface for a client that supports updating data.
 */
export interface UpdateDataClient {
    /**
     * Updates the data for the client.
     * 
     * @param ctx The user context.
     * @param doRefresh Whether to force a full refresh.
     * @param processItems Optional list of items to process.
     * @returns A promise resolving to the update result.
     */
    updateData(ctx: UserContext, doRefresh: boolean, processItems?: string[]): Promise<any>;
}

/**
 * Type for a client that supports both caching and updating data.
 */
export type CacheUpdateDataClient = CacheDataClient & UpdateDataClient;

/**
 * Interface for a processor that can process data.
 */
export interface Processor {
    /**
     * Processes data for the client.
     * 
     * @param ctx The user context.
     * @param doRefresh Whether to force a full refresh.
     * @param processItems Optional list of items to process.
     * @returns A promise resolving to the process result.
     */
    process(ctx: UserContext, doRefresh: boolean, processItems?: string[]): Promise<any>;
}