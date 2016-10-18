import { Component, OnInit }    from '@angular/core';
import { Subject }              from 'rxjs/Subject';

import { OrgUnitSearchService } from './org-unit-search.service';
import { OrgUnit }              from './org-unit';

@Component({
    //moduleId: module.id,
    selector: 'org-unit-search',
    templateUrl: 'app/org-unit-search.component.html',
    styleUrls: [ 'app/org-unit-search.component.css' ],
    providers: [ OrgUnitSearchService ]
})

export class OrgUnitSearchComponent {
    private searchTerms = new Subject<string>();

    search(term: string): void {
        this.searchTerms.next(term);
    }
}