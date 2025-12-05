/**
 * Copyright (c) 2025 Capital One
*/

import { User } from "dlms-base";
export interface AppContext {
    user: User;
    isAdministrator: boolean;
    isEditor: boolean;
    isEmployee: boolean;
    isAttestor?: boolean;
    isOwner?: boolean;
    editMode: boolean;
    writeGroups: string[];
    readGroups: string[];

    setError?: any;
    setInfoText?: any;
    setShowDialog?: any;
    setShowSpinner?: any;
    showErrorDialog?: (err: any) => void;
    showSection?: (section: string) => void;
    wasAdministrator?: boolean;
    show_checklist?: boolean;
    show_comments_section?: boolean;
    show_stepper_and_phases?: boolean;
    view_as_admin_only?:boolean;
    enable_print_option?:boolean;
    tabbed_document_view_switch?:boolean;
    info?: any;
    remoteInfo?: any;
}
