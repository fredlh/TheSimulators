import { OrgUnit } from "./org-unit";

export interface MapViewInterface {
    onSearch(orgUnits: OrgUnit[]);
    onSideBarClick(orgUnitId: string);
}