import { OrgUnit } from "./org-unit";

export interface SideBarInterface {
    updateList(orgUnits: OrgUnit[]);
    scrollToOrgUnit(orgUnitId: string);
    closeSideBar();
    showSideBar();
}