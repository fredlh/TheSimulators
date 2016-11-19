import { Component }                        from "@angular/core";

import { OrgUnitService}                    from "../../services/org-unit.service";
import { SideBarService}                    from "../../services/side-bar.service";

import { OrgUnitGroupsUpdateInterface }     from "../../core/org-unit-groups-update.interface";

import { OrgUnit }                          from "../../core/org-unit.class";
import { Globals, OrganisationUnitGroup }   from "../../globals/globals.class";

declare var $: any;

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

    // The selected/opened orgUnitGroup
    // Contains all the info the user can search and change
    private selectedOrgUnitGroups: SelectedOrgUnitGroups[] = [];

    // Same as above, but used during adding of new orgUnitGroups
    private newOrgUnitGroupStatus: boolean = null;
    private newOrgUnitGroupMessage: string = "";

    // Name on the new orgUnitGroup the use can add
    private newOrgUnitGroupName: string = "";

    private groupIndexToBeDeleted: number = -1;


    constructor(private orgUnitService: OrgUnitService, private sideBarService: SideBarService) {
        this.orgUnitService.registerOrgUnitGroupsListener(this);
        this.orgUnitService.registerOrgUnitGroups(this);

        for (let i = 0; i < this.orgUnitGroups.length; i++) {
            this.selectedOrgUnitGroups.push(new SelectedOrgUnitGroups());
        }
    }


    onOrgUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;

        this.selectedOrgUnitGroups = [];
        for (let i = 0; i < this.orgUnitGroups.length; i++) {
            this.selectedOrgUnitGroups.push(new SelectedOrgUnitGroups());
        }
    }

    toggleOrgUnitGroups(): void {
        this.showOrgUnitGroupsPanel();

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
    // Saves the ID and Index, sets the selectedOrgUnitGroup and retrives the orgUnits on first time opened
    orgUnitGroupOpened(orgUnitGroupId: string, orgUnitGroupIndex: number) {
        if (!this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray) {
            this.getOrgUnitsFromOrgUnitGroup(orgUnitGroupId, orgUnitGroupIndex);
        }
    }


    // Returns an orgUnits ID by its name
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
                if (res.organisationUnits.length > 0) {
                    selectedOrgUnitGroup.selectedFromSearch = res.organisationUnits[0].name;
                    selectedOrgUnitGroup.searchResults = res.organisationUnits;
                }
            },
            error => {
                selectedOrgUnitGroup.status = false;

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

        selectedOrgUnitGroup.status = null;
        selectedOrgUnitGroup.message = "";

        // Get thr orgUnit from the search results
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
                console.log(res);
                selectedOrgUnitGroup.status = true;
                selectedOrgUnitGroup.message = "Updated organisation unit group";
            },
            error => {
                selectedOrgUnitGroup.status = false;

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
        let tmpThis = this;
        this.orgUnitService.saveOrganisationUnitGroup(orgUnitGroup).subscribe(
            res => {
                tmpThis.refreshOrgunitGroups();
            },
            error => {
                tmpThis.newOrgUnitGroupStatus = false;

                try {
                    tmpThis.newOrgUnitGroupMessage =  error._body.split(`"message":`)[1].split(`"`)[1];
                } catch (Error) {
                    tmpThis.newOrgUnitGroupMessage = "Unable to find the reason";
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


    // Refreshes the orgUnitGroups
    refreshOrgunitGroups(): void {
        this.orgUnitService.refreshOrganisationUniGroups();
        this.groupIndexToBeDeleted = -1;
        this.newOrgUnitGroupName = "";
        this.newOrgUnitGroupStatus = null;
        this.newOrgUnitGroupMessage = "";
    }


    confirmDelete(yes: boolean): void {
        document.getElementById("confirmDeleteArea").style.display = "none";
        if (yes)  {
            this.onDeleteOrgUnitGroup(-1, true);
        }
    }

}