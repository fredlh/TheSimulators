import { OrgUnit, ID} from "../core/org-unit.class";

/*
 * A basic class for holding global data
 * 
 * All constants are placed here, such as FeatureType
 * 
 * Also holds orgUnitLevels and orgUnitGroups which the
 * various components can use to retrieve an up-to-date version of them
 */

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
    shortName: string;
    displayName: string;
    created: Date;
    symbol: string;
    dimensionItem: string;
    dimensionItentType: string;
    organisationGroupSet: ID;
    organisationUnits: ID[];
    orgUnitArray: OrgUnit[];

    constructor() {
        this.organisationGroupSet = new ID("");
        this.organisationUnits = [];
        this.orgUnitArray = [];
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


    // Returns the name of given orgUnitLevel, or "" on error
    public static getOrgUnitLevelName(level: number): string {
        for (let elem of Globals.organisationUnitLevels) {
            if (elem.level === level) return elem.name;
        }

        return "";
    }

    // Returns the name of the orgUnitGroup with the given id, or "" on error
    public static getOrgGroupName(id: string): string {
        for (let elem of Globals.organisationUnitGroups) {
            if (elem.id === id) return elem.name;
        }

        return "";
    }

    // Returns the level an orgUnitLevel with a given name, or -1 on error
    public static getOrgUnitLevelNumber(name: string): number {
        for (let elem of Globals.organisationUnitLevels) {
            if (elem.name === name) return elem.level;
        }

        return -1;
    }

    // Returns the number of orgUnitLevels
    public static getNumOrgUnitLevels(): number {
        return Globals.organisationUnitLevels.length;
    }

    // Returns a formated date on the form "yyyy-mm-dd hh:mm:ss"
    public static formatDate(date: string): string {
        let formatedDate = date.split(".");
        formatedDate = formatedDate[0].split("T");
        return formatedDate[0] + " " + formatedDate[1];
    }
}