import { Component } from "@angular/core";

import {OrgUnit} from "../../core/org-unit";

import {OrgUnitService} from "../../services/org-unit.service";

declare var $: any;

@Component({
    selector: "add-org-unit",
    template: require<any>("./add-org-unit.component.html"),
    styles: [ require<any>("./add-org-unit.component.less") ]
})

export class AddOrgUnitComponent {

    private orgUnit: OrgUnit = new OrgUnit();
    private self = this;

    constructor(private orgUnitService: OrgUnitService) {}

    openAddOrgUnitForm(): void {
        this.showAddOrgUnitPanel();

        let tmpThis = this;

        $(".add-org-unit-close").click(function() {
            document.getElementById("addOrgUnitArea").style.display = "none";
            this.orgUnit = new OrgUnit();
            tmpThis.orgUnitService.endAddOrEditOrgUnit();
            tmpThis.orgUnitService.unHideSideBar();
        });

        window.onclick = function(event) {
            let options = document.getElementById("addOrgUnitArea");
            if (event.target === options) {
                options.style.display = "none";
                tmpThis.orgUnit = new OrgUnit();
                tmpThis.orgUnitService.endAddOrEditOrgUnit();
                tmpThis.orgUnitService.unHideSideBar();
            }
        };
    }

    showAddOrgUnitPanel(): void {
        document.getElementById("addOrgUnitArea").style.display = "block";
        this.orgUnitService.hideSideBar();
    }

    hideAddOrgUnitPanel(unHideSideBar = true): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
        if (unHideSideBar) {
            this.orgUnitService.unHideSideBar();
        }
    }

    onCancel(tmpThis = this): void {
        tmpThis.hideAddOrgUnitPanel();
        this.orgUnit = new OrgUnit();
        this.orgUnitService.endAddOrEditOrgUnit();
    }


    onSubmit(): void {
        this.hideAddOrgUnitPanel();
        this.orgUnitService.endAddOrEditOrgUnit();
        
    }

    drawOrgUnitPolygon(): void {
        this.hideAddOrgUnitPanel(false);
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        if (!this.orgUnitService.startEditMode("", true)) {
            $("#drawOrgUnitPanelArea").slideToggle("fast");
            this.showAddOrgUnitPanel();
        }
    }

    drawOrgUnitMarker(): void {
        this.hideAddOrgUnitPanel(false);
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        if (!this.orgUnitService.startEditMode("", false)) {
            $("#drawOrgUnitPanelArea").slideToggle("fast");
            this.showAddOrgUnitPanel();
        }
    }

    saveDrawnOrgUnit(): void {
        this.orgUnit.coordinates = this.orgUnitService.endEditMode(true);
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.showAddOrgUnitPanel();
    }

    cancelDrawnOrgUnit(): void {
        this.orgUnitService.endEditMode(false);

        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.showAddOrgUnitPanel();
    }
}