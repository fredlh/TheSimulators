import { OrgUnit } from "./org-unit";

export interface SideBarInterface {
    onSearch(orgUnits: OrgUnit[]);
    onMapClick(orgUnitId: string);
}