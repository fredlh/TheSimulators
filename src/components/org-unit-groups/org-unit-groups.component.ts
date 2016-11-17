import { Component }                        from "@angular/core";

import { OrgUnitService}                    from "../../services/org-unit.service";
import { SideBarService}                    from "../../services/side-bar.service";

import { OrgUnitGroupsUpdateInterface }     from "../../core/org-unit-groups-update.interface";

import { OrgUnit }                          from "../../core/org-unit.class";
import { Globals, OrganisationUnitGroup }   from "../../globals/globals.class";

declare var $: any;

class SelectedOrgUnitGroups {
    orgUnitGroup: OrganisationUnitGroup;
    searchTerm: string = "";
    searchResults: OrgUnit[] = [];
    selectedFromSearch: string = "";
    selectedFromExisting: string = "";

    constructor() {
        this.orgUnitGroup = new OrganisationUnitGroup();
    }
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

    // The ID and Index of the opened orgUnitGroup
    private openedId;
    private openedIndex;

    // The selected/opened orgUnitGroup
    // Contains all the info the user can search and change
    private selectedOrgUnitGroup = new SelectedOrgUnitGroups();

    // Used to display info regarding adding and deletion of orgUnits in an orgUnitGroup
    // true = success, false = error
    private orgUnitGroupStatus: boolean = null;
    private orgUnitGroupMessage: string = "";

    // Same as above, but used during adding of new orgUnitGroups
    private newOrgUnitGroupStatus: boolean = null;
    private newOrgUnitGroupMessage: string = "";

    // Name on the new orgUnitGroup the use can add
    private newOrgUnitGroupName: string = "";


    constructor(private orgUnitService: OrgUnitService, private sideBarService: SideBarService) {
        this.orgUnitService.registerOrgUnitGroupsListener(this);
        this.orgUnitService.registerOrgUnitGroups(this);
    }


    onOrgUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;
    }

    toggleOrgUnitGroups(): void {
        this.showOrgUnitGroupsPanel();

        this.orgUnitGroupStatus = null;
        this.orgUnitGroupMessage = "";
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
    getOrgUnitsFromOrgUnitGroup(orgUnitGroupId: string, orgUnitGroupIndex: number): void {
        let firstSave = true;
        this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray = [];

        for (let orgUnit of this.orgUnitGroups[orgUnitGroupIndex].organisationUnits) {
            this.orgUnitService.getOrgUnit(orgUnit.id).subscribe(
                res => {
                    this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray.push(res);

                    if (firstSave) {
                        this.selectedOrgUnitGroup.selectedFromExisting = res.name;
                        firstSave = false;
                    }

                },
                error => {
                    console.error(error);
                });
        }
    }

    // Called when an orgUnitGroup is opened
    // Saves the ID and Index, sets the selectedOrgUnitGroup and retrives the orgUnits on first time opened
    orgUnitGroupOpened(orgUnitGroupId: string, orgUnitGroupIndex: number) {
        this.openedId = orgUnitGroupId;
        this.openedIndex = orgUnitGroupIndex;

        this.selectedOrgUnitGroup = new SelectedOrgUnitGroups();
        this.selectedOrgUnitGroup.orgUnitGroup = JSON.parse(JSON.stringify(this.orgUnitGroups[orgUnitGroupIndex]));

        if (!this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray) {
            this.getOrgUnitsFromOrgUnitGroup(orgUnitGroupId, orgUnitGroupIndex);
        }
    }


    // Returns an orgUnits ID by its name
    // Defaults to the orgUnitGroups orgUnitArray, but can be specified
    getIdByName(name: string, orgUnitArray = this.orgUnitGroups[this.openedIndex].orgUnitArray): string {
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
    searchOrgUnit(): void {
        let tmpThis = this;
        this.orgUnitService.getOrgUnits("&query=" + this.selectedOrgUnitGroup.searchTerm).subscribe(
            res => {
                if (res.organisationUnits.length > 0) {
                    tmpThis.selectedOrgUnitGroup.selectedFromSearch = res.organisationUnits[0].name;
                    console.log(tmpThis.selectedOrgUnitGroup.selectedFromSearch);
                    tmpThis.selectedOrgUnitGroup.searchResults = res.organisationUnits;
                }
            },
            error => {
                console.error(error);
            }
        );
    }


    // Removes an orgUnit from an orgUnitGroup
    removeOrgUnit(): void {
        // Get the ID of the selected orgUnit
        let id = this.getIdByName(this.selectedOrgUnitGroup.selectedFromExisting);

        // Remov the selected orgUnit from the select box
        this.orgUnitGroups[this.openedIndex].orgUnitArray = this.orgUnitGroups[this.openedIndex].orgUnitArray.filter(function(orgUnit) {
            return orgUnit.id !== id;
        });

        // Set the select box to default to the 1st item
        if (this.orgUnitGroups[this.openedIndex].orgUnitArray.length > 0) {
            this.selectedOrgUnitGroup.selectedFromExisting = this.orgUnitGroups[this.openedIndex].orgUnitArray[0].name;
        }
    }


    // Adds an orgUnit to the orgUnitGroup
    addOrgUnit(): void {
        this.orgUnitGroupStatus = null;
        this.orgUnitGroupMessage = "";
        let id = this.getIdByName(this.selectedOrgUnitGroup.selectedFromSearch, this.selectedOrgUnitGroup.searchResults);

        // Get thr orgUnit from the search results
        let orgUnit = undefined;
        for (let o of this.selectedOrgUnitGroup.searchResults) {
            if (o.id === id) {
                orgUnit = o;
                break;
            }
        }

        // If the orgUnit is already a part of the group, display error and return
        for (let unit of this.orgUnitGroups[this.openedIndex].orgUnitArray) {
            if (unit.id === orgUnit.id) {
                this.orgUnitGroupStatus = false;
                this.orgUnitGroupMessage = "Cannot add '" + unit.name + "'. The orgUnit is already a part of the group";
                return;
            }
        }

        // Add the orgUnit to the groups orgUnits
        this.orgUnitGroups[this.openedIndex].orgUnitArray.push(orgUnit);

        // Remove the orgUnit from the select box so you can cannot add the same orgUnit multiple times
        this.selectedOrgUnitGroup.searchResults = this.selectedOrgUnitGroup.searchResults.filter(function(unit) {
            return unit.id !== orgUnit.id;
        });

        // Set the option in the selectBox to the 1st result
        if (this.selectedOrgUnitGroup.searchResults.length > 0) {
            this.selectedOrgUnitGroup.selectedFromSearch = this.selectedOrgUnitGroup.searchResults[0].name;
        }
    }


    // Saves an orgUnitGroup with updated info
    // TODO:
    // - How to update?
    onSaveOrgUnitGroup(): void {
        // Update the organisationUnits in the group
        this.selectedOrgUnitGroup.orgUnitGroup.organisationUnits = [];
        for (let unit of this.orgUnitGroups[this.openedIndex].orgUnitArray) {
            this.selectedOrgUnitGroup.orgUnitGroup.organisationUnits.push({"id": unit.id});
        }

        // Send the updated orgUnitGroup to the API
        this.orgUnitService.updateOrganisationUnitGroup(this.selectedOrgUnitGroup.orgUnitGroup).subscribe(
            res => {
                console.log(res);
                this.orgUnitGroupStatus = true;
                this.orgUnitGroupMessage = "Updated organisation unit group";
            },
            error => {
                console.error(error);
                this.orgUnitGroupStatus = false;
                this.orgUnitGroupMessage = "Unable to update organisation unit group";
                console.error(error);
            }
        );
    }


    // Adds an orgUnitGroup
    // TODO:
    // - Howt to update?
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
        let tmpThis = this;
        this.orgUnitService.saveOrganisationUnitGroup(orgUnitGroup).subscribe(
            res => {
                tmpThis.newOrgUnitGroupStatus = true;
                tmpThis.newOrgUnitGroupMessage = "Added the organisation unit group '" + this.newOrgUnitGroupName + "'";
            },
            error => {
                tmpThis.newOrgUnitGroupStatus = false;
                tmpThis.newOrgUnitGroupMessage = "Unable to add the organisation unit group '" + this.newOrgUnitGroupName + "'";
                console.error(error);
            }
        );
    }


    // Deletes an orgUnitGroup
    // TODO:
    // - Howt to update?
    onDeleteOrgUnitGroup(confirmedDelete = false) {
        // Return if the user clicked "No" on confirm delete
        if (!confirmedDelete) {
            document.getElementById("confirmDeleteArea").style.display = "block";
            return;
        }

        // Send the delete request to the API and print out the delete result
        this.orgUnitService.deleteOrganisationUnitGroup(this.selectedOrgUnitGroup.orgUnitGroup.id).subscribe(
            res => {
                this.orgUnitGroupStatus = true;
                this.orgUnitGroupMessage = "Deleted organisation unit group '" + this.selectedOrgUnitGroup.orgUnitGroup.name + "'";
            },
            error => {
                this.orgUnitGroupStatus = false;
                this.orgUnitGroupMessage = "Failed to delete organisation unit group '" + this.selectedOrgUnitGroup.orgUnitGroup.name + "'";
                console.error(error);
            }
        );
    }


    // Refreshes the orgUnitGroups
    // TODO:
    // - When retrieving new orgUnitGroups, all orgUnitArrays are lost
    // - Any changes on the implementation or assumptions are needed?
    refreshOrgunitGroups(): void {
        // this.orgUnitService.refreshOrganisationUniGroups();
        console.log("Currently not working");
    }


    confirmDelete(yes: boolean): void {
        document.getElementById("confirmDeleteArea").style.display = "none";
        if (yes)  {
            this.onDeleteOrgUnitGroup(true);
        }
    }

}