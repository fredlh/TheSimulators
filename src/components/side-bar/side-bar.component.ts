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

    scrollToOrgUnit(orgUnitId: string) {
        /*
        let innerDiv = "#" + orgUnitId + " h4";
        let parentDiv = "#sideBar";

        setTimeout(function() {
            console.log($(innerDiv).position());
            $(parentDiv).scrollTop(0);
            console.log("PARENT: " + parentDiv + " | INNER: " + innerDiv)
        }, 2000);
        */
        $("#sideBar").scrollTop(0);
        console.log("OFFSET: " + $("#" + orgUnitId + " h4").offset().top);
        setTimeout(function() {
            $("#sideBar").animate({
                scrollTop: $("#" + orgUnitId + " h4").offset().top - 170
            }, 50);
        }, 200)
        
            
       
    }

    sideBarClicked(orgUnitId: string) {
        /*
        if (!(this.hideSidebarClick)) {
            this.orgUnitService.callOnSideBarClick(orgUnitId);
        }

        this.hideSidebarClick = false;
        */
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
        //console.log("Zoom to: " + orgUnitId);
        this.orgUnitService.getOrgUnitAndChildren(orgUnitId);
    }

    goToPreviousOrgUnits(): void {
        this.orgUnitService.returnToLastStackFrame();
    }

    editOrgUnit(orgUnitId: string) {
        console.log("Edit: " + orgUnitId);
    }

    deleteOrgUnit(orgUnitId: string) {
        console.log("Delete: " + orgUnitId);
    }

}