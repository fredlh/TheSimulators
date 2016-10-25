import { OrgUnit } from "./org-unit";

export interface MapViewInterface {
    draw(orgUnits: OrgUnit[]);
    onSideBarClick(orgUnitId: string);
}