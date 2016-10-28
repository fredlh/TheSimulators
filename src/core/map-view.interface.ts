import { OrgUnit } from "./org-unit";

export interface MapViewInterface {
    draw(orgUnits: OrgUnit[], maxLevelReached: boolean, onSearch: boolean);
    onSideBarClick(orgUnitId: string);
    deselectMap();
}