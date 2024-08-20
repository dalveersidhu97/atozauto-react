import { FilterType, VTOType } from "../../types";
import * as contentUtils from "../content.utils";

describe('isVTOAcceptable', () => {
    beforeEach(()=>{
        jest.resetModules();
    });
    it('Should pass', () => {
        jest.spyOn(contentUtils, 'getUserInfo').mockReturnValue({ name: 'Dalveer' });
        const vto: VTOType = {
            "date": "Fri, Jul 5",
            "startTime": 40,
            "endTime": 710,
            "button": null
        }
        const filters: FilterType[] = [
            {
                "date": "Jul 05, Fri",
                timeRules: [
                    { type: 'Start Time', op: 'lt', minutes: 50 },
                    { type: 'End Time', op: 'eq', minutes: 710 },
                    { type: 'End Time', op: 'eq', minutes: 710 },
                ],
                "forName": "Dalveer",
                preferedDuration: 'Max',
                gap: 0,
            }
        ]
        expect(contentUtils.isVTOAcceptable(filters, vto)).toMatchObject(filters[0]);
    })
    it('Should pass', () => {
        jest.spyOn(contentUtils, 'getUserInfo').mockReturnValue({ name: 'Dalveer' });
        const vto: VTOType = {
            "date": "Jul 5",
            "startTime": 40,
            "endTime": 710,
            "button": null
        }
        const filters: FilterType[] = [
            {
                "date": "Jul 05, Fri",
                timeRules: [
                    { type: 'Start Time', op: 'lte', minutes: 40 },
                    { type: 'Start Time', op: 'lt', minutes: 50 },
                    { type: 'End Time', op: 'gte', minutes: 710 },
                    { type: 'End Time', op: 'gt', minutes: 700 },
                ],
                preferedDuration: 'Max',
                "forName": "Dalveer",
                gap: 0,
            }
        ]
        expect(contentUtils.isVTOAcceptable(filters, vto)).toMatchObject(filters[0]);
    })
})