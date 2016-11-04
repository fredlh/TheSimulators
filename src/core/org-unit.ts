class ID {
    id: string;
}

export class OrgUnit {
    code: string;
    lastUpdated: string;
    id: string;
    level: number;
    name: string;
    displayName: string;
    created: string;
    openingDate: string;
    coordinates;

    featureType: string;
    dimensionItem: string;
    dimensionItemType: string;

    parent: ID;
    children: ID[];
    ancestors: ID [];
    organisationUnitGroups: ID[];
    datasets: ID[];
    users: ID[];


    constructor() {
        this.parent = new ID();
        this.children = [];
        this.ancestors = [];
        this.organisationUnitGroups = [];
        this.datasets = [];
        this.users = [];
    }
}