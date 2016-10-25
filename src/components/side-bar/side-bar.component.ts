import { Component, OnInit, AfterViewInit, OnChanges, AfterContentChecked }    from "@angular/core";

import { OrgUnit }  from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

import { SideBarInterface } from "../../core/side-bar.interface";

import { AccordionModule } from "ng2-accordion";


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
    private hideSidebarClick = false;

    constructor(private orgUnitService: OrgUnitService) {}

    updateList(orgUnits: OrgUnit[]): void {
        this.collapsList1 = [];
        this.collapsList2 = [];
        for (let i = 0; i < orgUnits.length; i++) {
            this.collapsList1.push("collapse" + i);
            this.collapsList2.push("#collapse" + i);
        }

        this.orgUnits = orgUnits;

        console.log("Side bar - received new orgUnits");
        if (this.orgUnits === undefined || this.orgUnits === null || this.orgUnits.length === 0) {
            this.toggleSideBar(false);
        } else {
            this.toggleSideBar(true);
        }
    }

    expandAndScrollToOrgUnit(orgUnitId: string) {
        console.log("i should scholl");
        let innerDiv = "#" + orgUnitId + " a";
        let parentDiv = "#sideBar";

        this.hideSidebarClick = true;

        $(innerDiv)[0].click();
        setTimeout(function() {
            $(parentDiv).scrollTop($(parentDiv).scrollTop() + $(innerDiv).position().top - 50);
        }, 50);
    }

    sideBarClicked(orgUnitId: string) {
        console.log("tesewewe");

        if (!(this.hideSidebarClick)) {
            this.orgUnitService.callOnSideBarClick(orgUnitId);
        }

        this.hideSidebarClick = false;
    }


    ngOnInit(): void {
        this.orgUnitService.registerSideBar(this);
    }

    toggleSideBar(show?: Boolean): void {
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
    }

    zoomToChildren(orgUnitId: string) {
        console.log("Zoom to: " + orgUnitId);
        this.orgUnitService.getOrgUnitAndChildren(orgUnitId);
    }

    editOrgUnit(orgUnitId: string) {
        console.log("Edit: " + orgUnitId);
    }

    deleteOrgUnit(orgUnitId: string) {
        console.log("Delete: " + orgUnitId);
    }

}