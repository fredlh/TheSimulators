class Id {
    id: string;
}

export class FeatureType {
    public static NONE = "NONE";
    public static MULTI_POLYGON = "MULTI_POLYGON";
    public static POLYGON = "POLYGON";
    public static POINT = "POINT";
    public static SYMBOL = "SYMBOL";
}

export class OrganisationUnitLevel {
    level: number;
    name: string;
    id: string;
    created: Date;
    displayName: string;
}

export class OrganisationUnitGroup {
    code: string;
    id: string;
    name: string;
    symbol: string;
    dimensionItem: string;
    dimensionItentType: string;
    organisationGroupSet: Id;
    organisationUnits: Id[];

    constructor() {
        this.organisationGroupSet = new Id();
        this.organisationUnits = [];
    }
}


export class Globals {

    public static organisationUnitLevels: OrganisationUnitLevel[] = [];
    public static organisationUnitGroups: OrganisationUnitGroup[] = [];


    // Returns the highest organisation unit level, or -1 on error
    public static getMaxLevel(): number {
        let maxLevel = Number.MIN_SAFE_INTEGER;
        for (let orgUnit of Globals.organisationUnitLevels) {
            if (orgUnit.level > maxLevel) maxLevel = orgUnit.level;
        }
        return maxLevel === Number.MIN_SAFE_INTEGER ? -1 : maxLevel;
    }

    // Returns the lowest organisation unit level, or -1 on error
    public static getMinlevel(): number {
        let minLevel = Number.MAX_SAFE_INTEGER;
        for (let orgUnit of Globals.organisationUnitLevels) {
            if (orgUnit.level < minLevel) minLevel = orgUnit.level;
        }

        return minLevel === Number.MAX_SAFE_INTEGER ? -1 : minLevel;
    }


    public static getName(level: number): string {
        for (let elem of Globals.organisationUnitLevels) {
            if (elem.level === level) return elem.name;
        }

        return "";
    }

    public static getOrgGroupName(id: string): string {
        for (let elem of Globals.organisationUnitGroups) {
            if (elem.id === id) return elem.name;
        }

        return "";
    }

    public static getLevel(name: string): number {
        for (let elem of Globals.organisationUnitLevels) {
            if (elem.name === name) return elem.level;
        }

        return -1;
    }

    public static getNumOrgUnitLevels(): number {
        return Globals.organisationUnitLevels.length;
    }

    public static formatDate(date: string): string {
        let formatedDate = date.split(".");
        formatedDate = formatedDate[0].split("T");
        return formatedDate[0] + " " + formatedDate[1];
    }
}