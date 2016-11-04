export class FeatureType {
    public static NONE = "NONE";
    public static MULTI_POLYGON = "MULTI_POLYGON";
    public static POLYGON = "POLYGON";
    public static SYMBOL = "SYMBOL";   
}

export class OrganisationUnitLevel {
    level: number;
    name: string;
    id: string;
}

export class OrganisationUnitGroup {
    code: string;
    id: string;
    name: string;
}


export class Globals {

    public static organisationUnitLevels: OrganisationUnitLevel[] = [];
    public static organisationUnitGroups: OrganisationUnitGroup[] = [];

    public static IN_EDIT_MODE = false;
    public static IN_EDIT_MODE_POLYGON = false;
    public static IN_EDIT_MODE_MARKER = false;

    public static getName(level: number): string {
        for (let elem of Globals.organisationUnitLevels) {
            if (elem.level === level) return elem.name;
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


    public static setInEditMode(polygon: boolean) {
        Globals.IN_EDIT_MODE = true;

        if (polygon) 
            Globals.IN_EDIT_MODE_POLYGON = true;
        else 
            Globals.IN_EDIT_MODE_MARKER = true;
    }

    public static endInEditMode(): void {
        Globals.IN_EDIT_MODE = false;
        Globals.IN_EDIT_MODE_POLYGON = false;
        Globals.IN_EDIT_MODE_MARKER = false;
    }

 
}