export interface SideNavItems {
    [index: string]: SideNavItem;
}

export interface SideNavItem {
    icon?: string;
    text: string;
    link?: string;
    submenu?: SideNavItem[];
}

export interface SideNavSection {
    text?: string;
    items: string[];
}
