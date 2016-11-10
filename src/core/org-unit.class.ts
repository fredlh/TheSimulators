export class ID {
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}

export class OrgUnit {
    code: string;
    lastUpdated: string;
    id: string;
    level: number;
    name: string;
    displayName: string;
    shortName: string;
    created: string;
    openingDate: Date;
    coordinates;
    path: string;

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
        this.parent = new ID("");
        this.children = [];
        this.ancestors = [];
        this.organisationUnitGroups = [];
        this.datasets = [];
        this.users = [];
    }
}