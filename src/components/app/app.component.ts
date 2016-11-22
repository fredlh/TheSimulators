import { Component, AfterViewInit } from "@angular/core";

/*
 * The App component is the main entrance point of the application
 * 
 * It contains all the components used in the application
 * 
 * It is also used for the "show/hide adanced view" button,
 * which toggles options, orgUnitLevels and orgUnitGroups.
 * 
 * Is done to minimize the amount of buttons the regular users wants,
 * while still being able to display them for advanced users
 */

const favicon = require("../../../images/favicon.png");

@Component({
    selector : "app",
    template: require<any>("./app.component.html"),
    styles: [ require<any>("./app.component.less") ]
})

export class AppComponent implements AfterViewInit {

    private advancedViewVisable: boolean = false;

    // After the view has been initialized, it hides the buttons
    ngAfterViewInit(): void {
        $("#optionsButton").hide();
        $("#toggleOrgUnitGroupsButton").hide();
        $("#toggleOrgUnitLevelsButton").hide();
    }

    // Toggles the 3 advanced buttons
    toggleAdvancedView(): void {
        $("#optionsButton").toggle();
        $("#toggleOrgUnitGroupsButton").toggle();
        $("#toggleOrgUnitLevelsButton").toggle();
        this.advancedViewVisable = !this.advancedViewVisable;
    }

}
