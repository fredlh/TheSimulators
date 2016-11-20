/*
 * An interface for notification when an organisation unit levels update happens
 * 
 * The component needs to implement the interface and call the appropiate
 * register function in orgUnitService
 */

export interface OrgUnitLevelsUpdateInterface {
    onOrgUnitLevelsUpdate();
}