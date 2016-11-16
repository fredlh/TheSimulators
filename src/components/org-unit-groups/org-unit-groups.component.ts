import { Component, ElementRef, Renderer, AfterViewInit }  from "@angular/core";

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
    private orgUnits = [];
    private displayedOrgUnits = [];
    private hasRetrievedChildren = [];

    private orgUnitSearchTerm: string = "";

    private openedId;
    private openedIndex;

    private listenFunc: Function;


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
        //this.sideBarService.hideSideBar();
    }

    hideOrgUnitGroupsPanel(): void {
        document.getElementById("orgUnitGroupsArea").style.display = "none";
        //this.sideBarService.unHideSideBar();
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
        console.log(this.orgUnitSearchTerm);
    }



}