import { OrgUnit } from "./org-unit";

export interface MapViewInterface {
    draw(orgUnits: OrgUnit[], maxLevelReached: boolean, onSearch: boolean);
    drawAdditionalOrgUnits(orgUnits: OrgUnit[]);
    onSideBarClick(orgUnitId: string);
    deselectMap();
    onMapOptionsSave();
    addNewPolygon();
    finishedAddNewPolygon();
    previewCoordinates(coords: number[][][][]);

}