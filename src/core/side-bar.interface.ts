import { OrgUnit } from "./org-unit";

export interface SideBarInterface {
    updateList(orgUnits: OrgUnit[]);
    expandAndScrollToOrgUnit(orgUnitId: string);
}