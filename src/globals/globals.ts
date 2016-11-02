export class Globals {
    public static LEVEL_1 = "Country";
    public static LEVEL_2 = "Province";
    public static LEVEL_3 = "District";
    public static LEVEL_4 = "Unit";

    public static nameToLevelMapping = [Globals.LEVEL_1, Globals.LEVEL_2, Globals.LEVEL_3, Globals.LEVEL_4];

    public static IN_EDIT_MODE = false;

    public static getName(level: number): string {
        if (level < 1 || level > 4) return "Error: Illegal level value";
        return Globals.nameToLevelMapping[level - 1];
    }

    public static getLevel(name: string): number {
        let map = Globals.nameToLevelMapping;
        for (let i = 0; i < map.length; i++) {
            if (map[i] === name) return i;
        }

        return -1;
    }

    public static getNumOrgUnits(): number {
        return Globals.nameToLevelMapping.length;
    }

 
}