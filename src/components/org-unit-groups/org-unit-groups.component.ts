import { Component, Injectable}                         from "@angular/core";

import { OrgUnitService}                    from "../../services/org-unit.service";
import { SideBarService}                    from "../../services/side-bar.service";

import { OrgUnitGroupsUpdateInterface }     from "../../core/org-unit-groups-update.interface";

import { OrgUnit }                          from "../../core/org-unit.class";
import { Globals, OrganisationUnitGroup }   from "../../globals/globals.class";



@Component({
    selector: "org-unit-groups",
    template: require<any>("./org-unit-groups.component.html"),
    styles: [ require<any>("./org-unit-groups.component.less")]
})


export class OrgUnitGroupsComponent implements OrgUnitGroupsUpdateInterface {

    private orgUnitGroups: OrganisationUnitGroup[] = [];
    private orgUnits: OrgUnit[] = [];
    private hasGottenOrgUnits: boolean = false;

    constructor(private orgUnitService: OrgUnitService,
                private sideBarService: SideBarService) {
        this.orgUnitService.registerOrgUnitGroupsListener(this);
        this.orgUnitService.registerOrgUnitGroups(this);
    }

    onOrgUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;
    }

    toggleOrgUnitGroups(): void {
        this.showOrgUnitGroupsPanel();

        if (!this.hasGottenOrgUnits) {
            //this.getOrgUnits();
            this.hasGottenOrgUnits = false;
        }

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
        this.sideBarService.hideSideBar();
    }

    hideOrgUnitGroupsPanel(): void {
        document.getElementById("orgUnitGroupsArea").style.display = "none";
        this.sideBarService.unHideSideBar();
    }

    onCancel(tmpThis = this): void {
        tmpThis.hideOrgUnitGroupsPanel();
        // Reset the thing
    }

    getOrgUnits(orgUnitGroupIndex: number): void {
        this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray = [];

        for (let orgUnit of this.orgUnitGroups[orgUnitGroupIndex].organisationUnits) {
            this.orgUnitService.getOrgUnitAsPromise(orgUnit.id).then(
                res => {
                    this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray.push(res);
                }
            );
        }
    }

    orgUnitGroupOpened(orgUnitGroupId: string, orgUnitGroupIndex: number) {
        if (!this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray) {
            let worker = Worker
            this.getOrgUnits(orgUnitGroupIndex);
        }
    }



}