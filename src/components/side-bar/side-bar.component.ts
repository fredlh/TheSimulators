import { Component, OnInit }        from "@angular/core";

import { OrgUnitService }           from "../../services/org-unit.service";
import { MapService }               from "../../services/map.service";
import { SideBarService}            from "../../services/side-bar.service";

import { OrgUnitLevelsUpdateInterface}    from "../../core/org-unit-levels-update.interface";
import { OrgUnitGroupsUpdateInterface}    from "../../core/org-unit-groups-update.interface";

import { OrgUnit, ID }              from "../../core/org-unit.class";

import { Globals, FeatureType, OrganisationUnitGroup }     from "../../globals/globals.class";


declare var $: any;

class FilterOptions {
    name: string = "";
    nameFilterType: string = "startsWith";
    level: string = "All";
    orgUnitGroups: string[] = [];
}


@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent implements OnInit, OrgUnitGroupsUpdateInterface, OrgUnitLevelsUpdateInterface {
    private orgUnits: OrgUnit[] = null;
    private displayedOrgUnits = null;
    private globals = Globals;
    private featurType = FeatureType;

    private toggleSideBarButtonVisible: boolean = false;
    private sideBarVisible: boolean = false;
    private filterAreaVisible: boolean = false;

    private filterApplied: boolean = false;

    private orgUnitLevels = [];
    private orgUnitGroups = [];

    private filterOptions = new FilterOptions();

    private selectedOrgUnit: OrgUnit = new OrgUnit();

    private haveSubmitted = false;
    private saveSuccess = null;

    constructor(private orgUnitService: OrgUnitService,
                private mapService: MapService,
                private sideBarService: SideBarService) {}

    onOrgUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
    }

    onOrgUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;
    }

    ngOnInit(): void {
        this.orgUnitService.registerSideBar(this);
        this.orgUnitService.registerOrgUnitGroupsListener(this);
        this.orgUnitService.registerOrgUnitLevelsListener(this);
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
    applyFilter(): void {
        let options = this.filterOptions;

        // Save the values in a short variable to avoid very long lines
        let name = this.filterOptions.name;
        let type = this.filterOptions.nameFilterType;
        let level = this.filterOptions.level;
        let groups = this.filterOptions.orgUnitGroups;

        // Filter on name
        let filteredName = [];
        if (name !== "") {
            filteredName = this.orgUnits.filter(function(orgUnit) {
                if (type === "startsWith" && orgUnit.displayName.startsWith(name)) return true;
                if (type === "endsWith" && orgUnit.displayName.endsWith(name)) return true;
                if (type === "includes" && orgUnit.displayName.includes(name)) return true;
                if (type === "equals" && orgUnit.displayName === name) return true;
                else return false;
            })
        }

        // Filter on level
        let filteredLevel = [];
        if (level !== "All") {
            filteredLevel = this.orgUnits.filter(function(orgUnit) {
                if (+level === orgUnit.level) return true;
                else return false;
            })
        }

        // Filter on orgUnitGroups
        let filteredGroups = [];
        if (groups.length > 0) {
            filteredGroups = this.orgUnits.filter(function(orgUnit) {
                outer: for (let g of groups) {
                    for (let o of orgUnit.organisationUnitGroups) {
                        if (g === o.id) {
                            continue outer;
                        }
                    }
                    return false;
                }
                return true;
            })
        }

        // Merge the 3 filtered arrys on duplicates
        let tmpArray = this.mergeArraysOnDuplicates(filteredName, filteredLevel);
        let filteredArray = this.mergeArraysOnDuplicates(tmpArray, filteredGroups);

        // Set displayOrgUnits and call the mapService so the map draws only the filtered orgUnits
        this.displayedOrgUnits = JSON.parse(JSON.stringify(filteredArray));
        this.filterApplied = true;
        this.mapService.onFilter(this.displayedOrgUnits);
    }


    mergeArraysOnDuplicates(array1: any[], array2: any[]): any[] {
        if (array1.length === 0) return array2;
        if (array2.length === 0) return array1;

        let newArray = [];
        for (let a of array1) {
            for (let b of array2) {
                if (a.id === b.id) {
                    newArray.push(a);
                }
            }
        }
        return newArray;
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

        this.filterOptions = new FilterOptions();
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
