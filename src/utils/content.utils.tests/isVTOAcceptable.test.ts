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
        const filters = [
            {
                "date": "Jul 05, Fri",
                "endTime": {
                    "eq": 710
                },
                "forName": "Dalveer",
                "startTime": {
                    "eq": 40
                }
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
        const filters = [
            {
                "date": "Jul 05, Fri",
                "endTime": {
                    "gte": 710
                },
                "forName": "Dalveer",
                "startTime": {
                    "lte": 40
                }
            }
        ]
        expect(contentUtils.isVTOAcceptable(filters, vto)).toMatchObject(filters[0]);
    })
})