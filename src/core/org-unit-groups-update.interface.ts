/*
 * An interface for notification when an organisation unit grpups update happens
 * 
 * The component needs to implement the interface and call the appropiate
 * register function in orgUnitService
 */

export interface OrgUnitGroupsUpdateInterface {
    onOrgUnitGroupsUpdate();
}