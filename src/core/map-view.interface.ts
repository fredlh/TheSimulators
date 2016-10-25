import { OrgUnit } from "./org-unit";

export interface MapViewInterface {
    draw(orgUnits: OrgUnit[], maxLevelReached: boolean);
    onSideBarClick(orgUnitId: string);
    deselectMap();
}