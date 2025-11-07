/**
 * Copyright (c) 2025 Capital One
*/

import { UserContext, UserProfileService } from 'dlms-server';

export interface EtlProfileService extends UserProfileService {
    logout(ctx: UserContext): Promise<any>;
    getProfile(emailOrUid: string, details?: boolean): Promise<any>;
    getManagementChain(users: string[]): Promise<any>;
}