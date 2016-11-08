import { Component, OnInit } from "@angular/core";

import { OrgUnitService } from "../../services/org-unit.service";
import { MapService } from "../../services/map.service";

import { Globals, OrganisationUnitLevel }            from "../../globals/globals";

import { GlobalsUpdateInterface} from "../../core/globals-update.interface";


declare var $: any;

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

class Options {
    autoZoomOnSearch = "Yes";
    autoZoomOnGetChildren = "Yes";
    autoZoomOnSelect = "Yes";
    mapOptions: MapOptions[] = [];
}

@Component({
    selector: "options-field",
    template: require<any>("./options.component.html"),
    styles: [ require<any>("./options.component.less") ]
})


export class OptionsComponent implements GlobalsUpdateInterface  {
    private static orgUnitLevels: OrganisationUnitLevel [] = [];
    private self = OptionsComponent;
    private booleanOptions = ["Yes", "No"];

    private mapOptions: MapOptions = 
        {color: "#000000", hoverColor: "#1E90FF", selectedColor: "#DC143C", 
        borderColor: "#000000", borderHoverColor: "#000000", borderSelectedColor: "#000000",
        opacity: 0.2, hoverOpacity: 0.2, selectedOpacity: 0.2, borderWeight: 1, borderHoverWeight: 1, borderSelectedWeight: 1,
        borderOpacity: 1.0, borderHoverOpacity: 1.0, borderSelectedOpacity: 1.0, level: -1};

    private static defaultOptions = new Options();
    private static tempOptions = new Options();
    private static currentOptions = new Options();

    constructor(private orgUnitService: OrgUnitService, private mapService: MapService) {
        OptionsComponent.defaultOptions.mapOptions.push(this.mapOptions);
        this.orgUnitService.registerGlobalsUpdateListener(this);     
    }

    onOrganisationUnitLevelsUpdate(): void {
        OptionsComponent.orgUnitLevels = Globals.organisationUnitLevels;

        OptionsComponent.tempOptions.mapOptions = [];
        OptionsComponent.currentOptions.mapOptions = [];
        OptionsComponent.defaultOptions.mapOptions = [];

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

    public static getMapOptions(): MapOptions[] {
        return OptionsComponent.currentOptions.mapOptions;
    }

    public static getDefaultMapOptions(): MapOptions {
        return OptionsComponent.defaultOptions.mapOptions[0];
    }


    // Returns the maptions on default of the corresponding level
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
        this.orgUnitService.hideSideBar();
    }

    hideOptionsPanel(): void {
        document.getElementById("optionsArea").style.display = "none";
        this.orgUnitService.unHideSideBar();
    }

    onCancel(tmpThis = this): void {
        tmpThis.hideOptionsPanel();
        OptionsComponent.tempOptions = JSON.parse(JSON.stringify(OptionsComponent.currentOptions));
    }


    onSave(zoomOnSearch: boolean): void {
        this.hideOptionsPanel();
        OptionsComponent.currentOptions = JSON.parse(JSON.stringify(OptionsComponent.tempOptions));

        this.mapService.onMapOptionsSaved();
    }

    onReset(): void {
        OptionsComponent.tempOptions = JSON.parse(JSON.stringify(OptionsComponent.defaultOptions));
        OptionsComponent.currentOptions = JSON.parse(JSON.stringify(OptionsComponent.defaultOptions));
    }

}