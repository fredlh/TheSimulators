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
    private sideBarVisible = true;

    constructor(private orgUnitService: OrgUnitService) {}

    updateList(orgUnits: OrgUnit[]): void {
        this.orgUnits = orgUnits;

        console.log("Side bar - received new orgUnits");
        if (this.orgUnits === undefined || this.orgUnits === null || this.orgUnits.length === 0) {
            this.toggleSideBar(false);
        } else {
            this.toggleSideBar(true);
        }
    }

    scrollToOrgUnit(orgUnitId: string) {
        $("#sideBar").scrollTop(0);
        setTimeout(function() {
            $("#sideBar").animate({
                scrollTop: $("#" + orgUnitId + " h4").offset().top - 170
            }, 50);
        }, 200)   
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

}