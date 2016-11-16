import { Component, ElementRef, Renderer, AfterViewInit }  from "@angular/core";

import {IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts }        from "../../modules/multiselect-dropdown";

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

    private orgUnitGroups: OrganisationUnitGroup[] = [];
    private orgUnits = [];
    private displayedOrgUnits = [];
    private hasRetrievedChildren = [];

    private testGroup:string[] = [];

    private orgUnitSearchTerm: string = "";

    private openedId;
    private openedIndex;

    private selectedOrgUnitGroup = new SelectedOrgUnitGroups();

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
                private sideBarService: SideBarService,
                private elementRef: ElementRef,
                private rendered: Renderer) {
        this.orgUnitService.registerOrgUnitGroupsListener(this);
        this.orgUnitService.registerOrgUnitGroups(this);

    }


    onOrgUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;
    }

    toggleOrgUnitGroups(): void {
        this.showOrgUnitGroupsPanel();

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

    getOrgUnits(orgUnitGroupId: string, orgUnitGroupIndex: number): void {
        this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray = [];

        for (let orgUnit of this.orgUnitGroups[orgUnitGroupIndex].organisationUnits) {
            this.orgUnitService.getOrgUnit(orgUnit.id).subscribe(
                res => {
                    this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray.push(res);
                },
                error => {
                    console.error(error);
                });
        }
    }

    orgUnitGroupOpened(orgUnitGroupId: string, orgUnitGroupIndex: number) {
        this.openedId = orgUnitGroupId;
        this.openedIndex = orgUnitGroupIndex;

        this.selectedOrgUnitGroup = new SelectedOrgUnitGroups();
        this.selectedOrgUnitGroup.orgUnitGroup = JSON.parse(JSON.stringify(this.orgUnitGroups[orgUnitGroupIndex]));

        if (!this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray) {
            this.getOrgUnits(orgUnitGroupId, orgUnitGroupIndex);
            this.getOrgUnitLevel1();
        }
    }

    getOrgUnitLevel1(): void {
        this.orgUnitService.getOrgUnits("&level=1").subscribe(
            res => {
                this.orgUnits = JSON.parse(JSON.stringify(res.organisationUnits));
                this.displayedOrgUnits = JSON.parse(JSON.stringify(res.organisationUnits));
            },
            error => {
                console.error(error);
            }
        )
    }

    getIdByName(name: string): string {
        for (let i = 0; i < this.displayedOrgUnits.length; i++) {
            if (this.displayedOrgUnits[i].name.trim() === name) {
                return "" + this.displayedOrgUnits[i].id;
            }
        }

        return "-1";
    }


    searchOrgUnit(): void {
        let tmpThis = this;
        this.orgUnitService.getOrgUnits("&query=" + this.selectedOrgUnitGroup.searchTerm).subscribe(
            res => {
                tmpThis.selectedOrgUnitGroup.searchResults = res.organisationUnits;
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
        console.log("Remove from orgUnitGroup: " + this.selectedOrgUnitGroup.selectedFromExisting);
    }


    // Adds an orgUnit to the orgUnitGroup
    // TODO:
    // - Add the orgUnit to this.selectedOrgUnitGroup.orgUnitGroup.organisationUnits[]
    addOrgUnit(): void {
        console.log("Add to orgUnitGroup: " + this.selectedOrgUnitGroup.selectedFromSearch);
    }


    // Saves an orgUnitGroup with updated info
    // TODO:
    // - Send a put request to the api with the new orgUnit
    // - How to update?
    onSaveOrgUnitGroup(id: string): void {
        console.log("Save orgUnitGroup: " + id);
    }


    // Adds an orgUnitGroup
    // TODO:
    // - Send the orgUnitGroup to the API
    // - Refresh the page? Or just have a refresh page button somewhere?
    onAddOrgUnitGroup(name: string) {
        console.log("Add orgUnitGroup: " + name)

        let orgUnitGroup = new OrganisationUnitGroup();
        orgUnitGroup.name = name;
        orgUnitGroup.displayName = name;
        orgUnitGroup.shortName = name;
        orgUnitGroup.created = new Date();

        this.orgUnitService.saveOrganisationUnitGroup(orgUnitGroup).subscribe(
            res => {
                console.log(res);
            },
            error => {
                console.error(error);
            }
        ); 
    }


    // Deletes an orgUnitGroup
    // TODO:
    // - Figure out where to place the delete button
    // - Send a delete request to the API
    // - Howt to update?
    onDeleteOrgUnitGroup(id: string) {
        console.log("Delete orgUnitGroup: " + id);
    }


}