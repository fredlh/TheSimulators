import { Component, OnInit }                                                 from "@angular/core";

import {IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts }        from "../../modules/multiselect-dropdown";

import { OrgUnitService }                                                    from "../../services/org-unit.service";
import { MapService }                                                        from "../../services/map.service";
import { SideBarService}                                                     from "../../services/side-bar.service";

import { OrgUnitLevelsUpdateInterface }                                      from "../../core/org-unit-levels-update.interface";
import { OrgUnitGroupsUpdateInterface }                                      from "../../core/org-unit-groups-update.interface";

import { OrgUnit, ID }                                                       from "../../core/org-unit.class";

import { Globals, FeatureType, OrganisationUnitGroup }                       from "../../globals/globals.class";


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
    private orgUnitIdToDelete: string = "";
    private deleteErrorMessage:string = "";

    private haveSubmitted = false;
    private saveSuccess = null;

    private selectBoxSettings: IMultiSelectSettings = {
        pullRight: true,
        enableSearch: true,
        checkedStyle: "checkboxes",
        buttonClasses: "btn btn-default",
        selectionLimit: 0,
        closeOnSelect: false,
        showCheckAll: true,
        showUncheckAll: true,
        dynamicTitleMaxItems: 2,
        maxHeight: "300px",
    };

    private selectBoxTexts: IMultiSelectTexts = {
        checkAll: "Check all",
        uncheckAll: "Uncheck all",
        checked: "checked",
        checkedPlural: "checked",
        searchPlaceholder: "Search...",
        defaultTitle: "Select",
    };

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
            $("#sideBarContent").animate({
                scrollTop: $("#" + orgUnitId).position().top + $("#sideBarContent").scrollTop() - 40
            }, 500);
        }, 100);
    }

    // Toggles the side bar, called when clicking
    // the toggle side bar button
    toggleSideBar(): void {
        $("#sideBarContent").toggle();
        $("#sideBarButtons").toggle();
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
        $("#sideBarContent").hide();
        $("#sideBarButtons").hide();
        $("#filterArea").hide();
        $("#toggleSideBar").hide();
    }

    // Reopens the side bar
    // Called when the focused form/pane has been closed
    unHideSideBar(): void {
        if (this.sideBarVisible) {
            $("#sideBarContent").show();
            $("#sideBarButtons").show();
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
        $("#sideBarContent").show();
        $("#sideBarButtons").show();
        $("#toggleSideBar").show();
    }


    //
    // General functions
    //

    // Tells the orgUnitService that it should retrive the children of the given orgUnit
    // Called when the get children button is clicked
    onGetChildrenClicked(orgUnitId: string) {
        let orgUnit = this.getOrgUnitById(orgUnitId);
        this.orgUnitService.getOrgUnitAndChildren(orgUnitId, true, true);
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
        tmpThis.mapService.endEditMode();
    }

    // The user has submited the edited org unit
    onEditOrgUnitSubmit(): void {
        this.mapService.endEditMode();

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
        this.unHideSideBar();

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
        this.unHideSideBar();
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
    deleteOrgUnit(orgUnitId: string, confirmedDelete: boolean = false) {
        if (orgUnitId !== "") {
            this.orgUnitIdToDelete = orgUnitId;
        }

        // Return if the user clicked "No" on confirm delete
        if (!confirmedDelete) {
            document.getElementById("confirmDeleteAreaOrgUnit").style.display = "block";
            return;
        }

        this.orgUnitService.deleteOrganisationUnit(this.orgUnitIdToDelete).subscribe(
            // All good, just refresh the page so the deleted orgUnit dissapairs
            res => {
                this.refreshOrgUnits();
            },
            // An error occured, try to find the reason and display the error area
            error => {
                try {
                    this.deleteErrorMessage =  error._body.split(`"message":`)[1].split(`"`)[1];
                } catch (Error) {
                    this.deleteErrorMessage = "Unable to find the reason";
                }

                document.getElementById("errorArea").style.display = "block";
                
            }
        );   
    }


    confirmDeleteOrgUnit(yes: boolean): void {
        document.getElementById("confirmDeleteAreaOrgUnit").style.display = "none";
        if (yes)  {
            this.deleteOrgUnit("", true);
        }
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

    // Closes the filter
    closeFilter(): void {
        $("#filterArea").hide();
        this.filterAreaVisible = false;
    }

    // Applies the filter on displayedOrgUnits
    // Called when apply filter button is clicked
    applyFilter(): void {
        $("#filterArea").toggle();
        let options = this.filterOptions;

        // Save the values in a short variable to avoid very long lines
        let name = this.filterOptions.name;
        let type = this.filterOptions.nameFilterType;
        let level = this.filterOptions.level;
        let groups = this.filterOptions.orgUnitGroups;

        // The orgUnits before filtering
        let tmpOrgUnits = JSON.parse(JSON.stringify(this.orgUnits));

        // Filter on name
        let filteredName = [];
        if (name !== "") {
            tmpOrgUnits = tmpOrgUnits.filter(function(orgUnit) {
                if (type === "startsWith" && orgUnit.displayName.startsWith(name)) return true;
                if (type === "endsWith" && orgUnit.displayName.endsWith(name)) return true;
                if (type === "includes" && orgUnit.displayName.includes(name)) return true;
                if (type === "equals" && orgUnit.displayName === name) return true;
                else return false;
            });
        }

        // Filter on level
        let filteredLevel = [];
        if (level !== "All") {
            tmpOrgUnits = tmpOrgUnits.filter(function(orgUnit) {
                if (+level === orgUnit.level) return true;
                else return false;
            });
        }

        // Filter on orgUnitGroups
        let filteredGroups = [];
        if (groups.length > 0) {
            tmpOrgUnits = tmpOrgUnits.filter(function(orgUnit) {
                outer: for (let g of groups) {
                    for (let o of orgUnit.organisationUnitGroups) {
                        if (g === o.id) {
                            continue outer;
                        }
                    }
                    return false;
                }
                return true;
            });
        }

        // Set displayOrgUnits and call the mapService so the map draws only the filtered orgUnits
        this.displayedOrgUnits = JSON.parse(JSON.stringify(tmpOrgUnits));
        this.filterApplied = true;
        this.filterAreaVisible = !this.filterAreaVisible;
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


    // Appends the parent name to the orgUnit in the list
    // Call either when orgUnit in list is expanded or when a orgUnit on the map is selected
    appendParent(orgUnitId: string): void {
        // Get the chosen orgUniten
        let orgUnit = this.getOrgUnitById(orgUnitId);

        // No parent, so nothing to retrieve or display
        if (!orgUnit.parent) return;

        // Get the orgUnits parent
        this.orgUnitService.getOrgUnit(orgUnit.parent.id).subscribe(
            res => {

                // Find the wanted <li>-element, and append the name
                $("#" + orgUnitId).find("li:last-child").each(function(){
                    let textElem = $(this).text();
                    if (textElem.includes(orgUnit.parent.id) && !textElem.includes(res.name)) {
                       $(this).append("<li><strong>Name: </strong>" + res.name + "</li>");
                    }
                });
            },
            error => {
                console.error(error);
            }
        );
    }

}
