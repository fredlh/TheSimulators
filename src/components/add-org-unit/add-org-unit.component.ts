import { Component }                                    from "@angular/core";

import { OrgUnitService }                               from "../../services/org-unit.service";
import { SideBarService }                               from "../../services/side-bar.service";
import { MapService }                                   from "../../services/map.service";

import { OrgUnit }                                      from "../../core/org-unit.class";

import { Globals, FeatureType, OrganisationUnitLevel }  from "../../globals/globals.class";

/*
 * The Add Org Unit component is a panel where the user can add new orgUnits
 * 
 * It contains the following features:
 * - Can choose the name of the orgUnit
 * - Can draw a polygon or place a marker
 * - Can specify the ID of its parent
 * 
 * If you add an orgUnit as a child of a parent with the highest orgUnitLevel known,
 * you will be prompted to add an orgUnitLevel first
 * 
 * When it is added, you can add the orgUnit
 * 
 * When drawing a polygon or placing a marker, leaflet-draw is used
 * This makes it possible to draw units, edit them and delete them in a user friendly way
 */


// Used for jQuery
declare var $: any;

@Component({
    selector: "add-org-unit",
    template: require<any>("./add-org-unit.component.html"),
    styles: [ require<any>("./add-org-unit.component.less") ]
})

export class AddOrgUnitComponent {

    // The orgUnit which is being added
    private orgUnit: OrgUnit = new OrgUnit();

    // The orgUnitLevel of the parent
    private orgUnitLevel: OrganisationUnitLevel = new OrganisationUnitLevel();

    // Various booleans to check forr what is needed
    private haveSubmitted = false;
    private saveSuccess = null;
    private newOrgUnitLevelNeeded = false;

    // ID of the orgUnitLevel if a new one had to be added
    private savedOrgUnitLevelId: string = "";

    // Status and error messages
    private errorMessage: string = "";
    private saveOrgUnitLevelSuccess = null;
    private orgUnitLevelErrormessage: string = "";

    constructor(private orgUnitService: OrgUnitService,
                private mapService: MapService,
                private sideBarService: SideBarService) {
        this.orgUnit.featureType = FeatureType.NONE;
    }

    // Called when the add org unit panel is opened
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
    }

    hideAddOrgUnitPanel(): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
    }

    // Closes the add org unit panel
    // If an orgUnitLevel was added, but the orgUnit was discarded, the orgUnitLevel is deleted
    onCancel(tmpThis = this): void {
        tmpThis.hideAddOrgUnitPanel();
        this.mapService.endEditMode();

        // If the orgUnit wasn't saved, but there is a saved orgUnitLevel, delete the orgUnitLevel
        // The user canceled the panel, so it is no longer needed
        if (!this.saveSuccess && this.savedOrgUnitLevelId !== "") {
            this.orgUnitService.deleteOrganisationUnitLevel(this.savedOrgUnitLevelId).subscribe(
                res => {
                },
                error => {
                    console.error(error);
                }
            );
        }
    }

    // Saves an orgUnit
    // async function due to the use of await when rgetting the parent
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
            let org = undefined;
            await tmpThis.orgUnitService.getOrgUnitAsPromise(tmpThis.orgUnit.parent.id)
                            .then(orgUnit => org = orgUnit)
                            .catch((error: any) => (console.log(error)));
            return org;
        }
        let parentOrgUnit: OrgUnit = await getOrgUnitParent();

        // Display error and return if the parent wasn't found
        if (!parentOrgUnit) {
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

        // Return if the orgUnitLevel was needed
        if (this.newOrgUnitLevelNeeded && !this.saveOrgUnitLevelSuccess) return;

        // Save the org unit
        this.orgUnitService.saveOrganisationUnit(this.orgUnit).subscribe(
            res => {
                $("#orgUnitCancelButton").prop("value", "Close");
                $("#submitOrgUnitButton").addClass("disabled");
                tmpThis.saveSuccess = true;
                tmpThis.haveSubmitted = true;
                tmpThis.newOrgUnitLevelNeeded = false;
            },
            error => {
                tmpThis.saveSuccess = false;

                // Check if it was a known error
                if (error.status === 409 && error._body.includes("parent")) {
                    tmpThis.errorMessage = "Invalid parent ID. Please enter a new one and try again.";
                } else {
                    tmpThis.errorMessage = "Something went wrong, pleas try again.";
                }
            }
        );
    }


    // Called when adding a orgUnitLevel
    addOrgUnitLevelSubmit(): void {
        // Set the required fields
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

    // Enters the draw polygon mode
    // Hides all shown panels, shows the edit panel and notifies the map service
    drawOrgUnitPolygon(): void {
        this.sideBarService.hideSideBar();
        this.hideAddOrgUnitPanel();
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.mapService.startEdit("", true);
    }

    // Enets the place marker mode
    // Hides all shown panels, shows the edit panel and notifies the map service
    drawOrgUnitMarker(): void {
        this.sideBarService.hideSideBar();
        this.hideAddOrgUnitPanel();
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.mapService.startEdit("", false);
    }

    // Called when the user saves the drawn orgUnit
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

    // The user cancels and discards the drawn orgUnit
    cancelDrawnOrgUnit(): void {
        this.sideBarService.unHideSideBar();
        this.mapService.endEdit(false);

        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.showAddOrgUnitPanel();
    }

    // Returns whether the orgUnit can be drawn as a marker
    canDrawOrgUnitPolygon(): boolean {
        return this.orgUnit.featureType === FeatureType.POLYGON ||
               this.orgUnit.featureType === FeatureType.MULTI_POLYGON ||
               this.orgUnit.featureType === FeatureType.NONE;
    }

    // Returns whether the orgUnit can be drawn as a polygon
    canDrawOrgUnitMarker(): boolean {
        return this.orgUnit.featureType === FeatureType.POINT ||
               this.orgUnit.featureType === FeatureType.NONE;
    }

    // Returns whether the orgUnit contains any coordinates to be cleared
    canClearCoordinates(): boolean {
        return this.orgUnit.featureType !== FeatureType.NONE;
    }

    // Clears the coordinates and sets the feature type to NONE
    clearCoordinates(): void {
        this.orgUnit.coordinates = "";
        this.orgUnit.featureType = FeatureType.NONE;
        this.mapService.clearMapEditData();
    }
}