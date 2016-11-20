import { Component, OnInit }                from "@angular/core";

import { OrgUnitService }                   from "../../services/org-unit.service";
import { SideBarService }                   from "../../services/side-bar.service";
import { MapService }                       from "../../services/map.service";

import { OrgUnitLevelsUpdateInterface}      from "../../core/org-unit-levels-update.interface";

import { Globals, OrganisationUnitLevel }   from "../../globals/globals.class";

/*
 * The Options component is a panel where the user can change the behaviour of the application
 * 
 * The user can change behaviour from the following main cateogires:
 * - Zooming: Whether to auto zoom on various conditions
 * - Visual represention of the orgUnits: Default color, hover color, opacity and much more for each orgUnitLevels
 * 
 * Each time it's saved, it notfies the map which updates all the preferences
 * 
 * No cookies or such used, so the options will reset on each page refresh
 * 
 * Each MapOption has a level field, so in the case that the API contains level 1, 2 and 4,
 * the application wont crash
 */


// Used for jQUery
declare var $: any;


// Represents all the visual choices for each orgUnitLevels
// Used in a ngModel in the HTML page
export interface MapOptions {
    color: string;
    hoverColor: string;
    selectedColor: string;
    borderColor: string;
    borderHoverColor: string;
    borderSelectedColor: string;
    opacity: number;
    hoverOpacity: number;
    selectedOpacity: number;
    borderWeight: number;
    borderHoverWeight: number;
    borderSelectedWeight: number;
    borderOpacity: number;
    borderHoverOpacity: number;
    borderSelectedOpacity: number;
    level: number;
}

// Contains all zoom options along with a reference to its map options
class Options {
    autoZoomOnSearch = "Yes";
    autoZoomOnGetChildren = "Yes";
    autoZoomOnSelect = "Yes";
    autoZoomOnDeselect = "Yes";
    autoZoomOnSelectWoCoordinates = "Yes";
    mapOptions: MapOptions[] = [];
}

@Component({
    selector: "options-field",
    template: require<any>("./options.component.html"),
    styles: [ require<any>("./options.component.less") ]
})


export class OptionsComponent implements OrgUnitLevelsUpdateInterface  {

    // The user can specify all visual options for each level
    private static orgUnitLevels: OrganisationUnitLevel [] = [];

    // A reference to iself, used in the HTML page to access static fields
    private self = OptionsComponent;

    // Used for the selectBoxes
    private booleanOptions = ["Yes", "No"];

    // The default maptions which is used for each level
    private mapOptions: MapOptions =
        {color: "#000000", hoverColor: "#1E90FF", selectedColor: "#DC143C",
        borderColor: "#000000", borderHoverColor: "#000000", borderSelectedColor: "#000000",
        opacity: 0.2, hoverOpacity: 0.2, selectedOpacity: 0.2, borderWeight: 1, borderHoverWeight: 1, borderSelectedWeight: 1,
        borderOpacity: 1.0, borderHoverOpacity: 1.0, borderSelectedOpacity: 1.0, level: -1};

    // Is the option that counds, is the "real" one
    private static defaultOptions = new Options();

    // Is the one displayed in the options panel
    // Makes it possible to edit anyting, is only saved when user clicks "Save"
    private static tempOptions = new Options();

    // Default option, used as default and in the cases
    // where an orgUnit contains a level which isn't contained in orgUnitLevels
    private static currentOptions = new Options();

    constructor(private orgUnitService: OrgUnitService,
                private mapService: MapService,
                private sideBarService: SideBarService) {
        OptionsComponent.defaultOptions.mapOptions.push(this.mapOptions);
        this.orgUnitService.registerOrgUnitLevelsListener(this);
    }

    // Gets called when the orgUnitLevels have been updated
    onOrgUnitLevelsUpdate(): void {
        OptionsComponent.orgUnitLevels = Globals.organisationUnitLevels;

        // Empty all current options
        OptionsComponent.tempOptions.mapOptions = [];
        OptionsComponent.currentOptions.mapOptions = [];
        OptionsComponent.defaultOptions.mapOptions = [];

        // Push updated info for all 3, and specify the actual level (in case of gaps)
        for (let i = 0; i < OptionsComponent.orgUnitLevels.length; i++) {
            OptionsComponent.tempOptions.mapOptions.push(JSON.parse(JSON.stringify(this.mapOptions)));
            OptionsComponent.tempOptions.mapOptions[i].level = OptionsComponent.orgUnitLevels[i].level;

            OptionsComponent.currentOptions.mapOptions.push(JSON.parse(JSON.stringify(this.mapOptions)));
            OptionsComponent.currentOptions.mapOptions[i].level = OptionsComponent.orgUnitLevels[i].level;

            OptionsComponent.defaultOptions.mapOptions.push(JSON.parse(JSON.stringify(this.mapOptions)));
            OptionsComponent.defaultOptions.mapOptions[i].level = OptionsComponent.orgUnitLevels[i].level;
        }
    }

    public static getAutoZoomOnSearch(): boolean {
        return OptionsComponent.currentOptions.autoZoomOnSearch === "Yes";
    }

    public static getAutoZoomOnGetChildren(): boolean {
        return OptionsComponent.currentOptions.autoZoomOnGetChildren === "Yes";
    }

    public static getAutoZoomOnSelect(): boolean {
        return OptionsComponent.currentOptions.autoZoomOnSelect === "Yes";
    }

    public static getAutoZoomOnDeselect(): boolean {
        return OptionsComponent.currentOptions.autoZoomOnDeselect === "Yes";
    }

    public static getAutoZoomOnSelectWoCoordinates(): boolean {
        return OptionsComponent.currentOptions.autoZoomOnSelectWoCoordinates === "Yes";
    }

    public static getMapOptions(): MapOptions[] {
        return OptionsComponent.currentOptions.mapOptions;
    }

    // Will always contain a copy of the default options on index 0
    public static getDefaultMapOptions(): MapOptions {
        return OptionsComponent.defaultOptions.mapOptions[0];
    }


    // Returns the maptions on default of the corresponding level
    // Is the default color, opacity and border options
    public static getMapOptionsDefault(level: number) {
        let option = OptionsComponent.getDefaultMapOptions();

        for (let elem of OptionsComponent.currentOptions.mapOptions) {
            if (elem.level === level) {
                option = elem;
                break;
            }
        }

        return {color: option.borderColor, fillColor: option.color,
                weight: option.borderWeight,
                fillOpacity: option.opacity, opacity: option.borderOpacity};
    }

    // Returns the maptions on selected of the corresponding level
    public static getMapOptionsSelected(level: number) {
        let option = OptionsComponent.getDefaultMapOptions();

        for (let elem of OptionsComponent.currentOptions.mapOptions) {
            if (elem.level === level) {
                option = elem;
                break;
            }
        }

        return {color: option.borderSelectedColor, fillColor: option.selectedColor,
                weight: option.borderSelectedWeight,
                fillOpacity: option.selectedOpacity, opacity: option.borderSelectedOpacity};
    }

    // Returns the maptions on hover of the corresponding level
    public static getMapOptionsHover(level: number) {
        let option = OptionsComponent.getDefaultMapOptions();

        for (let elem of OptionsComponent.currentOptions.mapOptions) {
            if (elem.level === level) {
                option = elem;
                break;
            }
        }

        return {color: option.borderHoverColor, fillColor: option.hoverColor,
                        weight: option.borderHoverWeight,
                        fillOpacity: option.hoverOpacity, opacity: option.borderHoverOpacity};
    }


    // Called when the options panels opens
    toggleOptionsWindow(): void {
        this.showOptionsPanel();

        let tmpThis = this;
        $(".close").click(function() {
            tmpThis.onCancel(tmpThis);
        });

        window.onclick = function(event) {
            if (event.target === document.getElementById("optionsArea")) {
                tmpThis.onCancel(tmpThis);
            }
        };
    }

    showOptionsPanel(): void {
        document.getElementById("optionsArea").style.display = "block";
    }

    hideOptionsPanel(): void {
        document.getElementById("optionsArea").style.display = "none";
    }

    // Reset the options when the panel closes
    onCancel(tmpThis = this): void {
        tmpThis.hideOptionsPanel();
        OptionsComponent.tempOptions = JSON.parse(JSON.stringify(OptionsComponent.currentOptions));
    }

    // Save the options, and notify the map
    onSave(zoomOnSearch: boolean): void {
        this.hideOptionsPanel();
        OptionsComponent.currentOptions = JSON.parse(JSON.stringify(OptionsComponent.tempOptions));

        this.mapService.onMapOptionsSaved();
    }

    // Reset to default values
    // Will only get saved if the user saves
    onReset(): void {
        OptionsComponent.tempOptions = JSON.parse(JSON.stringify(OptionsComponent.defaultOptions));
    }

}