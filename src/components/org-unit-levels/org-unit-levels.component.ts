import { Component }                         from "@angular/core";

import { OrgUnitService }                    from "../../services/org-unit.service";
import { SideBarService }                    from "../../services/side-bar.service";

import { OrgUnitLevelsUpdateInterface}    from "../../core/org-unit-levels-update.interface";

import { Globals, OrganisationUnitLevel, OrganisationUnitGroup }    from "../../globals/globals.class";

declare var $: any;

@Component({
    selector: "org-unit-levels",
    template: require<any>("./org-unit-levels.component.html"),
    styles: [ require<any>("./org-unit-levels.component.less")]
})

export class OrgUnitLevelsComponent implements OrgUnitLevelsUpdateInterface {

    private orgUnitLevels: OrganisationUnitLevel[] = [];
    private orgUnitLevel = new OrganisationUnitLevel();
    private globals = Globals;

    // Either null (done nothing yet), true (success) or false (error)
    private formStatus: boolean;

    // The status message when the user performs an action
    private statusMessage: string;

    // The type, either add or edit
    private typeMessage: string = "Add new organisation unit level";

    private lastEditId: string = "";

    constructor(private orgUnitService: OrgUnitService, private sideBarService: SideBarService) {
        this.orgUnitService.registerOrgUnitLevelsListener(this);
    }

    onOrgUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
    }

    toggleOrgUnitLevels(): void {
        this.showOrgUnitLevelsPanel();

        // Reset the form
        this.formStatus = null;
        this.statusMessage = "";
        this.typeMessage = "Add new organisation unit level";
        this.orgUnitLevel = new OrganisationUnitLevel();

        let tmpThis = this;
        $(".org-unit-levels-close").click(function() {
            tmpThis.onCancel(tmpThis);
        });

        window.onclick = function(event) {
            if (event.target === document.getElementById("orgUnitLevelsArea")) {
                tmpThis.onCancel(tmpThis);
            }
        };
    }

    showOrgUnitLevelsPanel(): void {
        document.getElementById("orgUnitLevelsArea").style.display = "block";
    }

    hideOrgUnitLevelsPanel(): void {
        document.getElementById("orgUnitLevelsArea").style.display = "none";
    }

    onCancel(tmpThis = this): void {
        tmpThis.hideOrgUnitLevelsPanel();
        $("td").filter(function() {
            return $(this).text() === tmpThis.lastEditId;
        }).closest("tr").css({"background-color": ""});
    }

    onCancelEdit(): void {
        this.formStatus = null;
        this.statusMessage = "";
        this.typeMessage = "Add new organisation unit level";
        this.orgUnitLevel = new OrganisationUnitLevel();

        let tmpThis = this;
        $("td").filter(function() {
            return $(this).text() === tmpThis.lastEditId;
        }).closest("tr").css({"background-color": ""});
    }

    editOrgUnitLevel(orgUnitLevelId: string): void {
        this.formStatus = null;
        this.statusMessage = "";
        this.typeMessage = "Edit an organisation unit level";

        this.orgUnitLevel = JSON.parse(JSON.stringify(this.getOrgUnitLevelById(orgUnitLevelId)));

        let tmpThis = this;
        $("td").filter(function() {
            return $(this).text() === tmpThis.lastEditId;
        }).closest("tr").css({"background-color": ""});

        $("td").filter(function() {
            return $(this).text() === orgUnitLevelId;
        }).closest("tr").css({"background-color": "lightblue"});

        this.lastEditId = orgUnitLevelId;
    }

    deleteOrgUnitLevel(orgUnitLevelId: string, confirmedDelete = false): void {
        let tmpThis = this;
        this.orgUnitLevel = JSON.parse(JSON.stringify(this.getOrgUnitLevelById(orgUnitLevelId)));

        if (!confirmedDelete) {
            document.getElementById("confirmDeleteArea").style.display = "block";
            return;
        }

        this.orgUnitService.deleteOrganisationUnitLevel(orgUnitLevelId).subscribe(
            res => {
                tmpThis.formStatus = true;
                tmpThis.statusMessage = "Successfully deleted the organisation unit level";
                tmpThis.orgUnitService.refreshOrganisationUnitLevels();

                // Check if the user deleted an orgUnitLevel which is currently being edited
                if (this.orgUnitLevel.id === orgUnitLevelId) {
                    this.orgUnitLevel = new OrganisationUnitLevel();
                    this.typeMessage = "Add new organisation unit level";
                }
            },
            error => {
                console.error("Failed to delete OrganisationUnitLevel");
                tmpThis.formStatus = false;
                tmpThis.statusMessage = "Failed to delete the organisation unit level. Please refresh and try again";
            }
        );
    }

    onSaveOrgUnit(): void {
        let tmpThis = this;

        // Update the organisation unit level
        if (this.isEditing()) {
            this.orgUnitService.updateOrganisationUnitLevel(this.orgUnitLevel).subscribe(
                res => {
                    tmpThis.formStatus = true;
                    tmpThis.statusMessage = "Successfully updated the organisation unit level";
                    tmpThis.typeMessage = "Add new organisation unit level";
                    tmpThis.orgUnitLevel = new OrganisationUnitLevel();
                    tmpThis.orgUnitService.refreshOrganisationUnitLevels();
                },
                error => {
                    console.error("Failed to update OrganisationUnitLevel");
                    tmpThis.formStatus = false;
                    tmpThis.statusMessage = "Failed to update the organisation unit level. Please refresh and try again";
                }
            );

        // Save the organisation unit level
        } else {
            this.orgUnitService.saveOrganisationUnitLevel(this.orgUnitLevel).subscribe(
                res => {
                    tmpThis.formStatus = true;
                    tmpThis.statusMessage = "Successfully saved the organisation unit level";
                    tmpThis.orgUnitService.refreshOrganisationUnitLevels();
                },
                error => {
                    console.error("Failed to save OrganisationUnitLevel");
                    tmpThis.formStatus = false;
                    tmpThis.statusMessage = "Failed to save the organisation unit level. Please refresh and try again";
                }
            );
        }
    }

    getOrgUnitLevelById(orgUnitLevelId: string): OrganisationUnitLevel {
        for (let level of this.orgUnitLevels) {
            if (level.id === orgUnitLevelId) return level;
        }

        return null;
    }

    isEditing(): boolean {
        return this.typeMessage.startsWith("Edit");
    }

    confirmDelete(yes: boolean): void {
        document.getElementById("confirmDeleteArea").style.display = "none";
        if (yes)  {
            this.deleteOrgUnitLevel(this.orgUnitLevel.id, true);
        }
    }

}