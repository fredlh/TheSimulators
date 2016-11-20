import { Component }                                                from "@angular/core";

import { OrgUnitService }                                           from "../../services/org-unit.service";
import { SideBarService }                                           from "../../services/side-bar.service";

import { OrgUnitLevelsUpdateInterface}                              from "../../core/org-unit-levels-update.interface";

import { Globals, OrganisationUnitLevel, OrganisationUnitGroup }    from "../../globals/globals.class";

/*
 * The Organisation Unit Levels component is a orgUnitLevel management view hidden under advanced view
 * 
 * Each orgUnitLevel is displayed in a table with all relevant info.
 * For each orgUnit, the user can edit and delete it
 * 
 * The user can also add a new orgUnitLevel with a given name and level
 * 
 * The displayed is auto-refreshed on changes, so the user will at any time view the latest info
 */


// Used for jQuery
declare var $: any;


@Component({
    selector: "org-unit-levels",
    template: require<any>("./org-unit-levels.component.html"),
    styles: [ require<any>("./org-unit-levels.component.less")]
})


export class OrgUnitLevelsComponent implements OrgUnitLevelsUpdateInterface {

    // Holds all the orgUnitLevels viewed in the table
    private orgUnitLevels: OrganisationUnitLevel[] = [];

    // The chosen orgUnitLevel
    // Will get high lighted in the table
    private orgUnitLevel = new OrganisationUnitLevel();

    // Used as a reference for the HTML page, which used it for formating the date    
    private globals = Globals;

    // Either null (done nothing yet), true (success) or false (error)
    private formStatus: boolean;

    // The status message when the user performs an action
    private statusMessage: string;

    // The type, either add or edit
    private typeMessage: string = "Add new organisation unit level";

    // ID of the last edited level, used for removing the highlight in table
    private lastEditId: string = "";


    constructor(private orgUnitService: OrgUnitService, private sideBarService: SideBarService) {
        this.orgUnitService.registerOrgUnitLevelsListener(this);
    }


    // Called when the orgUnitLevels have been updated
    onOrgUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
    }


    // Opens the orgUnitLevels management view/panel
    toggleOrgUnitLevels(): void {
        this.orgUnitService.refreshOrganisationUnitLevels();
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


    // Closes the panel, and removes the highlighted orgUnitLevel
    onCancel(tmpThis = this): void {
        tmpThis.hideOrgUnitLevelsPanel();
        $("td").filter(function() {
            return $(this).text() === tmpThis.lastEditId;
        }).closest("tr").css({"background-color": ""});
    }


    // Cancels the edit-mode
    // Resets the current orgUnitLevel and removes the highlight
    onCancelEdit(): void {
        this.formStatus = null;
        this.statusMessage = "";
        this.typeMessage = "Add new organisation unit level";
        this.orgUnitLevel = new OrganisationUnitLevel();

        // Remove the highlight
        let tmpThis = this;
        $("td").filter(function() {
            return $(this).text() === tmpThis.lastEditId;
        }).closest("tr").css({"background-color": ""});
    }


    // Enters the edit-mode
    // Will show the info the the current orgUnitLevel at the bottom,
    // along with a cancel edit mode and save updates button
    // Will also highlight the orgUnitLevel
    editOrgUnitLevel(orgUnitLevelId: string): void {
        // Enter edit-mode
        this.formStatus = null;
        this.statusMessage = "";
        this.typeMessage = "Edit an organisation unit level";

        // Save a copy of the orgUnitLevel
        this.orgUnitLevel = JSON.parse(JSON.stringify(this.getOrgUnitLevelById(orgUnitLevelId)));

        let tmpThis = this;

        // Remove the highlight of the previous orgUnitLevel
        $("td").filter(function() {
            return $(this).text() === tmpThis.lastEditId;
        }).closest("tr").css({"background-color": ""});

        // Set the highlight of the current orgUnitLevel
        $("td").filter(function() {
            return $(this).text() === orgUnitLevelId;
        }).closest("tr").css({"background-color": "lightblue"});

        this.lastEditId = orgUnitLevelId;
    }

    // Deletes the orgUnitLevel
    // If confirmedDelete is false, it will display a confirm field
    deleteOrgUnitLevel(orgUnitLevelId: string, confirmedDelete = false): void {
        this.orgUnitLevel = JSON.parse(JSON.stringify(this.getOrgUnitLevelById(orgUnitLevelId)));

        if (!confirmedDelete) {
            document.getElementById("confirmDeleteArea3").style.display = "block";
            return;
        }

        this.orgUnitService.deleteOrganisationUnitLevel(orgUnitLevelId).subscribe(
            res => {
                this.formStatus = true;
                this.statusMessage = "Successfully deleted the organisation unit level";
                this.orgUnitService.refreshOrganisationUnitLevels();

                // Check if the user deleted an orgUnitLevel which is currently being edited
                if (this.orgUnitLevel.id === orgUnitLevelId) {
                    this.orgUnitLevel = new OrganisationUnitLevel();
                    this.typeMessage = "Add new organisation unit level";
                }
            },
            error => {
                console.error(error);
                this.formStatus = false;
                this.statusMessage = "Failed to delete the organisation unit level. Please refresh and try again";
            }
        );
    }

    // Saves an orgUnitLevel
    onSaveOrgUnit(): void {
        // Update the organisation unit level
        if (this.isEditing()) {
            this.orgUnitService.updateOrganisationUnitLevel(this.orgUnitLevel).subscribe(
                // Success, display success message and leave edit-mode
                res => {
                    this.formStatus = true;
                    this.statusMessage = "Successfully updated the organisation unit level";
                    this.typeMessage = "Add new organisation unit level";
                    this.orgUnitLevel = new OrganisationUnitLevel();
                    this.orgUnitService.refreshOrganisationUnitLevels();
                },
                error => {
                    console.error(error);
                    this.formStatus = false;
                    this.statusMessage = "Failed to update the organisation unit level. Please refresh and try again";
                }
            );

        // Save the organisation unit level
        } else {
            this.orgUnitService.saveOrganisationUnitLevel(this.orgUnitLevel).subscribe(
                res => {
                    this.formStatus = true;
                    this.statusMessage = "Successfully saved the organisation unit level";
                    this.orgUnitService.refreshOrganisationUnitLevels();
                },
                error => {
                    console.error(error);
                    this.formStatus = false;
                    this.statusMessage = "Failed to save the organisation unit level. Please refresh and try again";
                }
            );
        }
    }

    // Returns the orgUnitLevel with the given id, or null on error
    getOrgUnitLevelById(orgUnitLevelId: string): OrganisationUnitLevel {
        for (let level of this.orgUnitLevels) {
            if (level.id === orgUnitLevelId) return level;
        }

        return null;
    }

    // Returns whether the table is in edit-mode or not
    isEditing(): boolean {
        return this.typeMessage.startsWith("Edit");
    }

    // Gets called when the user clicks yes/no on the confirm dialog
    // If yes, it calls deleteOrganisationUnitLevel() which tries to delete the orgUnitLevel
    confirmDelete(yes: boolean): void {
        document.getElementById("confirmDeleteArea3").style.display = "none";
        if (yes)  {
            this.deleteOrgUnitLevel(this.orgUnitLevel.id, true);
        }
    }

}