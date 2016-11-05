import { Component } from "@angular/core";

import {OrgUnit} from "../../core/org-unit";

import {OrgUnitService} from "../../services/org-unit.service";

import {FeatureType} from "../../globals/globals";

declare var $: any;

@Component({
    selector: "add-org-unit",
    template: require<any>("./add-org-unit.component.html"),
    styles: [ require<any>("./add-org-unit.component.less") ]
})

export class AddOrgUnitComponent {

    private orgUnit: OrgUnit = new OrgUnit();
    private self = this;

    constructor(private orgUnitService: OrgUnitService) {
        this.orgUnit.featureType = FeatureType.NONE;
    }

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
        // Display warning if no coordinates are entered
        if (this.orgUnit.featureType === FeatureType.NONE) {
            if (!confirm("The are no coordinates entered. Sure you want to save?")) return;
        }

        // Hide the panel and enter edit mode
        this.hideAddOrgUnitPanel();
        this.orgUnitService.endAddOrEditOrgUnit();

        // Save the required info in the org unit
        this.orgUnit.openingDate = new Date();
        this.orgUnit.displayName = this.orgUnit.name;
        this.orgUnit.shortName = this.orgUnit.name;
       
        // Save the org unit
        this.orgUnitService.saveOrganisationUnit(this.orgUnit).subscribe(res => {
            // TODO: Possible to if an error occured here?
            //       If yes, then dont close the panel, just show error to user and let them retry
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
        // Retrieve the drawn coordinates from the map
        this.orgUnit.coordinates = JSON.stringify(this.orgUnitService.endEditMode(true));

        // Check which feature type it is
        if (this.orgUnit.coordinates.lastIndexOf("[[[") > 4) {
            this.orgUnit.featureType = FeatureType.MULTI_POLYGON;
        
        } else if (this.orgUnit.coordinates.indexOf("[[[[") >= 0) {
            this.orgUnit.featureType = FeatureType.POLYGON;
        
        } else if (this.orgUnit.coordinates.indexOf("[[[[") === -1 && this.orgUnit.coordinates !== "[]") {
            this.orgUnit.featureType = FeatureType.POINT;
            
        } else {
            this.orgUnit.featureType = FeatureType.NONE;
            this.orgUnit.coordinates = "";
        }

        // Hide the draw area and show the add org unit panel again
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.showAddOrgUnitPanel();
    }

    cancelDrawnOrgUnit(): void {
        this.orgUnitService.endEditMode(false);

        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.showAddOrgUnitPanel();
    }

    canDrawOrgUnitPolygon(): boolean {
        return this.orgUnit.featureType === FeatureType.POLYGON ||
               this.orgUnit.featureType === FeatureType.MULTI_POLYGON ||  
               this.orgUnit.featureType === FeatureType.NONE;
    }

    canDrawOrgUnitMarker(): boolean {
        return this.orgUnit.featureType === FeatureType.POINT || 
               this.orgUnit.featureType === FeatureType.NONE;
    }

    canClearCoordinates(): boolean {
        return this.orgUnit.featureType !== FeatureType.NONE;
    }

    clearCoordinates(): void {
        this.orgUnit.coordinates = "";
        this.orgUnit.featureType = FeatureType.NONE;
        this.orgUnitService.clearMapEditData();
    }
}