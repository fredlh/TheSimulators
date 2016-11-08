import { Component, OnInit } from "@angular/core";

import { OrgUnitService } from "../../services/org-unit.service";
import { MapService } from "../../services/map.service";

import { Globals }            from "../../globals/globals";

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


export class OptionsComponent implements GlobalsUpdateInterface, OnInit  {
    private orgUnitLevels = [];
    private self = OptionsComponent;
    private booleanOptions = ["Yes", "No"];

    private static defaultOptions = new Options();
    private static tempOptions = new Options();
    private static currentOptions = new Options();

    constructor(private orgUnitService: OrgUnitService,
                private mapService: MapService) {}

    onOrganisationUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
        
        OptionsComponent.currentOptions.mapOptions = [];
        OptionsComponent.tempOptions.mapOptions = [];
        OptionsComponent.defaultOptions.mapOptions = [];

        let mapOption = 
            {color: "#000000", hoverColor: "#1E90FF", selectedColor: "#DC143C", borderColor: "#000000", borderHoverColor: "#000000", borderSelectedColor: "#000000",
             opacity: 0.2, hoverOpacity: 0.2, selectedOpacity: 0.2, borderWeight: 1, borderHoverWeight: 1, borderSelectedWeight: 1,
             borderOpacity: 1.0, borderHoverOpacity: 1.0, borderSelectedOpacity: 1.0};

        for (let i = 0; i < this.orgUnitLevels.length; i++) {
            OptionsComponent.tempOptions.mapOptions.push(mapOption);
            OptionsComponent.currentOptions.mapOptions.push(mapOption);
        }

        OptionsComponent.defaultOptions.mapOptions.push(mapOption);
    }

    ngOnInit(): void {
        let mapOption = 
            {color: "#000000", hoverColor: "#1E90FF", selectedColor: "#DC143C", borderColor: "#000000", borderHoverColor: "#000000", borderSelectedColor: "#000000",
             opacity: 0.2, hoverOpacity: 0.2, selectedOpacity: 0.2, borderWeight: 1, borderHoverWeight: 1, borderSelectedWeight: 1,
             borderOpacity: 1.0, borderHoverOpacity: 1.0, borderSelectedOpacity: 1.0};

        OptionsComponent.defaultOptions.mapOptions.push(mapOption);

        this.orgUnitService.registerGlobalsUpdateListener(this);
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