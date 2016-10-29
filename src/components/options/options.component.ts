import { Component } from "@angular/core";

import { OrgUnitService } from "../../services/org-unit.service";

declare var $: any;

export interface MapOptions {
    fillColor: string;
    fillHoverColor: string;
    fillSelectedColor: string;
    color: string;
    hoverColor: string;
    selectedColor: string;
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
    mapOptions = [
        {fillColor: "#000000", fillHoverColor: "#1E90FF", fillSelectedColor: "#DC143C", color: "#000000", hoverColor: "#000000", selectedColor: "#000000",
            opacity: 0.2, hoverOpacity: 0.2, selectedOpacity: 0.2, borderWeight: 1, borderHoverWeight: 1, borderSelectedWeight: 1,
            borderOpacity: 1.0, borderHoverOpacity: 1.0, borderSelectedOpacity: 1.0},

        {fillColor: "#000000", fillHoverColor: "#1E90FF", fillSelectedColor: "#DC143C", color: "#000000", hoverColor: "#000000", selectedColor: "#000000",
            opacity: 0.2, hoverOpacity: 0.2, selectedOpacity: 0.2, borderWeight: 1, borderHoverWeight: 1, borderSelectedWeight: 1,
            borderOpacity: 1.0, borderHoverOpacity: 1.0, borderSelectedOpacity: 1.0},

        {fillColor: "#000000", fillHoverColor: "#1E90FF", fillSelectedColor: "#DC143C", color: "#000000", hoverColor: "#000000", selectedColor: "#000000",
            opacity: 0.2, hoverOpacity: 0.2, selectedOpacity: 0.2, borderWeight: 1, borderHoverWeight: 1, borderSelectedWeight: 1,
            borderOpacity: 1.0, borderHoverOpacity: 1.0, borderSelectedOpacity: 1.0},

        {fillColor: "#000000", fillHoverColor: "#1E90FF", fillSelectedColor: "#DC143C", color: "#000000", hoverColor: "#000000", selectedColor: "#000000",
            opacity: 0.2, hoverOpacity: 0.2, selectedOpacity: 0.2, borderWeight: 1, borderHoverWeight: 1, borderSelectedWeight: 1,
            borderOpacity: 1.0, borderHoverOpacity: 1.0, borderSelectedOpacity: 1.0}
    ];
}

@Component({
    selector: "options-field",
    template: require<any>("./options.component.html"),
    styles: [ require<any>("./options.component.less") ]
})


export class OptionsComponent {
    private self = OptionsComponent;
    private booleanOptions = ["Yes", "No"];

    private static tempOptions = new Options();
    private static currentOptions = new Options();

    constructor(private orgUnitService: OrgUnitService) {}

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

    toggleOptionsWindow(): void {
        $("#optionsButton").click(this.onOpen);
        $(".close").click(this.onClose);

        
        window.onclick = function(event) {
            let options = document.getElementById("optionsArea");
            if (event.target === options) {
                options.style.display = "none";
                OptionsComponent.tempOptions = JSON.parse(JSON.stringify(OptionsComponent.currentOptions));
            }
        };
    }

    onOpen(): void {
        document.getElementById("optionsArea").style.display = "block";
    }

    onOutsideClick(event: MouseEvent): any {
        let options = document.getElementById("optionsArea");
        if (event.target === options) {
            options.style.display = "none";
        }
    }

    onClose(): void {
        let options = document.getElementById("optionsArea");
        options.style.display = "none";

        OptionsComponent.tempOptions = JSON.parse(JSON.stringify(OptionsComponent.currentOptions));
    }

    onSave(zoomOnSearch: boolean): void {
        let options = document.getElementById("optionsArea");
        options.style.display = "none";

        OptionsComponent.currentOptions = JSON.parse(JSON.stringify(OptionsComponent.tempOptions));

        this.orgUnitService.callOnOptionsSave();
    }

    


}