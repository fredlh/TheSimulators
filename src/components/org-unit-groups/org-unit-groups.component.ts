import { Component }                        from "@angular/core";

import { OrgUnitService}                    from "../../services/org-unit.service";
import { SideBarService}                    from "../../services/side-bar.service";

import { OrgUnitGroupsUpdateInterface }     from "../../core/org-unit-groups-update.interface";

import { OrgUnit }                          from "../../core/org-unit.class";
import { Globals, OrganisationUnitGroup }   from "../../globals/globals.class";

/*
 * The Organisation Unit Group component is an orgUnitGroup management panel
 * 
 * All orgUnitGroups are displayed in a collapsible list which the user can toggleOrgUnitGroups
 * When expanded, it will show all info of the current orgUnitGroup and the following options:
 * - remove: Removes an orgUnit from the group
 * - add: Adds an orgUnit to the group. A search field is used for searching
 * - save: Saves the current orgUnitGroup with the updated data
 * - delete: Deles the current orgUnitGroup
 * 
 * The user can also add a new orgUnitGroup with a given name
 * 
 * When adding new one or deleting existing one, the list will auto-refresh upon successed
 * The user can also click on the "refresh" button on the top to refresh all orgUnitGroups
 */


// Used for jQuery
declare var $: any;


// Represents the current orgUnitGroup
// - searchTerm: The term the user search for when adding a new orgUnit
// - searchResults: THe list of orgUnit which the search returned
// - selectedFromExisting: The currently selected orgUnit among the existing ones
// - selectedFromSearch: The currently selected orgUnit among the searched ones
// - status: null by default, true on success and false on error
// - message: The message corresponding to the status 
class SelectedOrgUnitGroups {
    searchTerm: string = "";
    searchResults: OrgUnit[] = [];
    selectedFromSearch: string = "";
    selectedFromExisting: string = "";
    status: boolean = null;
    message: string = "";
}

@Component({
    selector: "org-unit-groups",
    template: require<any>("./org-unit-groups.component.html"),
    styles: [ require<any>("./org-unit-groups.component.less")]
})


export class OrgUnitGroupsComponent implements OrgUnitGroupsUpdateInterface {

    // All the organistion unit groups
    // Each group is a toggable accordion
    private orgUnitGroups: OrganisationUnitGroup[] = [];

    // The selected/opened orgUnitGroups
    // Contains all the info the user can search and change
    private selectedOrgUnitGroups: SelectedOrgUnitGroups[] = [];

    // Status of the newly added orgUnitGroup
    private newOrgUnitGroupStatus: boolean = null;
    private newOrgUnitGroupMessage: string = "";

    // Name on the new orgUnitGroup the use can add
    private newOrgUnitGroupName: string = "";

    // The index of the orgUnitGroup to be deleted if the user clicks "yes" on confirm
    private groupIndexToBeDeleted: number = -1;


    constructor(private orgUnitService: OrgUnitService, private sideBarService: SideBarService) {
        // Register listner for orgUnitGroups and register itself to the orgUnitService
        // Latter one is needed to be able to get called when user expands an orgUnitGroup
        this.orgUnitService.registerOrgUnitGroupsListener(this);
        this.orgUnitService.registerOrgUnitGroups(this);

        // Init the selectedOrgUnitGroups
        for (let i = 0; i < this.orgUnitGroups.length; i++) {
            this.selectedOrgUnitGroups.push(new SelectedOrgUnitGroups());
        }
    }

    // Gets called when the orgUnitGroups have been updated
    onOrgUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;

        // Reset the current selectedOrgUnitGroups
        // Will then retrieve new orgUnits when user expands an orgUnitGroup
        this.selectedOrgUnitGroups = [];
        for (let i = 0; i < this.orgUnitGroups.length; i++) {
            this.selectedOrgUnitGroups.push(new SelectedOrgUnitGroups());
        }
    }

    // Called then the orgUnitGroup panel is opened
    toggleOrgUnitGroups(): void {
        this.showOrgUnitGroupsPanel();

        // Reset all SelectedOrgUnitGroups, so that all old states are deleted
        this.selectedOrgUnitGroups = [];
        for (let i = 0; i < this.orgUnitGroups.length; i++) {
            this.selectedOrgUnitGroups.push(new SelectedOrgUnitGroups());
        }

        this.newOrgUnitGroupStatus = null;
        this.newOrgUnitGroupMessage = "";
        this.newOrgUnitGroupName = "";

        let tmpThis = this;
        $(".org-unit-groups-close").click(function() {
            tmpThis.onCancel(tmpThis);
        });

        window.onclick = function(event) {
            if (event.target === document.getElementById("orgUnitGroupsArea")) {
                tmpThis.onCancel(tmpThis);
            }
        };
    }

    showOrgUnitGroupsPanel(): void {
        document.getElementById("orgUnitGroupsArea").style.display = "block";
    }

    hideOrgUnitGroupsPanel(): void {
        document.getElementById("orgUnitGroupsArea").style.display = "none";
    }

    onCancel(tmpThis = this): void {
        tmpThis.hideOrgUnitGroupsPanel();
    }


    // Retrives all the orgUnits from an orgUnitGroup
    // Is done so the user can see the names rather than the IDs
    // Result is displayed in the selectBox which shows the existing orgUnits of the group
    getOrgUnitsFromOrgUnitGroup(orgUnitGroupId: string, orgUnitGroupIndex: number): void {
        let firstSave = true;
        this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray = [];

        for (let orgUnit of this.orgUnitGroups[orgUnitGroupIndex].organisationUnits) {
            this.orgUnitService.getOrgUnit(orgUnit.id).subscribe(
                res => {
                    this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray.push(res);

                    if (firstSave) {
                        this.selectedOrgUnitGroups[orgUnitGroupIndex].selectedFromExisting = res.name;
                        firstSave = false;
                    }
                },
                error => {
                    console.error(error);
                }
            );
        }
    }


    // Called when an orgUnitGroup is opened
    // If the orgUnitGroup is opened for the first time after a refresh,
    // it retrieves all orgUnits so the user can see the names rather than just IDs
    orgUnitGroupOpened(orgUnitGroupId: string, orgUnitGroupIndex: number) {
        if (!this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray) {
            this.getOrgUnitsFromOrgUnitGroup(orgUnitGroupId, orgUnitGroupIndex);
        }
    }


    // Returns an orgUnits ID by its name, or "-1" on error
    // Defaults to the orgUnitGroups orgUnitArray, but can be specified
    getIdByName(name: string, groupIndex: number, orgUnitArray = this.orgUnitGroups[groupIndex].orgUnitArray): string {
        for (let orgUnit of orgUnitArray) {
            if (orgUnit.name.trim() === name) {
                return orgUnit.id.toString();
            }
        }

        return "-1";
    }


    // Searches for orgUnits
    // Gets called when the user wants to search for orgUnits to add to the orgUnitGroup
    // The result is displayed in a selectbox
    searchOrgUnit(groupIndex: number): void {
        let selectedOrgUnitGroup = this.selectedOrgUnitGroups[groupIndex];

        this.orgUnitService.getOrgUnits("&query=" + selectedOrgUnitGroup.searchTerm).subscribe(
            res => {
                // If the result contains 1 or more orgUnits, displayed the 1st one if the selectBox
                if (res.organisationUnits.length > 0) {
                    selectedOrgUnitGroup.selectedFromSearch = res.organisationUnits[0].name;
                    selectedOrgUnitGroup.searchResults = res.organisationUnits;
                }
            },
            error => {
                selectedOrgUnitGroup.status = false;

                // Try to get the error message from the API response
                try {
                    selectedOrgUnitGroup.message =  error._body.split(`"message":`)[1].split(`"`)[1];
                } catch (Error) {
                    selectedOrgUnitGroup.message = "Unable to find the reason";
                }
            }
        );
    }


    // Removes an orgUnit from an orgUnitGroup
    removeOrgUnit(groupIndex: number): void {
        let selectedOrgUnitGroup = this.selectedOrgUnitGroups[groupIndex];
        let orgUnitGroup = this.orgUnitGroups[groupIndex];

        // Get the ID of the selected orgUnit
        let id = this.getIdByName(selectedOrgUnitGroup.selectedFromExisting, groupIndex);

        // Remov the selected orgUnit from the select box
        orgUnitGroup.orgUnitArray = orgUnitGroup.orgUnitArray.filter(function(orgUnit) {
            return orgUnit.id !== id;
        });

        // Set the select box to default to the 1st item
        if (orgUnitGroup.orgUnitArray.length > 0) {
            selectedOrgUnitGroup.selectedFromExisting = orgUnitGroup.orgUnitArray[0].name;
        }
    }


    // Adds an orgUnit to the orgUnitGroup
    addOrgUnit(groupIndex: number): void {
        let selectedOrgUnitGroup = this.selectedOrgUnitGroups[groupIndex];
        let id = this.getIdByName(selectedOrgUnitGroup.selectedFromSearch, groupIndex, selectedOrgUnitGroup.searchResults);

        // Remove any prior errors
        selectedOrgUnitGroup.status = null;
        selectedOrgUnitGroup.message = "";

        // Get the orgUnit from the search results
        let orgUnit = undefined;
        for (let o of selectedOrgUnitGroup.searchResults) {
            if (o.id === id) {
                orgUnit = o;
                break;
            }
        }

        // If the orgUnit is already a part of the group, display error and return
        for (let unit of this.orgUnitGroups[groupIndex].orgUnitArray) {
            if (unit.id === orgUnit.id) {
                selectedOrgUnitGroup.status = false;
                selectedOrgUnitGroup.message = "Cannot add '" + unit.name + "'. The orgUnit is already a part of the group";
                return;
            }
        }

        // Add the orgUnit to the groups orgUnits
        this.orgUnitGroups[groupIndex].orgUnitArray.push(orgUnit);

        // Remove the orgUnit from the select box so you can cannot add the same orgUnit multiple times
        selectedOrgUnitGroup.searchResults = selectedOrgUnitGroup.searchResults.filter(function(unit) {
            return unit.id !== orgUnit.id;
        });

        // Set the option in the selectBox to the 1st result
        if (selectedOrgUnitGroup.searchResults.length > 0) {
            selectedOrgUnitGroup.selectedFromSearch = selectedOrgUnitGroup.searchResults[0].name;
        }
    }


    // Saves an orgUnitGroup with updated info
    onSaveOrgUnitGroup(groupIndex: number): void {
        let selectedOrgUnitGroup = this.selectedOrgUnitGroups[groupIndex];
        let orgUnitGroup = this.orgUnitGroups[groupIndex];

        // Update the organisationUnits in the group
        orgUnitGroup.organisationUnits = [];
        for (let unit of this.orgUnitGroups[groupIndex].orgUnitArray) {
            orgUnitGroup.organisationUnits.push({"id": unit.id});
        }

        // Send the updated orgUnitGroup to the API
        this.orgUnitService.updateOrganisationUnitGroup(orgUnitGroup).subscribe(
            res => {
                selectedOrgUnitGroup.status = true;
                selectedOrgUnitGroup.message = "Updated organisation unit group";
            },
            error => {
                selectedOrgUnitGroup.status = false;

                // Try to retrieve the error message from the API
                // Could be 2 different, so check where in the response object the message is
                let errorMessage: string = error._body;
                let splitIndex = errorMessage.includes("response") ? 2 : 1;

                try {
                    selectedOrgUnitGroup.message = errorMessage.split(`"message":`)[splitIndex].split(`"`)[1];
                } catch (Error) {
                    selectedOrgUnitGroup.message = "Unable to find the reason";
                }
            }
        );
    }


    // Adds an orgUnitGroup
    onAddOrgUnitGroup(): void {
        // Ignore if just blanks
        if (this.newOrgUnitGroupName.trim() === "") return;

        // Set the required fields
        let orgUnitGroup = new OrganisationUnitGroup();
        orgUnitGroup.name = this.newOrgUnitGroupName;
        orgUnitGroup.displayName = this.newOrgUnitGroupName;
        orgUnitGroup.shortName = this.newOrgUnitGroupName;
        orgUnitGroup.created = new Date();

        // Save the orgUnitGroup and display wether it successed or failed
        this.orgUnitService.saveOrganisationUnitGroup(orgUnitGroup).subscribe(
            res => {
                this.refreshOrgunitGroups();
            },
            error => {
                this.newOrgUnitGroupStatus = false;

                try {
                    this.newOrgUnitGroupMessage =  error._body.split(`"message":`)[1].split(`"`)[1];
                } catch (Error) {
                    this.newOrgUnitGroupMessage = "Unable to find the reason";
                }
            }
        );
    }


    // Deletes an orgUnitGroup
    onDeleteOrgUnitGroup(groupIndex: number, confirmedDelete = false): void {
        // Return if the user clicked "No" on confirm delete
        if (!confirmedDelete) {
            this.groupIndexToBeDeleted = groupIndex;
            document.getElementById("confirmDeleteArea").style.display = "block";
            return;
        }

        let selectedOrgUnitGroup = this.selectedOrgUnitGroups[this.groupIndexToBeDeleted];

        // Send the delete request to the API and print out the delete result
        this.orgUnitService.deleteOrganisationUnitGroup(this.orgUnitGroups[this.groupIndexToBeDeleted].id).subscribe(
            res => {
                this.refreshOrgunitGroups();
            },
            error => {
                selectedOrgUnitGroup.status = false;

                try {
                    selectedOrgUnitGroup.message  =  error._body.split(`"message":`)[1].split(`"`)[1];
                } catch (Error) {
                    selectedOrgUnitGroup.message  = "Unable to find the reason";
                }
            }
        );
    }

    confirmDelete(yes: boolean): void {
        document.getElementById("confirmDeleteArea").style.display = "none";
        if (yes)  {
            this.onDeleteOrgUnitGroup(-1, true);
        }
    }


    // Refreshes the orgUnitGroups
    refreshOrgunitGroups(): void {
        this.orgUnitService.refreshOrganisationUniGroups();
        this.groupIndexToBeDeleted = -1;
        this.newOrgUnitGroupName = "";
        this.newOrgUnitGroupStatus = null;
        this.newOrgUnitGroupMessage = "";
    }

}