export class Constants {
    public static LEVEL_1 = "Country";
    public static LEVEL_2 = "Province";
    public static LEVEL_3 = "District";
    public static LEVEL_4 = "Unit";

    public static nameToLevelMapping = [Constants.LEVEL_1, Constants.LEVEL_2, Constants.LEVEL_3, Constants.LEVEL_4];

    public static getName(level: number): string {
        if (level < 1 || level > 4) return "Error: Illegal level value";
        return Constants.nameToLevelMapping[level - 1];
    }

    public static getLevel(name: string): number {
        let map = Constants.nameToLevelMapping;
        for (let i = 0; i < map.length; i++) {
            if (map[i] === name) return i;
        }

        return -1;
    }
}