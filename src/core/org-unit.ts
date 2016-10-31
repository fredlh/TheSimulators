export class OrgUnit {
    id: string;
    displayName: string;
    lastUpdated: Date;
    level: number;
    created: Date;
    openingDate: Date;
    dimensionItem: string;
    dimensionItemType: string;
    children: OrgUnit[];
    users: OrgUnit[];
    coordinates;
    parent;
}