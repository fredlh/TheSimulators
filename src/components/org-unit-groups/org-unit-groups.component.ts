import { Component}                         from "@angular/core";

import { OrgUnitService}                    from "../../services/org-unit.service";
import { SideBarService}                    from "../../services/side-bar.service";

import { GlobalsUpdateInterface}            from "../../core/globals-update.interface";

import { Globals, OrganisationUnitGroup}    from "../../globals/globals.class";


@Component({
    selector: "org-unit-groups",
    template: require<any>("./org-unit-groups.component.html"),
    styles: [ require<any>("./org-unit-groups.component.less")]
})

export class OrgUnitGroupsComponent implements GlobalsUpdateInterface {

    private orgUnitGroups: OrganisationUnitGroup[] = [];

    constructor(private orgUnitService: OrgUnitService,
                private sideBarService: SideBarService) {
        this.orgUnitService.registerGlobalsUpdateListener(this);
                }

    onOrganisationUnitLevelsUpdate(): void {}

    onOrganisationUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;
        console.log(Globals.organisationUnitGroups);
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
}