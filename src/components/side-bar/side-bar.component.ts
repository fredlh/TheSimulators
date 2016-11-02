import { Component, OnInit, AfterViewInit, OnChanges, AfterContentChecked }    from "@angular/core";

import { OrgUnit }  from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

import { SideBarInterface } from "../../core/side-bar.interface";

import { Constants} from "../../constants/constants";

declare var $: any;

@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent implements SideBarInterface, OnInit {
    private orgUnits: OrgUnit[] = null;
    private displayedOrgUnits = null;
    private levelToNameMap: String[] = Constants.nameToLevelMapping;

    private toggleSideBarButtonVisible: boolean = false;
    private sideBarVisible: boolean = false;
    private filterAreaVisible: boolean = false;

    private filterApplied:boolean = false;

    private selectedOrgUnit: OrgUnit = new OrgUnit();

    constructor(private orgUnitService: OrgUnitService) {}

    ngOnInit(): void {
        this.orgUnitService.registerSideBar(this);
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
        this.clearFilter(true);
    }

    // Scrolls to a given orgUnit in the list by id
    // Called when the user has clicked on an orgUnit on the map
    scrollToOrgUnit(orgUnitId: string) {
        setTimeout(function() {
            $("#sideBar").animate({
                scrollTop: $("#" + orgUnitId).position().top + $("#sideBar").scrollTop() - 40
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
        this.orgUnitService.getOrgUnitAndChildren(orgUnitId);
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


    //
    // Edit org unit
    // 

    // Opens the editOrgUnitArea and registers the needed events
    // Gets called when the edit org unit button is clicked
    onEditOrgUnitOpen(orgUnitId = "") {
        this.hideSideBar();
        this.showEditOrgUnitPanel();
        
        if (orgUnitId !== "") {
            this.selectedOrgUnit = this.getOrgUnitById(orgUnitId);
        }

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
        document.getElementById("editOrgUnitArea").style.display = "none";
        tmpThis.unHideSideBar();
        tmpThis.orgUnitService.endAddOrEditOrgUnit();
    }

    // The user has submited the edited org unit
    // Re-show the sideBar
    // TODO: Send the updated onrgUnit to orgUnitService, and make a http put request
    onEditOrgUnitSubmit(): void {
        document.getElementById("editOrgUnitArea").style.display = "none";
        this.unHideSideBar();
        this.orgUnitService.endAddOrEditOrgUnit();
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
        this.orgUnitService.startEditMode(this.selectedOrgUnit.id);
    }

    // Opens the draw org unit marker menu and closes the rest
    drawOrgUnitMarker(): void {

    }

    // Saves the drawn org unit
    saveDrawnOrgUnit(): void {
        this.selectedOrgUnit.coordinates = this.orgUnitService.endEditMode(true);
        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.onEditOrgUnitOpen();
    }

    // Discards the drawn org unit
    cancelDrawnOrgUnit(): void {
        this.orgUnitService.endEditMode(false);
        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.onEditOrgUnitOpen();
    }


    //
    // Delete org unit
    //

    // Deletes the orgUnit with the given id
    deleteOrgUnit(orgUnitId: string) {
        console.log("Delete: " + orgUnitId);
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
        this.orgUnitService.onFilter(this.displayedOrgUnits);
    }

    // Clears the filter
    // If hideFilterArea === true, the filter area is hidden 
    // Called on search or clear filter button clicked
    clearFilter(hideFilterArea = false): void {
        this.displayedOrgUnits = [];

        for (let o of this.orgUnits) {
            this.displayedOrgUnits.push(JSON.parse(JSON.stringify(o)));
        }

        this.filterApplied = false;
        this.orgUnitService.onFilter(this.displayedOrgUnits);

        if (hideFilterArea) {
            $("#filterArea").hide();
            this.filterAreaVisible = false;
        }
    }

}
