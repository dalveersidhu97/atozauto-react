import { FilterType } from "../../types";
import * as contentUtils from "../content.utils";

describe('isVTOAcceptable', () => {
    beforeEach(()=>{
        jest.resetModules();
    });
    it('Should pass', () => {
        jest.spyOn(contentUtils, 'getUserInfo').mockReturnValue({ name: 'Dalveer' });
        const vto = {
            "date": "Fri, Jul 5",
            "startTime": 40,
            "endTime": 710,
            "time": "12:40a.m. - 9:10a.m.",
            "duration": "(8hrs 30mins)",
            "cycle": "SORT_1",
            "button": {}
        }
        const filters: FilterType[] = [
            {
                "date": "Jul 05, Fri",
                timeRules: [
                    { type: 'Start Time', op: 'lt', seconds: 50 },
                    { type: 'End Time', op: 'eq', seconds: 710 },
                    { type: 'End Time', op: 'eq', seconds: 710 },
                ],
                "forName": "Dalveer",
            }
        ]
        expect(contentUtils.isVTOAcceptable(filters, vto)).toMatchObject(filters[0]);
    })
    it('Should pass', () => {
        jest.spyOn(contentUtils, 'getUserInfo').mockReturnValue({ name: 'Dalveer' });
        const vto = {
            "date": "Jul 5",
            "startTime": 40,
            "endTime": 710,
            "time": "12:40a.m. - 9:10a.m.",
            "duration": "(8hrs 30mins)",
            "cycle": "SORT_1",
            "button": {}
        }
        const filters: FilterType[] = [
            {
                "date": "Jul 05, Fri",
                timeRules: [
                    { type: 'Start Time', op: 'lte', seconds: 40 },
                    { type: 'Start Time', op: 'lt', seconds: 50 },
                    { type: 'End Time', op: 'gte', seconds: 710 },
                    { type: 'End Time', op: 'gt', seconds: 700 },
                ],
                "forName": "Dalveer",
            }
        ]
        expect(contentUtils.isVTOAcceptable(filters, vto)).toMatchObject(filters[0]);
    })
})