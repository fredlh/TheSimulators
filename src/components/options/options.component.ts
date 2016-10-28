import { Component } from "@angular/core";

declare var $: any;

export interface MapOptions {
    fillColor: string;
    fillHoverColor: string;
    fillSelectedColor: string;
    color: string;
    hoverColor: string;
    selectedColor: string;
    opacity: string;
    hoverOpacity: string;
    selectedOpacity: string;
    borderWeight: string;
    borderHoverWeight: string;
    borderSelectedWeight: string;
    borderOpacity: string;
    borderHoverOpacity: string;
    borderSelectedOpacity: string;
}

@Component({
    selector: "options-field",
    template: require<any>("./options.component.html"),
    styles: [ require<any>("./options.component.less") ]
})


export class OptionsComponent {
    // Auto zoom
    private static AUTO_ZOOM_ON_SEARCH = 0;
    private static AUTO_ZOOM_ON_GET_CHILDREN = 1;
    private static AUTO_ZOOM_ON_SELECT = 2;

    private static mapOptions = [
        {fillColor: "black", fillHoverColor: "blue", fillSelectedColor: "red", color: "black", hoverColor: "black", selectedColor: "black", opacity: "0.2", hoverOpacity: "0.2", selectedOpacity: "0.2", borderWeight: "1", borderHoverWeight: "1", borderSelectedWeight: "1", borderOpacity: "1.0", borderHoverOpacity: "1.0", borderSelectedOpacity: "1.0"},
        {fillColor: "black", fillHoverColor: "blue", fillSelectedColor: "red", color: "black", hoverColor: "black", selectedColor: "black", opacity: "0.2", hoverOpacity: "0.2", selectedOpacity: "0.2", borderWeight: "1", borderHoverWeight: "1", borderSelectedWeight: "1", borderOpacity: "1.0", borderHoverOpacity: "1.0", borderSelectedOpacity: "1.0"},
        {fillColor: "black", fillHoverColor: "blue", fillSelectedColor: "red", color: "black", hoverColor: "black", selectedColor: "black", opacity: "0.2", hoverOpacity: "0.2", selectedOpacity: "0.2", borderWeight: "1", borderHoverWeight: "1", borderSelectedWeight: "1", borderOpacity: "1.0", borderHoverOpacity: "1.0", borderSelectedOpacity: "1.0"},
        {fillColor: "black", fillHoverColor: "blue", fillSelectedColor: "red", color: "black", hoverColor: "black", selectedColor: "black", opacity: "0.2", hoverOpacity: "0.2", selectedOpacity: "0.2", borderWeight: "1", borderHoverWeight: "1", borderSelectedWeight: "1", borderOpacity: "1.0", borderHoverOpacity: "1.0", borderSelectedOpacity: "1.0"}
    ];

    private static zoomOptions = [true, true, true];

    private self = OptionsComponent;

    public static getAutoZoomOnSearch(): boolean {
        return this.zoomOptions[this.AUTO_ZOOM_ON_SEARCH];
    }

    public static getAutoZoomOnGetChildren(): boolean {
        return this.zoomOptions[this.AUTO_ZOOM_ON_GET_CHILDREN];
    }

    public static getAutoZoomOnSelect(): boolean {
        return this.zoomOptions[this.AUTO_ZOOM_ON_SELECT];
    }

    public static getMapOptions(): MapOptions[] {
        return this.mapOptions;
    }

    toggleOptionsWindow(): void {
        let options = document.getElementById("optionsArea");
        let btn = document.getElementById("optionsButton");
        let span = document.getElementsByClassName("close")[0];

        btn.onclick = function() {
            options.style.display = "block";
        };

        span.onclick = function() {
            options.style.display = "none";
        };

        window.onclick = function(event) {
            if (event.target === options) {
                options.style.display = "none";
            }
        };
    }

    onClose(): void {
        let options = document.getElementById("optionsArea");
        options.style.display = "none";
        console.log("SAVE: " + OptionsComponent.zoomOptions);
    }

    onSave(zoomOnSearch: boolean): void {
    }

}