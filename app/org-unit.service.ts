import { Injectable }   from '@angular/core';
import { Headers, Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { OrgUnit }  from './org-unit';

@Injectable()
export class OrgUnitService {

    constructor(private http: Http){}
}