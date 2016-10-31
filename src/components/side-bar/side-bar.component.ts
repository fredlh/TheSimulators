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
    private sideBarVisible = false;

    constructor(private orgUnitService: OrgUnitService) {}

    updateList(orgUnits: OrgUnit[]): void {
        if (orgUnits.length === 0) {
            this.orgUnits = null;
        } else {
            this.orgUnits = orgUnits;
        }

        this.toggleSideBar(true);
        $("#toggleSideBar").show();
    }

    scrollToOrgUnit(orgUnitId: string) {
        setTimeout(function() {
            $("#sideBar").animate({
                scrollTop: $("#" + orgUnitId).position().top + $("#sideBar").scrollTop() - 40
            }, 500);
        }, 100);
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

    getChildren(orgUnitId: string) {
        this.orgUnitService.getOrgUnitAndChildren(orgUnitId);
    }

    goToPreviousOrgUnits(): void {
        this.orgUnitService.returnToLastStackFrame();
    }

    hasPreviousStackFrame(): boolean {
        return this.orgUnitService.hasPreviousStackFrame();
    }

    editOrgUnit(orgUnitId: string) {
        console.log("Edit: " + orgUnitId);
    }

    deleteOrgUnit(orgUnitId: string) {
        console.log("Delete: " + orgUnitId);
    }

    // Test functions
    callAddNewPolygon(): void {
        this.orgUnitService.callAddNewPolygon();
    }

    callFinishedAddNewPolygon(): void {
        this.orgUnitService.callFinishedAddNewPolygon();
    }
}
