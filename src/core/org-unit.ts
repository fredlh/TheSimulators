export class OrgUnit {
    id: string;
    displayName: string;
    lastUpdated: Date;
    level: number;
    created: Date;
    openingDate: Date;
    dimensionItem: String;
    dimensionItemType: String;
    children: OrgUnit[];
    users: OrgUnit[];
}