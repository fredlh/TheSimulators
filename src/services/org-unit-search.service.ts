import { Injectable }   from "@angular/core";
import { Response, Http} from "@angular/http";
import { Observable }    from "rxjs";

import { OrgUnit }  from "../core/org-unit";

@Injectable()
export class OrgUnitSearchService {

    constructor(private http: Http) {}
}