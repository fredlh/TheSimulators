import { Component } from "@angular/core";
// import { OrganisationUnit } from "../services/organisationUnit";

@Component({
    selector : "app",
    template: require<any>("./app.component.html"),
    styles: [ require<any>("./app.component.less") ]
})

export class AppComponent { 
/*
public organisationUnit = [];
    private organisationUnits;

    model = new OrganisationUnit('', '', '');

 newUnit(): void {
        this.appService.saveOrganisationUnit(this.model)
            .subscribe((data) => {
              this.loadList()
            })
    }
*/
}
