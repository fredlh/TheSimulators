import { Component, AfterViewInit } from "@angular/core";

@Component({
    selector : "app",
    template: require<any>("./app.component.html"),
    styles: [ require<any>("./app.component.less") ]
})

export class AppComponent implements AfterViewInit {

    private advancedViewVisable: boolean = false;

    ngAfterViewInit(): void {
        $("#optionsButton").hide();
        $("#toggleOrgUnitGroupsButton").hide();
        $("#toggleOrgUnitLevelsButton").hide();
    }

    toggleAdvancedView(): void {
        $("#optionsButton").toggle();
        $("#toggleOrgUnitGroupsButton").toggle();
        $("#toggleOrgUnitLevelsButton").toggle();
        this.advancedViewVisable = !this.advancedViewVisable;
    }

}
