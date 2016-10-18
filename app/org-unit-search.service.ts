import { Injectable }   from '@angular/core';
import { Response, Http} from '@angular/http';
import { Observable }    from 'rxjs';

import { OrgUnit }  from './org-unit';

@Injectable()
export class OrgUnitSearchService {

    constructor(private http: Http){}
}