import { OrgUnit } from "./org-unit";

export interface MapViewInterface {
    draw(orgUnits: OrgUnit[], maxLevelReached: boolean, onSearch: boolean);
    drawAdditionalOrgUnits(orgUnits: OrgUnit[]);
    onSideBarClick(orgUnitId: string);
    deselectMap();
    onMapOptionsSave();
    startEditMode(orgUnitId: string, polygon: boolean);
    clearEditData();
    endEditMode(saved: boolean);
    endEdit();
    previewCoordinates(coords: number[][][][]);
    toggleAddMarker();
    removeMarker();
}