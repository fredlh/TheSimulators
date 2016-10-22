import { OrgUnit } from "./org-unit";

export interface DrawAble {
    addPolygons(orgUnits: OrgUnit[]);
}