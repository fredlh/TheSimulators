import { Component } from "@angular/core";

declare var $: any;

interface MapOptions {
    color: string;
    hoverColor: string;
    borderColor: string;
    borderHoverColor: string;
    borderWeight: string;
    borderHoverWeight: string;
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

    private static mapOptions: MapOptions[] = [
        {color: "red", hoverColor: "blue", borderColor: "green", borderHoverColor: "black", borderWeight: "1", borderHoverWeight: "2"},
        {color: "red", hoverColor: "blue", borderColor: "green", borderHoverColor: "black", borderWeight: "1", borderHoverWeight: "2"},
        {color: "red", hoverColor: "blue", borderColor: "green", borderHoverColor: "black", borderWeight: "1", borderHoverWeight: "2"},
        {color: "red", hoverColor: "blue", borderColor: "green", borderHoverColor: "black", borderWeight: "1", borderHoverWeight: "2"}
    ];

    private static zoomOptions = [true, true];

    private self = OptionsComponent;

    public static getAutoZoomOnSearch(): boolean {
        return this.zoomOptions[this.AUTO_ZOOM_ON_SEARCH];
    }

    public static getAutoZoomOnGetChildren(): boolean {
        return this.zoomOptions[this.AUTO_ZOOM_ON_GET_CHILDREN];
    }

    public static getMapOptions(level?: number): MapOptions | MapOptions[] {
        if (level >= 0 && level <= 4) {
            return this.mapOptions[level];
        } else {
            return this.mapOptions;
        }
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