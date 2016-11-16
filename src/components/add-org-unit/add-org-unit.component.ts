import { Component }                                    from "@angular/core";

import { OrgUnitService }                               from "../../services/org-unit.service";
import { SideBarService }                               from "../../services/side-bar.service";
import { MapService }                                   from "../../services/map.service";

import {OrgUnit}                                        from "../../core/org-unit.class";

import {Globals, FeatureType, OrganisationUnitLevel}    from "../../globals/globals.class";


declare var $: any;

@Component({
    selector: "add-org-unit",
    template: require<any>("./add-org-unit.component.html"),
    styles: [ require<any>("./add-org-unit.component.less") ]
})

export class AddOrgUnitComponent {

    private orgUnit: OrgUnit = new OrgUnit();
    private orgUnitLevel: OrganisationUnitLevel = new OrganisationUnitLevel();

    private self = this;
    private haveSubmitted = false;
    private saveSuccess = null;
    private newOrgUnitLevelNeeded = false;

    private savedOrgUnitId: string = "";
    private savedOrgUnitLevelId: string = "";

    private errorMessage: string = "";

    private saveOrgUnitLevelSuccess = null;
    private orgUnitLevelErrormessage: string = "";

    constructor(private orgUnitService: OrgUnitService,
                private mapService: MapService,
                private sideBarService: SideBarService) {
        this.orgUnit.featureType = FeatureType.NONE;
    }

    openAddOrgUnitForm(): void {
        this.orgUnitService.refreshOrganisationUnitLevels();
        this.showAddOrgUnitPanel();

        // Reset the form
        this.orgUnit = new OrgUnit();
        this.orgUnitLevel = new OrganisationUnitLevel();
        this.orgUnit.featureType = FeatureType.NONE;
        this.haveSubmitted = false;
        this.saveSuccess = null;
        this.newOrgUnitLevelNeeded = false;
        this.saveOrgUnitLevelSuccess = null;
        this.savedOrgUnitId = "";
        this.savedOrgUnitLevelId = "";
        $("#submitOrgUnitLevelButton").removeClass("disabled");
        $("#submitOrgUnitButton").removeClass("disabled");
        $("#orgUnitCancelButton").prop("value", "Cancel");

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
        //this.sideBarService.hideSideBar();
    }

    hideAddOrgUnitPanel(unHideSideBar = true): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
        if (unHideSideBar) {
            //this.sideBarService.unHideSideBar();
        }
    }

    onCancel(tmpThis = this): void {
        tmpThis.hideAddOrgUnitPanel();
        this.mapService.endEditMode();

        if (this.newOrgUnitLevelNeeded && this.savedOrgUnitLevelId !== "") {
            this.orgUnitService.deleteOrganisationUnitLevel(this.savedOrgUnitLevelId).subscribe(
                res => {
                    console.log("Deleted org unit level that the user added but canceled");
                },
                error => {
                    console.log("Failed to delete org unit level on cancel");
                }
            );
        }
    }

    async onSubmit() {
        // Ignore if user alreayd have submitted successfully
        if (this.haveSubmitted) return;

        // Save the required info in the org unit
        this.orgUnit.openingDate = new Date();
        this.orgUnit.displayName = this.orgUnit.name;
        this.orgUnit.shortName = this.orgUnit.name;
        let tmpThis = this;

        // Get the parent
        async function getOrgUnitParent() {
            let org = await tmpThis.orgUnitService.getOrgUnitAsPromise(tmpThis.orgUnit.parent.id);
            return org;
        }
        let parentOrgUnit: OrgUnit = await getOrgUnitParent();

        // Display error and return if the parent wasn't found
        if (parentOrgUnit === undefined) {
            this.saveSuccess = false;
            tmpThis.errorMessage = "Invalid parent ID. Please enter a new one and try again.";
            return;
        }

        // Check if a new org unit level is needed
        if (parentOrgUnit.level >= Globals.getMaxLevel()) {
            this.newOrgUnitLevelNeeded = true;
            this.orgUnitLevel.level = parentOrgUnit.level + 1;
            this.haveSubmitted = true;
            $("#submitOrgUnitButton").addClass("disabled");
        }

        // Return if the parent was needed
        if (this.newOrgUnitLevelNeeded && !this.saveOrgUnitLevelSuccess) return;

        // Save the org unit
        this.orgUnitService.saveOrganisationUnit(this.orgUnit).subscribe(
            res => {
                $("#orgUnitCancelButton").prop("value", "Close");
                $("#submitOrgUnitButton").addClass("disabled");
                tmpThis.saveSuccess = true;
                tmpThis.haveSubmitted = true;
                tmpThis.newOrgUnitLevelNeeded = false;
                tmpThis.savedOrgUnitId = res.response.uid;
            },
            error => {
                tmpThis.saveSuccess = false;

                if (error.status === 409 && error._body.includes("parent")) {
                    tmpThis.errorMessage = "Invalid parent ID. Please enter a new one and try again.";
                } else {
                    tmpThis.errorMessage = "Something went wrong, pleas try again.";
                }
            }
        );
    }


    addOrgUnitLevelSubmit(): void {
        this.orgUnitLevel.created = new Date();
        this.orgUnitLevel.displayName = this.orgUnitLevel.name;

        let tmpThis = this;
        this.orgUnitService.saveOrganisationUnitLevel(this.orgUnitLevel).subscribe(
            res => {
                tmpThis.orgUnitService.refreshOrganisationUnitLevels();
                tmpThis.haveSubmitted = false;
                tmpThis.saveOrgUnitLevelSuccess = true;
                tmpThis.newOrgUnitLevelNeeded = false;
                tmpThis.savedOrgUnitLevelId = res.response.uid;
                $("#submitOrgUnitButton").removeClass("disabled");
                $("#submitOrgUnitLevelButton").addClass("disabled");
            },
            error => {
                tmpThis.orgUnitLevelErrormessage = "Failed to save the org unit level";
                tmpThis.saveOrgUnitLevelSuccess = false;
                tmpThis.newOrgUnitLevelNeeded = true;
            }
        );
    }

    drawOrgUnitPolygon(): void {
        this.sideBarService.hideSideBar();
        this.hideAddOrgUnitPanel(false);
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.mapService.startEdit("", true);
    }

    drawOrgUnitMarker(): void {
        this.sideBarService.hideSideBar();        
        this.hideAddOrgUnitPanel(false);
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.mapService.startEdit("", false);
    }

    saveDrawnOrgUnit(): void {
        this.sideBarService.unHideSideBar();

        // Retrieve the drawn coordinates from the map
        this.orgUnit.coordinates = JSON.stringify(this.mapService.endEdit(true));

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
        this.sideBarService.unHideSideBar();
        this.mapService.endEdit(false);

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
        this.mapService.clearMapEditData();
    }

    gotoOrgUnit(): void {
        this.hideAddOrgUnitPanel();
        this.orgUnitService.gotoOrgUnit(this.orgUnit.parent.id, this.savedOrgUnitId);
    }

    gotoParent(): void {
        this.hideAddOrgUnitPanel();
        this.orgUnitService.gotoParent(this.orgUnit.parent.id);
    }
}