import { Component, OnInit, AfterViewInit, OnChanges, AfterContentChecked }    from "@angular/core";

import { OrgUnit }  from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

import { OrgUnitUpdate} from "../../core/org-unit-update.interface";

declare var $: any;

@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent implements OrgUnitUpdate {
    private orgUnits: OrgUnit[] = null;
    private collapsList1: string[] = [];
    private collapsList2: string[] = [];

    private sideBarVisible = true;

    constructor(private orgUnitService: OrgUnitService) {}

    onOrgUnitGet(orgUnits: OrgUnit[]): void {
        this.orgUnits = orgUnits;
        console.log("Side bar - received new orgUnits: " + this.orgUnits);
        if (this.orgUnits === undefined || this.orgUnits === null || this.orgUnits.length === 0) {
            this.toggleSideBar(false);
        } else {
            this.toggleSideBar(true);
        }
    }

    ngOnInit(): void {
        this.orgUnitService.registerOrgUnitUpdateListener(this);

        for (let i = 0; i < 1000; i++) {
            this.collapsList1.push("collapse" + i);
            this.collapsList2.push("#collapse" + i);
        }
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