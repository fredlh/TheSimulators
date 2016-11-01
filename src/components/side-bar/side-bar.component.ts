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

export class SideBarComponent implements SideBarInterface, OnInit {
    private orgUnits: OrgUnit[] = null;
    private sideBarVisible = false;

    private selectedOrgUnit: OrgUnit = new OrgUnit();

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
        console.log("EDIT ID: " + orgUnitId);
        this.showEditOrgUnitPanel();
        this.closeSideBar();
        
        this.selectedOrgUnit = this.getOrgUnitById(orgUnitId);

        $(".edit-org-unit-close").click(this.onCancel);

        let tmpThis = this;
        window.onclick = function(event) {
            let options = document.getElementById("editOrgUnitArea");
            if (event.target === options) {
                options.style.display = "none";
                $("#sideBar").show();
                $("#toggleSideBar").show();
            }
        };
    }

    deleteOrgUnit(orgUnitId: string) {
        console.log("Delete: " + orgUnitId);
    }

    closeSideBar(): void {
        $("#sideBar").hide();
        $("#toggleSideBar").hide();
    }

    showSideBar(): void {
        $("#sideBar").show();
        $("#toggleSideBar").show();
    }

    onSubmit(): void {
        document.getElementById("editOrgUnitArea").style.display = "none";
        this.showSideBar();
    }

    onCancel(): void {
        document.getElementById("editOrgUnitArea").style.display = "none";
        $("#sideBar").show();
        $("#toggleSideBar").show();
    }

    closeEditOrgUnitPanel(): void {
        document.getElementById("editOrgUnitArea").style.display = "none";
    }

    showEditOrgUnitPanel(): void {
        document.getElementById("editOrgUnitArea").style.display = "block";
    }

    drawOrgUnitPolygon(): void {
        this.closeSideBar();
        this.closeEditOrgUnitPanel();

        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.orgUnitService.startEditMode(this.selectedOrgUnit.id);
    }


    drawOrgUnitMarker(): void {

    }

    saveDrawnOrgUnit(): void {
        this.selectedOrgUnit.coordinates = this.orgUnitService.endEditMode(true);
        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.editOrgUnit(this.selectedOrgUnit.id);
    }

    cancelDrawnOrgUnit(): void {
        this.orgUnitService.endEditMode(false);
        $("#editOrgUnitPanelArea").slideToggle("fast");

        this.editOrgUnit(this.selectedOrgUnit.id);
    }



    getOrgUnitById(orgUnitId: string): OrgUnit {
        for (let o of this.orgUnits) {
            if (o.id === orgUnitId) return o;
        }
        return null;
    }
}
