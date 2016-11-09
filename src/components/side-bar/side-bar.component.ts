import { Component, OnInit }        from "@angular/core";

import { OrgUnitService }           from "../../services/org-unit.service";
import { MapService }               from "../../services/map.service";
import { SideBarService}            from "../../services/side-bar.service";

import { SideBarInterface }         from "../../core/side-bar.interface";
import { GlobalsUpdateInterface}    from "../../core/globals-update.interface";

import { OrgUnit }                  from "../../core/org-unit";

import { Globals, FeatureType }     from "../../globals/globals";


declare var $: any;

@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent implements GlobalsUpdateInterface, OnInit {
    private orgUnits: OrgUnit[] = null;
    private displayedOrgUnits = null;
    private globals = Globals;
    private featurType = FeatureType;

    private toggleSideBarButtonVisible: boolean = false;
    private sideBarVisible: boolean = false;
    private filterAreaVisible: boolean = false;

    private filterApplied: boolean = false;

    private orgUnitLevels = [];

    private selectedOrgUnit: OrgUnit = new OrgUnit();

    private haveSubmitted = false;
    private saveSuccess = null;

    constructor(private orgUnitService: OrgUnitService,
                private mapService: MapService,
                private sideBarService: SideBarService) {}

    onOrganisationUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
    }

    ngOnInit(): void {
        this.orgUnitService.registerSideBar(this);
        this.orgUnitService.registerGlobalsUpdateListener(this);
        this.mapService.registerSideBar(this);
        this.sideBarService.registerSideBar(this);
    }

    //
    // SideBar
    //

    // Updates the list with a new orgUnit array
    // Called when the search or map has received new org units
    updateList(orgUnits: OrgUnit[]): void {
        this.displayedOrgUnits = [];

        if (orgUnits.length === 0) {
            this.orgUnits = null;
        } else {
            this.orgUnits = orgUnits;
            for (let o of this.orgUnits) {
                this.displayedOrgUnits.push(JSON.parse(JSON.stringify(o)));
            }
        }

        this.showSideBar();
        this.clearFilter(true, false);
    }

    // Scrolls to a given orgUnit in the list by id
    // Called when the user has clicked on an orgUnit on the map
    scrollToOrgUnit(orgUnitId: string) {
        setTimeout(function() {
            $("#orgUnitArea").animate({
                scrollTop: $("#" + orgUnitId).position().top + $("#orgUnitArea").scrollTop() - 40
            }, 500);
        }, 100);
    }

    // Toggles the side bar, called when clicking
    // the toggle side bar button
    toggleSideBar(): void {
        $("#sideBar").toggle();
        this.sideBarVisible = !this.sideBarVisible;

        if (this.sideBarVisible && this.filterAreaVisible) {
            $("#filterArea").show();
        } else {
            $("#filterArea").hide();
        }
    }

    // Hides the side bar
    // Called when a form/pane should have focus
    hideSideBar(): void {
        $("#sideBar").hide();
        $("#filterArea").hide();
        $("#toggleSideBar").hide();
    }

    // Reopens the side bar
    // Called when the focused form/pane has been closed
    unHideSideBar(): void {
        if (this.sideBarVisible) {
            $("#sideBar").show();
        }

        if (this.filterAreaVisible) {
            $("#filterArea").show();
        }

        if (this.toggleSideBarButtonVisible) {
            $("#toggleSideBar").show();
        }
    }

    // Opens the side bar, no matter if it was closed or not
    // Called on search result
    showSideBar(): void {
        this.toggleSideBarButtonVisible = true;
        this.sideBarVisible = true;
        $("#sideBar").show();
        $("#toggleSideBar").show();
    }


    //
    // General functions
    //

    // Tells the orgUnitService that it should retrive the children of the given orgUnit
    // Called when the get children button is clicked
    onGetChildrenClicked(orgUnitId: string) {
        let orgUnit = this.getOrgUnitById(orgUnitId);
        if (orgUnit.featureType === FeatureType.POLYGON || orgUnit.featureType === FeatureType.MULTI_POLYGON) {
            this.orgUnitService.getOrgUnitAndChildren(orgUnitId, true, true);
        }
    }

    // A "back button" which displays the previous orgUnits before getChildren was clicked
    goToPreviousOrgUnits(): void {
        this.orgUnitService.returnToLastStackFrame();
    }

    // Returns whether it can show previous orgUnits or not
    hasPreviousStackFrame(): boolean {
        return this.orgUnitService.hasPreviousStackFrame();
    }

    // Returns the orgUnit with the given id, or null if none exists
    getOrgUnitById(orgUnitId: string): OrgUnit {
        for (let o of this.orgUnits) {
            if (o.id === orgUnitId) return o;
        }
        return null;
    }

    canGetChildren(featurType: string): boolean {
        let tmp = featurType !== FeatureType.NONE;
        console.log(tmp);
        return tmp;
    }


    //
    // Edit org unit
    // 

    // Opens the editOrgUnitArea and registers the needed events
    // Gets called when the edit org unit button is clicked
    onEditOrgUnitOpen(orgUnitId = "") {
        this.hideSideBar();
        this.showEditOrgUnitPanel();

        if (orgUnitId !== "") {
            this.selectedOrgUnit = JSON.parse(JSON.stringify(this.getOrgUnitById(orgUnitId)));
        }

        // Clear the form
        this.haveSubmitted = false;
        this.saveSuccess = null;
        $("#editOrgUnitButton").removeClass("disabled");
        $("#cancelOrgUnitButton").prop("value", "Cancel");

        let tmpThis = this;

        $(".edit-org-unit-close").click(function() {
            tmpThis.onEditOrgUnitCancel(tmpThis);
        });

        window.onclick = function(event) {
            if (event.target === document.getElementById("editOrgUnitArea")) {
                tmpThis.onEditOrgUnitCancel(tmpThis);
            }
        };
    }

    // Either the cancel button is clicked or the user clicked outside of the panel
    // Closes the panel and shows the sideBar again
    onEditOrgUnitCancel(tmpThis = this): void {
        this.closeEditOrgUnitPanel();
        tmpThis.unHideSideBar();
        // tmpThis.orgUnitService.endAddOrEditOrgUnit();
        tmpThis.mapService.endEditMode();
    }

    // The user has submited the edited org unit
    // Re-show the sideBar
    // TODO: Send the updated onrgUnit to orgUnitService, and make a http put request
    onEditOrgUnitSubmit(): void {
        // Ignore if user alreayd have submitted successfully
        if (this.haveSubmitted) return;

        // Display warning if there are no coordinates
        if (this.selectedOrgUnit.featureType === FeatureType.NONE) {
            if (!confirm("The are no coordinates entered. Sure you want to save?")) return;
        }

        // Save the required info
        this.selectedOrgUnit.shortName = this.selectedOrgUnit.name;
        this.selectedOrgUnit.displayName = this.selectedOrgUnit.name;

        // Send a put update to the api
        let tmpThis = this;
        this.orgUnitService.updateOrgUnit(this.selectedOrgUnit).subscribe(
            res => {
                $("#cancelOrgUnitButton").prop("value", "Close");
                $("#editOrgUnitButton").addClass("disabled");
                tmpThis.saveSuccess = true;
                tmpThis.haveSubmitted = true;
            },
            error => {
                tmpThis.saveSuccess = false;
            }
        );

    }

    // Closes the edit org unit panel
    closeEditOrgUnitPanel(): void {
        document.getElementById("editOrgUnitArea").style.display = "none";
    }

    // Shows the edit org unit panel
    showEditOrgUnitPanel(): void {
        document.getElementById("editOrgUnitArea").style.display = "block";
    }

    // Open the draw org unit polygon menu and closes the rest
    drawOrgUnitPolygon(): void {
        this.hideSideBar();
        this.closeEditOrgUnitPanel();

        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.mapService.startEdit(this.selectedOrgUnit.id, true);
    }

    // Opens the draw org unit marker menu and closes the rest
    drawOrgUnitMarker(): void {
        this.hideSideBar();
        this.closeEditOrgUnitPanel();

        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.mapService.startEdit(this.selectedOrgUnit.id, false);
    }

    // Saves the drawn org unit
    saveDrawnOrgUnit(): void {
        // Retrieve the drawn coordinates from the map
        this.selectedOrgUnit.coordinates = JSON.stringify(this.mapService.endEdit(true));

        // Check which feature type it is
        if (this.selectedOrgUnit.coordinates.lastIndexOf("[[[") > 4) {
            this.selectedOrgUnit.featureType = FeatureType.MULTI_POLYGON;

        } else if (this.selectedOrgUnit.coordinates.indexOf("[[[[") >= 0) {
            this.selectedOrgUnit.featureType = FeatureType.POLYGON;

        } else if (this.selectedOrgUnit.coordinates.indexOf("[[[[") === -1 && this.selectedOrgUnit.coordinates !== "[]") {
            this.selectedOrgUnit.featureType = FeatureType.POINT;

        } else {
            this.selectedOrgUnit.featureType = FeatureType.NONE;
            this.selectedOrgUnit.coordinates = "";
        }

        // Hide the draw area and show the add org unit panel again
        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.onEditOrgUnitOpen();
    }

    // Discards the drawn org unit
    cancelDrawnOrgUnit(): void {
        this.mapService.endEdit(false);
        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.onEditOrgUnitOpen();
    }

    canDrawOrgUnitPolygon(): boolean {
        return this.selectedOrgUnit.featureType === FeatureType.POLYGON ||
               this.selectedOrgUnit.featureType === FeatureType.MULTI_POLYGON ||
               this.selectedOrgUnit.featureType === FeatureType.NONE;
    }

    canDrawOrgUnitMarker(): boolean {
        return this.selectedOrgUnit.featureType === FeatureType.POINT ||
               this.selectedOrgUnit.featureType === FeatureType.NONE;
    }

    canClearCoordinates(): boolean {
        return this.selectedOrgUnit.featureType !== FeatureType.NONE;
    }

    clearCoordinates(): void {
        this.selectedOrgUnit.coordinates = "";
        this.selectedOrgUnit.featureType = FeatureType.NONE;
        this.mapService.clearMapEditData();
    }


    //
    // Delete org unit
    //

    // Deletes the orgUnit with the given id
    deleteOrgUnit(orgUnitId: string) {
        console.log("Temporarily disabled");
        /*
        this.orgUnitService.deleteOrganisationUnit(orgUnitId).subscribe(
            // All good, just refresh the page so the deleted orgUnit dissapairs
            res => {
                this.refreshOrgUnits();
            },
            // An error occured, display appropiat error message if known else general error message
            error => {
                if (error.status === 404) {
                    console.error("Error: Organisation unit with id '" + orgUnitId + "' has already been deleted");
                } else {
                    console.error("Unknown error during deletion. Please refresh and try again");
                }
                console.log(error);
            }
        );
        */
    }


    //
    // Filters
    //

    // Toggles the filter area
    // Called when clicking the toggle filter button
    toggleFilter(): void {
        $("#filterArea").toggle();
        this.filterAreaVisible = !this.filterAreaVisible;
    }

    // Applies the filter on displayedOrgUnits
    // Called when apply filter button is clicked
    // TODO: Rewrite it, too ugly atm
    applyFilter(name: string, nameFilter: string, level: string): void {
        this.displayedOrgUnits = this.orgUnits.filter(function(orgUnit){
            if (nameFilter === "startsWith" && orgUnit.displayName.startsWith(name)) {
                if (level !== "All") {
                    if (+level === orgUnit.level) return true;
                    else return false;
                } else {
                    return true;
                }
            }

            else if (nameFilter === "endsWith" && orgUnit.displayName.endsWith(name)) {
                if (level !== "All") {
                    if (+level === orgUnit.level) return true;
                    else return false;
                } else {
                    return true;
                }
            }

            else if (nameFilter === "includes" && orgUnit.displayName.includes(name)) {
                if (level !== "All") {
                    if (+level === orgUnit.level) return true;
                    else return false;
                } else {
                    return true;
                }
            }

            else if (nameFilter === "equals" && orgUnit.displayName === name) {
                if (level !== "All") {
                    if (+level === orgUnit.level) return true;
                    else return false;
                } else {
                    return true;
                }
            }
        });

        this.filterApplied = true;
        this.mapService.onFilter(this.displayedOrgUnits);
    }

    // Clears the filter
    // Called on search or clear filter button clicked
    clearFilter(hideFilterArea = false, notifyOrgUnitService = true): void {
        this.displayedOrgUnits = [];

        if (this.orgUnits !== null) {
            for (let o of this.orgUnits) {
                this.displayedOrgUnits.push(JSON.parse(JSON.stringify(o)));
            }
        }

        this.filterApplied = false;

        if (notifyOrgUnitService) {
            this.mapService.onFilter(this.displayedOrgUnits);
        }

        if (hideFilterArea) {
            $("#filterArea").hide();
            this.filterAreaVisible = false;
        }

        $("#filterArea").find("form")[0].reset();
    }


    //
    // Refresh org units
    //

    // Refreshes the organisation units
    refreshOrgUnits(closeEditOrgUnitPanel = false): void {
        this.orgUnitService.refreshOrgUnits();
        if (closeEditOrgUnitPanel) {
            this.onEditOrgUnitCancel();
        }
    }

}
