import { Component, OnInit }    from "@angular/core";
import { Subject }              from "rxjs/Subject";

import { OrgUnitSearchService } from "../../services/org-unit-search.service";
import { OrgUnit }              from "../../core/org-unit";

@Component({
    selector: "org-unit-search",
    template: require<any>("./org-unit-search.component.html"),
    styles: [ require<any>("./org-unit-search.component.less") ],
    providers: [ OrgUnitSearchService ]
})

export class OrgUnitSearchComponent {
    private searchTerms = new Subject<string>();

    search(term: string): void {
        this.searchTerms.next(term);
    }
}