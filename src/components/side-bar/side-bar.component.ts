import { Component, OnInit, AfterViewInit, OnChanges, AfterContentChecked }    from "@angular/core";

import { OrgUnit }  from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

import { SideBarInterface } from "../../core/side-bar.interface";

declare var $: any;

@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent implements SideBarInterface {
    private orgUnits: OrgUnit[] = null;
    private collapsList1: string[] = [];
    private collapsList2: string[] = [];

    private sideBarVisible = true;

    constructor(private orgUnitService: OrgUnitService) {}

    onSearch(orgUnits: OrgUnit[]): void {
        this.collapsList1 = [];
        this.collapsList2 = [];
        for (let i = 0; i < orgUnits.length; i++) {
            this.collapsList1.push("collapse" + i);
            this.collapsList2.push("#collapse" + i);
        }

        this.orgUnits = orgUnits;

        console.log("Side bar - received new orgUnits: " + this.orgUnits);
        if (this.orgUnits === undefined || this.orgUnits === null || this.orgUnits.length === 0) {
            this.toggleSideBar(false);
        } else {
            this.toggleSideBar(true);
        }
    }

    onMapClick(orgUnitId: string) {
        // TODO: User has clicked on an orgUnit at the map
        // - scroll to the clicked on in the sidebar
        // - "click" on it (expand it)
        let innerDiv = "#" + orgUnitId + " a";
        let parentDiv = "#sideBar";
        $(innerDiv)[0].click();
        $(parentDiv).scrollTop($(parentDiv).scrollTop() + $(innerDiv).position().top - 50);
    }

    sideBarClicked(orgUnitId: string) {
        this.orgUnitService.callOnSideBarClick(orgUnitId);
    }


    ngOnInit(): void {
        this.orgUnitService.registerSideBar(this);
    }

    toggleSideBar(show?: Boolean): void {
        console.log("\nBefore:");
        console.log("show = " + show);
        console.log("sideBarVisible = " + this.sideBarVisible);

        if (show === undefined) {
            $("#sideBar").toggle("show");
            this.sideBarVisible = !this.sideBarVisible;
        }

        if (show === true && this.sideBarVisible !== true) {
            $("#sideBar").toggle("show");
            this.sideBarVisible = !this.sideBarVisible;

        } else if (show === false && this.sideBarVisible !== false) {
            $("#sideBar").toggle("show");
            this.sideBarVisible = !this.sideBarVisible;
        }

        console.log("\nAfter:");
        console.log("show = " + show);
        console.log("sideBarVisible = " + this.sideBarVisible);
    }

}