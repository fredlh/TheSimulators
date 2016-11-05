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
            tmpThis.onCancel(tmpThis);
        });

        window.onclick = function(event) {
            if (event.target === document.getElementById("addOrgUnitArea")) {
                tmpThis.onCancel(tmpThis);
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
        this.orgUnit.openingDate = new Date();
        this.orgUnit.displayName = this.orgUnit.name;
        this.orgUnit.shortName = this.orgUnit.name;
        //this.orgUnitService.saveOrganisationUnit(this.orgUnit);

        this.orgUnitService.saveOrganisationUnit(this.orgUnit).subscribe(res => {
            let tmp = res.organisationUnit;
            console.log(tmp);
        });
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
        this.orgUnit.coordinates = JSON.stringify(this.orgUnitService.endEditMode(true));
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.showAddOrgUnitPanel();
    }

    cancelDrawnOrgUnit(): void {
        this.orgUnitService.endEditMode(false);

        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.showAddOrgUnitPanel();
    }
}