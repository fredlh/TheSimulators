import { Component }                        from "@angular/core";

import { OrgUnitService}                    from "../../services/org-unit.service";
import { SideBarService}                    from "../../services/side-bar.service";

import { OrgUnitGroupsUpdateInterface }     from "../../core/org-unit-groups-update.interface";

import { OrgUnit }                          from "../../core/org-unit.class";
import { Globals, OrganisationUnitGroup }   from "../../globals/globals.class";


class SelectedOrgUnitGroups {
    orgUnitGroup: OrganisationUnitGroup;
    searchTerm: string = "";
    searchResults: OrgUnit[] = [];
    selectedFromSearch: string = "";
    selectedFromExisting: string = "";
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
                if (res.organisationUnits.length > 0){
                    tmpThis.selectedOrgUnitGroup.selectedFromSearch = res.organisationUnits[0].name;
                    console.log(tmpThis.selectedOrgUnitGroup.selectedFromSearch);
                    tmpThis.selectedOrgUnitGroup.searchResults = res.organisationUnits;
                }

            },
            error => {
                console.error(error);
            }
        )
    }


    // Removes an orgUnit from an orgUnitGroup
    // TODO:
    // - Remove selected orgUnit from this.selectedOrgUnitGroup.orgUnitGroup.organisationUnits[]
    removeOrgUnit(): void {
        let id = this.getIdByName(this.selectedOrgUnitGroup.selectedFromExisting);
        console.log("Remove from orgUnitGroup: " + this.selectedOrgUnitGroup.selectedFromExisting + " | id: " + id);
    }


    // Adds an orgUnit to the orgUnitGroup
    // TODO:
    // - Add the orgUnit to this.selectedOrgUnitGroup.orgUnitGroup.organisationUnits[]
    addOrgUnit(): void {
        let id = this.getIdByName(this.selectedOrgUnitGroup.selectedFromSearch, this.selectedOrgUnitGroup.searchResults);
        console.log("Add to orgUnitGroup: " + this.selectedOrgUnitGroup.selectedFromSearch + " | id: " + id);
    }


    // Saves an orgUnitGroup with updated info
    // TODO:
    // - Add the save button on the page
    // - Send a put request to the api with the new orgUnit
    // - How to update?
    onSaveOrgUnitGroup(): void {
        console.log("Save orgUnitGroup: " + this.openedId);
    }


    // Adds an orgUnitGroup
    // TODO:
    // - Call refreshOrgunitGroups() on success?
    onAddOrgUnitGroup():void {
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
            }
        ); 
    }


    // Deletes an orgUnitGroup
    // TODO:
    // - Add the delete button on the page
    // - Send a delete request to the API
    // - Howt to update?
    onDeleteOrgUnitGroup(id: string) {
        console.log("Delete orgUnitGroup: " + id);
    }


    // Refreshes the orgUnitGroups
    // TODO:
    // - When retrieving new orgUnitGroups, all orgUnitArrays are lost
    // - Any changes on the implementation or assumptions are needed?
    refreshOrgunitGroups(): void {
        //this.orgUnitService.refreshOrganisationUniGroups();
        console.log("Currently not working");
    }

}